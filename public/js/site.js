$(document).ready(function() {
    OpenLayers.ImgPath = 'http://js.mapbox.com/theme/dark/';
    OpenLayers.ThemePath = '/css/';
    $('.waxmap').each(Wax.bind);
});
