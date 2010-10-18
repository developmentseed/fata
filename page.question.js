/**
 * Agency page handler.
 */
var app = module.parent.exports.app;

app.get('/question/:id/:filter?/:facet?', function(req, res, next) {
    var id = req.params.id,
        async = require('async'),
        dataHandler = req.dataHandler,

        // Async control helper.
        waterfall = [],

        // Variables to populate.
        totals = [],
        agenciesData = [],
        questions = [],
        groups = [],
        demographics = [],
        activeFilter = {},
        activeConditions = {},
        pageTitle = '',
        subTitle = '';

    // Load all questions and pass the active question group to the
    // next callback.
    waterfall.push(function (callback) {
        dataHandler.find({collection: 'groups'}, function(result) {
            var currentGroup;
            result.forEach(function(group) {
                if (group.id === id) {
                    group.active = true;
                    pageTitle = group.shortname || '';
                    subTitle = group.text || '';
                    currentGroup = group;
                }
                groups.push(group);
            });
            if (currentGroup != null) {
                callback(null, currentGroup);
            }
            else {
                next();
            }
        });
    });

    // Load list of agencies
    waterfall.push(function(group, callback) {
        dataHandler.find({collection: 'agencies'}, function(agencies) {
            callback(null, group, agencies);
        });
    });

    // Get response counts per question, per agency.
    waterfall.push(function (group, agencies, callback) {
        var series = [];

        // Query for the current active filter
        if (req.params.filter && req.params.facet) {
            series.push(function(callback) {
                dataHandler.find({collection: 'demographics', conditions: {'id': req.params.filter, 'facets.id': req.params.facet}}, function(data) {
                    activeFilter = data.pop();
                    if (activeFilter && activeFilter.facets) {
                        activeFilter.facets.forEach(function(facet) {
                            if (facet.id === req.params.facet) {
                                activeConditions[activeFilter.id] = {'$in': facet.values};
                            }
                        });
                    }
                    callback(null);
                });
            });
        }

        agencies.forEach(function(agency) {
            series.push(function(responseCallback) {
                var conditions = {Agency: agency.id};
                _.extend(conditions, activeConditions);
                dataHandler.loadQuestion({group: group, context: 'question', conditions: conditions}, function(result) {
                    for (var q in result.questions) {
                        if (!questions[q]) {
                            questions[q] = {
                                id: q,
                                name: result.questions[q].name
                            };
                        }
                        if (!questions[q]['agencies']) {
                            questions[q]['agencies'] = [];
                        }
                        questions[q]['agencies'].push({
                            id: agency.id,
                            name: agency.name,
                            responses: result.questions[q].responses
                        });
                    }
                    agenciesData[agency.id] = result;
                    responseCallback(null);
                });
            });
        });
        // Load FATA-wide totals
        series.push(function(callback) {
            dataHandler.loadQuestion({group: group, context: 'question', conditions: activeConditions}, function(result) {
                totals = result.renderedQuestions;
                callback(null);
            });
        });
        async.series(series, function(err) {
            var questionsArray = [];
            for (var q in questions) {
                questionsArray.push(questions[q]);
            }
            questions = questionsArray;
            callback(err);
        });
    });

    // Load demographic.
    waterfall.push(function(callback) {
        dataHandler.find({collection: 'demographics'}, function(data) {
            demographics = data;
            callback(null);
        });
    });

    // Render the page
    waterfall.push(function(callback) {
        // Close the DB connection.
        dataHandler.close();

        require('graph').hashes.reset();
        res.render('question', {
            locals: {
                pageTitle: pageTitle,
                subTitle: subTitle,
                groups: groups,
                questions: questions,
                totals: totals,
                demographics: demographics,
                questionShortname: req.params.id,
            }
        });
    });
    async.waterfall(waterfall);
});
