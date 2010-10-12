require.paths.unshift(__dirname + '/modules', __dirname + '/lib/node', __dirname);

var connect = require('connect'),
    express = require('express'),
    settings = require('settings');

// Initialize core object.
var app = module.exports = new express.Server([
  connect.logger()
]);

app.listen(settings.port);
