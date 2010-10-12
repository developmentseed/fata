require.paths.unshift(__dirname + '/modules', __dirname + '/lib/node', __dirname);
connect = require('connect');
express = require('express');
this.settings = require('settings');

// Initialize core object.
var app = module.exports = express.createServer();

app.listen(this.settings.port);