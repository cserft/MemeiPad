// create a new OAuthAdapter instance by passing by your consumer data and signature method
Ti.include('oadapter.js');

var myMemeInfo = null;


//base Window
var win1 = Titanium.UI.createWindow({  
    title:'Meme for iPad',
    backgroundColor:'#141414',
    backgroundImage: 'images/bg.jpg',
	orientationModes : [
	Titanium.UI.LANDSCAPE_LEFT,
	Titanium.UI.LANDSCAPE_RIGHT
	]

});

var logoHeader = Titanium.UI.createImageView({
	image:'images/logo_header.png',
	top: 0,
	left: 20,
	width: 217, //actual: 194
	height: 93 // actual: 47
});
win1.add(logoHeader);

var btn_signin = Titanium.UI.createButton({
	backgroundImage:'images/btn_signin_top.png',
	top: 5,
	left: 795,
	width:222, //actual: 176
	height:89, //actual: 43
	opacity:1,
	visible: false
});
win1.add(btn_signin);

var btn_signup = Titanium.UI.createButton({
	backgroundImage:'images/btn_signup.png',
	top: 5,
	left: 450,
	width: 352, //actual: 306
	height: 89, //actual: 43
	opacity:1,
	visible: false
});
win1.add(btn_signup);

//Alert to Open Safari for the Post Permalink
var alertOpenSignUp = Titanium.UI.createAlertDialog({
	title: 'Create your account',
	message: 'We will open the SignUp page on Safari',
	buttonNames: ['OK','Cancel'],
	cancel: 1
});

btn_signup.addEventListener("click", function(e)
{
	alertOpenSignUp.show();
});


// Opens the Permalink page on Safari
alertOpenSignUp.addEventListener('click',function(e)
{
	if (e.index == 0){
		// Open Link to the Guidelines Page on Safari
		Ti.Platform.openURL("http://meme.yahoo.com/confirm");	
	}
});

// ====================
// = LOGGED IN HEADER =
// ====================

