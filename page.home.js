/**
 * Homepage handler.
 */
var app = module.parent.exports;

app.get('/', function(req, res) {
    var async = require('async'),
        parallel = [],
        agenciesView = {},
        questionsView = {},
        dataHandler = req.dataHandler;
    parallel.push(function(callback) {
        dataHandler.find({collection: 'agencies'}, function(data) {
            agenciesView = data;
            callback(null);
        });
    });
    parallel.push(function(callback) {
        dataHandler.find({collection: 'questions'}, function(data) {
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
