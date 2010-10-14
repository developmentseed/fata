/**
 * Agency page handler.
 */
var app = module.parent.exports;

app.get('/question/:id/:filter?', function(req, res) {
    var id = req.params.id,
        async = require('async'),
        dataHandler = req.dataHandler,

        // Async control helper.
        waterfall = [],

        // Variables to populate.
        questions = [],
        responses = {},
        pageTitle = '',
        subTitle = '';

    // Load all questions and pass the active question group to the
    // next callback.
    waterfall.push(function (callback) {
        dataHandler.find({collection: 'questions'}, function(result) {
            result.forEach(function(question) {
                if (question.id === id) {
                    question.active = true;
                    pageTitle = question.shortname || '';
                    subTitle = question.text || '';
                    callback(null, question);
                }
                questions.push(question);
            });
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
        var parallel = [];
        _.each(group.questions, function(value, question) {
            if (value.display.indexOf('question') !== -1) {
                responses[question] = {text:value.name};
                agencies.forEach(function(agency) {
                    responses[question][agency.ID] = [];
                    parallel.push(function(callback) {
                        dataHandler.countField({collection: 'responses', field: question, conditions: {Agency:agency.ID}}, function(results) {
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
            callback(null);
        });
    });
    // Render the page
    waterfall.push(function(callback) {
        console.log(questions);
        res.render('question', {
            locals: {
                pageTitle: pageTitle,
                subTitle: subTitle,
                questions: questions,
                responses: responses
            }
        });
    });
    async.waterfall(waterfall);
});
