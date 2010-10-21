// create a new OAuthAdapter instance by passing by your consumer data and signature method
Ti.include('oadapter.js');

//base Window
var win1 = Titanium.UI.createWindow({  
    title:'Meme for iPad',
    backgroundColor:'#141414',
    backgroundImage: 'images/bg.jpg'
});

// If not authenticated then Show SignIn Window
 var showSignIn = function(continuation) {
	
	var winSignIn = Ti.UI.createWindow({
	    url: 'signin.js',
		name: 'SignIn Window',
	    backgroundColor:'transparent',
	    backgroundImage: 'images/bg.jpg',
		//yql: yql,
		// memeInfo:meme,
		continuation:continuation,
		borderRadius: 5
	});

	    winSignIn.open();
 };

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

		// Ti.UI.createAlertDialog({
		// 	        title: 'Signout',
		// 	        message: "Signout link clicked"
		// 	    }).show();

		oAuthAdapter.logout('meme');
		oAuthAdapter.login(showSignIn, showDashboard);
		
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
		width:150
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
		memeInfo:meme,
		zIndex: 5
	});

	winDashboard.open();

 };


// =========================================
// =  // Initialize oAuthAdapter process   =
// =========================================
var oAuthAdapter = OAuthAdapter('meme', authorizationUI());
oAuthAdapter.login(showSignIn, showDashboard);





