var DataHandler = module.exports = function DataHandler(db) {
    this.db = db;
    this.collections = {};
};

DataHandler.prototype.countField = function(type, field, conditions, callback) {
    var self = this,
        db = this.db,
        data = [];
    // Build a collection id.
    var cid = JSON.stringify([type, field, conditions]);
    if (self.collections[cid]) {
        this.field(self.collections[cid], {}, callback);
    }
    else {
        db.open(function(err) {
            db.collection(type, function(err, collection) {
                var map = 'function() { emit(this.' + field + ', {count: 1}); }';
                var reduce = function(k, vals) {
                    var total = 0;
                    for (var i = 0; i < vals.length; i++) {
                        total += vals[i].count;
                    }
                    return { count: total };
                }
                collection.mapReduce(map, reduce, { query: conditions }, function(err, collection) {
                    self.collections[cid] = collection.collectionName;
                    self.field(self.collections[cid], {}, callback);
                });
            });
        });
    }
};

DataHandler.prototype.field = function(type, conditions, callback) {
    var db = this.db;
    db.open(function(err) {
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
    });
}
