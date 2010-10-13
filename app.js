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
    var dataHandler = app.dataHandler;
    dataHandler.field('agencies', {}, function(data) {
        res.render('index', {
            locals: {
                pageTitle: 'Home',
                agencies: data,
            }
        });
    });
});

// Handle agency page
app.get('/agency/:id', function(req, res) {
    var async = require('async'),
        parallel = [],
        view = {},
        dataHandler = app.dataHandler;
    dataHandler.field('agencies', {URL: req.params.id}, function(data) {
        res.render('agency', {
            locals: {
                pageTitle: data[0].Human,
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
    'afghanistan-landcover-fa': {
      '_type': 'OpenLayers.Layer.MapBox',
      'value': {
        'options': {
          'projection': {
            '_type': 'OpenLayers.Projection',
            'value': 'EPSG:900913'
          },
          'maxExtent': {
            '_type': 'OpenLayers.Bounds',
            'value': [-20037508, -20037508, 20037508, 20037508]
          },
          'type': 'png',
          'layername': 'afghanistan-landcover-fa'
        }
      }
    }
  };
  res.send(default_layers);
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

