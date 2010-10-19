/**
 * About page handler.
 */
var app = module.parent.exports.app,
    settings = module.parent.exports.settings;

app.get('/about/:id?', function(req, res, next) {
    var dataHandler = req.dataHandler,
        pages = [];

    // Default to first page if no page argument present.
    var activePage = false;
    if (!req.params.id && settings.aboutPages.length > 0) {
        activePage = settings.aboutPages[0];
    }
    // Set active page and generate page menu list.
    settings.aboutPages.forEach(function(page) {
        var active = false;
        if (!req.params.id && activePage && activePage.id === page.id) {
            active = true;
        }
        else if (req.params.id && page.id === req.params.id) {
            activePage = page;
            active = true;
        }
        pages.push({name: page.name, id: page.id, active: active});
    });

    if (activePage) {
        dataHandler.markdown({path: 'content/' + activePage.file}, function(data) {
            // Close the DB connection.
            dataHandler.close();

            res.render('about', {
                locals: {
                    pageTitle: activePage.name,
                    pages: pages,
                    contentText: data,
                }
            });
        });
    }
    else {
        next();
    }
});
