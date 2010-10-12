require.paths.unshift(__dirname + '/modules', __dirname + '/lib/node', __dirname);

var connect = require('connect'),
    express = require('express'),
    settings = require('settings');

// Initialize core object.
var app = module.exports = new express.Server([
    connect.logger({ format: '- [:response-timems] :date - :method :status' }),
    connect.staticProvider(__dirname + '/public')
]);

app.set('view engine', 'hbs');
app.dynamicHelpers({
    siteTitle: function(req, res) {
        return settings.siteTitle;
    },
    primaryNavigation: function(req) {
        items = [
            {title:'Home', url:'/'},
            {title:'Agencies', url:'/agency'},
            {title:'Questions', url:'/question'},
            {title:'About', url:'/about'}
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
    var async = require('async'),
        parallel = [],
        view = {},
        dataHandler = app.dataHandler;
    settings.questions.forEach(function(question) {
        parallel.push(function(callback) {
            dataHandler.countField('responses', question, {}, function(result) {
                view[question] = result[question];
                callback(null);
            });
        });
    });
    async.parallel(parallel, function(error) {
        console.log(view);
        res.render('agency', {
            locals: { pageTitle: 'Agency' }
        });
    });
});

app.get('/question/:id?', function(req, res) {
    res.render('question', {
        locals: { pageTitle: 'Question' }
    });
});

app.get('/about', function(req, res) {

    var markdown = require('markdown'),
        fs = require('fs');

    fs.readFile('about.md', 'utf-8', function (err, data) {
        if (err) throw err;
        res.render('about', {
            locals: {
                pageTitle: 'About',
                contentText: markdown.Markdown(data)
            }
        });
    });
});

if (settings.mongodb) {
    var mongo = require('node-mongodb-native/lib/mongodb');
    var DataHandler = require('./data');
    var db = new mongo.Db(settings.mongodb.db, new mongo.Server(settings.mongodb.host, mongo.Connection.DEFAULT_PORT, {}), {});
    db.open(function(err, db) {
        app.db = db;
        app.dataHandler = new DataHandler(db);
        app.listen(settings.port);
        console.log('Express server started on port %s', app.address().port);
    });
}

