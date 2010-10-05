// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Tab 1',
    window:win1
});

var label1 = Titanium.UI.createLabel({
	color:'#999',
	text:'I am Window 1',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

win1.add(label1);

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
tabGroup.open();

// =========
// = Oauth =
// =========

/*
 * This library currently works only with Yahoo! Meme, although I'd like to
 * spend some more time to make it generally compatible with other services
 * too.
 *
 * Sample use with Yahoo! Meme:
*/
 // create a new OAuthAdapter instance by passing by your consumer data and signature method

 Ti.include('oauth_adapter.js');

 var oAuthAdapter = new OAuthAdapter(
 '0013b3b080bbbf1d82be4ec970368162b7a904eb',
 'dj0yJmk9NlNJWFR6OW9wUlRmJmQ9WVdrOVZqbEJVVUpRTTJVbWNHbzlORE15TWprMk1nLS0mcz1jb25zdW1lcnNlY3JldCZ4PTQw',
 'HMAC-SHA1');

 // load the access token for the service (if previously saved)
 oAuthAdapter.loadAccessToken('meme');	

 var BASE_URL = 'https://query.yahooapis.com/v1/public/yql';
 var queryYQL = "SELECT * FROM meme.info where name='acarlos1000'";

 var parameters = [];
 parameters.push(["q", queryYQL]);
 parameters.push(["format", "json"]);
 parameters.push(["diagnostics", "false"]);
 // parameters.push(["callback", "back"]);
 parameters.push(["env", "http://datatables.org/alltables.env"]);

 // consume a service API - in this case the status update by Twitter
 oAuthAdapter.send(BASE_URL, parameters,'Meme','Query works.','Query didnt work.');

 // if the client is not authorized, ask for authorization. the previous tweet will be sent automatically after authorization
 if (oAuthAdapter.isAuthorized() == false)
 {
	 // this function will be called as soon as the application is authorized
     var receivePin = function() {
		 // get the access token with the provided pin/oauth_verifier
         oAuthAdapter.getAccessToken('https://api.login.yahoo.com/oauth/v2/get_token');
		 // save the access token
         oAuthAdapter.saveAccessToken('meme');
     };

	 // get the oauth_token response to append on the Request_auth call
	 var oauthToken = oAuthAdapter.getRequestToken('https://api.login.yahoo.com/oauth/v2/get_request_token')
	 // Ti.API.debug('oAuthToken from Apps.js: ' + oauthToken);
	
	 // show the authorization UI and call back the receive PIN function
     oAuthAdapter.showAuthorizeUI('https://api.login.yahoo.com/oauth/v2/request_auth?' + oauthToken, receivePin);
 }



