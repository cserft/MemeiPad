// create a new OAuthAdapter instance by passing by your consumer data and signature method
Ti.include('oadapter.js');
Ti.include('lib/cache.js');

var myMemeInfo = null;
var oAuthAdapter = OAuthAdapter('meme', authorizationUI());

//base Window
var win1 = Titanium.UI.createWindow({  
    title: 				'Meme for iPad',
    backgroundImage: 	'images/bg.png',
	orientationModes : [
	Titanium.UI.LANDSCAPE_LEFT,
	Titanium.UI.LANDSCAPE_RIGHT
	]

});

var view1 = Ti.UI.createImageView({
	image: 'images/destaque1.png',
	backgroundColor:'black',
	width: 1024,
	height: 273
});

var captionBgView = Ti.UI.createView({
	backgroundColor:'black',
	opacity: 0.9,
	top: 150,
	left: 634,
	width: 390,
	height: 87
});
view1.add(captionBgView);

var featuredLabel = Ti.UI.createLabel({
	color: 			'#ffffff',
	text:  			'FEATURED CONTENT',
	font: 			{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'},
	opacity: 		0.5,
	textAlign: 		'left',
	top: 			10,
	left:  			15,
	height: 		20,
	width: 			150,
	zIndex: 		2
});
captionBgView.add(featuredLabel);

var captionLabel = Ti.UI.createLabel({
	color: 			'#ffffff',
	text:  			'Rolling Stones are back on the road with a brand new show',
	font: 			{fontSize:18, fontFamily:'Helvetica', fontWeight:'bold'},
	textAlign: 		'left',
	top: 			30,
	left:  			15,
	height: 		50,
	width: 			361,
	zIndex: 		2
});
captionBgView.add(captionLabel);

var view2 = Ti.UI.createView({
	backgroundColor:'yellow',
	width:'100%',
	height:'100%'
});

var view3 = Ti.UI.createView({
	backgroundColor:'red',
	width:'100%',
	height:'100%'
});

var highlight = Titanium.UI.createScrollableView({
	views: 					[view1,view2,view3],
	top: 					51,
	left: 					0,
	width: 					1024,
	height: 				273,
	showPagingControl: 		true,
	pagingControlHeight: 	24,
	pagingControlColor: 	'black',
	// maxZoomScale: 			2.0,
	currentPage: 			0,
	zIndex: 				1
});
win1.add(highlight);


var appNavBarView = Ti.UI.createView({
	backgroundImage: 		'images/bg_app_navbar.png',
	backgroundColor: 		'black',
	opacity: 				1,
	top: 					0,
	left: 					0,
	width: 					1024,
	height: 				50,
	zIndex: 				1
});
win1.add(appNavBarView);

var logoHeader = Titanium.UI.createImageView({
       	image:'images/logo_meme_white.png',
       	top:            9,
       	left:           15,
       	width:          163,
       	height:         33,
		zIndex: 		2
});
appNavBarView.add(logoHeader);

var btn_signin = Titanium.UI.createButton({
	backgroundImage:'images/btn_signin_top_2.png',
	top: -22,
	left: 940,
	width: 96, // 72
	height: 97,  // 54
	opacity: 1,
	visible: false,
	zIndex: 3
});
win1.add(btn_signin);

var btn_signup = Titanium.UI.createButton({
	backgroundImage:'images/btn_signup2.png',
	top: -26,
	left: 599,
	width: 369, //actual: 303	
	height: 106, //actual: 54
	opacity:1,
	visible: false,
	zIndex: 3
});
win1.add(btn_signup);

btn_signup.addEventListener("click", function(e) {
	Ti.App.fireEvent('openLinkOnSafari', { 
		title: 'Create your account',
		message: 'We will open the SignUp page on Safari',
		url: 'http://meme.yahoo.com/confirm'
	});
});


// ====================
// = LOGGED IN HEADER =
// ====================

var showHeader = function (yql, pType, successCallback) {
	
	Ti.API.info("showHeader function Called with pType = " + pType);
	
	var headerView = Ti.UI.createView({
		backgroundColor:'transparent',
		left:0,
		top:0,
		height:54,
		width:1024,
		zIndex: 4,
		visible: true
	});
	win1.add(headerView);

	if (pType === "logged") {

		// ========================
		// = retrieving yql data =
		// ========================

		var yqlMemeInfo = yql.query("SELECT * FROM meme.info where owner_guid=me | meme.functions.thumbs(width=35,height=35)");

		if (!yqlMemeInfo.query.results) {
			Ti.App.fireEvent('yqlerror');
		}

		var meme = yqlMemeInfo.query.results.meme;
		myMemeInfo = meme;
		
		var btn_Username = Ti.UI.createButton({
			backgroundImage: 	'images/btn_username_2.png',
			backgroundSelectedImage: 'images/btn_username_selected.png',
			height: 			49,
			width: 				243,
			left: 				207,
			top: 				0,
			zIndex:  			3
		});
		headerView.add(btn_Username);
	
		var memeTitleLabel = Ti.UI.createLabel({
			color: 		'#ffffff',
			text:  		meme.title,
			font: 		{fontSize:14, fontFamily:'Helvetica Neue', fontWeight:'bold'},
			textAlign: 	'left',		
			top: 		14,
			left:  		12,
			height: 	20,
			width: 		200,
			zIndex: 2
		});
		btn_Username.add(memeTitleLabel);
	
		// ================
		// = PopOver Menu =
		// ================

		// build User popover
		btn_Username.addEventListener('click', function()	{
			
			//PopOver 
			var popover = Ti.UI.iPad.createPopover({
				width:341,
				height:160, 
				backgroundColor: 'white',
				navBarHidden: true,
				arrowDirection:Ti.UI.iPad.POPOVER_ARROW_DIRECTION_UP
			});
			
			var main = Ti.UI.createWindow({
				top: 0,
				left: 0,
				width: 340,
				height: 420,
				backgroundColor:"#FFF",
				navBarHidden: true
			});
			
			popover.add(main);
			
			// BUILDING THE TABLE VIEW
			var data = [];
			
			// ROW 1 LINK TO MEME AND SIGNOUT BUTTON
			var row1 = Ti.UI.createTableViewRow({
				selectionStyle:'none', // no color when clicking in the row
				height: 60
			});
			
			var linkMeme = Ti.UI.createLabel({
			 	color: 			'#7D0670',
				text: 			'me.me/' + meme.name,
				textAlign: 		'left',
				font: 			{fontSize:18, fontWeight:'regular'},
				top: 			16,
				left: 			14,
				height: 		30,
				width: 			224
			});	
			row1.add(linkMeme);

			linkMeme.addEventListener("click", function(e) {
				Ti.App.fireEvent('openLinkOnSafari', {
					url: meme.url,
					title: 'Open Link',
					message: 'We will open this link on Safari'
				});
			});

			var btn_signout = Ti.UI.createButton({
				top:14,
				left:256,
				width:64,
				height:31,
				title: 'sign out',
				color: '#666666',
				font:{fontSize:11, fontWeight:'regular'},
				backgroundImage: 'images/btn_signout.png',
				style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
				borderRadius: 5
			});
			row1.add(btn_signout);
			
			//Sign Out listener
			btn_signout.addEventListener('click', function()
			{
				Ti.API.info("Signout Link clicked");
				popover.hide({animated:true});
				oAuthAdapter.logout('meme');
				Ti.App.fireEvent('remove_tableview');
				headerView.hide();
				startApplication();
			});
			data[0] = row1;
			
			// ROW 2 FOLLOWERS
			var row2 = Ti.UI.createTableViewRow({
				height: 40,
				selectionStyle:'none',
			});
			
			var iconGraphic = Ti.UI.createImageView({
				image: 			'images/icon_graphic.png',
				top: 			10,
				left: 			14,
				width: 			23,
				height: 		16
			});
			row2.add(iconGraphic);
			
			var followLabel = Ti.UI.createLabel({
 				color: 			'#666',
				text: 			'followers ' + meme.followers + '    following ' + meme.following	,
				textAlign: 		'left',
				font: 			{fontSize:14, fontWeight:'regular'},
				left: 			50,
				height: 		34,
				width: 			260
			});	
			row2.add(followLabel);
			
			data[1] = row2;
			
			// ROW 3: ABOUT
			var row3 = Ti.UI.createTableViewRow({
				selectedBackgroundColor: '#CCC',
				height: 60,
				hasChild: true
			});
			
			var aboutApp = Ti.UI.createLabel({
 				color: 			'#333',
				text: 			'About Meme for iPad',
				textAlign: 		'left',
				font: 			{fontSize:18, fontFamily:'Helvetica', fontWeight:'bold'},
				left: 			14,
				height: 		34,
				width: 			260
			});	
			row3.add(aboutApp);
			
			data[2] = row3;
			
			var settingsTableView = Ti.UI.createTableView({
				data: 			data,
				top: 			0,
				left: 			0,
				width: 			340,
				height: 		160,
				separatorColor: '#CCC',
				style: 			0 //Ti.UI.iPhone.TableViewStyle.PLAIN
			});
			
			
			main.add(settingsTableView);
			
			//ABOUT WINDOW
			var aboutWindow = Ti.UI.createView({
				backgroundColor: 	"white",
				top: 				0,
				left: 				341,
				width: 				340,
				height: 			420,
				visible: 			true
			});
			main.add(aboutWindow);
			
			//ABOUT WINDOW
			var navBar = Ti.UI.createView({
				backgroundImage: 	'images/bg_navbar_black.png',
				left: 				0,
				top: 				0,
				width: 				341,
				height: 			44,
				visible: 			true
			});
			aboutWindow.add(navBar);
			
			var backButton = Ti.UI.createButton({
				backgroundImage: 	'images/btn_back.png',
				left: 				0,
				top: 				-5,
				height: 			52, //29
				width: 				73, // 50
			    title: 				'back',
				color: 				'white',
				textAlign: 			'center',
				font: 				{fontSize:12, fontFamily:'Helvetica', fontWeight:'bold'},
				style: 				Titanium.UI.iPhone.SystemButtonStyle.PLAIN
			});
			navBar.add(backButton);

			backButton.addEventListener('click', function (){
				settingsTableView.animate({left: 0, duration: 200});
				aboutWindow.animate({left: 341, duration: 200});
				popover.height = 160; 
			});
			
			var aboutHTML = '<html><head><script language="javascript">var link = function(url) { Ti.App.fireEvent("openLinkOnSafari", { url: url }); }</script></head><body>';
			aboutHTML += '<font face="Helvetica Neue" style="font-size:14px;"><p>Meme for iPad is a pet project from the Yahoo! Meme Team, originated in one of our internal Hack Events.</p><p>It was developed by Antonio Carlos Silveira (<a href="javascript:link(\'http://twitter.com/acarlos1000\');">@acarlos1000</a>) and Guilherme Chapiewski (<a href="javascript:link(\'http://twitter.com/gchapiewski\');">@gchapiewski</a>) with Design/UI by Guilherme Neumann (<a href="javascript:link(\'http://twitter.com/gneumann\');">@gneumann</a>).</p><p>This app is totally developed on top of the Open Source Titanium SDK and Yahoo\'s YQL.</p><p>The source code of this app is freely available at GitHub, feel free to download and learn from it.</p></font>';
			aboutHTML += '</body></html>'
			
			var aboutView = Ti.UI.createWebView({
				html: 				aboutHTML,
				top: 				50,	
				width: 				335,
				height: 			270,
				backgroundColor: 	'#FFF'
			});
			aboutWindow.add(aboutView);
			
			var aboutGitButton = Ti.UI.createButton({
				top: 				325,
				image: 				'images/btn_about.png',
				width: 				335, //real 329
				height: 			91, //real: 85
				style: 				Ti.UI.iPhone.SystemButtonStyle.PLAIN,
				zIndex: 			3
			});
			aboutWindow.add(aboutGitButton);

			aboutGitButton.addEventListener("click", function(e) {
				Ti.App.fireEvent('openLinkOnSafari', {
					url: 'http://memeapp.net/source'
				});
			});
			
			var githubIcon = Ti.UI.createImageView({
				image: 			'images/github.png',
				left: 			20,
				width: 			60,
				height: 		60,
				borderRadius: 	4
			});
			aboutGitButton.add(githubIcon);
			
			var aboutGitLabel = Ti.UI.createLabel({
				text: 				'Meme for iPad on GitHub:\nhttp://memeapp.net/source',
				font: 				{fontSize:14,fontFamily:'Helvetica Neue', fontWeight:'bold'},	
				left: 				githubIcon.left + githubIcon.width + 10,
				width: 				220,
				height: 			70,
				backgroundColor: 	'transparent',
				color: 				'white',
				shadowColor: 		'black',
				shadowOffset: 		{x:1,y:1}
			});
			aboutGitButton.add(aboutGitLabel);
			
			settingsTableView.addEventListener('click', function(e)	{
				if (e.index == 2) {
					popover.height = 420; 
					settingsTableView.animate({left: -341, duration: 200});
					aboutWindow.animate({left: 0, duration: 200});
					
					// navGroup.open(aboutWindow, {animated: true, duration: 100});
					
				}
			});
			
			popover.show({
				view:btn_Username,
				animated:true,
			});

		});
		
		
		// ===============
		// = post button =
		// ===============
		
		var btn_StartPosting = Ti.UI.createButton({
			backgroundImage: 	'images/btn_start_posting_2.png',
			height: 			79, //55
			width: 				407, //395
			left: 				623,
			top: 				-13
		});
		headerView.add(btn_StartPosting);
		
		// Opens the New Post Window
		btn_StartPosting.addEventListener('click', function()
		{
			newPost(yql);
		});

	} else {
		
		// NOT LOGGED IN
		btn_signin.visible = true;
		btn_signup.visible = true;
		headerView.hide();
	}
	
	successCallback();
};

// If Authentication OK the Show Dashboard
var winDashboard;
var showDashboard = function(yql,pDashboardType) {
	
	Ti.API.info('pDashboardType from showDashboard function on app.js = ' + pDashboardType);
	
	// ===========================
	// = CREATING DASHBOARD VIEW =
	// ===========================

	winDashboard = Ti.UI.createWindow({
		url: 'dashboard.js',
		name: 'Dashboard',
		backgroundColor: 'transparent',
		left: 0,
		top: 331,
		height: 417,
		width: 1024,
		navBarHidden: true,
		yql: yql,
		pDashboardType: pDashboardType,
		myMemeInfo: myMemeInfo,
		win1: win1,
		zIndex: 2
	});
	
	// scrollView.add(winDashboard);
	winDashboard.open();
	
	//Removes the TableView so it can start fresh
    Ti.App.fireEvent('remove_tableview');
	
	// Builds the LoggedIn Header or the SignIn one
	if (pDashboardType === "logged") {
		btn_signin.visible = false;
		btn_signup.visible = false;
		
	} else {
		btn_signin.visible = true;
		btn_signup.visible = true;
	}
};

var dashboardShadow = Titanium.UI.createImageView({
	image:'images/shadow.png',
	backgroundColor: "transparent",
	bottom:998,
	left:0,
	width:1024,
	height:26,
	zIndex:999
});
win1.add(dashboardShadow);

var signInButtonClick = function(continuation) {
	// Sign In Button Listener
	btn_signin.addEventListener("click",continuation);
};

var startApplication = function() {
	if (oAuthAdapter.isLoggedIn()) {
		// logged in, shows logged dashboard and header
		showHeader(oAuthAdapter.getYql(), "logged", function() {
		showDashboard(oAuthAdapter.getYql(), "logged");
		});
		
	} else {
		// not logged in, shows unlogged screens
		showHeader(null, "notlogged", function() {
			showDashboard(OAuthAdapter("meme"), "notlogged");
		});
	   	
		oAuthAdapter.attachLogin(signInButtonClick, startApplication);
	}
}

// ==========================
// = CREATE THE POST WINDOW =
// ==========================
// 
// tempPostLabel.animate({zIndex: 0, top : 120 + img.size.height});
// 
var a = Titanium.UI.createAnimation();
a.duration = 200;
a.top = 0;

var newPost = function(yql) {
	Ti.UI.createWindow({
		url: 'newpost.js',
		title: 'New Post',
		backgroundColor: 'white',
		left: 0,
		top: -749,
		height: 748,
		width: 1024,
		yql: yql,
		zIndex: 3,
		navBarHidden: true
	}).open(a);
};
	
//  CREATE CUSTOM LOADING INDICATOR
//
var indWin = null;
var actInd = null;

function showIndicator(pMessage, pColor, pSize, pTop, pLeft) {
	
	// window container
	indWin = Titanium.UI.createWindow({
		height: 		pSize,
		width: 			pSize,
		zIndex: 		995
	});
	
	//IF POSITION IS DEFINED
	if (pTop){
		indWin.top = pTop;
		indWin.left = pLeft;
	}

	// black view
	var indView = Titanium.UI.createView({
		height: 			pSize,
		width: 				pSize,
		backgroundColor: 	pColor,
		borderRadius: 		10,
		opacity: 			0.8
	});
	indWin.add(indView);

	// loading indicator
	actInd = Titanium.UI.createActivityIndicator({
		style: 			Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
		top: 			pSize/3,
		height: 		30,
		width: 			30
	});
	indWin.add(actInd);

	// message
	var message = Titanium.UI.createLabel({
		text: 			pMessage,
		color: 			'#fff',
		width: 			'auto',
		height: 		'auto',
		font: 			{fontSize:18,fontWeight:'bold'},
		bottom: 		pSize/4
	});
	indWin.add(message);
	indWin.open();
	actInd.show();	

};

function hideIndicator() {
	if (actInd && indWin) {
		actInd.hide();
		indWin.close({opacity:0,duration:500});
	}
};

//
// Add global event handlers to hide/show custom indicator
//
Ti.App.addEventListener('show_indicator', function(e)
{
	Ti.API.info("SHOW INDICATOR");
	showIndicator(e.message, e.color, e.size, e.top, e.left);
});

Ti.App.addEventListener('hide_indicator', function(e)
{
	Ti.API.info("HIDE INDICATOR");
	hideIndicator();
});

//
// Opens a link on Safari
//
Ti.App.addEventListener('openLinkOnSafari', function(data) {
	var title = 'Open Link',
		message = 'We will open a page on Safari';
	
	if (data.title) {
		title = data.title;
	}
	if (data.message) {
		message = data.message;
	}
	
	var alert = Titanium.UI.createAlertDialog({
		title: title,
		message: message,
		buttonNames: ['OK','Cancel'],
		cancel: 1
	});
	
	alert.addEventListener('click', function(e) {
		if (e.index == 0){
			Ti.Platform.openURL(data.url);
		}
	});
	
	alert.show();
});

// ============================
// = Fullscreen error message =
// ============================
var displayErrorMessage = function(title, message, relativeTop, pFontSize) {
	//Closes the Keyboard if open
	Ti.App.fireEvent('hide_keyboard');
	
	var errorWin = Ti.UI.createWindow({
		title: title,
		backgroundColor: 'transparent',
		left: 0,
		top: 0,
		height: '100%',
		width: '100%',
		zIndex: 999,
		navBarHidden: true
	});
	
	var errorView = Ti.UI.createView({
	 backgroundColor: 	'transparent',
		backgroundImage: 	'images/bg_error_msg.png',
		width: 				'100%',
		height: 			'100%',
		zIndex: 			999
	});
	errorWin.add(errorView);
	
	var icon_exclamation = Ti.UI.createImageView({
		image: 'images/icon_exclamation.png',
		top: 310,
		left: 50,
		width: 100,
		height: 86,
		opacity: 0.3
	});
	errorView.add(icon_exclamation);
	
	var errorLabel = Ti.UI.createLabel({
		text: 				message,
		font: 				{fontSize: pFontSize, fontFamily:'Helvetica', fontWeight:'bold'},
		textAlign: 			'left',
		top: 				250 + relativeTop,
		left: 				177,	
		width: 				600,
		height: 			'auto',
		backgroundColor: 	'transparent',
		color: 				'#666'
	});
	errorView.add(errorLabel);
	
	var btn_error_refresh = Ti.UI.createButton({
		title: 				'refresh',
		color: 				'#7D0670',
		font: 				{fontSize:22, fontFamily:'Helvetica', fontWeight:'regular'},
		backgroundImage: 	'images/btn_error_refresh.png',
		backgroundColor: 	'transparent',
		selectedColor: 		'gray',
		height: 			53,
		width: 				160,
		left: 				794,
		top: 				330,
		style: 				Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});
	errorView.add(btn_error_refresh);
	
	errorWin.open();
	
	// Opens the New Post Window
	btn_error_refresh.addEventListener('click', function() {
		//Closes NewPost if Open
		Ti.App.fireEvent('close_newpost');
		
		//Closes Permalink if Open
		Ti.App.fireEvent('close_permalink');
		
		errorWin.close({opacity:0,duration:200});
		
		startApplication();
	});
}

// =====================
// = YQL ERROR MESSAGE =
// =====================
Ti.App.addEventListener('yqlerror', function(e) {
	Ti.API.error('App crashed (cannot connect to YQL). Query: ' + e.query);
	displayErrorMessage('YQL Error', 'Ops, it seems we had a problem...', 80, 36);
});

// ==================================
// = Checks if the Device is Online =
// ==================================
if (!Titanium.Network.online) {
	displayErrorMessage('Network Error', 'You need to be online to use Meme for iPad. Please, check your network connection and try again.', 45, 30);
} else {
	startApplication();
};