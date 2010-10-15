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
        { content: 'section1', group: 'Q16'},
        { content: 'section2'},
        { content: 'section3', group: 'Q8'},
        { content: 'section4', group: 'Q10'},
        { content: 'section5', group: 'Q1'},
    ],
    googleAnalyticsAccount:'<script type="text/javascript">

	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', 'UA-19117141-1']);
	  _gaq.push(['_trackPageview']);

	  (function() {
	    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();

	</script>'
};
