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

module.exports = router;
