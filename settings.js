module.exports = {
    port: 8888,
    mongodb: {
        host: 'localhost',
        db: 'fata',
    },
    siteTitle: 'FATA Sentiment Survey',
    siteSlogan: '1,000 Interviews across 120 villages in all seven tribal Agencies of FATA-Pakistan',
    footerMessage: 'Copyright © <a href="http://newamerica.net/about/copyright">New America Foundation</a><br/>Background photo by <a href="http://www.flickr.com/photos/aamerjaved/2914342056/">AamerJaved</a> Creative Commons (<a href="http://creativecommons.org/licenses/by-nc-nd/2.0/">by-nc-nd 2.0</a>)',
    homeSections: [
        { content: 'section1', group: 'Q16'},
        { content: 'section2', group: 'Q11'},
        { content: 'section3', group: 'Q8'},
        { content: 'section4', group: 'Q10'},
        { content: 'section5', group: 'Q1'},
    ],
    analyticsId: 'UA-19117141-1',
    tileLiveServer: 'http://ndi1.live.mapbox.com/tile/${mapfile}/${z}/${x}/${y}.${format}',
    baseUrl: 'http://www.pakistansurvey.org/'
};
