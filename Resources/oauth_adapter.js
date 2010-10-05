/*
 * The Adapter needs 2 external libraries (oauth.js, sha1.js) hosted at
 *  http://oauth.googlecode.com/svn/code/javascript/
 *
 * Save them locally in a lib subfolder
 */
Ti.include('lib/sha1.js');
Ti.include('lib/oauth.js');

// create an OAuthAdapter instance
var OAuthAdapter = function(pConsumerSecret, pConsumerKey, pSignatureMethod)
 {
	
	Ti.API.info('*********************************************');
	Ti.API.info('If you like the OAuth Adapter, consider donating at');
	Ti.API.info('https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=T5HUU4J5EQTJU&lc=IT&item_name=OAuth%20Adapter&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted');
	Ti.API.info('*********************************************');	

    // will hold the consumer secret and consumer key as provided by the caller
    var consumerSecret = pConsumerSecret;
    var consumerKey = pConsumerKey;

    // will set the signature method as set by the caller
    var signatureMethod = pSignatureMethod;

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

    // holds actions to perform
    var actionsQueue = [];

    // will hold UI components
    var window = null;
    var view = null;
    var webView = null;
    var receivePinCallback = null;

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
    this.saveAccessToken = function(pService)
    {
        Ti.API.debug('Saving access token [' + pService + '].');
        var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, pService + '.config');
        if (file == null) file = Ti.Filesystem.createFile(Ti.Filesystem.applicationDataDirectory, pService + '.config');
        file.write(JSON.stringify(
        {
            accessToken: accessToken,
            accessTokenSecret: accessTokenSecret
        }
        ));
        Ti.API.debug('Saving access token: done.');
    };

    // will tell if the consumer is authorized
    this.isAuthorized = function()
    {
        return ! (accessToken == null || accessTokenSecret == null);
    };

    // creates a message to send to the service
    var createMessage = function(pUrl)
    {
        var message = {
            action: pUrl
            ,
            method: 'POST'
            ,
            parameters: []
        };
        message.parameters.push(['oauth_consumer_key', consumerKey]);
        message.parameters.push(['oauth_signature_method', signatureMethod]);
        return message;
    };

    // returns the pin
    this.getPin = function() {
        return pin;
    };

    // requests a requet token with the given Url
    this.getRequestToken = function(pUrl)
    {
        accessor.tokenSecret = '';

        var message = createMessage(pUrl);
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
        Ti.API.debug('authorizeUILoaded');

        var htmlSource = e.source.html;
		var result = (/<span id="shortCode">(\w+)<\/span>/g).exec(htmlSource);
	
		if (result && result[1]) {
		    pin = result[1];
			
			Ti.API.debug('ShortCode: ' + pin);

            if (receivePinCallback) setTimeout(receivePinCallback, 100);

            destroyAuthorizeUI();

            break;	
		}

        htmlSource = null; 

    };

    // shows the authorization UI
    this.showAuthorizeUI = function(pUrl, pReceivePinCallback)
    {
        receivePinCallback = pReceivePinCallback;

        window = Ti.UI.createWindow({
            modal: true,
            fullscreen: true
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

    this.getAccessToken = function(pUrl)
    {
        accessor.tokenSecret = requestTokenSecret;

        var message = createMessage(pUrl);
        message.parameters.push(['oauth_token', requestToken]);

		Ti.API.info('pin code: ' + pin);
		
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

    var processQueue = function()
    {
        Ti.API.debug('Processing queue.');
        while ((q = actionsQueue.shift()) != null)
        send(q.url, q.parameters, q.title, q.successMessage, q.errorMessage);

        Ti.API.debug('Processing queue: done.');
    };

    // TODO: remove this on a separate Twitter library
    var send = function(pUrl, pParameters, pTitle, pSuccessMessage, pErrorMessage)
    {
        Ti.API.debug('Sending a message to the service at [' + pUrl + '] with the following params: ' + JSON.stringify(pParameters));

        if (accessToken == null || accessTokenSecret == null)
        {

            Ti.API.debug('The send status cannot be processed as the client doesn\'t have an access token. The status update will be sent as soon as the client has an access token.');

            actionsQueue.push({
                url: pUrl,
                parameters: pParameters,
                title: pTitle,
                successMessage: pSuccessMessage,
                errorMessage: pErrorMessage
            });
            return;
        }

        accessor.tokenSecret = accessTokenSecret;

        var message = createMessage(pUrl);
        message.parameters.push(['oauth_token', accessToken]);
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
            Ti.UI.createAlertDialog({
                title: pTitle,
                message: pSuccessMessage
            }).show();
        } else {
            Ti.UI.createAlertDialog({
                title: pTitle,
                message: pErrorMessage
            }).show();
        }

        Ti.API.debug('*** sendStatus, Response: [' + client.status + '] ' + client.responseText);

        return client.responseText;

    };
    this.send = send;

};
