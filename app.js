require.paths.unshift(__dirname + '/modules', __dirname + '/lib/node', __dirname);

var connect = require('connect'),
    express = require('express'),
    settings = require('settings'),
    dbConnection = require('db');
    _ = require('./modules/underscore/underscore')._;

// Initialize the Express server with an array of middleware layers to use:
// 1. Log mesage output for each request.
// 2. Static file serving from /public directory (for CSS, JavaScript, images)
//    @TODO: Use this in dev only, use nginx when in production.
// 3. DB connection middleware. See db.js.
var app = module.exports.app = new express.Server([
    connect.logger({ format: '- [:response-timems] :date - :method :status' }),
    connect.staticProvider(__dirname + '/public'),
    new dbConnection(settings.mongodb)
]);

// Add settings to export
module.exports.settings = settings;

// Use hbs (Express wrapper around handlebars.js) as template engine.
app.set('view engine', 'hbs');

// Populate dynamicHelpers (layout template variables)
app.dynamicHelpers({
    bodyClasses: function(req, res) {
        var classes = [];
        if (req.url === '/') {
            classes.push('front');
        }
        var path = [];
        req.url.split('/').forEach(function(arg) {
            if (arg) {
                path.push(arg);
                classes.push(path.join('-'));
            }
        });
        return classes.join(' ');
    },
    siteTitle: function(req, res) {
        return settings.siteTitle;
    },
    footerMessage: function() {
        return settings.footerMessage;
    },
    analytics: function() {
        return settings.googleAnalyticsAccount;
    }
});

// HTML pages
require('page.home');
require('page.about');
require('page.agency');
require('page.question');

// Map JSON and MML
require('page.map');
require('page.style');
require('page.drone');

// Begin HTTP server
app.listen(settings.port);
console.log('Express server started on port %s', app.address().port);
