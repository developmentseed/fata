require.paths.unshift(__dirname + '/modules', __dirname + '/lib/node', __dirname);

var connect = require('connect'),
    express = require('express'),
    settings = require('settings');

// Initialize core object.
var app = module.exports = new express.Server([
  connect.logger()
]);

app.listen(settings.port);
app.set('view engine', 'hbs');

app.get('/home', function(req, res){
  res.render('index', {
      locals: { title: 'My Site' }
  });
});

app.get('/agency/:id?', function(req, res){
  res.send('agency ' + req.params.id);
});

app.get('/question/:id?', function(req, res){
  res.send('question');
});
