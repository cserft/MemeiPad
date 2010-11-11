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
Ti.include('lib/yql_queries.js');

var authorizationUI = function() {
	var authWindow, oauthWebView, signingIn;
   
	// unloads the UI used to have the user authorize the application
    var destroyUI = function() {
        Ti.API.debug('destroyUI');
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
			gCallback  = pCallback;
			authWindow = Ti.UI.createWindow({
				modal: false,
			    fullscreen: false,
				navBarHidden: true
			});
	        authWebView = Ti.UI.createWebView({
	            url: pUrl,
				top: 40,
				scalesPageToFit: false,
				autoDetect:[Ti.UI.AUTODETECT_NONE]
	        });
		
			// Force Landscape mode only		
			var transform = Ti.UI.create2DMatrix().scale(0);
	        var authView = Ti.UI.createView({
	            top: 50,
	            width: 550,
	            height: 550,
	            border: 5,
	            backgroundColor: 'white',
	            borderColor: 'gray',
	            borderRadius: 10,
	            borderWidth: 5,
	            zIndex: -1,
	            transform: transform
	        });
	        var closeLabel = Ti.UI.createLabel({
	            textAlign: 'right',
	            font: {
	                fontWeight: 'bold',
	                fontSize: '12pt'
	            },
	            text: '(X)',
	            top: 10,
	            right: 12,
	            height: 14
	        });
	        authWindow.open();
		
			Ti.API.debug('Setting:['+Ti.UI.AUTODETECT_NONE+']');
	        authWebView.addEventListener('load', lookupVerifier(pCallback));
	        authView.add(authWebView);
		
	        closeLabel.addEventListener('click', destroyUI);
	        authView.add(closeLabel);
	        authWindow.add(authView);
		
	        var animation = Ti.UI.createAnimation();
	        animation.transform = Ti.UI.create2DMatrix();
	        animation.duration = 300;
	        authView.animate(animation);
			signingIn = true;
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

		Ti.API.debug("Sending request with parameters: ");
		Ti.API.debug("url: "+ myUrl);
        client.open(message.method, myUrl, false);
        client.send();
		Ti.API.debug("Request done, code: "+ client.status);
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
		Ti.API.debug('Refrescando: timestamp[' + timedToken.timestamp + '], oauth_expires_in[' + oauth_expires_in + '], now[' + now + ']');
		if (timedToken.timestamp + oauth_expires_in <= now) {
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
			
			if ( ! token.token.oauth_token || token.token.oauth_token === 'undefined'){
				// IF Token Dict is empty then Starts the Sign Process Again
				Ti.API.debug("Token{} Empty " + JSON.stringify(token.token));
			} else {
				Ti.API.debug("Loading token from file done: " + JSON.stringify(token));
				return(token);
			}
        } catch(e) {
			Ti.API.debug("Loading token failed. Reason=" + e.message);
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
		var json, yqldata, tries = 0;
		var request = function() {
			json = serviceRequest(yql_base_url, parameters.slice(0), token);
			yqldata = JSON.parse(json);
			tries++;
		};
		while ((!yqldata || !yqldata.query || !yqldata.query.results) && (tries < MAX_RETRIES)) {
			if (tries > 0) {
				Ti.API.warn('*** BAD *** Retrying YQL query - tried already ' + tries + ' time(s)');
			}
			request();
		};
		if (tries >= MAX_RETRIES) {
			Ti.API.error('App crashed (cannot connect to YQL)');
			Titanium.UI.createAlertDialog({ 
				title: 'Error',
				message: 'There was an error connecting to Yahoo! APIs. Please try again later.'
			}).show();
		}
		return yqldata;
	};
	
	// will check if access tokens are stored in the config file
    var login = function(signin, callback) {	
		var self  = { query: query };
		var token = loadToken();
        if (! token) {
			signin(function() {
				Ti.API.debug('File not found, executing oauth flow');
				var rtoken = requestToken();
				authorize(rtoken["xoauth_request_auth_url"], function(pVerifier) {
					var atoken = accessToken(rtoken, pVerifier);
					saveToken(atoken);
					Ti.API.debug('Oauth flow done, calling callback');
					callback(self, "logged");
				});	
			});
		} else {
			Ti.API.debug('Loading token from file!');
			callback(self, "logged");
		}
    };
	
	// Logs out from Yahoo! deleting the config file
    var logout = function(pService) {
		Ti.API.debug('Deleting access token [' + pService + '].');
		var file = tokenFilename();
		file.deleteFile();
	};
	
	return({
		login: login,
		logout: logout,
		query: query2legg
	});
};