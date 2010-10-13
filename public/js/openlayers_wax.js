OpenLayers.ImgPath = 'http://js.mapbox.com/theme/dark/';


function get_function(head) {
  return _.reduce(head.split('.'), function(f, cl) {
    return f[cl]
  },
  window);
}

/**
 * Instantiate JSON objects
 */
function wax(json_object) {
    if (json_object.hasOwnProperty('_type')) {
        var fn = get_function(json_object._type);
        var waxed = wax(json_object._value);
        if (waxed.length == 1) {
          return new fn(waxed);
        }
        else {
          return new fn(waxed[0], waxed[1]);
        }
    }
    else if (_.isString(json_object)) {
      return json_object;
    }
    else {
      for (var i in json_object) {
        json_object[i] = wax(json_object[i]);
      }
      return json_object;
    }
}

function map_setup() {
    $('#map').data('map', new OpenLayers.Map('map', {'projection': new OpenLayers.Projection('900913')}));
    $.getJSON('/layers', function(data) {
        $('#map').data('map').addLayers([wax(data)]);
    });
}
