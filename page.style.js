/**
 * TileLite MML handler.
 */
var app = module.parent.exports.app;

app.get('/style/drone/:agency', function(req, res) {
    res.render('style', {
        layout: false,
        locals: {
            rules: [
                {
                    'selector': '#data',
                    properties: [
                        {
                            property: 'marker-width',
                            value: 3
                        },
                        {
                            property: 'marker-height',
                            value: 3
                        },
                        {
                            property: 'marker-fill',
                            value: '#dd4400'
                        },
                        {
                            property: 'marker-fill-opacity',
                            value: 0.9
                        },
                        {
                            property: 'marker-line-color',
                            value: '#dd3300'
                        },
                        {
                            property: 'marker-line-width',
                            value: 3
                        },
                        {
                            property: 'marker-line-opacity',
                            value: 0.9
                        },
                        {
                            property: 'marker-type',
                            value: 'ellipse'
                        }
                    ]
                }
            ],
            layers: [
                {
                    file: 'http://localhost:8888/drone/' + req.params.agency + '/drones.geojson',
                    type: 'ogr',
                    id: 'data',
                    layer: 'OGRGeoJSON',
                }
            ]
        }
    });
});


/**
 * Produces breakdown by agency of the percentage of responses for the given
 * question given opinion.
 *
 * Example:
 * 'style/question/Q1a/positive' would produce the percent of people who think
 *     corruption of local officials is a problem broken down by agency.
 *
 * @param question
 *     The question ID.
 * @param opinion
 *     The opinion to produce percentages for (e.g. 'positive' or 'negative').
 */
app.get('/style/question/:question/:opinion', function(req, res) {
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

    // Determine groupId from questionId
    var groupId = '',
        questionId = req.params.question;
    for (var l in questionId) {
        if (l != 0 && isNaN(questionId[l])) {
            groupId = questionId.substring(0, l);
            break;
        }
    }
    if (!groupId.length) {
        groupId = questionId;
    }

    series.push(function(callback) {
        dataHandler.find({collection: 'groups', conditions: {group: groupId}}, function(result) {
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
                    result.questions[questionId].responses.forEach(function(response) {
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
