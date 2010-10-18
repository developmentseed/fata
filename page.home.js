/**
 * Homepage handler.
 */
var app = module.parent.exports.app,
    settings = module.parent.exports.settings;

app.get('/', function(req, res) {
    var async = require('async'),
        dataHandler = req.dataHandler,

        // Async control helper.
        series = [],

        // Variables to populate.
        agencies = [],
        groups = [],
        sections = [],
        intro = '';

    // Agencies menu.
    series.push(function(callback) {
        dataHandler.find({collection: 'agencies'}, function(data) {
            agencies = data;
            callback(null);
        });
    });

    // Question groups menu.
    series.push(function(callback) {
        dataHandler.find({collection: 'groups'}, function(data) {
            groups = data;
            callback(null);
        });
    });

    // Content sections.
    series.push(function(callback) {
        dataHandler.markdown({path: 'content/home.intro.md'}, function(data) {
            intro = data;
            callback(null);
        });
    });

    // Build each content section.
    settings.homeSections.forEach(function(section) {
        series.push(function(callback) {
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
            if (section.group) {
                series.push(function(callback) {
                    dataHandler.find({collection: 'groups', conditions: {group: section.group}}, function(result) {
                        loaded.group = result.pop();
                        callback(null);
                    });
                });
                series.push(function(callback) {
                    dataHandler.loadQuestion({group: loaded.group, context: 'home'}, function(result) {
                        loaded.group = result;
                        callback(null);
                    });
                });
            }

            // Run tasks as series.
            async.series(series, function() {
                sections.push(loaded);
                callback(null);
            });
        });
    });

    async.series(series, function(error) {
        // Close the DB connection.
        dataHandler.close();

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
