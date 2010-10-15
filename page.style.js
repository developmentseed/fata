/**
 * TileLite MML handler.
 */
var app = module.parent.exports.app;

/**
 * Produces breakdown by agency of the percentage of responses for the given
 * question given opinion.
 *
 * Example:
 * 'style/Q1/Q1a/positive' would produce the percent of people who think
 *     corruption of local officials is a problem broken down by agency.
 *
 * @param group
 *     The question group ID.
 * @param question
 *     The question ID.
 * @param opinion
 *     The opinion to produce percentages for (e.g. 'positive' or 'negative').
 */
app.get('/style/:group/:question/:opinion', function(req, res) {
    var async = require('async'),
        style = require('./style'),
        dataHandler = req.dataHandler,

        // Async control helper.
        series = [],
        parallel = [],

        // Variables to populate.
        group = [],
        view = [],
        agencies = [],
        responseLabels = [],

        supportFields = ['Somewhat Support', 'Strongly Support'],
        color_start = style.Color('000000'),
        color_end = style.Color('ffffff');

    series.push(function(callback) {
        dataHandler.find({collection: 'groups', conditions: {group: req.params.group}}, function(result) {
            group = result.pop();
            callback(null);
        });
    });
    series.push(function(callback) {
        dataHandler.find({collection: 'agencies'}, function(result) {
            agencies = result;
            callback(null);
        });
    });

    series.push(function(callback) {
        // Set up another series
        var series = []
        // Load question responses for each agency
        agencies.forEach(function(agency) {
            series.push(function (callback) {
                dataHandler.loadQuestion({group: group, context: 'question', conditions: {Agency: agency.id}}, function(result) {
                    if (responseLabels.length == 0) {
                        result.answers.forEach(function (answer) {
                            if (answer.group == req.params.opinion) {
                                responseLabels.push(answer.name);
                            }
                        });
                    }
                    result.questions[req.params.question].responses.forEach(function(response) {
                        if (responseLabels.indexOf(response.label) !== -1) {
                            if (!view[agency.id]) {
                                view[agency.id] = 0;
                            }
                            view[agency.id] += response.percent;
                        }
                    });
                    callback(null);
                });
            });
        });
        async.series(series, function() {
            console.log('done');
            console.log(view);
            var list_normalize = function(a, list) {
                return (a - _.min(list)) / (_.max(list) - _.min(list));
            }
            res.render('style', {
                layout: false,
                locals: {
                    rules: _.map(view, function(record) {
                            return {
                                selector: '#data[adm2_id = "' + record.agency + '"]',
                                properties: [
                                    {
                                        property: 'polygon-fill',
                                        /*
                                        value: color_start.blend(color_end,
                                            list_normalize(record.percent,
                                            _.pluck(view, 'percent')))
                                            */
                                        value: color_start.blend(color_end, 0.4)
                                    }
                                ]
                            }
                        })
                    ,
                    layers: [
                        {
                            file: 'https://client-data.s3.amazonaws.com/naf-fata/fata.zip',
                            type: 'shape',
                            id: 'data',
                        }
                    ]
                }
            });
        });
    });
    async.series(series);
});
