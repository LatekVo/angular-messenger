const dbs = require('./databaseService');

const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const PAGE_URL = 'localhost:3000';

let hashCost = 12; // todo: this value can be changed without harming anything, but should get tuned for ~150ms per hash comparison


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
// every route in here to be addressed by /api/___

router.post('/tokenLogin', (req, res) => {
  let tokenHash = req.body['token'];

  dbs.getRecord(dbs.AUTH_TABLE, ['token'], `token='${tokenHash}'`).then(output => {
    if (output) {
      // don't send anything, just confirm the token is fine
      res.writeHead(200);
      res.send();
    } else {
      res.writeHead(401);
      res.send();
    }
  }).catch((err) => {
    console.log('ERROR when getRecord(): ', err);
    res.writeHead(401);
    res.send();
  });
});

router.post('/login', (req, res) => {
  let usernameOrEmail = req.body['username'],
      password = req.body['password'];

  dbs.getRecord(dbs.USERS_TABLE, ['password', 'id'], `username='${usernameOrEmail}' OR email='${usernameOrEmail}'`).then(output => {
    let storedPasswordHash = output.password;
    let storedUserId = output.id;

    let isEqual = bcrypt.compareSync(password, storedPasswordHash);

    if (isEqual) {
      // make sure the record has been deleted, then proceed with creating the new one
      dbs.deleteRecord(dbs.AUTH_TABLE, `userId='${storedUserId}'`).then(() => {
        let tokenHash = hashGen() + hashGen(),
          tokenUserId = storedUserId,
          tokenExpiryDate = new Date(); // unused for now, but necessary for later

        let currentDate = new Date();
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
          res.writeHead(200);
          res.send();

        });
      });
    } else {
      // wrong credentials - ask to retry
      res.writeHead(401);
      res.send();
    }
  });
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
    res.writeHead(200);
    res.send();
  });
});

// NOTE: from now on verification is done via cookies, request.cookies['userToken'] to be used for verification
// this is a wrapper function for all this, it does all the verification
function verifyRequest(req, res) {
  return new Promise((accept, reject) => {
    let respondUnauthorized = () => {
      res.writeHead(401);
      res.send({message: 'Token invalid or expired'});
      reject();
    }

    let incomingToken = req.cookies['userToken'];
    if (incomingToken) {
      dbs.getRecord(dbs.AUTH_TABLE, ['userId', 'expiry'], `token='${incomingToken}`).then(output => {
        if (output?.expiry && ( stringToDate(output.expiry) > new Date() )) {
          accept(output.userId);
        } else {
          respondUnauthorized();
        }
      });
    } else {
      respondUnauthorized();
    }
  });
}


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
let messageBroadcastingSockets = new Map();

function addListenerSocket(chatId, userId, responseObject) {
  // .get() refers to the Array object, instead of copying it
  let listenerMap = messageBroadcastingSockets.get(chatId);

  if (!listenerMap) {
    messageBroadcastingSockets.set(chatId, new Map([[userId, responseObject]]));
  } else {
    listenerMap[userId] = responseObject; // add or update listening response
  }
}

function broadcastMessage(chatId, messageObject) {
  let socketList = messageBroadcastingSockets.get(chatId);

  socketList.forEach(res => {
    res.write(messageObject);
  })

}

router.post('/sendMessage', (req, res) => {
  verifyRequest(req, res).then(userId => {
    let messageContent = req.body['content'];
    let messageChatId = req.body['chatId'];

    // todo: chat_links should ONLY contain user-chat connections
    // todo: add permissions as a separate database table
    dbs.getRecord(dbs.CHAT_LINKS_TABLE, ['id'], `chatId=${messageChatId} AND userId=${userId}`).then(output => {
      // check if the user is a member of requested chat
      if (output?.id) {
        let messageInsertionQuery = {
          dateCreated: new Date(),
          userId: userId,
          chatId: messageChatId,
          content: messageContent
        };

        dbs.insertRecord(dbs.MESSAGES_TABLE, messageInsertionQuery).then(output => {

          broadcastMessage(messageChatId, messageInsertionQuery);

          res.writeHead(200); // sent to and received by the server
          res.send();
        });
      } else {
        res.writeHead(401);
        res.send({message: 'User is not a member of this chat'});
      }
    });
  });
});

router.post('/fetchMessages', (req, res) => {
  verifyRequest(req, res).then(userId => {
    let chatId = req.body['chatId'];
    let pagination = req.body['pagination'];

    let batchAmount = pagination.batchAmount;
    let batchIndex = pagination.batchIndex;
    let recordFrom = batchAmount * batchIndex;
    let recordTo = recordFrom + batchAmount;

    // TODO: put all these string keywords into an enum

    dbs.getRecord(dbs.MESSAGES_TABLE, ['id', 'dateCreated', 'userId', 'content'], `chatId=${chatId} AND userId=${userId}`, recordTo, 'dateCreated').then(output => {
      let requestedOutput = null;
      console.log('OUTPUT:', output);
      if (Array.isArray(output)) {
        // webstorm is so incredibly advanced, it already knows that this branch can only be run after output is determined to be an array, and so it automatically highlights output as an array, but only inside this branch.
        requestedOutput = output.slice(recordFrom, recordTo); // this function is smart enough no additional checks are required

      } else if (output) {
        requestedOutput = [output];
      }

      res.writeHead(200);
      res.send(requestedOutput);

    });
  });
});

router.post('/streamMessages', (req, res) => {
  verifyRequest(req, res).then(userId => {
    let chatId = req.body['chatId'];

    addListenerSocket(chatId, userId, res);

  });
});

// Chats schema:
// /joinChat - works on OPEN chats, doesn't on PRIVATE
// /inviteToChat - works on
router.post('/fetchChats', (req, res) => {
  verifyRequest(req, res).then(userId => {

  });
});

router.post('/createChat', (req, res) => {
  verifyRequest(req, res).then(userId => {

  });
});

router.post('/joinChat', (req, res) => {
  verifyRequest(req, res).then(userId => {

  });
});

router.post('/inviteToChat', (req, res) => {
  verifyRequest(req, res).then(userId => {

  });
});


// Friend status in future will grant some privileges, like allowing for private messages or adding to group without asking
router.post('/fetchFriends', (req, res) => {
  verifyRequest(req, res).then(userId => {
    // limit is arbitrary, add pagination
    dbs.getRecord(dbs.FRIEND_LINKS_TABLE, ['userIdFirst', 'userIdSecond'], `userIdFirst=${userId} OR userIdSecond=${userId}`, 500, 'dateCreated').then(output => {


    });

  });
});
router.post('/addFriend', (req, res) => {
  verifyRequest(req, res).then(userId => {

  });
});

router.post('/removeFriend', (req, res) => {
  verifyRequest(req, res).then(userId => {

  });
});


module.exports = router;
