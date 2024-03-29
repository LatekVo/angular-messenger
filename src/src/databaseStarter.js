const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'database', 'database.sqlite'));

console.log('database folder: ', __dirname + '/database/')

const dbErrorCallback = (err, output) => {
  if (err) {
    console.log('--- SQLITE ERROR ---');
    console.log(err);
  } else {
    console.log('--- SQLITE SUCCESS ---');
    console.log(output);
  }
};

// todo: when development slows down, migrate this code to SQL script, will make it simpler to transition to C#

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

db.run(`
CREATE TABLE IF NOT EXISTS authorizations (
  id TEXT PRIMARY KEY,
  userId TEXT,
  token TEXT,
  expiry DATETIME,

  FOREIGN KEY(userId) REFERENCES users(id)

  );
`, dbErrorCallback);

// if friend is removed, we will change the link to inactive, but still keep the link and the related chat
db.run(`
CREATE TABLE IF NOT EXISTS friendLinks (
  id TEXT PRIMARY KEY,

  dateCreated DATETIME,
  userIdFirst TEXT,
  userIdSecond TEXT,

  isActive INTEGER,

  FOREIGN KEY(userIdFirst) REFERENCES users(id),
  FOREIGN KEY(userIdSecond) REFERENCES users(id)

  );
`, dbErrorCallback);

db.run(`
CREATE TABLE IF NOT EXISTS friendRequests (
  id TEXT PRIMARY KEY,

  dateCreated DATETIME,
  userIdRequester TEXT,
  userIdRecipient TEXT,

  FOREIGN KEY(userIdRequester) REFERENCES users(id),
  FOREIGN KEY(userIdRecipient) REFERENCES users(id)

  );
`, dbErrorCallback);

// IN CASE OF FRIEND-CHAT: ownerId is NULL, isPublic is 0, isFriendChat is 1, friendLinkId is SET
db.run(`
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,

  chatName TEXT,
  isPublic INTEGER,
  dateCreated DATETIME,
  ownerId TEXT,

  isFriendChat INTEGER,
  friendLinkId TEXT,

  FOREIGN KEY(friendLinkId) REFERENCES friendLinks(id),
  FOREIGN KEY(ownerId) REFERENCES users(id)

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

// global invites, shortId will be the 5 symbol invite link.
db.run(`
CREATE TABLE IF NOT EXISTS chatInvitationLinks (
  id TEXT PRIMARY KEY,

  shortId TEXT,
  dateCreated DATETIME,
  authorId TEXT,
  chatId TEXT,

  UNIQUE(shortId),
  FOREIGN KEY(authorId) REFERENCES users(id),
  FOREIGN KEY(chatId) REFERENCES chats(id)
  );
`, dbErrorCallback);

// personal invites
db.run(`
CREATE TABLE IF NOT EXISTS chatInvitations (
  id TEXT PRIMARY KEY,

  dateCreated DATETIME,
  authorId TEXT,
  userId TEXT,
  chatId TEXT,

  FOREIGN KEY(authorId) REFERENCES users(id),
  FOREIGN KEY(userId) REFERENCES users(id),
  FOREIGN KEY(chatId) REFERENCES chats(id)
  );
`, dbErrorCallback);

db.run(`
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,

  dateCreated DATETIME,
  senderId TEXT,
  chatId TEXT,
  content TEXT,

  FOREIGN KEY(senderId) REFERENCES users(id),
  FOREIGN KEY(chatId) REFERENCES chats(id)

  );
`, dbErrorCallback);

module.exports = {}
