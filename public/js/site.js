$(document).ready(function() {
    OpenLayers.ImgPath = 'http://js.mapbox.com/theme/dark/';
    OpenLayers.ThemePath = '/css/';
    $('.waxmap').each(Wax.bind);

    $('#map-slide-toggle').toggle(
      // out
      function() {
        $('#home-map').animate(
          { height: '600px' },
          500,
          function() {
            $('#home-map').data('map').updateSize();
            $('#home-map').data('map').zoomIn();
          }
        );
        $(this).text('Smaller Map');
      },
      // in 
      function() {
        $('#home-map').animate(
          { height: '315px' },
          500,
          function()  {
            $('#home-map').data('map').updateSize();
            $('#home-map').data('map').zoomOut();
          }
        );
        $(this).text('Larger Map');
    });
});
