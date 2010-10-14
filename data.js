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
    var cid = [type];
    for (var key in conditions) {
        cid.push(key, conditions[key]);
    }
    cid = cid.join('_');
    self.field(cid, {_id: field}, function(data) {
        if (data && data.length > 0) {
            callback(data);
        }
        else {
            self.connect(function(err) {
                db.collection(type, function(err, collection) {
                    if (collection) {
                        var map = function() {
                            for (var field in this) {
                                var val = {};
                                val[this[field]] = 1;
                                emit(field, val);
                            }
                        };
                        var reduce = function(k, val) {
                            var doc = {};
                            for (var i = 0; i < val.length; i++) {
                                for (var j in val[i]) {
                                    doc[j] = doc[j] || 0;
                                    doc[j] += val[i][j];
                                }
                            }
                            return doc;
                        };
                        collection.mapReduce( map, reduce, { query: conditions, out: cid }, function(err, collection) {
                                self.field(cid, {_id: field}, callback);
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
