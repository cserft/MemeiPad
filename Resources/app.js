 // create a new OAuthAdapter instance by passing by your consumer data and signature method
 Ti.include('oadapter.js');

// If not authenticated then Show SignIn Window
 var showSignIn = function(continuation) {
	
	var winSignIn = Ti.UI.createWindow({
	    name: 'SignIn Window',
	    backgroundColor:'transparent',
	    backgroundImage: 'images/bg.jpg',
		borderRadius: 5
	});
	winSignIn.orientationModes = [
		Titanium.UI.LANDSCAPE_LEFT
	];

	var signinView = Ti.UI.createView({
		backgroundColor:'white',
		width: 500,
		height: 300,
		borderRadius: 5
	});
	winSignIn.add(signinView);

	var btn_signin = Titanium.UI.createButton({
		backgroundImage:'images/btn_signin.png',
		width:260,
		height:57,
		opacity:1
	});
	signinView.add(btn_signin);
	
    winSignIn.open();

	// Sign In Button Listener
	btn_signin.addEventListener("click", continuation);

 }

// If Authentication OK the Show Dashboard
 var showDashboard = function(yql) {
	
	var yqlMemeInfo = yql.query("SELECT * FROM meme.info where owner_guid=me | meme.functions.thumbs(width=22,height=22)");
	
	// ========================
	// = retrieving yql data =
	// ========================

	if (yqlMemeInfo){
		//var dataMeme = JSON.parse(yqlMemeInfo);
		var meme = yqlMemeInfo.query.results.meme;	
	}

	// this sets the background color of the master UIView (when there are no windows/tab groups on it)
	Titanium.UI.setBackgroundColor('#000');

	//
	// create base UI tab and root window
	//
	var win1 = Titanium.UI.createWindow({  
	    title:'Tab 1',
	    backgroundColor:'#fff',
	    backgroundImage: 'images/bg.jpg'
	});

	//Forces Landscape mode only
	win1.orientationModes = [
		Titanium.UI.LANDSCAPE_LEFT
	];


	var logoHeader = Titanium.UI.createImageView({
		image:'images/logo_header.png',
		top:-5,
		left:3,
		width:236,
		height:106
	});
	win1.add(logoHeader);

	var hiYahooUserLabel = Titanium.UI.createLabel({
		color:'#999999',
		text: 'Hi, ' + meme.name + '    |',
		font:{fontSize:12,fontFamily:'Helvetica Neue'},
	    textAlign:'right',
		top:27,
		left:590,
		height:30,
		width:'150'
	});
	win1.add(hiYahooUserLabel);

	var signoutLabel = Titanium.UI.createLabel({
		color:'#999999',
		text: 'signout',
		font:{fontSize:12,fontFamily:'Helvetica Neue'},
	    textAlign:'right',
		top:27,
		left:690,
		height:30,
		width:'100'
	});
	win1.add(signoutLabel);

	signoutLabel.addEventListener("click", function(e) {

		Ti.API.info("Signout Link clicked");

		Ti.UI.createAlertDialog({
	        title: 'Signout',
	        message: "Signout link clicked"
	    }).show();

		// oAuthAdapter.logout('meme');
	});

	var miniAvatarView = Titanium.UI.createImageView({
		image: meme.avatar_url.thumb,
		borderColor: 'black',
		border: 2,
		top:30,
		left:810,
		width:22,
		height:22
	});
	win1.add(miniAvatarView);

	var memeTitleLabel = Titanium.UI.createLabel({
		color:'#ffffff',
		text: meme.title,
		// text: 'Antonio Carlos Silveira',
		font:{fontSize:14,fontFamily:'Helvetica Neue',fontWeight:'bold'},
		textAlign:'left',
		top:27,
		left:840,
		height:30,
		width:150,
	});
	win1.add(memeTitleLabel);


	// open Window with Transition
	win1.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});

	// ===========================
	// = CREATING DASHBOARD VIEW =
	// ===========================

	var winDashboard = Ti.UI.createWindow({
	    url: 'dashboard.js',
	    name: 'Dashboard Window',
	    backgroundColor:'transparent',
		left:0,
		top:90,
		height:655,
		width:1024,
		navBarHidden: true,
		yql: yql,
		// memeInfo:meme,
		zIndex: 5
	});

	winDashboard.open();

 }

// =========================================
// =  // Initialize oAuthAdapter process   =
// =========================================
var oAuthAdapter = OAuthAdapter('meme', authorizationUI());
oAuthAdapter.login(showSignIn, showDashboard);





