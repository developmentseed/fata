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
        $(this).attr('class', 'expand-button');
      });

    // AJAX page content loading ==============================================
    // Requires jQuery BBQ (http://benalman.com/projects/jquery-bbq-plugin).
    var ajaxHandler = function ajaxHandler() {
        this.cache = {};
    };

    ajaxHandler.prototype.get = function(url) {
        // Sometimes a URL can have multiple hashes, e.g. foo#bar#
        // Strip off any additional hashes before proceeding.
        url = url.replace(/[#]/g, '');
        var self = this;
        var link = $('a.ajax[href=' + url + ']');
        var target = $('#ajax-content');

        // Set classes.
        $('a.ajax.active').removeClass('active');
        link.addClass('active');

        target.animate({opacity: .25}, 'fast', function() {
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
        var data = $(this.cache[url]).css({opacity: .25});
        var target = $('#ajax-content');

        target.replaceWith(data);
        data.animate({opacity: 1}, 'fast');
    };

    var ajax = new ajaxHandler();
    // Bind handler for hashchange event. This allows back/forward buttons to
    // be supported.
    $(window).bind('hashchange', function(e) {
        ajax.get($.bbq.getState('url'));
    });
    // Set initial page state if #url= is populated.
    if ($.bbq.getState('url')) {
        ajax.get($.bbq.getState('url'));
    }
    // Add click handlers.
    $('a.ajax').click(function() {
        $.bbq.pushState({url: $(this).attr('href')});
        return false;
    });

    // Demographics filters fixed position handling ===========================
    if ($('.demographics').size()) {
        var filterPosition = $('.demographics').offset().top;
        $(window).bind('scroll', function(e) {
            var scroll = (document.documentElement.scrollTop || document.body.scrollTop);
            if (scroll > filterPosition) {
                $('body').addClass('fix-filters');
            }
            else {
                $('body').removeClass('fix-filters');
            }
        });
    }
});
