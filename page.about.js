/**
 * About page handler.
 */
var app = module.parent.exports.app;

app.get('/about', function(req, res) {
    var dataHandler = req.dataHandler;
    dataHandler.markdown({path: 'content/about.md'}, function(data) {
        res.render('about', {
            locals: {
                pageTitle: 'About',
                contentText: data,
            }
        });
    });
});
