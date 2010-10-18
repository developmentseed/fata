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
        $(this).attr('class', 'shrink-button');
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
        $(this).attr('class','expand-button');
      });

    var ajaxCache = {};
    $('a.ajax').click(function() {
        var link = $(this);
        var url = $(this).attr('href');
        var target = $('#ajax-content');
        link.renderData = function(url) {
            var data = $(ajaxCache[url]).css({opacity:.25});
            target.replaceWith(data);
            data.animate({opacity:1}, 'fast');
        };

        $('a.ajax.active').removeClass('active');
        if (ajaxCache[url]) {
            link.addClass('active');
            target.animate({opacity:.25}, 'fast', function() {
                link.renderData(url);
            });
        }
        else {
            link.addClass('active');
            target.animate({opacity:.25}, 'fast', function() {
                $.get(url, function(data) {
                    // Cache results locally
                    ajaxCache[url] = data;
                    link.renderData(url);
                });
            });
        }
        return false;
      });
});
