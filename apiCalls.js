const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

let hashCost = 12; // todo: this value can be changed without harming anything, but should get tuned for ~150ms per hash comparison

// db init will be moved to server.js later, but for now it's only being used here
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  username TEXT,
  password TEXT
  )
`, (err, output) => {
  if (err) {
    console.log('--- SQLITE create table ERROR ---')
    console.log(err)
  } else {
    console.log('--- SQLITE create table SUCCESS ---')
    console.log(output)

    db.run(`SELECT * FROM users`, (err, output) => {
      console.log('SELECT * FROM users | results')

      if (err) {
        console.log('--- SQLITE show users ERROR ---')
        console.log(err)
      } else {
        console.log('--- SQLITE show users SUCCESS ---')
        console.log(output)
      }
    })

  }
});

// every route in here to be addressed by /api/___

router.post('/login', (req, res) => {
  let username = req.body['username'],
      password = req.body['password']

  console.log('b')

  // todo: settle on some specific syntax for those calls, this one is all over the place
  db.run(`SELECT password FROM users WHERE username=?`, [username], (err, output) => {
    if (err) {
      console.log('--- SQLITE ERROR ---')
      console.log(err)
      return
    }

    console.log(output)
  })
});

router.post('/register', (req, res) => {
  let email = req.body['email'],
      username = req.body['username'],
      password = req.body['password']

  // todo: add verification etc, we don't want people spamming empty accounts

  db.run(`INSERT INTO users (email, username, password) VALUES (?, ?, ?)`, [email, username, password], (err, output) => {
    if (err) {
      console.log('--- SQLITE ERROR ---')
      console.log(err)
      return
    }

    console.log(output)
  })
});

module.exports = router;
