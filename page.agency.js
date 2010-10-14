/**
 * Agency page handler.
 */
var app = module.parent.exports;

app.get('/agency/:id/:filter?', function(req, res, next) {

    var async = require('async'),
        parallel = [],
        agencies = {},
        questions = {},
        pageTitle = '',
        dataHandler = req.dataHandler;

    // Load all questions
    parallel.push(function(callback) {
        // Set up waterfall:
        // 1. Load all questions
        // 2. For each question, load all responses
        var waterfall = [];
        waterfall.push(function(callback) {
            dataHandler.find({collection:'questions'}, function(questions) {
                callback(null, questions);
            });
        });
        waterfall.push(function(result, callback) {
            var series = [];
            result.forEach(function(question) {
                questions[question.group] = question;

                var display = [];
                for (var q in question.questions) {
                    if (question.questions[q].display.indexOf('agency') !== -1) {
                        display.push(q);
                    }
                }
                display.forEach(function(q) {
                    series.push(function(responseCallback) {
                        dataHandler.countField({collection: 'responses', field: q, conditions: {Agency: req.params.id}}, function(result) {
                            questions[question.group].questions[q].responses = result.pop().value;
                            responseCallback(null);
                        });
                    });
                });
            });
            async.series(series, function(error) {
                callback(error);
            });
        });
        async.waterfall(waterfall, function(error) {
            callback(error);
        });
    });

    // Load agencies for navigation.
    parallel.push(function(callback) {
        dataHandler.find({collection: 'agencies'}, function(data) {
            data.forEach(function(agency) {
                if ('/agency/' + agency.ID == req.url) {
                    agency.active = true;
                }
            });
            agencies = data;
            callback(null);
        });
    });

    // Load the current agency's information.
    parallel.push(function(callback) {
        dataHandler.find({collection: 'agencies', conditions: {ID: req.params.id}}, function(data) {
            if (data && data[0] && data[0].Human) {
                pageTitle = data[0].Human;
            }
            else {
                next();
            }
            callback(null);
        });
    });

    // Run all tasks and render.
    async.parallel(parallel, function(error) {
        res.render('agency', {
            locals: {
                pageTitle: pageTitle,
                agencies: agencies,
                questions: questions,
            }
        });
    });
});
