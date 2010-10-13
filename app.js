require.paths.unshift(__dirname + '/modules', __dirname + '/lib/node', __dirname);

var connect = require('connect'),
    express = require('express'),
    settings = require('settings');
    _ = require('./modules/underscore/underscore')._;

// Initialize core object.
var app = module.exports = new express.Server([
    connect.logger({ format: '- [:response-timems] :date - :method :status' }),
    connect.staticProvider(__dirname + '/public')
]);

// Set view engine
app.set('view engine', 'hbs');

// Populate dynamicHelpers (layout templating functions)
app.dynamicHelpers({
    siteTitle: function(req, res) {
        return settings.siteTitle;
    },
    footerMessage: function() {
        return settings.footerMessage;
    },
    primaryNavigation: function(req) {
        items = [
            {title:'Home', url:'/'},
            {title:'Agencies', url:'/agency'},
            {title:'Questions', url:'/question'},
            {title:'About', url:'/about'}
        ];
        items.forEach(function (item) {
            if (item.url == req.url) {
                item.active = true;
            }
        });
        return items;
    },
});

// Handle home page
app.get('/', function(req, res) {
    var async = require('async'),
        parallel = [],
        agenciesView = {},
        questionsView = {},
        dataHandler = app.dataHandler;
    parallel.push(function(callback) {
        dataHandler.field('agencies', {}, function(data) {
            agenciesView = data;
            callback(null);
        });
    });
    parallel.push(function(callback) {
        dataHandler.field('questions', {}, function(data) {
            questionsView = data;
            callback(null);
        });
    });
    async.parallel(parallel, function(error) {
        res.render('index', {
            locals: {
                pageTitle: 'Home',
                agencies: agenciesView,
                questions: questionsView
            }
        });
    });
});

// Handle agency page
app.get('/agency/:id', function(req, res) {
    var async = require('async'),
        parallel = [],
        view = {},
        agenciesView = {},
        pageTitle = '',
        dataHandler = app.dataHandler;

    settings.questions.forEach(function(question) {
        parallel.push(function(callback) {
            dataHandler.countField('responses', question, {Agency: req.params.id}, function(result) {
                view[question] = result[question];
                callback(null);
            });
        });
    });

    parallel.push(function(callback) {
        dataHandler.field('agencies', {}, function(data) {
            data.forEach(function(agency) {
                if ('/agency/' + agency.ID == req.url) {
                    agency.active = true;
                }
            });
            agenciesView = data;
            callback(null);
        });
    });

    parallel.push(function(callback) {
        dataHandler.field('agencies', {ID: req.params.id}, function(data) {
            pageTitle = data[0].Human
            callback(null);
        });
    });

    async.parallel(parallel, function(error) {
        res.render('agency', {
            locals: {
                pageTitle: pageTitle,
                agencies: agenciesView,
            }
        });
    });
});

// Handle question page
app.get('/question/:id', function(req, res) {
    if (settings.questions.indexOf(req.params.id) !== -1) {
        var question = req.params.id,
            dataHandler = app.dataHandler;
        dataHandler.countField('responses', question, {}, function(result) {
            data = [];
            _.each(result[question], function(value, key) {
                response = {
                    name: key,
                    count: value
                }
                data.push(response);
            });
            res.render('question', {
                locals: {
                    pageTitle: 'Question',
                    results: data
                }
            });
        });
    }
});

// Handle about page
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

app.get('/layers', function(req, res) {
  var default_layers = {
    '_type': 'OpenLayers.Layer.MapBox',
    '_value': [
      'blah',
      {
        'projection': {
          '_type': 'OpenLayers.Projection',
          '_value': 'EPSG:900913'
        },
        'type': 'jpg',
        'layername': 'afghanistan-landcover-fa'
      }
    ]
  };
  res.send(default_layers);
});

// Database setup
if (settings.mongodb) {
    var mongo = require('node-mongodb-native/lib/mongodb');
    var DataHandler = require('./data');
    var db = new mongo.Db(settings.mongodb.db, new mongo.Server(settings.mongodb.host, mongo.Connection.DEFAULT_PORT, {}), {});
    app.db = db;
    app.dataHandler = new DataHandler(db);
}

// Begin HTTP server!
app.listen(settings.port);
console.log('Express server started on port %s', app.address().port);
