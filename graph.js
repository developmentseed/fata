/**
 * Graph processing.
 */
var process = function(params, data) {
    params.width = params.width || 280;
    var processed = [];
    var total = 0;
    var offset = 0;
    var count = 0;

    // @TODO: Implement sorting of bars in "order".

    // Loop first to get the sum, count.
    for (var i in data) {
        total += data[i];
        count++;
    }

    // Loop again to generate processed items.
    var i = 1;
    for (var label in data) {
        // Force last segment to fill in remainder of the bar.
        var value = (i === count) ? (params.width - offset) : Math.floor(data[label] / total * params.width);
        processed.push({
            label: label,
            width: value,
            offset: offset,
            percent: Math.round(data[label] / total * 100),
            number: data[label],
            class: label.toLowerCase().replace(/[\'\" ]/g, '-')
        });
        offset += value;
        i++;
    }
    return processed;
};

module.exports = { process: process };
