OpenLayers.ImgPath = 'http://js.mapbox.com/theme/dark/';

function get_function(head, f) {
    if (arguments.length === 1) {
        return get_function(head.split('.'), window);
    }
    else if (head.length === 0) {
        return f;
    }
    h = head.shift();
    if (typeof f[h] !== 'undefined') {
        return get_function(head, f[h]);
    }
    else {
        return false;
    }
}

/**
 * Instantiate JSON objects
 */
function wax(json_object) {
    for (i in json_object) {
        if (json_object.hasOwnProperty(i)) {
            if (json_object[i].hasOwnProperty'_type')) {
                // console.log('has type');
                // json_object[i] = new get_function(json_object[i]._type)(wax(json_object[i].value));
            }
            else if(typeof json_object[i] === 'string') {
                // console.log('is string');
                // json_object[i] = json_object[i];
            }
            else {
                // console.log('is non-typed array');
                // json_object[i] = wax(json_object[i]);
            }
        }
    }
    return json_object;
}

function map_setup() {
    $('#map').data('map', new OpenLayers.Map('map', {'projection': new OpenLayers.Projection('900913')}));
    $.getJSON('/layers', function(data) {
        $('#map').data('map').addLayers([wax(data)]);
    });
}
