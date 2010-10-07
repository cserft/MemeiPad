// =========
// = Oauth =
// =========

 // create a new OAuthAdapter instance by passing by your consumer data and signature method
 Ti.include('oauth_adapter.js');

 // Initialize oAuthAdapter  
 var oAuthAdapter = new OAuthAdapter();

 // load the access token for the service (if previously saved)
 oAuthAdapter.loadAccessToken('meme');	

 // consume a service API - Sending queries to YQL
 // yql_base_url, yql_params are configured on lib/secrets.js
 // yql_query_meme_info comes form lib/yql_queries.js

 var yqlMemeInfo = oAuthAdapter.send(yql_base_url, yql_params, yql_query_meme_info, 'Meme Info','Meme Basic Info retrieved.','Errr, Not Working.');
 var yqlMemeDashboard = oAuthAdapter.send(yql_base_url, yql_params, yql_query_dashboard, 'Meme Dashboard','Meme Dashboard retrieved.','Errr, Not Working.');

 // if the client is not authorized, ask for authorization. the previous tweet will be sent automatically after authorization
 // get_token_url, get_request_token_url and request_auth_url are configured on secrets.js
 if (oAuthAdapter.isAuthorized() == false)
 {
	 // this function will be called as soon as the application is authorized
     var receivePin = function() {
		 // get the access token with the provided pin/oauth_verifier
         oAuthAdapter.getAccessToken(get_token_url);
		 // save the access token locally on a config file
         oAuthAdapter.saveAccessToken('meme');
     };

	 // get the oauth_token response to append on the Request_auth call
	 var oauthToken = oAuthAdapter.getRequestToken(get_request_token_url)
	
	 // show the authorization UI and call back the receive PIN function
     oAuthAdapter.showAuthorizeUI(request_auth_url + '?' + oauthToken, receivePin);
 }

// ========================
// = retrieving yql data =
// ========================

if (yqlMemeInfo){
	var dataMeme = JSON.parse(yqlMemeInfo);
	var meme = dataMeme.query.results.meme;	
}

if (yqlMemeDashboard){
	var dataPosts = JSON.parse(yqlMemeInfo);
	var posts = dataPosts.query.results;	
}

// ==========
// = LAYOUT =
// ==========

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

Force Landscape mode only
win1.orientationModes = [
	Titanium.UI.LANDSCAPE_LEFT
];


var label1 = Titanium.UI.createLabel({
	color:'black',
	text:'Welcome to Meme iPad app',
	font:{fontSize:35,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto',
	zIndex:3
});
win1.add(label1);

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
	left:640,
	height:30,
	width:'100'
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
	// oAuthAdapter.loadAccessToken('meme');
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
	font:{fontSize:14,fontFamily:'Helvetica Neue',fontWeight:'bold'},
	textAlign:'left',
	top:27,
	left:840,
	height:30,
	width:150,
});
win1.add(memeTitleLabel);

var dashboardShadow = Titanium.UI.createImageView({
	image:'images/shadow.png',
	top:742,
	left:0,
	width:1024,
	height:26
});
win1.add(dashboardShadow);


// open Window with Transition
win1.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});

