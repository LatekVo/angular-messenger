const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

console.log('database folder: ', __dirname)

// TODO: IMPORTANT
//  make this a typescript file, add types for all arguments

const dbErrorCallback = (err, output) => {
  if (err) {
    console.log('--- SQLITE ERROR ---');
    console.log(err);
  } else {
    console.log('--- SQLITE SUCCESS ---');
    console.log(output);
  }
};

// db init will be moved to server.js later, but for now it's only being used here
// datetime format: yyyy-MM-dd HH:mm:ss ie: '2007-01-01 10:00:00'
// to get this time format in js: date.toISOString().slice(0, 19).replace('T', ' '); date being the Date() std class
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  username TEXT,
  password TEXT
  );
`, dbErrorCallback);

// only one sql request can be run at a time with .run(), so i had to split up the 'tokens' creation into a separate .run()
db.run(`
CREATE TABLE IF NOT EXISTS authorizations (
  id TEXT PRIMARY KEY,
  userId TEXT,
  token TEXT,
  expiry DATETIME,

  FOREIGN KEY(userId) REFERENCES users(id)

  );
`, dbErrorCallback);

db.run(`
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,

  dateCreated DATETIME,
  ownerId TEXT,

  FOREIGN KEY(ownerId) REFERENCES users(id)

  );
`, dbErrorCallback);

db.run(`
CREATE TABLE IF NOT EXISTS friendLinks (
  id TEXT PRIMARY KEY,

  dateCreated DATETIME,
  userIdFirst TEXT,
  userIdSecond TEXT,

  FOREIGN KEY(userIdFirst) REFERENCES users(id),
  FOREIGN KEY(userIdSecond) REFERENCES users(id)

  );
`, dbErrorCallback);

db.run(`
CREATE TABLE IF NOT EXISTS chatLinks (
  id TEXT PRIMARY KEY,

  dateJoined DATETIME,
  userId TEXT,
  chatId TEXT,

  FOREIGN KEY(userId) REFERENCES users(id),
  FOREIGN KEY(chatId) REFERENCES chats(id)

  );
`, dbErrorCallback);

db.run(`
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,

  dateCreated DATETIME,
  userId TEXT,
  chatId TEXT,
  content TEXT,

  FOREIGN KEY(userId) REFERENCES users(id),
  FOREIGN KEY(chatId) REFERENCES chats(id)

  );
`, dbErrorCallback);

module.exports = {}
