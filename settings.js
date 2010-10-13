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
    questions: ['Q1a', 'Q1b', 'Q1c', 'Q1d', 'Q1e', 'Q1f', 'Q1g'],
};
