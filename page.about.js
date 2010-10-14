/**
 * About page handler.
 */
var app = module.parent.exports;

app.get('/about', function(req, res) {
    var markdown = require('markdown'),
        fs = require('fs');

    fs.readFile('content/about.md', 'utf-8', function(err, data) {
        if (err) throw err;
        res.render('about', {
            locals: {
                pageTitle: 'About',
                contentText: markdown.Markdown(data)
            }
        });
    });
});
