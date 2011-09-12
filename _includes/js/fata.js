$(function() {
var demographics = $('.demographics');
$('a', demographics).click(function() {
  var scope = data[$(this).attr('href').split('#').pop()];
  var template = _('<%=pct%>% &mdash; <%=num%> respondents').template();
  _(scope).each(function(answers, key) {
    var q = $('#' + key);
    var total = answers.total;
    if (!q || !total) return;

    // TODO: handle no data cases.
    var target = {};
    _(answers).each(function(val, answer) {
        var c = answer.toLowerCase().replace(/ /g, '-').replace(/\'/g, '');
        target[c] = {
            width: Math.floor(280 * val / total),
            pct: Math.floor(100 * val / total),
            num: val
        };
    });
    $('a:not(.fill)', q).each(function() {
        var c = $(this).attr('class').split(' ').shift();
        var values = target[c] || { width:0, pct:0, num:0};
        $(this).css({width: values.width + 'px'});
        $('i', this).html(template(values));
    });
  });
  $('a.active', demographics).removeClass('active');
  $(this).addClass('active');
  return false;
});
});
