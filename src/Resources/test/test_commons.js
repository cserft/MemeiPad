Ti.include('../lib/commons.js');

jsUnity.attachAssertions();

var CommonsTestSuite = {
	suiteName: 'Cache Test Suite',
	
	testAddHtmlEntities: function() {
		var text = 'poker\nopker poker poker\n\ntest';
		var result = add_html_entities(text);
		assertEqual(result, 'poker<br>opker poker poker<br><br>test');
	},
	
	testStripHtmlEntities: function() {
		var html = '<p>this is my <span class="bold">html</span> awesome\ntext!';
		var result = strip_html_entities(html);
		assertEqual(result, 'this is my html awesome text!');
	}
};