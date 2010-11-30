/*
 * The Oauth Adapter needs 2 external libraries (oauth.js, sha1.js) hosted at
 *  http://oauth.googlecode.com/svn/code/javascript/
 * Save them locally in a lib subfolder
 * 
 * Your Oauth secrets as well as you API end points must be in the *secrets.js* 
 * file inside the lib folder
 */

Ti.include('lib/sha1.js');
Ti.include('lib/oauth.js');
Ti.include('lib/secrets.js');

var authorizationUI = function() {
	var authWindow, oauthWebView, signingIn;
   
	// unloads the UI used to have the user authorize the application
    var destroyUI = function() {
        Ti.API.debug('destroyUI');

		btn_signin.enabled = true;
        // if the window doesn't exist, exit
        if (authWindow == null) return;
        // remove the UI
        try
        {
	        Ti.API.debug('destroyAuthorizeUI:webView.removeEventListener');
            authWebView.removeEventListener('load', lookupVerifier);
	        Ti.API.debug('destroyAuthorizeUI:window.close()');
            authWindow.close();
			signingIn = false;
        } catch(ex) {
            Ti.API.debug('Cannot destroy the authorize UI, ignoring. reason: '+ ex.message);
        }

		oauthWindow  = null;
		oauthWebView = null;
		gCallback    = null;
    };

	// looks for the Oauth Verifier everytime the webview loads
    // currently works only with YAHOO!
    var lookupVerifier = function(pCallback) {
		return(function(e) {
			
	        Ti.API.debug('authorizeUILoaded, looking for oAuth Verifier Code');
	
			// stores the page HTML source code
	        var htmlSource = e.source.html;
	
	        // REGEXP looking for the oAuth Verifier code in the HTML page
			var result = (/<span id="shortCode">(\w+)<\/span>/g).exec(htmlSource);
			if (result && result[1]) {
			    var pin = result[1];
				Ti.API.debug('Found oAuth Verifier Code: ' + pin);
	            destroyUI();
				return(pCallback(pin));
			}			
		});
    };

	var showUI = function(pUrl, pCallback) {
		if (signingIn != true) {
			
			btn_signin.enabled = false;
			
			gCallback  = pCallback;
			
			authWindow = Ti.UI.createWindow({
				navBarHidden: true
			});
			
	        authWebView = Ti.UI.createWebView({
	            url: pUrl,
				top: 40,
				zIndex: 99,
				scalesPageToFit: false,
				autoDetect:[Ti.UI.AUTODETECT_NONE] // does not detects Phone numbers and links them automatically
	        });
		
			// Force Landscape mode only		
			var t = Ti.UI.create2DMatrix().scale(0);
			
	        var authView = Ti.UI.createView({
	            top: 50,
	            width: 550,
	            height: 550,
	            border: 5,
	            backgroundColor: 'white',
	            borderColor: '#333',
	            borderRadius: 5,
	            borderWidth: 5,
	            zIndex: -1,
	            transform: t
	        });
			authWindow.add(authView);
	
			// Activity indicator AJAX
			var actInd = Ti.UI.createActivityIndicator({
				top: 250,
				height: 50,
				width: 10,
				zIndex: 90,
				style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK
			});
			authWebView.add(actInd);
	
			//Close button
			var btn_close = Titanium.UI.createButton({
				backgroundImage:'images/btn_close_gray.png',
				width: 			22,
				height: 		22,
				top: 			10,
				right: 			10,
				zIndex: 		10,
				visible: 		true
			});
			authView.add(btn_close);
			
	        authWindow.open();
		
	        authWebView.addEventListener('load', lookupVerifier(pCallback));
	        authView.add(authWebView);
	
			// Creating the Open Transition
			// create first transform to go beyond normal size
			var t1 = Titanium.UI.create2DMatrix();
			t1 = t1.scale(1.1);

			var a = Titanium.UI.createAnimation();
			a.transform = t1;
			a.duration = 200;

			// when this animation completes, scale to normal size
			a.addEventListener('complete', function()
			{
				var t2 = Titanium.UI.create2DMatrix();
				t2 = t2.scale(1.0);
				authView.animate({transform:t2, duration:200});
			});
			
			// Starts the Animation
	        authView.animate(a);
			signingIn = true;
			
			
			// Closes the Authentication Window
	        btn_close.addEventListener('click', destroyUI);
		}
    };

	return(showUI);
}

