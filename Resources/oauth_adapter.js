/*
 * The Oauth Adapter needs 2 external libraries (oauth.js, sha1.js) hosted at
 *  http://oauth.googlecode.com/svn/code/javascript/
 * Save them locally in a lib subfolder
 * 
 * Your Oauth secrets as well as you API end points must be in the *secrets.js* file inside the lib folder
 *
 * 
 */

Ti.include('lib/sha1.js');
Ti.include('lib/oauth.js');
Ti.include('lib/secrets.js');

// create an OAuthAdapter instance
 var OAuthAdapter = function()
 {
	
	Ti.API.info('*********************************************');
	Ti.API.info('CREATING OAUTH ADAPTER INSTANCE');
	Ti.API.info('*********************************************');	

    // the pin or oauth_verifier returned by the authorization process window
    var pin = null;

    // will hold the request token and access token returned by the service
    var requestToken = null;
    var requestTokenSecret = null;
    var accessToken = null;
    var accessTokenSecret = null;

    // the accessor is used when communicating with the OAuth libraries to sign the messages
    var accessor = {
        consumerSecret: consumerSecret,
        tokenSecret: ''
    };

    // holds actions to perform in the Queue
    var actionsQueue = [];

    // will hold UI components for the Authorization process
    var window = null;
    var view = null;
    var webView = null;
    var receivePinCallback = null;

	// will check if access tokens are stored in the config file
    this.loadAccessToken = function(pService)
    {
        Ti.API.debug('Loading access token for service [' + pService + '].');

        var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, pService + '.config');
        if (file.exists == false) return;

        var contents = file.read();
        if (contents == null) return;

        try
        {
            var config = JSON.parse(contents.text);
        }
        catch(ex)
        {
            return;
        }
        if (config.accessToken) accessToken = config.accessToken;
        if (config.accessTokenSecret) accessTokenSecret = config.accessTokenSecret;

        Ti.API.debug('Loading access token: done [accessToken:' + accessToken + '][accessTokenSecret:' + accessTokenSecret + '].');
    };

	// Saves the access tokens in the config File
    this.saveAccessToken = function(pService)
    {
        Ti.API.debug('Saving access token for [' + pService + '] on config file.');
        var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, pService + '.config');
        if (file == null) file = Ti.Filesystem.createFile(Ti.Filesystem.applicationDataDirectory, pService + '.config');
        file.write(JSON.stringify(
        {
            accessToken: accessToken,
            accessTokenSecret: accessTokenSecret
        }
        ));
        Ti.API.debug('Saving access token on config file: done.');
    };

	// Logs out from Yahoo! deleting the config file
    this.logout = function(pService)
	{
		Ti.API.debug('Deleting access token [' + pService + '].');
		var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, pService + '.config'); 
		file.deleteFile();
		
		//TODO: insert call for the Login View after logging out
	
	}

    // will tell if the consumer is authorized (i.e. has the access tokens)
    this.isAuthorized = function()
    {
        return ! (accessToken == null || accessTokenSecret == null);
    };

    // creates a message to send to the service
    var createMessage = function(pUrl, pMethod)
    {
        var message = {
            action: pUrl
            ,
            method: pMethod || "POST"
            ,
            parameters: []
        };
        message.parameters.push(['oauth_consumer_key', consumerKey]);
        message.parameters.push(['oauth_signature_method', signatureMethod]);
        return message;
    };

    // requests a requet token with the given Url
    this.getRequestToken = function(pUrl)
    {
        accessor.tokenSecret = '';

        var message = createMessage(pUrl, 'POST');
		message.parameters.push(['oauth_callback', 'oob']);
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var client = Ti.Network.createHTTPClient();
        client.open('POST', pUrl, false);
        client.send(OAuth.getParameterMap(message.parameters));

        var responseParams = OAuth.getParameterMap(client.responseText);
        requestToken = responseParams['oauth_token'];
        requestTokenSecret = responseParams['oauth_token_secret'];

        Ti.API.debug('Request token got the following response: ' + client.responseText);

        return client.responseText;
    }

    // unloads the UI used to have the user authorize the application
    var destroyAuthorizeUI = function()
    {
        Ti.API.debug('destroyAuthorizeUI');
        // if the window doesn't exist, exit
        if (window == null) return;

        // remove the UI
        try
        {
	        Ti.API.debug('destroyAuthorizeUI:webView.removeEventListener');
            webView.removeEventListener('load', authorizeUICallback);
	        Ti.API.debug('destroyAuthorizeUI:window.close()');
            window.hide();
			// 	        Ti.API.debug('destroyAuthorizeUI:window.remove(view)');
			// window.remove(view);
			// 	        Ti.API.debug('destroyAuthorizeUI:view.remove(webView)');
			// 	        view.remove(webView);
			// 	        Ti.API.debug('destroyAuthorizeUI:nullifying');
			// 	        webView = null;
			//             view = null;
			//             window = null;
        }
        catch(ex)
        {
            Ti.API.debug('Cannot destroy the authorize UI. Ignoring.');
        }
    };

    // looks for the PIN everytime the webview loads
    // currently works with YAHOO!
    var authorizeUICallback = function(e)
    {
        Ti.API.debug('authorizeUILoaded, looking for oAuth Verifier Code');

		// stores the page HTML source code
        var htmlSource = e.source.html;

        // REGEXP looking for the oAuth Verifier code in the HTML page
		var result = (/<span id="shortCode">(\w+)<\/span>/g).exec(htmlSource);
	
		if (result && result[1]) {
		    pin = result[1];
			
			Ti.API.debug('Found oAuth Verifier Code: ' + pin);

            if (receivePinCallback) setTimeout(receivePinCallback, 100);

            destroyAuthorizeUI();

            return;	
		}

        htmlSource = null; 

    };

    // shows the authorization UI
    this.showAuthorizeUI = function(pUrl, pReceivePinCallback)
    {
        receivePinCallback = pReceivePinCallback;

        window = Ti.UI.createWindow({
            modal: true,
            fullscreen: false
        });

        var transform = Ti.UI.create2DMatrix().scale(0);

        view = Ti.UI.createView({
            top: 5,
            width: 500,
            height: 500,
            border: 5,
            backgroundColor: 'white',
            borderColor: 'blue',
            borderRadius: 20,
            borderWidth: 5,
            zIndex: -1,
            transform: transform
        });
        closeLabel = Ti.UI.createLabel({
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
        window.open();

        webView = Ti.UI.createWebView({
            url: pUrl,
			autoDetect:[Ti.UI.AUTODETECT_NONE]
        });
		Ti.API.debug('Setting:['+Ti.UI.AUTODETECT_NONE+']');
        webView.addEventListener('load', authorizeUICallback);
        view.add(webView);

        closeLabel.addEventListener('click', destroyAuthorizeUI);
        view.add(closeLabel);

        window.add(view);

        var animation = Ti.UI.createAnimation();
        animation.transform = Ti.UI.create2DMatrix();
        animation.duration = 500;
        view.animate(animation);
    };

	// Requests the Access Tokens
    this.getAccessToken = function(pUrl)
    {
        accessor.tokenSecret = requestTokenSecret;

        var message = createMessage(pUrl, 'POST');
        message.parameters.push(['oauth_token', requestToken]);
        message.parameters.push(['oauth_verifier', pin]);

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);
        for (var p in parameterMap)
        Ti.API.debug(p + ': ' + parameterMap[p]);

        var client = Ti.Network.createHTTPClient();
        client.open('POST', pUrl, false);
        client.send(parameterMap);

        var responseParams = OAuth.getParameterMap(client.responseText);
        accessToken = responseParams['oauth_token'];
        accessTokenSecret = responseParams['oauth_token_secret'];

        Ti.API.debug('*** get access token, Response: ' + client.responseText);

        processQueue();

        return client.responseText;

    };

	// execute the post queue
    var processQueue = function()
    {
        Ti.API.debug('Processing queue.');
        while ((q = actionsQueue.shift()) != null)
        send(q.url, q.parameters, q.query, q.title, q.successMessage, q.errorMessage);

        Ti.API.debug('Processing queue: done.');
    };

	// creates a translucent popup Window to display quick messages
	var popMessage = function(pMessage)
	{
		// window container
		var welcomeWindow = Titanium.UI.createWindow({
			height:80,
			width:200,
			touchEnabled:false
		});

		// black view
		var indView = Titanium.UI.createView({
			height:80,
			width:200,
			backgroundColor:'#000',
			borderRadius:10,
			opacity:0.8,
			touchEnabled:false
		});
		welcomeWindow.add(indView);

		// message
		var message = Titanium.UI.createLabel({
			text: pMessage,
			color:'#fff',
			textAlign:'center',
			font:{fontSize:18,fontWeight:'bold'},
			height:'auto',
			width:'auto'
		});
		welcomeWindow.add(message);
		welcomeWindow.open();

		var t = Ti.UI.create2DMatrix().translate(0,0).scale(0);
		welcomeWindow.animate({transform:t,delay:1500,duration:700,opacity:0.1},function()
		{
			welcomeWindow.close();
		});
	};


    // Send YQL query
    var send = function(pUrl, pParameters, pYql_query, pTitle, pSuccessMessage, pErrorMessage)
    {
        Ti.API.debug('Sending a message to the service at [' + pUrl + '] with the following params: ' + JSON.stringify(pParameters));

        if (accessToken == null || accessTokenSecret == null)
        {

            Ti.API.debug('The send status cannot be processed as the client doesn\'t have an access token. The status update will be sent as soon as the client has an access token.');
			
			// if it doesn't have the access tokens, the queries are stored in a queue to later execution
            actionsQueue.push({
                url: pUrl,
                parameters: pParameters,
				query: pYql_query,
                title: pTitle,
                successMessage: pSuccessMessage,
                errorMessage: pErrorMessage
            });
            return;
        }

        accessor.tokenSecret = accessTokenSecret;

        var message = createMessage(pUrl, 'POST');
        message.parameters.push(['oauth_token', accessToken]);
        message.parameters.push(['q', pYql_query]);
        for (p in pParameters) message.parameters.push(pParameters[p]);
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);
        for (var p in parameterMap)

        Ti.API.debug(p + ': ' + parameterMap[p]);

        var client = Ti.Network.createHTTPClient();
        client.open('POST', pUrl, false);
        client.send(parameterMap);

        if (client.status == 200) {

			popMessage(pSuccessMessage);

        } else {
            // Ti.UI.createAlertDialog({
            //     title: pTitle,
            //     message: pErrorMessage
            // }).show();

			popMessage(pErrorMessage);
        }

        Ti.API.debug('*** sendStatus, Response: [' + client.status + '] ' + client.responseText);

        return client.responseText;

    };
    this.send = send;

};
