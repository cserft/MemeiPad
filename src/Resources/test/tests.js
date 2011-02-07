Ti.include('./lib/jsunity-0.6.js');

// Add all test suites...
Ti.include('./test_cache.js');
Ti.include('./test_commons.js');

var testsWebView = Ti.UI.createWebView({
	html: 	'',
	top: 	50,
    left: 	50,
	width: 	924,
	height: 648
});
Ti.UI.currentWindow.add(testsWebView);

var testResults = '';
var testResultsBegin = '<html><head><style type="text/css">body{font-family:helvetica;}</style></head><body>';
var testResultsEnd = '</body></html>';
var updateTestResults = function(message) {
	if (message.indexOf('Running') == 0) {
		testResults += '<strong>' + message + '</strong><br>';
	} else if (message.indexOf('[FAILED]') == 0) {
		testResults += '<font color="#FF0000">' + message + '</font><br>';
	} else if (message.indexOf('[PASSED]') == 0) {
		testResults += '<font color="#009900">' + message + '</font><br>';
	} else {
		testResults += message + '<br>';
	}
	testsWebView.html = testResultsBegin + testResults + testResultsEnd;
};

jsUnity.log = function(message) {
	updateTestResults(message);
};

jsUnity.error = function(message) {
	Ti.API.error(message);
};

jsUnity.run(CacheTestSuite, CommonsTestSuite);