const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.json());

const databaseStarter = require('./src/databaseStarter');
const databaseService = require('./src/databaseService');
const apiRouter = require('./src/apiCalls');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const rootPath = path.join(__dirname, '..', 'dist', 'angular-messenger');

// !!! before launching, remember to ng build, dist doesn't exist without building first, and it's not included in the GitHub repo

// simply setting a static path won't work, due to how angular is compiled
// every request besides /api/ requests gets served the SPA main page, this explains why get requests never worked for me lol
app.get(/^(?!\/api).*/, function(req, res) {
  fs.stat(rootPath + req.path, function (err) {
    if (err) {
      // check for static as well before sending back default index.html
      let staticPath = path.join(__dirname, '..', 'src', 'static');
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

app.use('/api', apiRouter);

app.listen(port);
console.log('Listening on port ' + port);
