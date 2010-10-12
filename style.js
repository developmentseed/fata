var _ = require('underscore')._;

/**
 * Equal breaks in a dataset
 * @return array of break places
 */
function equal(data, n) {
    return _.range(_.min(data), _.max(data), 
        (_.max(data) - _.min(data)) / (n - 1)).
        concat(_.max(data));
}

/**
 * a color class
 */
function Color(rgb) {
    // Constructor
    if (this instanceof Color) {
        this.rgb = _.isArray(rgb) ? rgb :
        [
            parseInt(rgb.slice(0,2), 16),
            parseInt(rgb.slice(2,4), 16),
            parseInt(rgb.slice(4,6), 16)
        ];
    }
    else {
        return new Color(rgb);
    }

    this.pad = function(str) {
        return (("" + str).length == 1) ? "0" + str : "" + str;
    }

    this.hex = function() {
        return this.pad(this.rgb[0].toString(16)) + 
            this.pad(this.rgb[1].toString(16)) + 
            this.pad(this.rgb[2].toString(16));
    }

    this.to = function(color, n) {
        return _.map(
            _.zip(
                _.map(equal([this.rgb[0], color.rgb[0]], n), Math.round),
                _.map(equal([this.rgb[1], color.rgb[1]], n), Math.round),
                _.map(equal([this.rgb[2], color.rgb[2]], n), Math.round)
            ),
            Color);
    }
};
