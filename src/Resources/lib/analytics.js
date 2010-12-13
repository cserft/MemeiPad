// =====================================
// = INTEGRATION WITH Y! WEB ANALYTICS =
// =====================================
var analytics = {
	APP_STARTED: 2,				//OK
	NEW_POST_OPEN: 3,			//OK
	NEW_POST_PUBLISHED: 4,		//OK
	REPOST: 5,					//OK
	ADD_REPOST_COMMENT: 6,		//OK
	OPEN_SAFARI_CREATE_ACCOUNT: 7,	//OK
	OPEN_SAFARI: 8,				//OK
	PERMALINK_VIEW: 9, 			//OK
	FLASHLIGHT_SEARCH: 10,		//OK
	PHOTO_POST: 11,				//OK
	TEXT_POST: 12,				//OK
	VIDEO_POST: 13,				//OK
	SHARE_TWITTER_IPAD: 14,		//OK
	SHARE_MAIL: 15,				//OK
	COPY_LINK: 16,				//OK
	DELETE_POST: 17,			//OK
	REPORT_ABUSE: 18,			//OK
	SIGN_IN: 19					//OK
};


var doYwaRequest = function(pAction) {
	
	var request_url = 'http://a.analytics.yahoo.com/p.pl?a=1000671789962&x=' + pAction;

	var xhr = Titanium.Network.createHTTPClient();

    xhr.onerror = function(e) {
        Ti.API.error("ERROR YWA: " + e.error);
    };

    xhr.onload = function(e) {
		Ti.API.debug('Request YWA done for Action: ' + pAction);
    };

	//eContent = encodeURIComponent(pContent);
    xhr.open('GET', request_url);
	xhr.setRequestHeader('User-Agent', Ti.App.getName() + ':' + Ti.App.getVersion() + " | Titanium v:" + Ti.version + " | hash:" + Ti.buildHash + "(" + Titanium.buildDate + ")");
	xhr.send();
};
