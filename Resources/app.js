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

// Force Landscape mode only
win1.orientationModes = [
	Titanium.UI.LANDSCAPE_LEFT
];


var label1 = Titanium.UI.createLabel({
	color:'black',
	text:'I am Window 1',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
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

var hiYahooUser = Titanium.UI.createLabel({
	color:'#999999',
	text:'Hi, gneumann    |',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	textAlign:'right',
	top:27,
	left:720,
	height:30,
	width:'auto'
});
win1.add(hiYahooUser);

var memeUser = Titanium.UI.createLabel({
	color:'#ffffff',
	text:'New Musical Express',
	font:{fontSize:14,fontFamily:'Helvetica Neue',fontWeight:'bold'},
	textAlign:'left',
	top:27,
	left:840,
	height:30,
	width:150,
});
win1.add(memeUser);

var dashboardShadow = Titanium.UI.createImageView({
	image:'images/shadow.png',
	top:742,
	left:0,
	width:1024,
	height:26
});
win1.add(dashboardShadow);


// // View with data from Users Meme (table: meme.info)
// var usercardView = Ti.UI.createView({
// 	color:'black',
// 	backgroundColor:'white',
// 	borderWidth:3,
// 	borderColor:'#777',
// 	borderRadius:5,
// 	width:200,
// 	zIndex:2
// });
// win1.add(usercardView);
// usercardView.add(label1);

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({  
    title:'Tab 2',
    backgroundColor:'#fff'
});
//var tab2 = Titanium.UI.createTab({  
//    icon:'KS_nav_ui.png',
//    title:'Tab 2',
//    window:win2
//});

var label2 = Titanium.UI.createLabel({
	color:'#999',
	text:'I am Window 2',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

win2.add(label2);


//
//  add tabs
//
//tabGroup.addTab(tab1);  
//tabGroup.addTab(tab2);  


// open tab group
win1.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});


// =========
// = Oauth =
// =========

 // create a new OAuthAdapter instance by passing by your consumer data and signature method
 Ti.include('oauth_adapter.js');

 // Initialize oAuthAdapter  
 var oAuthAdapter = new OAuthAdapter();

 // load the access token for the service (if previously saved)
 oAuthAdapter.loadAccessToken('meme');	

 var yql_query = "SELECT * FROM meme.info where owner_guid=me";

 // consume a service API - Sending queries to YQL
 // yql_base_url, yql_params are configured on secrets.js
 var yqlResult = oAuthAdapter.send(yql_base_url, yql_params, yql_query, 'Meme','YQL Query is working properly.','Sorry, YQL query didn\'t work.');

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

// =======================
// = retrieving yql data =
// =======================

Ti.API.debug("Result YQL XML: " + yqlResult);
