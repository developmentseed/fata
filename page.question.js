/**
 * Agency page handler.
 */
var app = module.parent.exports;

app.get('/question/:group/:filter?', function(req, res) {
    var group = req.params.group,
        dataHandler = req.dataHandler,
        async = require('async'),
        waterfall = [],
        pageTitle = '',
        subTitle = '';
    // Load the question group
    waterfall.push(function (callback) {
        dataHandler.find({collection: 'questions', conditions: {id:group}}, function(groups) {
            pageTitle = groups[0].shortname;
            subTitle = groups[0].text;
            callback(null, groups[0]);
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
        var parallel = [],
            responses = {};
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
