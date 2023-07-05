const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

// returns promise, so that these statements are more readable, and callback functions are be optional - replaced with .then()
// it has to be noted, that db.run() and db.get() run asynchronously, detached from the main thread, and using async keyword is not an option

// checks across all tables since IDs of all tables have the same format
function doesIdExist(id) {
  // TODO: generate this list automatically
  let query = [
    'users',
    'authorizations',
    'chats',
    'friendLinks',
    'chatLinks',
    'messages'
  ]
    .map(tableName => tableName = `SELECT id FROM ${tableName} WHERE id='${id}'`)
    .join('\nUNION\n'); // 'union' joins all sql outputs into a single output
  query += ';';

  return new Promise((success, error) => {
    db.get(query, (err, output) => {
      if (err) {
        error(err);
      } else {
        if (output) {
          console.log('ERROR: tried adding duplicate ID: ' + output); // this should be so incredibly rare that it's more likely there is an error than an actually duplicate ID
          success(true);
        } else {
          success(false);
        }
      }
    });
  });
}

module.exports = {
  AUTH_TABLE: 'authorizations',
  USERS_TABLE: 'users',
  CHATS_TABLE: 'chats',
  CHAT_LINKS_TABLE: 'chatLinks',
  FRIEND_LINKS_TABLE: 'friendLinks',
  FRIEND_REQUESTS_TABLE: 'friendRequests',
  MESSAGES_TABLE: 'messages',

  getRecord(tableName, fieldNames /*: Array<string>*/, condition, returnsLimit = 1, orderByField = null) {
    let fieldNamesString = '';
    fieldNames.forEach((field) => {
      if (fieldNamesString.length > 0) {
        fieldNamesString += ', ';
      }
      fieldNamesString += field;
    });

    let orderByString = '';
    if (orderByField)
      orderByString = `ORDER BY ${orderByField} DESC`;

    return new Promise((success, error) => {
      db.all(`SELECT ${fieldNamesString} FROM ${tableName} WHERE ${condition} ${orderByString} LIMIT ${returnsLimit};`, (err, output) => {
        if (err) {
          error(err);
        } else {
          if (returnsLimit === 1) {
            success(output?.[0]);
          } else {
            success(output);
          }
        }
      });
    });
  },
  // insertion query is an object with keys and values corresponding to the addressed table.
  insertRecord(tableName, insertionQuery) {

    // 16-long hexadecimal hash, near 0% chance of IDs repeating, assigned if no other ID is detected
    let newId = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    insertionQuery.id = insertionQuery.id ?? newId;

    let valuesString = '';
    let keysString = '';

    for (let [key, value] of Object.entries(insertionQuery)) {
      if (valuesString.length > 0) {
        valuesString += ', ';
        keysString += ', ';
      }

      valuesString += `'${value}'`;
      keysString += key;
    }

    return new Promise((success, error) => {
      // To loop until a valid ID is found would force me to make this Promise, a double Promise, since the callback function would have to be async,
      // instead, since chance of this happening is near 0%, it will be just throwing an error.
      doesIdExist(newId).then(doesExist => {
        if (doesExist) {
          error('Generated duplicate ID, try again.');
        } else {
          db.run(`INSERT INTO ${tableName} (${keysString}) VALUES (${valuesString});`, (err, output) => {
            if (err) {
              error(err);
            } else {
              success(true);
            }
          });
        }
      });
    });
  },
  deleteRecord(tableName, condition) {
    return new Promise((success, error) => {
      db.run(`DELETE FROM ${tableName} WHERE ${condition};`, (err, output) => {
        if (err) {
          error(err);
        } else {
          success(true);
        }
      });
    });
  }

  // ONE MORE THING I WILL ADD, 'observeRecord' would use a separate db to send

}
