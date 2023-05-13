const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const PAGE_URL = 'localhost:3000'

let hashCost = 12; // todo: this value can be changed without harming anything, but should get tuned for ~150ms per hash comparison

// converts SQL date string to Date object
function stringToDate(string) {
  return new Date(Date.parse(string))
}

// converts ISO date to SQL date
function dateToString(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ')
}
// every route in here to be addressed by /api/___
router.post('/tokenLogin', (req, res) => {
  let tokenHash = req.body['token']

  db.get(`SELECT token FROM tokens WHERE token=?;`, [tokenHash], (err, token) => {
    if (err || token.token === undefined || token.token !== token) {
      console.log('--- SQLITE ERROR ---')
      console.log(err)
      res.writeHead(401)
      res.redirect(PAGE_URL + '/login')
      res.send()
      return
    }

    // don't send anything, just confirm the token is fine
    res.writeHead(200)
    // res.redirect(PAGE_URL + '/home')
    res.send()

  })
})

router.post('/login', (req, res) => {
  console.log("req body:")
  console.log(req.body)

  let username = req.body['username'],
      password = req.body['password']

  // todo: settle on some specific syntax for those calls, this one is all over the place
  db.get(`SELECT password, id FROM users WHERE username=?;`, [username], (err, user) => {
    if (err) {
      console.log('--- SQLITE ERROR ---')
      console.log(err)
      return
    }

    let storedPasswordHash = user.password,
        storedUserId = user.id

    let isEqual = bcrypt.compareSync(password, storedPasswordHash)

    if (isEqual) {
      // make sure the record has been deleted, then proceed with creating the new one
      db.run(`DELETE FROM tokens WHERE userId=?`, [storedUserId], (err) => {
        if (err) {
          // this error could just be a 'not found' message, this is to be expected since we are executing the deletion without checking if the record exists.
          console.log('--- SQL INFORMATION ---')
          console.log(err)
        }

        // ~4.5 * 10^15 combinations
        let hashGen = () => {
          return Math.random().toString(36).substring(2)
        }

        let tokenHash = hashGen() + hashGen(),
            tokenUserId = storedUserId,
            tokenExpiryDate = new Date(); // unused for now, but necessary for later

        let currentDate = new Date();
        tokenExpiryDate.setDate(tokenExpiryDate.getDate()+31); // set the expiry as 1 month into the future

        let tokenExpiryDateString = dateToString(tokenExpiryDate)

        db.run(`INSERT INTO tokens (userId, token, expiry) VALUES (?, ?, ?);`, [tokenUserId, tokenHash, tokenExpiryDateString], (err) => {
          if (err) {
            // this error could just be a 'not found' message, this is to be expected since we are executing the deletion without checking if the record exists.
            console.log('--- SQL ERROR ---')
            console.log(err)
          } else {
            // reminder to self before I forget again - we won't be validating an already existing token, GET /tokenLogin already does that
            // send session token & home page
            res.writeHead(200)
            res.cookie('sessionToken', tokenHash)
            res.send()
          }
        })
      })
    } else {
      // wrong credentials - ask to retry
      res.writeHead(401)
      res.send()
    }

  });
});

router.post('/register', (req, res) => {
  let email = req.body['email'],
      username = req.body['username'],
      password = req.body['password']

  // todo: add verification etc, we don't want people spamming empty accounts
  let passwordHash = bcrypt.hashSync(password)

  db.run(`INSERT INTO users (email, username, password) VALUES (?, ?, ?);`, [email, username, passwordHash], (err) => {
    if (err) {
      console.log('--- SQLITE ERROR ---')
      console.log(err)
    } else {
      res.writeHead(200)
      res.send()
    }
  })
});

module.exports = router;
