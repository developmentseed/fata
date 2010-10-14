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
var app = module.exports = new express.Server([
    connect.logger({ format: '- [:response-timems] :date - :method :status' }),
    connect.staticProvider(__dirname + '/public'),
    new dbConnection(settings.mongodb)
]);

// Set view engine
app.set('view engine', 'hbs');

// Populate dynamicHelpers (layout templating functions)
app.dynamicHelpers({
    siteTitle: function(req, res) {
        return settings.siteTitle;
    },
    footerMessage: function() {
        return settings.footerMessage;
    }
});

// Handle home page
app.get('/', function(req, res) {
    var async = require('async'),
        parallel = [],
        agenciesView = {},
        questionsView = {},
        dataHandler = req.dataHandler;
    parallel.push(function(callback) {
        dataHandler.field('agencies', {}, function(data) {
            agenciesView = data;
            callback(null);
        });
    });
    parallel.push(function(callback) {
        dataHandler.field('questions', {}, function(data) {
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

// Handle agency page
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
            dataHandler.field('questions', {}, function(questions) {
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
                        dataHandler.countField('responses', q, {Agency: req.params.id}, function(result) {
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
        dataHandler.field('agencies', {}, function(data) {
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
        dataHandler.field('agencies', {ID: req.params.id}, function(data) {
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

// Handle question page
app.get('/question/:group/:filter?', function(req, res) {
    var group = req.params.group,
        dataHandler = req.dataHandler,
        async = require('async'),
        waterfall = [],
        pageTitle = '',
        subTitle = '';
    // Load the question group
    waterfall.push(function (callback) {
        dataHandler.field('questions', {id:group}, function(groups) {
            pageTitle = groups[0].shortname;
            subTitle = groups[0].text;
            callback(null, groups[0]);
        });
    });
    // Load list of agencies
    waterfall.push(function(group, callback) {
        dataHandler.field('agencies', {}, function(agencies) {
            callback(null, group, agencies);
        });
    });
    // Get response counts per question, per agency.
    waterfall.push(function (group, agencies, callback) {
        var parallel = [],
            responses = {};
        _.each(group.questions, function(value, question) {
            if (value.display.indexOf('question') !== -1) {
                responses[question] = {text:value.name};
                agencies.forEach(function(agency) {
                    responses[question][agency.ID] = [];
                    parallel.push(function(callback) {
                        dataHandler.countField('responses', question, {Agency:agency.ID}, function(results) {
                            response = {};
                            // Add a total response count
                            response.total = _.reduce(results, function(memo, num){
                                return memo + num.value.count;
                            }, 0);
                            // Add raw count and percentage
                            _.each(results, function(num, key) {
                                _.each(results, function(num){
                                    response[num._id] = {
                                        count: num.value.count,
                                        percent: num.value.count / response.total * 100
                                    }
                                });
                            });
                            responses[question][agency.ID].push(response);
                            callback(null);
                        });
                    });
                });
            }
        });
        async.parallel(parallel, function() {
            callback(null, responses);
        });
    });
    // Render the page
    waterfall.push(function(results, callback) {
        console.log(results);
        res.render('question', {
            locals: {
                pageTitle: pageTitle,
                subTitle: subTitle,
                questions: results
            }
        });
    });
    // dataHandler.countField('responses', question, {}, function(result) {
    //     data = [];
    //     _.each(result[question], function(value, key) {
    //         response = {
    //             name: key,
    //             count: value
    //         };
    //         data.push(response);
    //     });
    //     res.render('question', {
    //         locals: {
    //             pageTitle: 'Question',
    //             results: data
    //         }
    //     });
    // });
    async.waterfall(waterfall);
});

// Handle about page
app.get('/about', function(req, res) {
    var markdown = require('markdown'),
        fs = require('fs');

    fs.readFile('content/about.md', 'utf-8', function(err, data) {
        if (err) throw err;
        res.render('about', {
            locals: {
                pageTitle: 'About',
                contentText: markdown.Markdown(data)
            }
        });
    });
});

app.get('/style/:question', function(req, res) {
    var async = require('async'),
        style = require('./style'),
        dataHandler = req.dataHandler,
        waterfall = [],
        parallel = [],
        view = [],
        supportFields = ['Somewhat Support', 'Strongly Support'],
        color_start = style.Color('000000'),
        color_end = style.Color('111111');
        question = req.params.question;
    waterfall.push(function(callback) {
        // Load list of agencies
        dataHandler.field('agencies', {}, function(agencies) {
            callback(null, agencies);
        });
    });
    waterfall.push(function(agencies, callback) {
        // Load question responses for each agency
        agencies.forEach(function(agency) {
            parallel.push(function (callback) {
                dataHandler.countField('responses', question, {Agency:agency.ID}, function(result) {
                    var totalResponses = _.reduce(result, function(memo, num){
                        return memo + num.value.count;
                    }, 0);
                    var support = 0;
                    supportFields.forEach(function(field) {
                        result.forEach(function(row) {
                            if (row._id == field && row.value.count) {
                                support += row.value.count;
                            }
                        });
                    });
                    view.push({
                        agency: agency.ID,
                        percent: support / totalResponses * 100
                    });
                    callback(null);
                });
            });
        });
        async.parallel(parallel, function(err) {
            var list_normalize = function(a, list) {
                return (a - _.min(list)) / (_.max(list) - _.min(list));
            }
            res.render('style', {
                layout: false,
                locals: {
                    rules: _.map(view, function(record) {
                            return {
                                selector: '#data[ID = "' + record.agency + '"]',
                                properties: [
                                    {
                                        property: 'polygon-fill',
                                        value: color_start.blend(color_end, 
                                            list_normalize(record.percent, 
                                            _.pluck(view, 'percent')))
                                    }
                                ]
                            }
                        })
                    ,
                    layers: [
                        {
                            property: 'polygon-fill',
                            value: '#000',
                            file: 'test.shp',
                            type: 'shape',
                            id: 'data',
                        }
                    ]
                }
            });
        });
    });
    async.waterfall(waterfall);
});

app.get('/map/:question', function(req, res) {
    var fs = require('fs');
    var map_template = JSON.parse(fs.readFileSync('map_defaults.json', 'utf-8'));
    var question_layer = map_template.layers.stylewriter;
    question_layer._value[1].mapfile = '/style/' + req.params.question;
    res.send({
        'layers': [question_layer],
        'controls': [map_template.controls.navigation]});
});

// Begin HTTP server!
app.listen(settings.port);
console.log('Express server started on port %s', app.address().port);
