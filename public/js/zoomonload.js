var OpenLayersWaxZoomOnLoad = function(opts, lon, lat, zoom) {
    pt = new OpenLayers.LonLat(lon, lat);
    pt.transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913'));
    $(opts[0]).data('map').setCenter(pt, zoom);
}
