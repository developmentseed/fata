require.paths.unshift(__dirname + '/modules', __dirname + '/lib/node', __dirname);
var settings = require('settings');

if (settings.mongodb) {
    var mongo = require('node-mongodb-native/lib/mongodb');
    var DataHandler = require('./data');
    var db = new mongo.Db(settings.mongodb.db, new mongo.Server(settings.mongodb.host, mongo.Connection.DEFAULT_PORT, {}), {});
    dataHandler = new DataHandler(db);
    db.open(function(err, db) {
        var async = require('async');
        var parallel = [];
        parallel.push(function(callback) {
            var waterfall = [];

            // Load list of agencies
            waterfall.push(function(callback) {
                dataHandler.find({collection: 'agencies'}, function(result) {
                    callback(null, result);
                });
            });

            // Load demographics
            waterfall.push(function(agencies, callback) {
                dataHandler.find({collection: 'demographics'}, function(result) {
                    callback(null, agencies, result);
                });
            });

            // Load the first question group
            waterfall.push(function(agencies, demographics, callback) {
                dataHandler.find({collection: 'groups', conditions: {group: 'Q1'}}, function(result) {
                    callback(null, agencies, demographics, result.pop());
                });
            });

            waterfall.push(function(agencies, demographics, questionGroup, callback) {
                var series = [];

                // Query with no conditions
                series.push(function(callback) {
                    var conditions = {};
                    dataHandler.loadQuestion({group: questionGroup, context: 'question', conditions: conditions}, function(result) {
                        callback(null);
                    });
                });

                demographics.forEach(function(filter) {
                    filter.facets.forEach(function(facet) {
                        // Query with demographics as a condition
                        series.push(function(callback) {
                            var conditions = {};
                            conditions[filter.id] = {'$in': facet.values};
                            dataHandler.loadQuestion({group: questionGroup, context: 'question', conditions: conditions}, function(result) {
                                callback(null);
                            });
                        });
                    });
                });

                agencies.forEach(function(agency) {
                    // Query with agency as a condition
                    series.push(function(callback) {
                        var conditions = {};
                        conditions.Agency = agency.id;
                        dataHandler.loadQuestion({group: questionGroup, context: 'question', conditions: conditions}, function(result) {
                            callback(null);
                        });
                    });
                    demographics.forEach(function(filter) {
                        filter.facets.forEach(function(facet) {
                            // Query with both agency and demographics as conditions
                            series.push(function(callback) {
                                var conditions = {};
                                conditions.Agency = agency.id;
                                conditions[filter.id] = {'$in': facet.values};
                                dataHandler.loadQuestion({group: questionGroup, context: 'question', conditions: conditions}, function(result) {
                                    callback(null);
                                });
                            });
                        });
                    });
                });
                async.series(series, function() {
                    callback(null);
                });
            });
            console.log('Creating MapReduce tables. This could take a while...');
            async.waterfall(waterfall, function() {
                callback(null);
            });
        });
        async.parallel(parallel, function() {
            console.log('Complete!');
            process.exit(0);
        });
    });
}
