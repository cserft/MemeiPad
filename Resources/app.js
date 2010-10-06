// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundColor:'#fff',
    backgroundImage: 'images/bg.jpg'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Tab 1',
    window:win1
});

var label1 = Titanium.UI.createLabel({
	color:'black',
	text:'I am Window 1',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto',
	zIndex:3
});
win1.add(label1);

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
var tab2 = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'Tab 2',
    window:win2
});

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
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  


// open tab group
tabGroup.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});


// =========
// = Oauth =
// =========

 // create a new OAuthAdapter instance by passing by your consumer data and signature method
 Ti.include('oauth_adapter.js');

 // Initialize oAuthAdapter  
 var oAuthAdapter = new OAuthAdapter();

 // load the access token for the service (if previously saved)
 oAuthAdapter.loadAccessToken('meme');	

 var yql_query = "SELECT * FROM meme.info where name='acarlos1000'";

 // consume a service API - Sending queries to YQL
 // yql_base_url, yql_params are configured on secrets.js
 oAuthAdapter.send(yql_base_url, yql_params, yql_query, 'Meme','YQL Query is working properly.','Sorry, YQL query didn\'t work.');

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

