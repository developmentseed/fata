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
            // Remove labels that should always be at the end
            if (["Don't know", "Refused"].indexOf(label) === -1) {
                answers.push(label);
            }
        }
        // Sort answers, then add 'Don't know' and 'Refused' to the end
        answers.sort();
        answers.push("Don't know", "Refused");
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
                hash = require('crypto').createHash('md5').update(answer).digest('hex');
                if (hashes.hashIndex(hash) == -1) {
                    hashes.addHash(hash);
                }
                class += ' autogen autogen-' + (hashes.hashIndex(hash) + 1);
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

// Closure for hashes
var hashes = function() {
    var hashes = [];
    return {
        addHash: function(hash) {
            return hashes.push(hash);
        },
        hashIndex: function(hash) {
            return hashes.indexOf(hash);
        },
        reset: function(hash) {
            hashes = [];
        }
    }
}();

module.exports = {
    process: process,
    hashes: hashes
};
