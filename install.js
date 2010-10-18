require.paths.unshift(__dirname + '/modules', __dirname + '/lib/node', __dirname);
var settings = require('settings');

if (settings.mongodb) {
    var mongo = require('node-mongodb-native/lib/mongodb');
    var DataHandler = require('./data');
    var db = new mongo.Db(settings.mongodb.db, new mongo.Server(settings.mongodb.host, mongo.Connection.DEFAULT_PORT, {}), {});
    db.open(function(err, db) {
        var async = require('async');
        var parallel = [];
        async.parallel(parallel, function() {
            process.exit(0);
        });
    });
}