// ====================================
// = create an OAuthAdapter instance =
// ====================================
var OAuthAdapter = function(pService, authorize) {
	Ti.API.info('*********************************************');
	Ti.API.info('CREATING OAUTH ADAPTER INSTANCE');
	Ti.API.info('*********************************************');

	var accessorFromToken = function(token) {
		return({
			consumerSecret: consumerSecret,
			tokenSecret: token.oauth_token_secret
		});
	};

	var oauthRequest = function(pUrl, pParameters, accessor) {
		return(OAuth.getParameterMap(serviceRequest(pUrl, pParameters, accessor)));
	};

	var serviceRequest = function(pUrl, pParameters, accessor) {
		pParameters.push( ["oauth_consumer_key", consumerKey ] );
		pParameters.push( ["oauth_signature_method", "HMAC-SHA1"] );
		
		var message = { action: pUrl,
					    method: "POST",
						parameters: pParameters
			          };
		OAuth.setTimestampAndNonce(message);
		OAuth.completeRequest(message, accessor);

		var client = Ti.Network.createHTTPClient();
		var myUrl  = OAuth.addToURL(pUrl, message.parameters);

		client.open(message.method, myUrl, false);
        client.send();

		// Ti.API.debug(">>>>> _______________");
		// Ti.API.debug(">>>>> | YQL REQUEST |");
		// 		Ti.API.debug(">>>>> |_____________|");
		// 		Ti.API.debug(">>>>> parameters: [" + pParameters + "]");
		// 		Ti.API.debug(">>>>> url: " + myUrl);
		// 		Ti.API.debug(">>>>> ________________");
		// 		Ti.API.debug(">>>>> | YQL RESPONSE |");
		// 		Ti.API.debug(">>>>> |______________|");
		// 		Ti.API.debug(">>>>> client data: [" + JSON.stringify(client) + "]");
		// 		Ti.API.debug(">>>>> HTTP status code: " + client.status);
		// 		Ti.API.debug(">>>>> HTTP response header [Date]: " + client.getResponseHeader('Date'));
		// 		Ti.API.debug(">>>>> HTTP response header [Server]: " + client.getResponseHeader('Server'));
		// 		Ti.API.debug(">>>>> HTTP response header [Content-Type]: " + client.getResponseHeader('Content-Type'));
		// 		Ti.API.debug(">>>>> HTTP response header [Content-Length]: " + client.getResponseHeader('Content-Length'));
		// 		Ti.API.debug(">>>>> response: " + client.responseText);
		// 		Ti.API.debug(">>>>> ____________");
		// 		Ti.API.debug(">>>>> | END YQL! |");
		// 		Ti.API.debug(">>>>> |__________|");

		return(client.responseText);
	};
	
    var requestToken = function() {
		var accessor       = { consumerSecret: consumerSecret };
		var oauth_response = oauthRequest(get_request_token_url, [ [ "oauth_callback", "oob" ] ], accessor);
		return(oauth_response);
    };

	var accessToken = function(pToken, pVerifier) {
		var parameters = [ [ "oauth_token", pToken.oauth_token ] ];
		if (pVerifier) {
			parameters.push( ["oauth_verifier", pVerifier] );
		}
		if (pToken.oauth_session_handle) {
			parameters.push( ["oauth_session_handle", pToken.oauth_session_handle] );
		}
		var oauth_response = oauthRequest(get_token_url, parameters, accessorFromToken(pToken));
		return(oauth_response);
	};
	
	var maybeRefreshToken = function(timedToken) {
		var token = timedToken.token;
		var now   = timestamp();
		var oauth_expires_in = parseInt(token.oauth_expires_in) * 1000;
		if (timedToken.timestamp + oauth_expires_in <= now) {
			Ti.API.debug('Refrescando: timestamp[' + timedToken.timestamp + '], oauth_expires_in[' + oauth_expires_in + '], now[' + now + ']');
			Ti.API.info('Woo! Refreshing oAuth token...');
			var newToken = accessToken(token);
			saveToken(newToken);
			return(newToken);
		}
		return(token);
	};

	var tokenFilename = function(create) {
		var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, pService + '.config');
		return(file);
	};
	
	var loadToken = function() {
        try {
			var file  = tokenFilename();
			var token = JSON.parse(file.read());
			
			if (token) {
				if ( ! token.token.oauth_token || token.token.oauth_token === 'undefined'){
					// IF Token Dict is empty then Starts the Sign Process Again
					Ti.API.debug("Token{} Empty (will authenticate again): " + JSON.stringify(token.token));
				} else {
					//Ti.API.debug("Loading token from file done: " + JSON.stringify(token));
					return(token);
				}
			}
        } catch(e) {
			//Ti.API.debug("Loading token failed. Reason=" + e.message);
			return null;
		}
	};
	
	var timestamp = function() {
		return((new Date()).getTime());
	};

	var saveToken = function(token) {
        var file = tokenFilename(true);
        file.write(JSON.stringify({
			token: token,
			timestamp: timestamp()
		}));
        Ti.API.debug('Saving token done: '+ JSON.stringify(token));
	};

	var query = function(pQuery) {
		Ti.API.debug("Function Query Called");
		var token = maybeRefreshToken(loadToken());
		var parameters = [ ["format", "json"],
		 				   ["diagnostics", "false"],
		 				   ["q", pQuery],
						   ["oauth_token", token.oauth_token],
						   ["env", "http://datatables.org/alltables.env"]
						 ];
		return doQuery(yql_base_url, parameters, accessorFromToken(token));
	};

	var query2legg = function(pQuery) {
		Ti.API.debug("Function Query2Legg Called");
		var accessor = { consumerSecret: consumerSecret };
		var parameters = [ ["format", "json"],
		 				   ["diagnostics", "false"],
		 				   ["q", pQuery],
						   ["env", "http://datatables.org/alltables.env"]
						 ];
		return doQuery(yql_base_url, parameters, accessor);
	};
	
	var doQuery = function(yql_base_url, parameters, token) {
		var MAX_RETRIES = 3;
		var MODIFY_QUERY = /^insert|delete/i;
		var yql_query = parameters[2][1];
		
		if (MODIFY_QUERY.test(yql_query.trim())) {
			MAX_RETRIES = 1;
		}
		
		var json, yqldata, tries = 0;
		var request = function() {
			json = serviceRequest(yql_base_url, parameters.slice(0), token);
			yqldata = JSON.parse(json);
			tries++;
		};
		while ((!yqldata || !yqldata.query) && (tries < MAX_RETRIES)) {
			if (tries > 0) {
				Ti.API.warn('*** BAD *** Retrying YQL query - tried already ' + tries + ' time(s)');
			}
			request();
		};
		if ((!yqldata || !yqldata.query) && (tries >= MAX_RETRIES)) {
			Ti.App.fireEvent('yqlerror', { query: yql_query });
		}
		return yqldata;
	};
	
	var isLoggedIn = function() {
        if (loadToken()) {
			return true;
		}
		return false;
	}
	
	// returns proper YQL (2 or 3 legged)
	var getYql = function() {
		if (isLoggedIn()) {
			return { query: query };
		}
		return { query: query2legg };
	}
	
	// will check if access tokens are stored in the config file
    var attachLogin = function(attachFunction, callback) {
		attachFunction(function() {
			Ti.API.debug('File not found, executing oauth flow');
			var rtoken = requestToken();
			authorize(rtoken["xoauth_request_auth_url"], function(pVerifier) {
				var atoken = accessToken(rtoken, pVerifier);
				saveToken(atoken);
				Ti.API.debug('Oauth flow done, calling callback');
				callback();
			});	
		});
    };
	
	// Logs out from Yahoo! deleting the config file
    var logout = function(pService) {
		Ti.API.debug('Deleting access token [' + pService + '].');
		var file = tokenFilename();
		file.deleteFile();
	};
	
	var getUserGuid = function() {
		var token = loadToken();
		if (token && token.token && token.token.xoauth_yahoo_guid) {
			return token.token.xoauth_yahoo_guid;
		}
		return null;
	}
	
	return({
		attachLogin: attachLogin,
		logout: logout,
		getUserGuid: getUserGuid,
		isLoggedIn: isLoggedIn,
		getYql: getYql
	});
};