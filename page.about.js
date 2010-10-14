/**
 * About page handler.
 */
var app = module.parent.exports;

app.get('/about', function(req, res) {
    var dataHandler = req.dataHandler;
    dataHandler.markdown({path: 'content/about.md'}, function(err, data) {
        if (err) throw err;
        res.render('about', {
            locals: {
                pageTitle: 'About',
                contentText: data,
            }
        });
    });
});
