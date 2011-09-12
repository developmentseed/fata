$(function() {
var demographics = $('.demographics');
$('a', demographics).click(function() {
  var facet = $(this).attr('href').split('#').pop().toLowerCase();
  var template = _('<%=pct%>% &mdash; <%=num%> respondents').template();

  // TODO: handle no data message.
  $('.graph').each(function() {
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
  });

  $('a.active', demographics).removeClass('active');
  $(this).addClass('active');
  return false;
});
});
