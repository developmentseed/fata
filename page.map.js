/**
 * Map JSON handler.
 */
var app = module.parent.exports;

app.get('/map/:question', function(req, res) {
    var fs = require('fs');
    var map_template = JSON.parse(fs.readFileSync('map_defaults.json', 'utf-8'));
    var question_layer = map_template.layers.stylewriter;
    question_layer._value[1].mapfile = '/style/' + req.params.question;
    res.send({
        'layers': [question_layer],
        'controls': [map_template.controls.navigation]});
});
