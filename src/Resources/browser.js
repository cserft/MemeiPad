Ti.include('lib/commons.js');
Ti.include('lib/analytics.js');

//Analytics Request
doYwaRequest(analytics.BROWSER_VIEW);

// Setting local window holder
var win = Ti.UI.currentWindow;

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var pUrl = win.pUrl;

// ============================
// = BULDING BROWSER LAYOUT =
// ============================

var browserView = Ti.UI.createView({
	backgroundColor:'white',
	opacity: 		100,
	borderRadius: 	3,
	width:  		978,
	height: 		700,
	zIndex: 		1
});
win.add(browserView);

//Creates the top navigation bar of the browser
var browserBar = Ti.UI.createView({
	backgroundImage: 	'images/bg_bar_browser.png',
	backgroundColor: 	'black',
	opacity: 			1,
	top: 				0,
	left: 				0,
	width:  			978,
	height: 			44,
	zIndex: 			1
});
browserView.add(browserBar);

//Guid Name / Title
var titleLabel = Titanium.UI.createLabel({
	color:'#FFF',
	text: '',
	textAlign:'center',
	font: {
		fontSize: 20,
		fontFamily:'Helvetica',
		fontWeight: 'bold'
	},
	left: 214,
	width: 550,
	height: 27,
	zIndex: 2
});
browserBar.add(titleLabel);


// Button that closes the Browser
var backButton = Ti.UI.createButton({
	backgroundImage: 			'images/bg_btn_back.png',
	backgroundLeftCap: 			15,
	backgroundRightCap: 		15,
	borderRadius: 				2,
	right: 						5,
	height: 					35, //29
	width: 						80	, // 50
    title: 						' done',
	color: 						'white',
	textAlign: 					'center',
	font: 						{fontSize:12, fontFamily:'Helvetica', fontWeight:'bold'},
	style: 						Titanium.UI.iPhone.SystemButtonStyle.PLAIN
});
browserBar.add(backButton);

backButton.addEventListener("click", function(e)
{
	var t3 = Titanium.UI.create2DMatrix();
	t3 = t3.scale(0);
	win.close({transform:t3,duration:200});
	Ti.App.browserIsOpened = false;
    // allows for other Browser to Open
	
});

// Loader
var actAjax = Ti.UI.createActivityIndicator({
	left: 			600,
	message: 		'',
	zIndex: 		2,
	visible: 		false,
	style: 			Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
});
browserBar.add(actAjax);

// Create our Webview to render the URL's content
var webView = Ti.UI.createWebView({
		backgroundColor: 	'white',
		opacity: 			1,
        url: 				pUrl,
		top: 				44,
		width: 				978,
		height: 			656,
        loading: 			true,
		scalesPageToFit: 	true
});
browserView.add(webView);

//Listeners
webView.addEventListener("beforeload", function(e) {
	// displays the ajax in the NavBar while the webview is being loaded
	actAjax.show();
	// reload_btn.hide();
});

webView.addEventListener("load", function(e) {
	titleLabel.text = webView.evalJS("document.title");
	// hides the ajax in the NavBar after the webview is loaded
	actAjax.hide();
	// reload_btn.show();
});



