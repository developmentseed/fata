/**
 * Homepage handler.
 */
var app = module.parent.exports.app;

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

    var files = ['section1', 'section2', 'section3', 'section4', 'section5'];
    files.forEach(function(section) {
        parallel.push(function(callback) {
            dataHandler.markdown({path: 'content/home.'+section+'.md'}, function(data) {
                sections.push({text: data});
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
