var DataHandler = module.exports = function DataHandler(db) {
    this.db = db;
};

DataHandler.prototype.countField = function(type, field, conditions, callback) {
    var db = this.db;
    db.collection(type, function(err, collection) {
        var fields = {},
            initial = {};
        fields[field] = true;
        initial[field] = {};
        collection.group(
            fields,
            conditions,
            initial,
            // Reduce callback.
            function(obj, prev) {
                for (i in prev) {
                    if (obj[i]) {
                        prev[i][obj[i]] = prev[i][obj[i]] || 0;
                        prev[i][obj[i]]++;
                    }
                }
            },
            // Callback.
            function(err, data) {
                callback(data.pop());
            }
        );
    });
};

DataHandler.prototype.field = function(type, conditions, callback) {
    var db = this.db;
    db.collection(type, function(err, collection) {
        if (err)
            throw err
        var data = [];
        collection.find(conditions, {}, function(err, cursor) {
            cursor.each(function(err, record) {
                if (record != null) {
                    data.push(record);
                }
                else {
                    callback(data);
                }
            });
        });
    });
}
