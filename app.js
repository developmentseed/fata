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
app.dynamicHelpers({
    siteTitle: function(req, res) {
        return settings.siteTitle;
    },
    primaryNavigation: function(req) {
        items = [
            {title:'Home', url:'/'},
            {title:'Agencies', url:'/agency'},
            {title:'Questions', url:'/question'}
        ];
        for (item in items) {
            if (items[item].url == req.url) {
                items[item].active = true;
            }
        }
        return items;
    },
});

app.get('/', function(req, res) {
    res.render('index', {
        locals: { pageTitle: 'Home' }
    });
});

app.get('/agency/:id?', function(req, res) {
    res.render('agency', {
        locals: { pageTitle: 'Agency' }
    });
});

app.get('/question/:id?', function(req, res) {
    res.render('question', {
        locals: { pageTitle: 'Question' }
    });
});
