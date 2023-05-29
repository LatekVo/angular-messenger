const dbs = require('./databaseService');

const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const PAGE_URL = 'localhost:3000';

let hashCost = 12; // todo: this value can be changed without harming anything, but should get tuned for ~150ms per hash comparison

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

  dbs.getRecord(dbs.AUTH_TABLE, ['token'], `token=${tokenHash}`).then(([token]) => {
    if (token?.token === undefined || token?.token !== token) {
      res.writeHead(401);
      res.send();
    } else {
      // don't send anything, just confirm the token is fine
      res.writeHead(200);
      res.send();
    }
  }).catch((err) => {
    console.log('ERROR when getRecord(): ', err);
    res.writeHead(401);
    res.send();
  });
});

router.post('/login', (req, res) => {
  console.log("req body:");
  console.log(req.body);

  let username = req.body['username'],
      password = req.body['password'];

  dbs.getRecord(dbs.USERS_TABLE, ['password', 'id'], `username=${username}`).then(([storedPasswordHash, storedUserId]) => {

    let isEqual = bcrypt.compareSync(password, storedPasswordHash);

    if (isEqual) {
      // make sure the record has been deleted, then proceed with creating the new one
      dbs.deleteRecord(dbs.AUTH_TABLE, `userId = ${storedUserId}`).then((err) => {
        if (err) {
          // this error could just be a 'not found' message, this is to be expected since we are executing the deletion without checking if the record exists.
          console.log('--- SQL INFORMATION ---');
          console.log(err);
        }

        // ~4.5 * 10^15 combinations
        let hashGen = () => {
          return Math.random().toString(36).substring(2);
        }

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

        dbs.insertRecord(dbs.AUTH_TABLE, tokenInsertionQuery).then((err) => {
          if (err) {
            // this error could just be a 'not found' message, this is to be expected since we are executing the deletion without checking if the record exists.
            console.log('--- SQL ERROR ---');
            console.log(err);
          } else {
            // reminder to self before I forget again - we won't be validating an already existing token, GET /tokenLogin already does that
            // send session token & home page
            res.writeHead(200);
            res.cookie('userToken', tokenHash);
            res.cookie('userId', tokenUserId);
            res.send();
          }

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
  let passwordHash = bcrypt.hashSync(password);

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
