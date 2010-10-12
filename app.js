require.paths.unshift(__dirname + '/modules', __dirname + '/lib/node', __dirname);

var connect = require('connect'),
    express = require('express'),
    settings = require('settings');

if (settings.db && settings.db.url) {
  var mongoose = require('mongoose/mongoose').Mongoose;
  var db = mongoose.connect(settings.db.url);
  console.log('Using database %s', settings.db.url)
}

// Initialize core object.
var app = module.exports = new express.Server([
  connect.logger(),
  connect.staticProvider(__dirname + '/public')
]);

app.listen(settings.port);
console.log('Express server started on port %s', app.address().port);
app.set('view engine', 'hbs');

app.get('/', function(req, res) {
  res.render('index', {
      locals: { pageTitle: 'Home | ' + settings.siteTitle }
  });
});

app.get('/agency/:id?', function(req, res) {
  res.render('agency', {
      locals: { pageTitle: 'Agency | ' + settings.siteTitle }
  });
});

app.get('/question/:id?', function(req, res) {
  res.render('question', {
      locals: { pageTitle: 'Qeustion | ' + settings.siteTitle }
  });
});
