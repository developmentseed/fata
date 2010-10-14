/**
 * Agency page handler.
 */
var app = module.parent.exports;

app.get('/agency/:id/:filter?', function(req, res, next) {
    var async = require('async'),
        dataHandler = req.dataHandler,

        // Async control helper.
        parallel = [],

        // Variables to populate.
        agencies = [],
        questions = [],
        profile = '',
        pageTitle = '';

    // Load all questions
    parallel.push(function(callback) {
        // Set up waterfall:
        // 1. Load all questions
        // 2. For each question, load all responses
        var waterfall = [];
        waterfall.push(function(callback) {
            dataHandler.find({collection: 'groups'}, function(result) {
                callback(null, result);
            });
        });
        waterfall.push(function(result, callback) {
            var series = [];
            result.forEach(function(question) {
                questions.push(question);

                // Filter questions down to those that should be displayed in
                // this context.
                var display = [];
                for (var q in question.questions) {
                    if (question.questions[q].display.indexOf('agency') !== -1) {
                        display.push(q);
                    }
                }
                display.forEach(function(q) {
                    var responses = [];
                    question.questions[q].responses = responses;
                    series.push(function(responseCallback) {
                        dataHandler.countField({collection: 'responses', field: q, conditions: {Agency: req.params.id}}, function(result) {
                            var graph = require('graph');
                            graph.process({answers:question.answers}, result.pop().value).forEach(function(bar) {
                                responses.push(bar);
                            });
                            responseCallback(null);
                        });
                    });
                });
            });
            async.series(series, function(error) {
                // Gross. Convert objects to arrays for templating.
                questions.forEach(function(question) {
                    var render = [];
                    for (var i in question.questions) {
                        render.push(question.questions[i]);
                    }
                    question.questions = render;
                });
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
                if (agency.id == req.params.id) {
                    agency.active = true;
                }
                agencies.push(agency);
            });
            callback(null);
        });
    });

    // Load the current agency's information.
    parallel.push(function(callback) {
        dataHandler.find({collection: 'agencies', conditions: {id: req.params.id}}, function(data) {
            if (data && data[0] && data[0].name) {
                pageTitle = data[0].name;
            }
            else {
                next();
            }
            callback(null);
        });
    });

    // Load the current agency's markdown content if available.
    parallel.push(function(callback) {
        dataHandler.markdown({path: 'content/agency.'+req.params.id+'.md'}, function(data) {
            profile = data;
            callback(null);
        });
    });

    // Run all tasks and render.
    async.parallel(parallel, function(error) {
        res.render('agency', {
            locals: {
                pageTitle: pageTitle,
                profile: profile,
                agencies: agencies,
                questions: questions,
            }
        });
    });
});
