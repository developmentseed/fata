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
    footerMessage: 'Copyright © New America Foundation',
    homeSections: [
        { content: 'section1', group: 'Q1', graphs: ['Q1a'] },
        { content: 'section2', group: 'Q1', graphs: ['Q1b'] },
        { content: 'section3', group: 'Q1', graphs: ['Q1c'] },
        { content: 'section4', group: 'Q1', graphs: ['Q1d'] },
        { content: 'section5', group: 'Q1', graphs: ['Q1e'] },
    ]
};
