/**
 * Graph processing.
 */
var process = function(params, data) {
    params.width = params.width || 280;
    var processed = [];
    var total = 0;
    var offset = 0;
    var count = 0;
    var autogen = false;

    // Generate list of usable answers (they should be in the proper order if
    // provided by caller).
    var answers = [];
    if (params.answers) {
        for (var i in params.answers) {
            answers.push(params.answers[i].name);
        }
    }
    else {
        autogen = true;
        for (var label in data) {
            answers.push(label);
        }
    }

    // Loop first to get the sum, count.
    answers.forEach(function(answer) {
        if (data[answer]) {
            total += data[answer];
            count++;
        }
    });

    // Loop again to generate processed items.
    var i = 1;
    answers.forEach(function(answer) {
        if (data[answer]) {
            // Force last segment to fill in remainder of the bar.
            var value = (i === count) ? (params.width - offset) : Math.floor(data[answer] / total * params.width);
            var class = answer.toLowerCase().replace(/[\'\"\(\) ]/g, '-');
            if (autogen) {
                class += ' autogen autogen-' + i;
            }
            processed.push({
                label: answer,
                width: value,
                offset: offset,
                percent: Math.round(data[answer] / total * 100),
                number: data[answer],
                class: class
            });
            offset += value;
            i++;
        }
    });
    return processed;
};

module.exports = { process: process };
