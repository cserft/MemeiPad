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
	top:-5,
	left:3,
	width:236,
	height:106
});
win1.add(logoHeader);

var btn_signin = Titanium.UI.createButton({
	backgroundImage:'images/btn_signin_top.png',
	top: 5,
	left: 800,
	width:207,
	height:77,
	opacity:1,
	visible: false
});
win1.add(btn_signin);

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

		var yqlMemeInfo = yql.query("SELECT * FROM meme.info where owner_guid=me | meme.functions.thumbs(width=22,height=22)");

		if (yqlMemeInfo){

			var meme = yqlMemeInfo.query.results.meme;	
			
			// Sets a FireEvent passing the Meme Object Fwd
			Ti.App.fireEvent('myMemeInfo',{myMemeInfo:meme});
		}
		
		// ===============
		// = post button =
		// ===============
		
		var btn_StartPosting = Ti.UI.createButton({
			//title:'Show Popover 1',
			backgroundImage: 'images/btn_start_posting.png',
			height:64,
			width:240,
			left: 245,
			top:15
		});
		headerView.add(btn_StartPosting);
		
		btn_StartPosting.addEventListener('click', function()
		{
			newPost(yql);
		});

		var miniAvatarView = Titanium.UI.createImageView({
			image: meme.avatar_url.thumb,
			borderColor: 'black',
			defaultImage: 'images/default_img_avatar.png',
			border: 2,
			top:32,
			left:810,
			width:22,
			height:22
		});
		headerView.add(miniAvatarView);

		var hiYahooUserLabel = Titanium.UI.createLabel({
			color:'#999999',
			text: 'Hi, ' + meme.name + '    |',
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
		    textAlign:'right',
			top:29,
			left:650,
			height:30,
			width:150
		});
		headerView.add(hiYahooUserLabel);
	
		var memeTitleLabel = Titanium.UI.createLabel({
			color:'#ffffff',
			text: meme.title,
			font:{fontSize:14,fontFamily:'Helvetica Neue',fontWeight:'bold'},
			textAlign:'left',
			top:29	,
			left:840,
			height:30,
			width:150
		});
		headerView.add(memeTitleLabel);


		// ================
		// = PopOver Menu =
		// ================

		// build User popover
		memeTitleLabel.addEventListener('click', function()
		{
			
			var popover = Titanium.UI.iPad.createPopover({ 
				width:200, 
				height:180,
				borderWidth: 0,
				title:'Your Stuff',
				arrowDirection:Ti.UI.iPad.POPOVER_ARROW_DIRECTION_UP
			}); 

			var settingsTableView = Ti.UI.createTableView({
				top:0,
				height:180,
				data:[
					{title:'Your Memes', 
						font:{
							fontFamily:'Helvetica Neue'
						}
					},
					{title:'Explore'},
					{title:'Invite your friends'},
					{title:'sign out'}
					],
				color: '#9E4F9E'
				//style: Ti.UI.iPhone.TableViewStyle.GROUPED
			});
			
			settingsTableView.addEventListener('click', function(e) 
			{
				Ti.API.info("Table Row Clicked: " + e.index);
				
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
				view:memeTitleLabel,
				animated:true,
			}); 

		});

	} else {
		
		// NOT LOGGED IN
		btn_signin.visible = true;
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
		name: 'Dashboard Window',
		backgroundColor:'transparent',
		left:0,
		top:90, //90
		height:658,
		width:1024,
		navBarHidden: true,
		yql: yql,
		pDashboardType:pDashboardType,
		win1:win1,
		zIndex: 2,
		orientationModes : [
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

	} else {
		btn_signin.visible = true;
	}

};


// ==========================
// = CREATE THE POST WINDOW =
// ==========================

var newPost = function(yql) {
	Ti.UI.createWindow({
		url: 'newpost.js',
		title: 'New Post',
		backgroundColor: 'white',
		left: 0,
		top: 0,
		height: 748,
		width: 1024,
		yql: yql,
		zIndex: 3,
		modal: true,
		modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
		modalStyle: Ti.UI.iPhone.MODAL_PRESENTATION_FULLSCREEN,
		navBarHidden: true,
		orientationModes: [
			Titanium.UI.LANDSCAPE_LEFT,
			Titanium.UI.LANDSCAPE_RIGHT
		]
	}).open();
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
