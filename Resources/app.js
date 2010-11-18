// create a new OAuthAdapter instance by passing by your consumer data and signature method
Ti.include('oadapter.js');

// var winDashboardExist;


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
	top: 27,
	left: 34,
	width: 194,
	height: 47
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
			
			// Sets a FireEvent passing the Meme Object Fwd
			Ti.App.fireEvent('myMemeInfo',{myMemeInfo:meme});
		}
		
		var btn_Username = Ti.UI.createButton({
			backgroundImage: 	'images/btn_username.png',
			height: 			41, //actual: 35
			width: 				220, //actual: 214
			left: 				268,
			top: 				23,
			zIndex:  			3
		});
		headerView.add(btn_Username);

		var miniAvatarView = Titanium.UI.createImageView({
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
	
		var memeTitleLabel = Titanium.UI.createLabel({
			color: 		'#ffffff',
			text:  		meme.title,
			font: 		{fontSize:13, fontFamily:'Helvetica Neue', fontWeight:'bold'},
			textAlign: 	'left',
			shadowColor:'black',
			shadowOffset:{x:-1,y:-1},
			top: 		10,
			left:  		50,
			height: 	20,
			width: 		145
		});
		btn_Username.add(memeTitleLabel);
		
		// ================
		// = PopOver Menu =
		// ================

		// build User popover
		btn_Username.addEventListener('click', function()	{
			
			var popover = Titanium.UI.iPad.createPopover({
				width:220,
				height:200,
				title: 'Settings',
				arrowDirection:Ti.UI.iPad.POPOVER_ARROW_DIRECTION_UP
			});

			var settingsTableView = Ti.UI.createTableView({
				top:0,
				height:200,
				data:[
					{title:'About this app', hasChild: true, url: 'about.js'},
					{title:'Followers: ' + meme.followers, hasChild: true},
					{title:'Following: ' + meme.following, hasChild: true},
					{title:'Sign out'}
				],
				style: 1 //Ti.UI.iPhone.TableViewStyle.GROUP
			});
		
			settingsTableView.addEventListener('click', function(e)	{
			
			Ti.API.info("Table Row Clicked: " + e.index);
			
			// if (e.rowData.url)
			// {
			// 	var winPopover = Titanium.UI.createView({
			// 		top:0,
			// 		left:0,
			// 		backgroundColor: 'red',
			// 		// url:e.rowData.url,
			// 		title:e.rowData.title
			// 	});
			// 	settingsTableView.add(winPopover);
			// 	// winPopover.open({animated:true});
			// }

				if (e.index == 3){ // Sign Out

					Ti.API.info("Signout Link clicked");
					popover.hide({animated:true});
					oAuthAdapter.logout('meme');
					Ti.App.fireEvent('remove_tableview');
					headerView.hide();
					oAuthAdapter.login(showSignIn, showDashboard);
				}

			});

			popover.add(settingsTableView);

			popover.show({
				view:btn_Username,
				animated:true,
			});

		});
		
		// ==================
		// = signout button =
		// ==================
		
		// var btn_signout = Ti.UI.createButton({
		// 	backgroundImage: 	'images/btn_signout.png',
		// 	height: 			41, //actual: 35
		// 	width: 				66, //actual: 60
		// 	left: 				482,
		// 	top: 				23
		// });
		// headerView.add(btn_signout);
		// 
		// // triggers the signout process
		// btn_Username.addEventListener('click', function()
		// 		{
		// 			Ti.API.info("Signout Button clicked");
		// 			oAuthAdapter.logout('meme');
		// 			Ti.App.fireEvent('remove_tableview');
		// 			headerView.hide();
		// 			oAuthAdapter.login(showSignIn, showDashboard);
		// 		});
		
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
		

	} else {
		
		// NOT LOGGED IN
		btn_signin.visible = true;
		btn_signup.visible = true;
		headerView.hide();
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

function showIndicator(pMessage, pColor, pSize)
{
	// window container
	indWin = Titanium.UI.createWindow({
		height: pSize,
		width: pSize
	});

	// black view
	var indView = Titanium.UI.createView({
		height: pSize,
		width: pSize,
		backgroundColor: pColor,
		borderRadius:10,
		opacity:0.8
	});
	indWin.add(indView);

	// loading indicator
	actInd = Titanium.UI.createActivityIndicator({
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
		top: pSize/3,
		height:30,
		width:30
	});
	indWin.add(actInd);

	// message
	var message = Titanium.UI.createLabel({
		text: pMessage,
		color:'#fff',
		width:'auto',
		height:'auto',
		font:{fontSize:22,fontWeight:'bold'},
		bottom: pSize/4
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
Titanium.App.addEventListener('show_indicator', function(e)
{
	Ti.API.info("SHOW INDICATOR");
	showIndicator(e.message, e.color, e.size);
});
Titanium.App.addEventListener('hide_indicator', function(e)
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
