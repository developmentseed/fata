/**
 * Map JSON handler.
 */
var app = module.parent.exports.app;
var settings = require('./settings');
var mapbox_attribution = '<a href="http://mapbox.com/" class="mapbox-logo">Mapbox.com</a> | <a href="http://mapbox.com/tos">Terms of Use</a> | Some data <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> <a href="http://openstreetmap.org">OpenStreetMap</a> & contributers';

function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for (; i < len; i++) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for (i in obj) {
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
    var zoomonload = map_template.externals.zoomonload;

    base_layer._value[1].layername = 'pakistan-fata';
    base_layer._value[0] = 'FATA';
    base_layer._value[1].type = 'png';
    base_layer._value[1].attribution = mapbox_attribution;

    drone_layer._value[0] = 'Attacks';
    drone_layer._value[1] = settings.tileLiveServer;
    drone_layer._value[2].mapfile = settings.baseUrl + 'style/drone/mohmand';

    fighters_layer._value[0] = 'Opinion on Foreign Fighters';
    fighters_layer._value[1] = settings.tileLiveServer;
    fighters_layer._value[2].mapfile = settings.baseUrl + 'style/question/Q11b/positive';
    fighters_layer._value[2].visibility = false;
    
    taliban_layer._value[0] = 'Opinion on Pakistan Taliban';
    taliban_layer._value[1] = settings.tileLiveServer;
    taliban_layer._value[2].visibility = false;
    taliban_layer._value[2].mapfile = settings.baseUrl + 'style/question/Q11d/positive';
    
    drone_opinion_layer._value[0] = 'Opinion on Drones';
    drone_opinion_layer._value[1] = settings.tileLiveServer;
    drone_opinion_layer._value[2].mapfile = settings.baseUrl + 'style/question/Q16/positive';

    blockswitcher._value[0] = '#home-map';

    zoomonload._value[0] = ['#home-map'];
    zoomonload._value[1] = 71.7;
    zoomonload._value[2] = 33.4;
    zoomonload._value[3] = 1;

    res.send({
        'map': {
            'layers': [base_layer,drone_opinion_layer,drone_layer,taliban_layer,fighters_layer],
            'maxExtent': map_template.maxExtent,
            'maxResolution': 1.40625,
            'projection': map_template.spherical_mercator,
            'displayProjection': map_template.spherical_mercator,
            'units': 'm',
            'controls': [
                map_template.controls.navigation,
                map_template.controls.attribution,
                map_template.controls.interaction
            ]
        },
        'externals': {
            'blockswitcher': map_template.externals.blockswitcher,
            'zoomonload': zoomonload
        }
    });
});

app.get('/map/agency/:id', function(req, res) {
    var fs = require('fs');
    var dataHandler = req.dataHandler;
    var map_template = JSON.parse(fs.readFileSync('map_defaults.json', 'utf-8'));
    var base_layer = map_template.layers.mapbox;
    var stylewriter_layer = map_template.layers.stylewriter;
    var zoomonload = map_template.externals.zoomonload;

    base_layer._value[1].layername = 'pakistan-fata';
    base_layer._value[0] = 'FATA';
    base_layer._value[1].type = 'png';
    base_layer._value[1].attribution = mapbox_attribution;
    
    stylewriter_layer._value[0] = 'Attacks';
    stylewriter_layer._value[1] = settings.tileLiveServer;
    stylewriter_layer._value[2].mapfile = settings.baseUrl + 'style/drone/' + req.params.id;
    stylewriter_layer._value[2].isBaseLayer = false;

    // Load the current agency's information.
    dataHandler.find({collection: 'agencies', conditions: {id: req.params.id}}, function(data) {
        if (data && data[0] && data[0].name) {
            pageTitle = data[0].name;
        }
        else {
            next();
        }
        zoomonload._value[0] = ['#agency-map'];
        zoomonload._value[1] = data[0].lon;
        zoomonload._value[2] = data[0].lat;
        zoomonload._value[3] = 3;

        res.send({
            'map': {
                'layers': [base_layer, stylewriter_layer],
                'maxExtent': map_template.maxExtent,
                'maxResolution': 1.40625,
                'projection': map_template.spherical_mercator,
                'units': 'm',
                'controls': [
                    map_template.controls.navigation,
                    map_template.controls.attribution,
                    map_template.controls.interaction
                ]
            },
            'externals': {
                'zoomonload': zoomonload
            }
        });
    });
});
