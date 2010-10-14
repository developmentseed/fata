/**
 * DB Connection middleware. Establishes a DataHandler with access to a single
 * mongodb connection per HTTP request.
 * @TODO: Determine how/if the connection needs to be closed explicitly when a
 * request is finished being handled.
 *
 * @param {Object} options
 *   An options dictionary containing the following keys:
 *   - host: server host
 *   - db: database name
 */
var dbConnection = module.exports = function dbConnection(options) {
    return function dbConnection(req, res, next) {
        var mongo = require('node-mongodb-native/lib/mongodb');
        var DataHandler = require('./data');
        var db = new mongo.Db(options.db,
            new mongo.Server(
                options.host,
                mongo.Connection.DEFAULT_PORT,
                {}),
            {});
        req.db = db;
        req.dataHandler = new DataHandler(db);
        next();
    };
};
