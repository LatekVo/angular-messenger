const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const PAGE_URL = 'localhost:3000'

let hashCost = 12; // todo: this value can be changed without harming anything, but should get tuned for ~150ms per hash comparison

// db init will be moved to server.js later, but for now it's only being used here
// datetime format: yyyy-MM-dd HH:mm:ss ie: '2007-01-01 10:00:00'
// to get this time format in js: date.toISOString().slice(0, 19).replace('T', ' '); date being the Date() std class
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  username TEXT,
  password TEXT
  );

CREATE TABLE IF NOT EXISTS tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  token TEXT,
  created DATETIME,

  FOREIGN KEY(userId) REFERENCES users(id)

  );
`, (err, output) => {
  if (err) {
    console.log('--- SQLITE create table ERROR ---')
    console.log(err)
  } else {
    console.log('--- SQLITE create table SUCCESS ---')
    console.log(output)
  }
});

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
  let username = req.body['username'],
      password = req.body['password']

  console.log('b')

  // todo: settle on some specific syntax for those calls, this one is all over the place
  db.get(`SELECT password, id FROM users WHERE username=?;`, [username], (err, output) => {
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

  db.run(`INSERT INTO users (email, username, password) VALUES (?, ?, ?);`, [email, username, passwordHash], (err, output) => {
    if (err) {
      console.log('--- SQLITE ERROR ---')
      console.log(err)
      return
    }

    console.log(output)
  })
});

module.exports = router;
