module.exports = {
    port: 8888,
    mongodb: {
        host: 'localhost',
        db: 'fata',
        indexes: {
            responses: [
                [['Q1a', 1]],
                [['Q1b', 1]],
                [['Q1c', 1]],
                [['Q1d', 1]],
                [['Q1e', 1]],
                [['Q1f', 1]],
                [['Q1g', 1]],
            ]
        }
    },
    siteTitle: 'FATA Sentiment Survey',
    siteSlogan: '1,000 Interviews across 120 villages in all seven tribal Agencies of FATA-Pakistan',
    footerMessage: 'Copyright © New America Foundation',
    homeSections: [
        { content: 'section1', group: 'Q16'},
        { content: 'section2', group: 'Q11'},
        { content: 'section3', group: 'Q8'},
        { content: 'section4', group: 'Q10'},
        { content: 'section5', group: 'Q1'},
    ],
    analyticsId: 'UA-19117141-1'
};
