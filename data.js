var DataHandler = module.exports = function DataHandler(db) {
    this.db = db;
    this.collections = {};
};

DataHandler.prototype.connect = function(callback) {
    if (this.db.state === 'connected') {
        callback(null);
    }
    else {
        this.db.open(function(err) { callback(err); });
    }
};

DataHandler.prototype.countField = function(type, field, conditions, callback) {
    var self = this,
        db = this.db,
        data = [];

    // Build a collection id.
    var cid = [type, field];
    for (var key in conditions) {
        cid.push(key, conditions[key]);
    }
    cid = cid.join('-');
    self.field(cid, {}, function(data) {
        if (data && data.length > 0) {
            callback(data);
        }
        else {
            self.connect(function(err) {
                db.collection(type, function(err, collection) {
                    if (collection) {
                        var map = 'function() { emit(this.' + field + ', {count: 1}); }';
                        var reduce = function(k, vals) {
                            var total = 0;
                            for (var i = 0; i < vals.length; i++) {
                                total += vals[i].count;
                            }
                            return { count: total };
                        }
                        collection.mapReduce( map, reduce, { query: conditions, out: cid }, function(err, collection) {
                                self.collections[cid] = collection.collectionName;
                                self.field(self.collections[cid], {}, callback);
                        });
                    }
                    else {
                        console.log(field);
                        callback([]);
                    }
                });
            });
        }
    });
};

DataHandler.prototype.field = function(type, conditions, callback) {
    var db = this.db,
        self = this;
    self.connect(function(err) {
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
