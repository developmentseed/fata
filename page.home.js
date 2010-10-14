/**
 * Homepage handler.
 */
var app = module.parent.exports.app,
    settings = module.parent.exports.settings;

app.get('/', function(req, res) {
    var async = require('async'),
        dataHandler = req.dataHandler,

        // Async control helper.
        parallel = [],

        // Variables to populate.
        agencies = [],
        groups = [],
        sections = [],
        intro = '';

    // Agencies menu.
    parallel.push(function(callback) {
        dataHandler.find({collection: 'agencies'}, function(data) {
            agencies = data;
            callback(null);
        });
    });

    // Question groups menu.
    parallel.push(function(callback) {
        dataHandler.find({collection: 'groups'}, function(data) {
            groups = data;
            callback(null);
        });
    });

    // Content sections.
    parallel.push(function(callback) {
        dataHandler.markdown({path: 'content/home.intro.md'}, function(data) {
            intro = data;
            callback(null);
        });
    });

    // Build each content section.
    settings.homeSections.forEach(function(section) {
        parallel.push(function(callback) {
            var series = [];
            var loaded = {};

            // Load markdown text.
            series.push(function(callback) {
                dataHandler.markdown({path: 'content/home.'+section.content+'.md'}, function(data) {
                    loaded.content = data;
                    callback(null);
                });
            });
            // @TODO load graphs.

            // Run tasks as series.
            async.series(series, function() {
                sections.push(loaded);
                callback(null);
            });
        });
    });

    async.parallel(parallel, function(error) {
        res.render('home', {
            locals: {
                pageTitle: 'Home',
                agencies: agencies,
                groups: groups,
                sections: sections,
                intro: intro
            }
        });
    });
});
