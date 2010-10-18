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

    // AJAX page content loading, used for demographic filters.
    // Requires jQuery BBQ (http://benalman.com/projects/jquery-bbq-plugin).
    var ajaxHandler = function ajaxHandler() {
        this.cache = {};
    };

    ajaxHandler.prototype.get = function(url) {
        var self = this;
        var link = $('a.ajax[href='+url+']');
        var target = $('#ajax-content');

        link.addClass('active');
        target.animate({opacity:.25}, 'fast', function() {
            // Data is cached. Use it.
            if (self.cache[url]) {
                self.renderData(url);
                return;
            }

            // Data is not cached. Make an AJAX request.
            $.get(url, {ajax: 1}, function(data) {
                self.cache[url] = data;
                self.renderData(url);
            });
        });
    };

    ajaxHandler.prototype.renderData = function(url) {
        var data = $(this.cache[url]).css({opacity:.25});
        var target = $('#ajax-content');

        target.replaceWith(data);
        data.animate({opacity:1}, 'fast');
        $.bbq.pushState({url: url});
    };

    var ajax = new ajaxHandler();
    // Set initial page state if #url= is populated.
    var state = $.bbq.getState('url');
    if (state) {
        $('a.ajax.active').removeClass('active');
        ajax.get(state);
    }
    // Add click handlers.
    $('a.ajax').click(function() {
        $('a.ajax.active').removeClass('active');
        var url = $(this).attr('href');
        ajax.get(url);
        return false;
    });
});
