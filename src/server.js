const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser'); // parser for request body JSON data
const multer = require('multer'); // parser for FormData data
const cookieParser = require("cookie-parser");

// we're using a non-standard multer mechanism, essentially saving received files into the memory (sounds scary, but I will ignore my gut),
// then after saving the image to ram, and processing the request, we move the image from ram to it's destination
const upload = require('./src/multerInstance');

app.use(cookieParser());
app.use(bodyParser.json()); // application/json
app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded
// all of the lines below dictate the only allowed type of form data transmitted globally.
// app.use(upload.array()); // returns: 500 unexpected field
// app.use(upload.single('image')); // returns: 500 unexpected field (doesn't see chatId)
// app.use(upload.any()); // throws: too long to paste, but critical

const databaseStarter = require('./src/databaseStarter');
const databaseService = require('./src/databaseService');
const apiRouter = require('./src/apiCalls');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const rootPath = path.join(__dirname, '..', 'dist', 'angular-messenger');

// !!! before launching, remember to ng build, dist doesn't exist without building first, and it's not included in the GitHub repo

// simply setting a static path won't work, due to how angular is compiled
// every request besides /api/ requests gets served the SPA main page, this explains why get requests never worked for me lol
let staticPath = path.join(__dirname, '..', 'src', 'static');
app.get(/^(?!\/api).*/, function(req, res) {
  fs.stat(rootPath + req.path, function (err) {
    if (err) {
      // check for static as well before sending back default index.html
      fs.stat(staticPath + req.path, function (err) {
        if (err) {
          res.sendFile("index.html", { root: rootPath });
        } else {
          res.sendFile(req.path, { root: staticPath });
        }
      });
    } else {
      res.sendFile(req.path, { root: rootPath });
    }
  });
});

// global stack error handling, should completely mitigate client-caused server crashes
// DO NOT FIX! Everything here from the app.use() construction to res.status() is unrecognised and marked as error, this is IDE's mistake. DO NOT FIX!
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});
app.use('/api', apiRouter);

if (!fs.existsSync(staticPath)){
  fs.mkdirSync(staticPath);
  console.log('created static directory');
} else {
  console.log('static directory already present');
}

app.listen(port);
console.log('Listening on port ' + port);
