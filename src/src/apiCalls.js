const dbs = require('./databaseService');

const express = require('express');
const router = express.Router();
const fs = require('fs');

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom'); // simulates a window
const DOMPurify = createDOMPurify(new JSDOM().window);
const upload = require('./multerInstance');

const bcrypt = require('bcrypt');
const path = require("path");
//const {webSocket} = require("rxjs/webSocket");

const PAGE_URL = 'localhost:3000';

let hashCost = 12; // todo: this value can be changed without harming anything, but should get tuned for ~150ms per hash comparison

// note: it's a little misleading, in Promise, onRejection actually means onError, when a rejection is caught, the onRejection cb will not be executed at all.

// ~4.5 * 10^15 combinations
function hashGen() {
  return Math.random().toString(36).substring(2);
}

// converts SQL date string to Date object
function stringToDate(string) {
  return new Date(Date.parse(string));
}

// converts ISO date to SQL date
function dateToString(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function newSqlDate() {
  return dateToString(new Date());
}
// every route in here to be addressed by /api/___

router.post('/login', (req, res) => {
  let usernameOrEmail = req.body['username'],
      password = req.body['password'];

  dbs.getRecord(dbs.USERS_TABLE, ['password', 'id'], `username='${usernameOrEmail}' OR email='${usernameOrEmail}'`).then(output => {
    if (!output) {
      res.writeHead(401, 'invalid username or password');
      res.end();
      return;
    }

    let storedPasswordHash = output.password;
    let storedUserId = output.id;

    let isEqual = bcrypt.compareSync(password, storedPasswordHash);

    if (isEqual) {
      // make sure the record has been deleted, then proceed with creating the new one
      dbs.deleteRecord(dbs.AUTH_TABLE, `userId='${storedUserId}'`).then(() => {
        let tokenHash = hashGen() + hashGen(),
          tokenUserId = storedUserId,
          tokenExpiryDate = new Date();

        tokenExpiryDate.setDate(tokenExpiryDate.getDate()+31); // set the expiry as 1 month into the future

        let tokenExpiryDateString = dateToString(tokenExpiryDate);

        let tokenInsertionQuery = {
          userId: tokenUserId,
          token: tokenHash,
          expiry: tokenExpiryDateString
        };

        dbs.insertRecord(dbs.AUTH_TABLE, tokenInsertionQuery).then(() => {
          // reminder to self before I forget again - we won't be validating an already existing token, GET /tokenLogin already does that
          // run goToDefaultPage() in userContextService
          res.cookie('userToken', tokenHash);
          res.cookie('userId', tokenUserId);
          res.end();

        });
      });
    } else {
      // wrong credentials - ask to retry
      res.writeHead(401, 'invalid username or password');
      res.end();
    }
  }).catch();
});

router.post('/register', (req, res) => {
  let email = req.body['email'],
      username = req.body['username'],
      password = req.body['password'];

  // todo: add verification etc, we don't want people spamming empty accounts
  let saltHash = bcrypt.genSaltSync(12);
  let passwordHash = bcrypt.hashSync(password, saltHash);

  let insertQuery = {
    email: email,
    username: username,
    password: passwordHash
  };

  dbs.insertRecord(dbs.USERS_TABLE, insertQuery).then(() => {
    res.end();
  });
});

// NOTE: from now on verification is done via cookies, request.cookies['userToken'] to be used for verification
// this is a wrapper function for all this, it does all the verification
function verifyRequest(req, res, requiredValues = []) {
  return new Promise((accept, reject) => {
    let respondUnauthorized = () => {
      res.writeHead(401, 'Token invalid or expired');
      res.end();
      reject('Rejected unauthorized token');
    }

    let sanitize = (input) => {
      // https://stackoverflow.com/questions/2794137/sanitizing-user-input-before-adding-it-to-the-dom-in-javascript
      const map = {
        //'&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
        "`": '&grave;'
      };

      const reg = /[&<>"'/`]/ig;
      return String(input).replace(reg, (match)=>(map[match]));
    }

    // req.body is not a simple map, or any other std js object, so std functions will most likely not work on it as well.
    let allValuesPresent = true;
    let allValuesAllowed = true;

    let sanitizeEntity = (object) => {
      if (typeof object == "object") {
        Object.values(object).forEach(val => {
          val = sanitizeEntity(val);
          return val;
        });
      } else {
        object = sanitize(object);
      }
      return object;
    }

    requiredValues.forEach((key) => {
      let value = JSON.stringify(req.body[key]);
      if (value === undefined && value !== '') {

        allValuesPresent = false;
      } else {
        req.body[key] = sanitizeEntity(req.body[key]);
      }
    });

    let incomingToken = req.cookies['userToken'];
    if (incomingToken) {
      if (allValuesPresent && allValuesAllowed) {
        dbs.getRecord(dbs.AUTH_TABLE, ['userId', 'expiry'], `token='${incomingToken}'`).then(output => {
          if (output?.expiry && ( stringToDate(output.expiry) > new Date() )) {
            accept(output.userId);
          } else {
            respondUnauthorized();
          }
        }).catch();
      } else {
        res.writeHead(401, 'Request is incomplete or invalid');
        res.end();
        reject('Rejected incomplete or invalid request');
      }
    } else {
      respondUnauthorized();
    }
  });
}

router.post('/validateSession', (req, res) => {
  verifyRequest(req, res).then(() => {
    res.end();
  }, () => {});
});

// for now, we will be using standard node's responses instead of sockets,
// since it turns out .write() actually sends data to client as soon as it is called
/*
  Map {
    '123' : [socket, socket, socket],
    '234' : [socket]
  }
*/
// todo ASAP: transition to websockets, it's the simplest way to make sure offline clients are removed from the list
// right now it's not as bad anymore, as there will be as many open connections at most as there are users. (earlier, it could go to infinity)
// TODO: This can be probably actually moved to the SQLITE database, using a type called BLOB, it stores data in it's raw format
// Map< Map< response > >
let messageBroadcastingSockets = new Map();

function addListenerSocket(chatId, userId, responseObject) {
  // .get() refers to the Array object, instead of copying it
  let listenerMap = messageBroadcastingSockets.get(chatId);

  if (!listenerMap) {
    messageBroadcastingSockets.set(chatId, new Map([[userId, responseObject]]));
  } else {
    listenerMap.set(userId, responseObject); // add or update listening response
  }
}
function broadcastMessage(chatId, messageObject) {
  let socketList = messageBroadcastingSockets.get(chatId);
  // debug: this part is verified to be working, the problem is probably with the headers
  if (socketList) {
    socketList.forEach(res => {
      // this format is required by EventSource object to be working.
      res.write(`event: message\n`);
      res.write(`data: ${JSON.stringify(messageObject)}\n\n`);
    });
  }
}

router.post('/sendMessage', (req, res) => {
  verifyRequest(req, res, ['content', 'chatId']).then(userId => {
    let messageContent = req.body['content'];
    let messageChatId = req.body['chatId'];

    // todo: add permissions as a separate database table: {chatId: string, userId: string, permissionId: string}
    dbs.getRecord(dbs.CHAT_LINKS_TABLE, ['id'], `chatId='${messageChatId}' AND userId='${userId}'`).then(output => {
      // check if the user is a member of requested chat
      if (output?.id) {
        let messageInsertionQuery = {
          dateCreated: newSqlDate(),
          senderId: userId,
          chatId: messageChatId,
          content: messageContent
        };

        dbs.insertRecord(dbs.MESSAGES_TABLE, messageInsertionQuery).then(messageId => {
          let broadCastedMessage = {
            id: messageId,
            dateCreated: newSqlDate(), // more readable for now
            senderId: userId,
            content: messageContent
          }
          broadcastMessage(messageChatId, broadCastedMessage);
          // no res.end(), that would interfere with broadcastMessage
        });
      } else {
        res.writeHead(401, 'User is not a member of this chat');
        res.end();
      }
    });
  }, () => {});
});

router.post('/sendImage', upload.fields([{name: 'image', maxCount: 1}, {name: 'chatId', maxCount: 1}]), (req, res) => {
  // image is not required as it's not a part of the body object. DO NOT FIX!
  verifyRequest(req, res, ['chatId']).then(userId => {
    // console.log(req.body); // returns { chatId: string}
    // console.log(req.files); // returns { image: imageJson }
    let imageContent = req.files['image'][0];
    let messageChatId = req.body['chatId'];

    dbs.getRecord(dbs.CHAT_LINKS_TABLE, ['id'], `chatId='${messageChatId}' AND userId='${userId}'`).then(output => {
      // check if the user is a member of requested chat && size < 10MB
      if (output?.id && imageContent !== undefined && imageContent?.size <= (Math.pow(2, 20) * 10)) {
        // rare case, we generate the id here, for better safety we could send the image first and THEN edit it with the appropriate content,
        // but for now this is sufficient.
        // todo: this response protocol has a lot of unfinished security, and has to be patched up asap before lauching any production builds.
        let imageId = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''); // copied from databaseService.js
        let fileExtension = 'png';
        // img fields: { fieldname: 'image', originalname: string, encoding: 'Xbit', mimetype: 'image/XXX', buffer: Buffer, size: Number }
        // todo: out of these ^^^, we want to check mimetype and size
        // save the image
        console.log(__dirname)
        let fileHandle = fs.openSync(path.join(__dirname, '..', 'static', `${imageId}.${fileExtension}`), 'w', 0o660);
        fs.writeSync(fileHandle, imageContent['buffer']);
        fs.closeSync(fileHandle);

        let messageInsertionQuery = {
          // todo: change .png into an autodetected type: jpg jpeg or png
          // IT LOOKS SIMPLE TO JUST REPLACE [] WITH <> BUT THAT WOULD ENABLE HARD TO PATCH XSS INJECTION, angular handles this well by itself as long as we don't manually force the html into the DOM
          // instead, we will look for @image() and place what's inside into a carefully injected <img> tag. No user input will get injected,
          // if user simulates this syntax sanitize() along with angular will pick out any XSS injection attempts
          id: imageId,
          dateCreated: newSqlDate(),
          senderId: userId,
          chatId: messageChatId,
          content: `@image(${imageId}.png)`
        };
        dbs.insertRecord(dbs.MESSAGES_TABLE, messageInsertionQuery).then(messageId => {
          let broadCastedMessage = {
            id: messageId,
            dateCreated: newSqlDate(), // more readable for now
            senderId: userId,
            content: `@image(${imageId}.png)`
          }
          broadcastMessage(messageChatId, broadCastedMessage);
          // no res.end(), that would interfere with broadcastMessage
        });
      } else {
        res.writeHead(401, 'File size is too large'); // most likely error
        res.end();
      }
    });
  }, () => {});
});

router.post('/fetchMessages', (req, res) => {
  verifyRequest(req, res, ['chatId', 'pagination']).then(userId => {
    let chatId = req.body['chatId'];
    let pagination = req.body['pagination'];

    let batchAmount = pagination.batchAmount;
    let batchIndex = pagination.batchIndex;
    let recordFrom = batchAmount * batchIndex;
    let recordTo = recordFrom + batchAmount;

    // TODO: put all these string keywords into an enum

    dbs.getRecord(dbs.MESSAGES_TABLE, ['id', 'dateCreated', 'senderId', 'content'], `chatId='${chatId}'`, recordTo, 'dateCreated').then(output => {
      let requestedOutput = null;
      if (Array.isArray(output)) {
        // webstorm is so incredibly advanced, it already knows that this branch can only be run after output is determined to be an array, and so it automatically highlights output as an array, but only inside this branch.
        requestedOutput = output.slice(recordFrom, recordTo); // this function is smart enough no additional checks are required
      } else if (output) {
        requestedOutput = [output];
      }
      // messages: Array
      res.send({ messages: requestedOutput });
    });
  }, () => {});
});

router.get('/streamMessages', (req, res) => {
  verifyRequest(req, res).then(userId => {
    let chatId = req.cookies['chatId']; // note: contained in cookie, should work the same but stay vigilant about this

    // streaming headers
    res.setHeader('Content-Type', 'text/event-stream'); // necessary for EventSource API
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.writeHead(200)

    // console.log('registering a listening client:', chatId, userId);
    addListenerSocket(chatId, userId, res);
  }, () => {});
});
router.post('/getChatName', (req, res) => {
  verifyRequest(req, res, ['chatId']).then(userId => {
    let checkedId = req.body['chatId'];
    if (checkedId) {
      dbs.getRecord(dbs.CHATS_TABLE, ['chatName'], `id='${checkedId}'`).then((output) => {
        if (output?.chatName) {
          // chatName: string
          res.send({chatName: output.chatName});
        } else {
          res.writeHead(400, 'This id does not exist!');
          res.end();
        }
      });
    } else {
      res.writeHead(400, 'Incomplete request!');
      res.end();
    }
  }, () => {});
});
// Chats schema:
// /joinChat - works on OPEN chats, doesn't on PRIVATE
// /inviteToChat - works on OPEN chats, if they are RESTRICTED, it will add an user to the whitelist, otherwise it'll just send him an invitation.
router.post('/fetchChats', (req, res) => {
  verifyRequest(req, res).then(userId => {
    dbs.getRecord(dbs.CHAT_LINKS_TABLE, ['chatId'], `userId='${userId}'`, 500).then(output => {
      if (output) {
        let rawIdArray = output.map(element => element.chatId);

        // chats: Array
        res.send({chats: rawIdArray});
      } else {
        res.end();
      }
    });
  }, () => {});
});

// TODO: first, a bunch of verification has to go into this particular input
// TODO: secondly, there has to be general verification going into every input user provides, i suggest purification at the verifyRequest, check 'DOM purify', or something along these lines
router.post('/createChat', (req, res) => {
  verifyRequest(req, res, ['chatName']).then(userId => {
    let currentDate = newSqlDate();
    let chatName = req.body['chatName'].match(/[A-Za-z ]/g)?.join('');

    // this is an exception, and will not be fixed inside verifyRequest
    // a user could use a string matched by .match() but not by DOMPurify, that's normal (example: ')
    if (chatName) {
      // add chat and add self
      let chatInsertion = {
        chatName: chatName,
        isPublic: 1, // default 1 meaning anyone can join provided he has an invitation link
        dateCreated: currentDate,
        ownerId: userId,
        isFriendChat: 0,
        friendLinkId: 'NULL',
      }
      dbs.insertRecord(dbs.CHATS_TABLE, chatInsertion).then(chatId => {
        let chatLinkInsertion = {
          dateJoined: currentDate,
          userId: userId,
          chatId: chatId,
        }
        dbs.insertRecord(dbs.CHAT_LINKS_TABLE, chatLinkInsertion).then(output => {
          // chatId: string
          res.send({chatId: chatId});
        });
      });
    } else {
      res.writeHead(401, 'Invalid chat name!');
      res.end();
    }

    // todo: rate-limit this

  }, () => {});
});

router.post('/createChatInviteLink', (req, res) => {
  verifyRequest(req, res, ['chatId']).then(userId => {
    // 1. user must be on the server referenced
    // 2. todo: user must provide a role he is promoted to which allows him to create invites (this way the server only has to check if the information provided by the user is true, instead of parsing through every role related to the user)
    let chatId = req.body['chatId'];
    dbs.getRecord(dbs.CHAT_LINKS_TABLE, ['id'], `chatId='${chatId}' AND userId='${userId}'`).then(output => {
      if (output?.id) {
        // todo: re-roll shortId if duplicate or offensive, for now SQLite will throw an error if anything.
        let inviteInsertionQuery = {
          shortId: Array.from({ length: 5 }, () => Math.floor(Math.random() * 36).toString(36)).join(''),
          dateCreated: newSqlDate(),
          authorId: userId,
          chatId: chatId,
        }
        // if the shortId is somehow duplicate, the error will be caught by now so no way to stop onFulfil's execution
        dbs.insertRecord(dbs.CHAT_INVITATION_LINKS_TABLE, inviteInsertionQuery).then((inviteId) => {
          // we are sending the whole thing, after the creation of a new server I want to see a popup,
          // with all this information displayed along with a click-to-copy shortId link
          inviteInsertionQuery.id = inviteId;
          res.send(inviteInsertionQuery);
        }, () => {});
      }
    });
  }, () => {});
});

router.post('/joinChat', (req, res) => {
  verifyRequest(req, res, ['shortId']).then(userId => {
    // todo: request sends a chat invitation link, not a chatId, fix asap

    // dbs.getRecord(dbs.CHAT_INVITATION_LINKS_TABLE, ['chatId', 'isPublic']);
    let shortId = req.body['shortId'];

    // If chat is public, just add user, if private, check for an invitation
    // update: chats will be public by default, meaning with an invitation LINK you can just join,
    //         and special privacy option will need to be turned on for the chat to turn private: only individual invites
    dbs.getRecord(dbs.CHAT_INVITATION_LINKS_TABLE, ['chatId'], `shortId='${shortId}'`).then(inviteOutput => {
      if (inviteOutput) {
        let chatId = inviteOutput['chatId'];
        // console.log(`user: ${userId} joining: ${chatId} via ${shortId}`);
        dbs.getRecord(dbs.CHATS_TABLE, ['isPublic'], `id='${chatId}'`).then(chatOutput => {
          // todo: types may need fixing here, test it again when the system will be up
          let finalizeInsertion = () => {
            let chatMemberInsertion = {
              dateJoined: newSqlDate(),
              userId: userId,
              chatId: chatId
            }
            dbs.insertRecord(dbs.CHAT_LINKS_TABLE, chatMemberInsertion).then(output => {
              // chatId: string
              res.send({chatId: chatId});
            });
          }
          if (chatOutput?.isPublic === 1) {
            finalizeInsertion();
          } else {
            // if private, check if user was invited
            dbs.getRecord(dbs.CHAT_INVITATIONS_TABLE, ['id'], `userId='${userId}' AND chatId='${chatId}'`).then(output => {
              if (output) {
                finalizeInsertion();
              } else {
                res.writeHead(301, 'This server is private or does not exist!');
                res.end();
              }
            });
          }
        });
      }
    });
  }, () => {});
});

router.post('/inviteToChat', (req, res) => {
  // IMPORTANT NOTE: this API is intended only for inviting individual people.
  verifyRequest(req, res, ['chatId', 'invitedId']).then(userId => {
    // todo: for now, any member of a server can invite an user, when i add permissions support, only allow 'inviter' perms to invite users
    let invitedId = req.body['invitedId'], // do not misread this: it's invitED, as in an invited person
        chatId = req.body['chatId']

    // check if user is a member of this server
    dbs.getRecord(dbs.CHAT_LINKS_TABLE, ['id'], `userId='${userId}' AND chatId='${chatId}'`).then(output => {
      if (output) {
        let invitationInsertion = {
          dateCreated: newSqlDate(),
          authorId: userId,
          userId: invitedId,
          chatId: chatId
        }
        dbs.insertRecord(dbs.CHAT_INVITATIONS_TABLE, invitationInsertion).then(output => {
          res.writeHead(200, 'Successfully invited user to this server!');
          res.end();
        });
      } else {
        res.writeHead(301, 'You are not allowed to do that!');
        res.end();
      }
    });
  }, () => {});
});

router.post('/fetchChatInviteLinks', (req, res) => {
  verifyRequest(req, res, ['chatId']).then(userId => {
    let chatId = req.body['chatId'];
    dbs.getRecord(dbs.CHAT_INVITATION_LINKS_TABLE, ['id', 'shortId'], `chatId='${chatId}'`, 20).then(output => {
      res.send({ inviteLinkList: output });
    });
  }, () => {});
});

router.post('/removeChatInviteLink', (req, res) => {
  verifyRequest(req, res, ['inviteId']).then(userId => {
    let inviteId = req.body['inviteId'];
    // check the chat of presented invite
    dbs.getRecord(dbs.CHAT_INVITATION_LINKS_TABLE, ['id', 'chatId'], `id='${inviteId}'`).then(linkOutput => {
      if (linkOutput) {
        let chatId = linkOutput.chatId;
        // check if user is present in said chat
        dbs.getRecord(dbs.CHAT_LINKS_TABLE, ['id'], `userId='${userId}' AND chatId='${chatId}'`).then(chatOutput => {
          if (chatOutput) {
            dbs.deleteRecord(dbs.CHAT_INVITATION_LINKS_TABLE, `id='${inviteId}'`).then(output => {
              res.writeHead(200, 'Successfully removed invite link!');
              res.end();
            });
          } else {
            res.writeHead(301, 'You are not allowed to do that!');
            res.end();
          }
        });
      } else {
        res.writeHead(301, 'You are not allowed to do that!');
        res.end();
      }
    });
  }, () => {});
});

router.post('/getInviteLinkDetails', (req, res) => {
  verifyRequest(req, res, ['inviteId']).then(userId => {
    let inviteId = req.body['inviteId'];
    dbs.getRecord(dbs.CHAT_INVITATION_LINKS_TABLE, ['id', 'shortId', 'dateCreated', 'authorId', 'chatId'], `id='${inviteId}'`).then((output) => {
      res.send({invite: output})
    });
  }, () => {});
});

router.post('/fetchChatMembers', (req, res) => {
  verifyRequest(req, res, ['chatId']).then(userId => {
    let chatId = req.body['chatId'];
    dbs.getRecord(dbs.CHAT_LINKS_TABLE, ['id', 'userId'], `chatId='${chatId}'`, 200).then(output => {
      output.forEach((user) => {
        user.id = user.userId;
        user.userId = undefined;
      });
      res.send({ chatMemberList: output });
    });
  }, () => {});
});

router.post('/', (req, res) => {
  verifyRequest(req, res).then(userId => {

  }, () => {});
});

router.post('/', (req, res) => {
  verifyRequest(req, res).then(userId => {

  }, () => {});
});

router.post('/getUsername', (req, res) => {
  verifyRequest(req, res, ['id']).then(userId => {
    let checkedId = req.body['id'];
    dbs.getRecord(dbs.USERS_TABLE, ['username'], `id='${checkedId}'`).then((output) => {
      if (output?.username) {
        // username: string
        res.send({username: output.username});
      } else {
        res.writeHead(300, 'This id does not exist!');
        res.end();
      }
    });
  }, () => {});
});

// Friend status in future will grant some privileges, like allowing for private messages or adding to group without asking
router.post('/fetchFriends', (req, res) => {
  verifyRequest(req, res).then(userId => {
    let getFriendId = (outputObject) => {
      if (outputObject['userIdFirst'] === userId) {
        return outputObject['userIdSecond'];
      } else {
        return outputObject['userIdFirst'];
      }
    }

    // limit is arbitrary, add pagination
    dbs.getRecord(dbs.FRIEND_LINKS_TABLE, ['userIdFirst', 'userIdSecond'], `(userIdFirst='${userId}' OR userIdSecond='${userId}') AND isActive=1`, 500, 'dateCreated').then(output => {
      let friendsList = [];
      if (output) {
        output.forEach(x => {
          friendsList.push(getFriendId(x));
        });
      }
      // friends: Array
      res.send({friends: friendsList});
    });
  }, () => {});
});
router.post('/addFriend', (req, res) => {
  verifyRequest(req, res, ['friendId']).then(userId => {
    let friendId = req.body['friendId'];
    let friendRequestInsertion = {
      dateCreated: newSqlDate(),
      userIdRequester: userId,
      userIdRecipient: friendId,
      isActive: 1
    };

    // check if the recipient already tried to add the requester as a friend
    dbs.getRecord(dbs.FRIEND_REQUESTS_TABLE, ['id'], `userIdRequester='${friendId}' AND userIdRecipient='${userId}'`).then(output => {
      if (output) {
        // pending friend request accepted & deleted
        dbs.deleteRecord(dbs.FRIEND_REQUESTS_TABLE, `userIdRequester='${friendId}' AND userIdRecipient='${userId}'`).then(x => {
          res.writeHead(200, 'Friend added.');
          res.end();
        });
      } else {
        // make sure these aren't already friends
        dbs.getRecord(dbs.FRIEND_LINKS_TABLE, ['isActive'], `(userIdFirst='${userId}' AND userIdSecond='${friendId}') OR (userIdFirst='${friendId}' AND userIdSecond='${userId}')`).then(exitingFriendsRecord => {
          if (exitingFriendsRecord) {
            // reactivate the connection if not active yet
            if (String(exitingFriendsRecord.isActive) === '0') {
              let updateQuery = {
                isActive: 1,
              }
              dbs.updateRecord(dbs.FRIEND_LINKS_TABLE, updateQuery, `(userIdFirst='${userId}' AND userIdSecond='${friendId}') OR (userIdFirst='${friendId}' AND userIdSecond='${userId}')`).then(output => {
                res.writeHead(200, 'Friend added.');
                res.end();
              });
            } else {
              // friend link just exists already and is already active, invalid request
              res.writeHead(300, 'Already added this friend!');
              res.end();
            }
          } else {
            // send a friend request
            dbs.insertRecord(dbs.FRIEND_REQUESTS_TABLE, friendRequestInsertion).then(x => {
              res.writeHead(200, 'Request sent.');
              res.end();
            });
          }
        });
      }
    });
  }, () => {});
});
router.post('/removeFriend', (req, res) => {
  verifyRequest(req, res, ['friendId']).then(userId => {
    let friendId = req.body['friendId'];
    let updateQuery = {
      isActive: 0,
    }
    dbs.updateRecord(dbs.FRIEND_LINKS_TABLE, updateQuery, `(userIdFirst='${userId}' AND userIdSecond='${friendId}') OR (userIdFirst='${friendId}' AND userIdSecond='${userId}')`).then(output => {
      res.end();
    });
  }, () => {});
});


module.exports = router;
