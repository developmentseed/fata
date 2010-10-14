/**
 * Map JSON handler.
 */
var app = module.parent.exports.app;

app.get('/map/question/:question', function(req, res) {
    var fs = require('fs');
    var map_template = JSON.parse(fs.readFileSync('map_defaults.json', 'utf-8'));
    var question_layer = map_template.layers.stylewriter;
    question_layer._value[1].mapfile = '/style/' + req.params.question;
    res.send({
        'layers': [question_layer],
        'controls': [map_template.controls.navigation]});
});

app.get('/map/home', function(req, res) {
    var fs = require('fs');
    var map_template = JSON.parse(fs.readFileSync('map_defaults.json', 'utf-8'));
    var base_layer = map_template.layers.mapbox;
    var blockswitcher = map_template.externals.blockswitcher;

    base_layer._value[1].layername = 'afghanistan-summer-jpg';
    base_layer._value[0] = 'Afghanistan Summer';
    base_layer._value[1].type = 'jpg';

    blockswitcher._value[0] = '#home-map';

    res.send({
        'map': {
            'layers': [base_layer],
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
    var blockswitcher = map_template.externals.blockswitcher;

    base_layer._value[1].layername = 'afghanistan-summer-jpg';
    base_layer._value[0] = 'Afghanistan Summer';
    base_layer._value[1].type = 'jpg';

    blockswitcher._value[0] = '#agency-map';

    res.send({
        'map': {
            'layers': [base_layer],
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
