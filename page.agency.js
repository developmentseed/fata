/**
 * Agency page handler.
 */
var app = module.parent.exports.app;

app.get('/agency/:id/:filter?/:facet?', function(req, res, next) {
    var async = require('async'),
        dataHandler = req.dataHandler,

        // Async control helper.
        parallel = [],

        // Variables to populate.
        agencies = [],
        groups = [],
        demographics = [],
        drone_info = {},
        activeFilter = {},
        profile = '',
        pageTitle = '';

    // Load all questions
    parallel.push(function(callback) {
        // Set up series:
        // 1. Load all questions
        // 2. Load all demographics
        // 3. For each question, load all responses using demographics filters
        var series = [];
        var conditions = {};
        series.push(function(callback) {
            dataHandler.find({collection: 'groups'}, function(data) {
                groups = data;
                callback(null);
            });
        });
        // Query for the current active filter
        if (req.params.filter && req.params.facet) {
            series.push(function(callback) {
                dataHandler.find({collection: 'demographics', conditions: {'id': req.params.filter, 'facets.id': req.params.facet}}, function(data) {
                    activeFilter = data.pop();
                    callback(null);
                });
            });
        }
        series.push(function(callback) {
            var series = [];
            groups.forEach(function(group) {
                series.push(function(responseCallback) {
                    // Add query conditions based on request params.
                    var conditions = {Agency: req.params.id};
                    if (activeFilter && activeFilter.facets) {
                        activeFilter.facets.forEach(function(facet) {
                            if (facet.id === req.params.facet) {
                                conditions[activeFilter.id] = {'$in': facet.values};
                            }
                        });
                    }
                    dataHandler.loadQuestion({group: group, context: 'agency', conditions: conditions}, function(result) {
                        responseCallback(null);
                    });
                });
            });
            async.series(series, function(error) {
                callback(error);
            });
        });
        async.series(series, function(error) {
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

    // Load demographic.
    parallel.push(function(callback) {
        dataHandler.find({collection: 'demographics'}, function(data) {
            demographics = data;
            demographics.forEach(function(filter) {
                filter.length = filter.facets.length;
                if (req.params.filter && req.params.facet && filter.id === req.params.filter) {
                    filter.facets.forEach(function(facet) {
                        if (facet.id === req.params.facet) {
                            facet.active = true;
                        }
                    });
                }
            });
            callback(null);
        });
    });

    // Load drone_aggregate info
    parallel.push(function(callback) {
        dataHandler.find({collection: 'drones_aggregate', conditions: {agency: req.params.id}}, function(data) {
            var cols = [
                'total',
                'militant_deaths_min',
                'militant_deaths_max',
                'civilian_deaths_min',
                'civilian_deaths_max',
                'leader_deaths'
            ];
            cols.forEach(function(k) {
              drone_info[k] = data[0][k] || 0;
            })

            if (drone_info.militant_deaths_min === drone_info.militant_deaths_max) {
              delete drone_info.militant_deaths_max;
            }
            if (drone_info.civilian_deaths_min === drone_info.civilian_deaths_max) {
              delete drone_info.civilian_deaths_max;
            }

            callback(null);
        });
    });

    // Run all tasks and render.
    async.parallel(parallel, function(error) {
        // Close the DB connection.
        dataHandler.close();

        res.render('agency', {
            locals: {
                pageTitle: pageTitle,
                profile: profile,
                agencyid: req.params.id,
                agencies: agencies,
                groups: groups,
                demographics: demographics,
                drone_info: drone_info
            }
        });
    });
});