var showHeader = function (yql, pType, pWinDashboard){
	
	// Ti.App.fireEvent('show_indicator', {
	// 	message: "Loading...",
	// 	color: "transparent",
	// 	size: 150,
	// 	top: -10,
	// 	left: 530
	// });
	
	Ti.API.info("showHeader function Called with pType = " + pType);

	var headerView = Ti.UI.createView({
		backgroundColor:'transparent',
		left:0,
		top:0,
		height:88,
		width:1024,
		zIndex: 2

	});
	win1.add(headerView);

	if (pType === "logged") {

		// ========================
		// = retrieving yql data =
		// ========================

		var yqlMemeInfo = yql.query("SELECT * FROM meme.info where owner_guid=me | meme.functions.thumbs(width=33,height=33)");

		if (yqlMemeInfo){

			var meme = yqlMemeInfo.query.results.meme;	
			myMemeInfo = meme;
		}
		
		var btn_Username = Ti.UI.createButton({
			backgroundImage: 	'images/btn_username.png',
			height: 			41, //actual: 35
			width: 				220, //actual: 214
			left: 				290,
			top: 				25,
			zIndex:  			3
		});
				headerView.add(btn_Username);

		var miniAvatarView = Ti.UI.createImageView({
			image: 			meme.avatar_url.thumb,
			defaultImage: 	'images/default_img_avatar.png',
			top: 			4,
			left: 			5,
			width: 			33,
			height: 		33,
			borderRadius: 	3,
			zIndex:  		2
		});
		btn_Username.add(miniAvatarView);
	
		var memeTitleLabel = Ti.UI.createLabel({
			color: 		'#ffffff',
			text:  		meme.title,
			font: 		{fontSize:13, fontFamily:'Helvetica Neue', fontWeight:'bold'},
			textAlign: 	'left',
			shadowColor:'black',
			shadowOffset:{x:-1,y:-1},
			top: 		10,
			left:  		50,
			height: 	20,
			width: 		145,
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
				backgroundColor:"#FFF",
				navBarHidden: true
			});
			
			var navGroup = Ti.UI.iPhone.createNavigationGroup({
			  window:main
			});
			
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
			
			//Open Link on Safari
			var alertOpenSignUp = Titanium.UI.createAlertDialog({
				title: 'Open Link',
				message: 'We will open this link on Safari',
				buttonNames: ['OK','Cancel'],
				cancel: 1
			});

			linkMeme.addEventListener("click", function(e)
			{
				alertOpenSignUp.show();
			});

			alertOpenSignUp.addEventListener('click',function(e)
			{
				if (e.index == 0){
					Ti.Platform.openURL(meme.url);	
				}
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
				oAuthAdapter.login(showSignIn, showDashboard);
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
				width: 			340,
				height: 		160,
				separatorColor: '#CCC',
				style: 			0 //Ti.UI.iPhone.TableViewStyle.PLAIN
			});
			
			
			main.add(settingsTableView);
			
			//ABOUT WINDOW
			var aboutWindow = Ti.UI.createWindow({
				backgroundColor: 	"white",
				barColor: 			'#333',
				title: 				aboutApp.text,
				navBarHidden: 		false
			});
			
			var aboutView = Ti.UI.createScrollView({
				top: 				0,
				width: 				340, 
				height: 			420,
				contentWidth: 		330,
				contentHeight: 		480,
				showVerticalScrollIndicator:true,
				showHorizontalScrollIndicator:false
			});
			aboutWindow.add(aboutView);
			
			var aboutLabel = Ti.UI.createLabel({
				text: 'Meme for iPad is a pet project from the Yahoo! Meme Team, originated in one of our internal Hack Events.\n\nIt was developed by Antonio Carlos Silveira (@acarlos1000) and Guilherme Chapiewski (@gchapiewski) with Design/UI by Guilherme Neumann (@gneumann).\n\nThis app is totally developed on top of the Open Source Titanium SDK and Yahoo\'s YQL.\n\nThe source code of this app is freely available at GitHub, feel free to download and learn from it.',
				font: 			{fontSize:15,fontFamily:'Helvetica Neue', fontWeight:'regular'},
				top: 				10,	
				width: 				325,
				height: 			'auto',
				backgroundColor: 	'#FFF',
				color: 				'black'
			});
			aboutView.add(aboutLabel);
			
			var aboutGitButton = Ti.UI.createButton({
				top: 				aboutLabel.top + aboutLabel.height + 20,
				image: 				'images/btn_about.png',
				width: 				335, //real 329
				height: 			91, //real: 85
				style: 				Ti.UI.iPhone.SystemButtonStyle.PLAIN,
				zIndex: 			3
			});
			aboutView.add(aboutGitButton);
			
			//Open Link on Safari
			//Alert to Open Safari for the GitHub Link
			var alertOpenSignUp = Titanium.UI.createAlertDialog({
				title: 'Open Link',
				message: 'We will open GitHub page on Safari',
				buttonNames: ['OK','Cancel'],
				cancel: 1
			});

			aboutGitButton.addEventListener("click", function(e)
			{
				alertOpenSignUp.show();
			});


			// Opens the GitHub page on Safari
			alertOpenSignUp.addEventListener('click',function(e)
			{
				if (e.index == 0){
					Ti.Platform.openURL('http://memeapp.net/source');
				}
			});
			
			var githubIcon = Ti.UI.createImageView({
				image: 			'images/github.png',
				left: 			20,
				width: 			60,
				height: 		60,
				borderRadius: 	4
				// borderColor: 	'#CCC'
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
			
			
			var backButton = Ti.UI.createButton({
			    title:'Back',
				style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
			});
			
			aboutWindow.leftNavButton = backButton;
			
			aboutWindow.addEventListener('blur', function (){
				 popover.height = 160;
			});
			
			backButton.addEventListener('click', function (){
				navGroup.close(aboutWindow, {animated: true, duration: 100});
			});

			
			settingsTableView.addEventListener('click', function(e)	{
				if (e.index == 2) {
					navGroup.open(aboutWindow, {animated: true, duration: 100});
					popover.height = 420; 
				}
			});
			
			popover.add(navGroup);
			
			popover.show({
				view:btn_Username,
				animated:true,
			});

		});
		
		
		// ===============
		// = post button =
		// ===============
		
		var btn_StartPosting = Ti.UI.createButton({
			backgroundImage: 	'images/btn_start_posting.png',
			height: 			89, //actual: 43
			width: 				306, //actual: 260
			left: 				708,
			top: 				0
		});
		headerView.add(btn_StartPosting);
		
		// Opens the New Post Window
		btn_StartPosting.addEventListener('click', function()
		{
			newPost(yql);
		});
		
		Ti.App.fireEvent('hide_indicator');

	} else {
		
		// NOT LOGGED IN
		btn_signin.visible = true;
		btn_signup.visible = true;
		headerView.hide();
		Ti.App.fireEvent('hide_indicator');
	}

};


