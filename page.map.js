/**
 * Map JSON handler.
 */
var app = module.parent.exports.app;
var settings = require('./settings');

function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
}


app.get('/map/home', function(req, res) {
    var fs = require('fs');
    var map_template = JSON.parse(fs.readFileSync('map_defaults.json', 'utf-8'));
    var base_layer = map_template.layers.mapbox;
    var drone_layer = deepCopy(map_template.layers.stylewriter);
    var fighters_layer = deepCopy(map_template.layers.stylewriter);
    var taliban_layer = deepCopy(map_template.layers.stylewriter);
    var drone_opinion_layer = deepCopy(map_template.layers.stylewriter);
    var blockswitcher = map_template.externals.blockswitcher;

    base_layer._value[1].layername = 'pakistan-grey';
    base_layer._value[0] = 'FATA';
    base_layer._value[1].type = 'jpg';

    drone_layer._value[0] = 'Attacks';
    drone_layer._value[1] = settings.tileLiveServer;
    drone_layer._value[2].mapfile = 'http://localhost:8888/style/drone/mohmand';

    fighters_layer._value[0] = 'Opinion on Foreign Fighters';
    fighters_layer._value[1] = settings.tileLiveServer;
    fighters_layer._value[2].mapfile = 'http://localhost:8888/style/question/Q11b/positive';
    
    taliban_layer._value[0] = 'Opinion on Pakistan Taliban';
    taliban_layer._value[1] = settings.tileLiveServer;
    taliban_layer._value[2].mapfile = 'http://localhost:8888/style/question/Q11d/positive';
    
    drone_opinion_layer._value[0] = 'Opinion on Drones';
    drone_opinion_layer._value[1] = settings.tileLiveServer;
    drone_opinion_layer._value[2].mapfile = 'http://localhost:8888/style/question/Q16/positive';

    blockswitcher._value[0] = '#home-map';

    res.send({
        'map': {
            'layers': [base_layer,taliban_layer,drone_opinion_layer,fighters_layer,drone_layer],
            'maxExtent': map_template.maxExtent,
            'maxResolution': 1.40625,
            'projection': map_template.spherical_mercator,
            'displayProjection': map_template.spherical_mercator,
            'units': 'm',
            'controls': [map_template.controls.navigation]
        },
        'externals': {
            'layerswitcher': map_template.externals.blockswitcher
        }
    });
});

app.get('/map/agency/:id', function(req, res) {
    var fs = require('fs');
    var map_template = JSON.parse(fs.readFileSync('map_defaults.json', 'utf-8'));
    var base_layer = map_template.layers.mapbox;
    var stylewriter_layer = map_template.layers.stylewriter;
    var blockswitcher = map_template.externals.blockswitcher;

    base_layer._value[1].layername = 'pakistan-grey';
    base_layer._value[0] = 'FATA';
    base_layer._value[1].type = 'jpg';
    
    stylewriter_layer._value[0] = 'Attacks';
    stylewriter_layer._value[1] = 'http://localhost:8887/tile/${mapfile}/${z}/${x}/${y}.${format}';
    stylewriter_layer._value[2].mapfile = 'http://localhost:8888/style/drone/mohmand';
    stylewriter_layer._value[2].isBaseLayer = false;

    blockswitcher._value[0] = '#agency-map';

    res.send({
        'map': {
            'layers': [base_layer, stylewriter_layer],
            'maxExtent': map_template.maxExtent,
            'maxResolution': 1.40625,
            'projection': map_template.spherical_mercator,
            // 'displayProjection': map_template.spherical_mercator,
            'units': 'm',
            // 'controls': [map_template.controls.navigation]
        },
        'externals': {
            'layerswitcher': blockswitcher
        }
    });
});

app.get('/map/question/:id', function(req, res) {
    var fs = require('fs');
    var map_template = JSON.parse(fs.readFileSync('map_defaults.json', 'utf-8'));
    var base_layer = map_template.layers.mapbox;
    var choropleth_layer = map_template.layers.stylewriter;
    var blockswitcher = map_template.externals.blockswitcher;

    base_layer._value[1].layername = 'pakistan-grey';
    base_layer._value[0] = 'FATA';
    base_layer._value[1].type = 'jpg';

    choropleth_layer._value[0] = 'Choropleth Map';
    choropleth_layer._value[1] = 'http://localhost:8887/tile/${mapfile}/${z}/${x}/${y}.${format}';
    choropleth_layer._value[2].mapfile = '/style/question/' + req.param.id;

    blockswitcher._value[0] = '#question-map';

    res.send({
        'map': {
            'layers': [base_layer, choropleth_layer],
            'maxExtent': map_template.maxExtent,
            'maxResolution': 1.40625,
            'projection': map_template.spherical_mercator,
            'displayProjection': map_template.spherical_mercator,
            'units': 'm',
            'controls': [map_template.controls.navigation]
        },
        'externals': {
            'layerswitcher': blockswitcher
        }
    });
});
