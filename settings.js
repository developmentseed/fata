module.exports = {
    port: 8888,
    mongodb: {
        host: 'localhost',
        db: 'fata',
    },
    // These strings are hardcoded into public/404.html and public/50x.html.
    // If you change them, please update these files as well.
    siteTitle: 'FATA Sentiment Survey',
    siteSlogan: 'Data and in-depth analysis from all seven tribal agencies of FATA-pakistan',
    footerMessage: 'Copyright © <a href="http://newamerica.net/about/copyright">New America Foundation</a><br/>Background photo by <a href="http://www.flickr.com/photos/aamerjaved/2914342056/">AamerJaved</a> Creative Commons (<a href="http://creativecommons.org/licenses/by-nc-nd/2.0/">by-nc-nd 2.0</a>)',
    homeSections: [
        { content: 'section1', group: 'Q16'},
        { content: 'section2', group: 'Q11'},
        { content: 'section3', group: 'Q8'},
        { content: 'section4', group: 'Q10'},
        { content: 'section5', group: 'Q1'},
    ],
    aboutPages: [
        { id: 'site', name: 'This site', file: 'about.md' },
        { id: 'methodology', name: 'Methodology', file: 'about.methodology.md' },
        { id: 'drones', name: 'Drones', file: 'about.drones.md' },
		{ id: 'maps', name: 'Maps', file: 'about.maps.md' },
		{ id: 'contact', name: 'Contact', file: 'about.contact.md' }
    ],
    partners: [
        { name: 'Terror Free Tomorrow', url: 'http://www.terrorfreetomorrow.org' },
        { name: 'Community Appraisal & Motivation Programme', url: 'http://www.camp.org.pk' },
        { name: 'U.S. Institute of Peace', url: 'http://www.usip.org' },
        { name: 'Open Society Foundations', url: 'http://www.soros.org' },
        { name: 'Smith Richardson Foundation', url: 'http://www.srf.org' },
        { name: 'Development Seed', url: 'http://www.developmentseed.org' }
    ],
    analyticsId: 'UA-19117141-1',
    tileLiveServer: 'http://ndi1.live.mapbox.com/tile/${mapfile}/${z}/${x}/${y}.${format}',
    baseUrl: 'http://www.pakistansurvey.org/'
};