// If not authenticated then Show SignIn Window
var showSignIn = function(continuation) {
	
	// Sign In Button Listener
	btn_signin.addEventListener("click",continuation);
	
	showHeader(null,"notlogged");
   	showDashboard(OAuthAdapter("meme"),"notlogged");

};

// If Authentication OK the Show Dashboard
var showDashboard = function(yql,pDashboardType) {
	
	Ti.API.info('pDashboardType from showDashboard function on app.js = ' + pDashboardType);
	
	// ===========================
	// = CREATING DASHBOARD VIEW =
	// ===========================

	var winDashboard = Ti.UI.createWindow({
		url: 'dashboard.js',
		name: 'Dashboard',
		backgroundColor: 'transparent',
		left: 0,
		top: 90,
		height: 658,
		width: 1024,
		navBarHidden: true,
		yql: yql,
		pDashboardType: pDashboardType,
		myMemeInfo: myMemeInfo,
		win1: win1,
		zIndex: 2,
		orientationModes: [
			Titanium.UI.LANDSCAPE_LEFT,
			Titanium.UI.LANDSCAPE_RIGHT
		]
	});
	winDashboard.open();
	
	//Removes the TableView so it can start fresh
    Ti.App.fireEvent('remove_tableview');

	//PASSES THE YQL OBJECT fwd
    Ti.App.fireEvent('yql', {yql:yql});
	
	// Builds the LoggedIn Header or the SignIn one
	if (pDashboardType === "logged") {
		showHeader(yql, pDashboardType, winDashboard);
		btn_signin.visible = false;
		btn_signup.visible = false;
	} else {
		btn_signin.visible = true;
		btn_signup.visible = true;
	}
};

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
		top: 749,
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

function showIndicator(pMessage, pColor, pSize, pTop, pLeft)
{
	
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

function hideIndicator()
{
	actInd.hide();
	indWin.close({opacity:0,duration:500});	
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

// Titanium.App.addEventListener('resume', function(e)
// {
//   var a = Titanium.UI.createAlertDialog({ 
//     title:'App Resumed',
//     message: 'YEP it works'
//   });
// 	a.show();
// });

// ==================================
// = Checks if the Device is Online =
// ==================================

if (!Titanium.Network.online) {
	Ti.UI.createAlertDialog({ 
		title:'Network Connection Required',
	    message: 'Meme for iPad requires an Internet connection to, you know, use stuff from the Internets. Please, check your network connection and try again.'
	}).show();
} else {
	// =========================================
	// =  // Initialize oAuthAdapter process   =
	// =========================================
	var oAuthAdapter = OAuthAdapter('meme', authorizationUI());
	oAuthAdapter.login(showSignIn, showDashboard);
};

// =====================
// = YQL ERROR MESSAGE =
// =====================
Ti.App.addEventListener('yqlerror', function(e) {
	Ti.API.error('App crashed (cannot connect to YQL). Query: ' + e.query);
	//Closes the Keyboard if open
	Ti.App.fireEvent('hide_keyboard');
	
	var errorWin = Ti.UI.createWindow({
		title: 'Error YQL',
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
		left: 58,
		width: 100,
		height: 86,
		opacity: 0.3
	});
	errorView.add(icon_exclamation);
	
	var errorLabel = Ti.UI.createLabel({
		text: 				'Ops, it seems we had a problem...',
		font: 				{fontSize:36, fontFamily:'Helvetica', fontWeight:'bold'},
		textAlign: 			'left',
		top: 				330,
		left: 				177,	
		width: 				660,
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
		left: 				782,
		top: 				330,
		style: 				Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});
	errorView.add(btn_error_refresh);
	
	errorWin.open();
	
	// Opens the New Post Window
	btn_error_refresh.addEventListener('click', function()
	{
		//Closes NewPost if Open
		Ti.App.fireEvent('close_newpost');
		
		//Closes Permalink if Open
		Ti.App.fireEvent('close_permalink');
		
		errorWin.close({opacity:0,duration:200});
		// Starts Authentication
		var oAuthAdapter = OAuthAdapter('meme', authorizationUI());
		oAuthAdapter.login(showSignIn, showDashboard);
	});
	
});