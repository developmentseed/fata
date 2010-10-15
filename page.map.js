/**
 * Map JSON handler.
 */
var app = module.parent.exports.app;

app.get('/map/home', function(req, res) {
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

    blockswitcher._value[0] = '#home-map';

    res.send({
        'map': {
            'layers': [base_layer, stylewriter_layer],
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
