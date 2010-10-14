var Wax = {
    /**
     * Get a function by string name without using eval
     * @return {Function} the requested function.
     */
    get_function: function(head) {
          return _.reduce(head.split('.'), function(f, cl) {
            return f[cl];
          }, window);
    },

    /**
     * Instantiate JSON objects
     * @param {Object} a json object.
     * @return {Object} an instantiated OpenLayers or another type object.
     */
    reify: function(json_object) {
        if (json_object.hasOwnProperty('_type')) {
            var fn = Wax.get_function(json_object._type);
            var waxed = Wax.reify(json_object._value);
            if (waxed.length == 1) {
              return new fn(waxed);
            }
            else if (waxed.length == 2) {
              return new fn(waxed[0], waxed[1]);
            }
            else if (waxed.length == 3) {
              return new fn(waxed[0], waxed[1], waxed[2]);
            }
        }
        else if (_.isString(json_object) || _.isNumber(json_object) || _.isBoolean(json_object)) {
          return json_object;
        }
        else {
          for (var i in json_object) {
            json_object[i] = Wax.reify(json_object[i]);
          }
          return json_object;
        }
    },

    /**
     * Instantiate a map on an element
     * @param {element} element to instantiate a map on.
     */
    bind: function() {
        var element = _(arguments).last();
        $.getJSON($(element).attr('src'), function(data) {
            $(element).data('map', new OpenLayers.Map(element, Wax.reify(data.map)));
            $(element).data('externals', Wax.reify(data.externals));
            var degrees = new OpenLayers.LonLat(70.37,33.27);
            degrees.transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913'));
            $(element).data('map').setCenter(degrees, 1);
        });
    }
};
