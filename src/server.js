const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const databaseStarter = require('./src/databaseStarter');
const databaseService = require('./src/databaseService');
const apiRouter = require('./src/apiCalls');

const port = process.env.NODE_PORT || 3000;

const rootPath = path.join(__dirname, '..', 'dist', 'angular-messenger');

// !!! before launching, remember to ng build, dist doesn't exist without building first, and it's not included in the GitHub repo

// simply setting a static path won't work, due to how angular is compiled
app.get('*', function(req, res) {
  fs.stat(rootPath + req.path, function(err) {
    if (err) {
      res.sendFile("index.html", { root: rootPath });
    } else {
      res.sendFile(req.path, { root: rootPath });
    }
  })
});

app.use('/api', apiRouter);

app.listen(port);
console.log('Listening on port ' + port);
