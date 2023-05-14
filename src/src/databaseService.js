const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT,
  token TEXT,
  expiry DATETIME,

  FOREIGN KEY(userId) REFERENCES users(id)

  );
`, dbErrorCallback);

// returns promise, so that these statements are more readable, and callback functions are be optional - replaced with .then()
// it has to be noted, that db.run() and db.get() run asynchronously, detached from the main thread, and using async keyword is not an option

// avoiding using class to force a singleton and cleaner addressing from other files
module.exports = {
  getRecord(tableName, fieldNames /*: Array<string>*/, condition) {
    let fieldNamesString = fieldNames.reduce((acc, field) => {
      if (acc.length > 0) {
        acc += ', ';
      }
      acc += field;
    });

    return new Promise<Array<string>>((success, error) => {
      db.get(`SELECT ${fieldNamesString} FROM ${tableName} WHERE ${condition};`, (err, output) => {
        if (err) {
          error(output);
        } else {
          console.log(output);
          success(output.split(' '));
        }
      });
    });
  },
  // insertion query is an object with keys and values corresponding to the addressed table.
  insertRecord(tableName, insertionQuery) {
    let valuesString = "";
    let keysString = "";

    for (let [key, value] of insertionQuery.entries()) {
      if (valuesString.length > 0) {
        valuesString += ', ';
        keysString += ', ';
      }

      valuesString += value;
      keysString += key;
    }

    return new Promise<Boolean>((success, error) => {
      db.run(`INSERT INTO ${tableName} (${keysString}) VALUES (${valuesString});`, (err, output) => {
        if (err) {
          error(output);
        } else {
          success(true);
        }
      });
    });
  },
  deleteRecord(tableName, condition) {
    return new Promise<Boolean>((success, error) => {
      db.run(`DELETE FROM ${tableName} WHERE ${condition};`, (err, output) => {
        if (err) {
          error(output);
        } else {
          success(true);
        }
      });
    });
  }
}
