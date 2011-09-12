$(function() {
var demographics = $('.demographics');
if (!demographics.size()) return;

$('a', demographics).click(function() {
  var facet = $(this).attr('href').split('#').pop().toLowerCase();
  var template = _('<%=pct%>% &mdash; <%=num%> respondents').template();

  // TODO: handle no data message.
  $('.graph').each(function() {
    _.defer(_(function() {
      var total = 0;
      $('a:not(.fill)', this).each(function() {
        total += parseInt($(this).data()[facet] || 0, 10);
      });
      $('a:not(.fill)', this).each(function() {
        var val = parseInt($(this).data()[facet] || 0, 10);
        var values = {
          width: Math.floor(280 * val / total),
          pct: Math.floor(100 * val / total),
          num: val
        };
        $(this).css({width: values.width + 'px'});
        $('i', this).html(template(values));
      });
    }).bind(this));
  });

  $('a.active', demographics).removeClass('active');
  $(this).addClass('active');
  return false;
});

var filterPosition = demographics.offset().top;
$(window).bind('scroll', function(e) {
  var scroll = (document.documentElement.scrollTop || document.body.scrollTop);
  if (scroll > filterPosition) {
    $('body').addClass('fix-filters');
  } else {
    $('body').removeClass('fix-filters');
  }
});

});
