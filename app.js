require.paths.unshift(__dirname + '/modules', __dirname + '/lib/node', __dirname);

var connect = require('connect'),
    express = require('express'),
    settings = require('settings');

if (settings.mongodb) {
    var mongo = require('node-mongodb-native/lib/mongodb');
    var db = new mongo.Db(settings.mongodb.db, new mongo.Server(settings.mongodb.host, mongo.Connection.DEFAULT_PORT, {}), {});
    /*
    db.open(function(err, db) {
        db.collection('responses', function(err, collection) {
            collection.count(function(err, foo) {
                console.log(foo);
            });
        });
    });
    */
    /*
    db.open(function(err, db) {
        db.collection('responses', function(err, collection) {
            collection.group(
                { current_disaster:true }, // Fields
                { }, // Conditions
                { 1: 0, 0: 0 },
                function(obj, prev) { prev[obj.current_disaster]++ }, // Reduce callback
                function(err, foo) {
                    console.log(foo);
                }
            );
        });
    });
    */
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
    res.render('agency', {
        locals: { pageTitle: 'Agency' }
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
