Ti.include('lib/commons.js');

var win = Ti.UI.currentWindow;

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var yql = win.yql;
var _guid = win.pGuid;
var _pubId = win.pPubId;
var myMemeInfo = win.myMemeInfo;
var openingDetails = win.openingDetails;

// =======================
// = DASHBOARD TABLEVIEW =
// =======================


// Example Queries to retrieve Post Details
// "SELECT * FROM meme.posts WHERE owner_guid='MOLV2IG2KYLCBZDPMFVUQ7HKYU' and pubid='NtnNg2A'"
// "SELECT * FROM meme.post.info WHERE owner_guid='MOLV2IG2KYLCBZDPMFVUQ7HKYU' and pubid='NtnNg2A'"

// =============
// = YQL QUERY =
// =============

yqlQuery = "SELECT * FROM meme.posts WHERE owner_guid='" + _guid + "' and pubid='" + _pubId + "'";

Ti.API.debug(" ####### YQL Query executed: " + yqlQuery);

var yqldata = yql.query(yqlQuery);
var post = yqldata.query.results.post;

// ============================
// = BULDING PERMALINK LAYOUT =
// ============================

var blackBG = Ti.UI.createView({
	backgroundColor:'black',
	width: '100%',
	height: '100%',
	opacity:0.85,
	zIndex: 0,
	touchEnabled: false
});
win.add(blackBG);

var whiteBox = Ti.UI.createView({
	backgroundColor:'white',
	width: 878,
	height: 626,
	top:52,
	left:73,
	zIndex: 2
});
win.add(whiteBox);

var btn_close = Titanium.UI.createButton({
	backgroundImage: 'images/btn_close.png',
	top:32,
	left:931,
	width:36,
	height:36,
	zIndex:3
});
win.add(btn_close);

btn_close.addEventListener("click", function(e)
{
	var t3 = Titanium.UI.create2DMatrix();
	t3 = t3.scale(0);
	win.close({transform:t3,duration:200});
	Ti.App.fireEvent('openingDetailsFalse');
    // allows for other Permalinks to Open
	
});


// ========================
// = geo places retrieval =
// ========================
// var getGeoPlaces = function(pContent){
// 	
// 	yqlQuery = 'SELECT * FROM geo.placemaker WHERE documentContent = "' + pContent + '" AND documentType="text/plain"';
// 
// 	Ti.API.debug("####### YQL Query executed: " + yqlQuery);
// 
// 	var yqlGeoPlaces = yql.query(yqlQuery);
// 	var places = yqlGeoPlaces.query.results;
// 	
// 	Ti.API.debug("####### PLACES: " + JSON.stringify(places));
// 	
// }

// =========================
// = WEBVIEW WITH THE POST =
// =========================

// =============================================
// = DEFINITION OF LAYOUT TYPE IN THE WEB VIEW =
// =============================================

var	innerMedia;
var innerCaption;

// Create our Webview to render the Post's content
var postWebView = Ti.UI.createWebView({
        html: '',
		backgroundImage: 'images/bg.jpg',
		top:0,
		width: '100%',
		height: 565,
        left:0,
        loading: true
});
whiteBox.add(postWebView);

//Border from the WebView to the User Information bottom bar
var border = Ti.UI.createView({
	backgroundColor:'#EBEBEB',
	height:1,
	bottom:60,
	width: '100%'	
});
whiteBox.add(border);

var getPostHtml = function(innerMedia, innerCaption) {
	return '<html><head><title></title><style type="text/css">#wrapper {padding: 20px;width: 700px;}.post {font-family:"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;font-size:16px;margin:8px 0;padding-left:8px;font-size: 16px;color:#516064;}.post strong, .post b {font-weight:600;} a { outline:0 none;} a, a:visited {color:#863486;cursor:pointer;text-decoration:none;} .block_clear {display: block;clear: both;} p{margin-bottom:-10px} .post blockquote {background:url("images/quote_innerhtml.png") no-repeat scroll 7px 3px transparent; border-left:2px solid #CCCCCC; font-size:16px; margin:8px 0; padding-left:30px;}</style></head><body><div id="wrapper"><div id="middle">' + innerMedia + '<div class="post">' + innerCaption + '<br/><br/><br/></div></div></div></body></html>';
};

if (post.type == "photo"){
	
	innerMedia= '<img src="' + post.content.content + '" class="block_clear">';
	innerCaption = post.caption;
	captionStripped = post.caption.replace(/(<([^>]+)>)/ig,"").replace(/&.+;/,"");
	// getGeoPlaces(captionStripped);

	
	
} else if (post.type == "video"){
	
	if (post.content.indexOf("vimeo") != -1){
		getVideoData(post.content, function(thumb, data) {
			innerMedia = data.html;
			innerCaption = post.caption;
			postWebView.html = getPostHtml(innerMedia, innerCaption);
		});
	} else {
		var youtubeid = post.content.match(/v=([a-zA-Z0-9_-]{11})&?/)[1];
		innerMedia = '<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/' + youtubeid + '" frameborder="0"></iframe>';
		innerCaption = post.caption;
	}
	
} else if (post.type == "text"){
	innerMedia = "";

	innerCaption = post.content;
}

if (innerMedia || innerCaption) {
	postWebView.html = getPostHtml(innerMedia, innerCaption);
}


// ====================================
// = OWNER GUID INFORMATION RETRIEVAL =
// ====================================

yqlQuery = "SELECT * FROM meme.info where owner_guid='" + _guid + "' | meme.functions.thumbs(width=40,height=40)";

Ti.API.debug("####### YQL Query executed: " + yqlQuery);

var yqlMemeInfo = yql.query(yqlQuery);
var meme = yqlMemeInfo.query.results.meme;

// Users Post Owner Avatar
var guidAvatar = Titanium.UI.createImageView({
	image: meme.avatar_url.thumb,
	defaultImage: 'images/default_img_avatar.png',
	bottom:10,
	left:10,
	width:40,
	height:40,
	zIndex:3
});
whiteBox.add(guidAvatar);

var titleStripped = meme.title.replace(/(<([^>]+)>)/ig,"").replace(/&.+;/,"");

//Guid Name / Title
var guidNameLabel = Titanium.UI.createLabel({
	color:'#853885',
	text: titleStripped,
	textAlign:'left',
	font: {
		fontSize: 18,
		fontFamily:'Helvetica',
		fontWeight: 'bold'
	},
	bottom: 22,
	left: 60,
	width: 400,
	height: 29,
	zIndex: 2
});

whiteBox.add(guidNameLabel);


//POsted X times ago message
var post_update_time = humane_date(post.timestamp);

var postUpdatedTimeLabel = Titanium.UI.createLabel({
	color: '#999',
	text: ' posted ' + post_update_time,
	textAlign: 'left',
	font: {
		fontSize: 13,
		fontFamily: 'Georgia',
		fontStyle: 'italic'
	},
	bottom: 6,
	left: 60,
	width: 150,
	height: 29,
	zIndex: 2
});

whiteBox.add(postUpdatedTimeLabel);

// ===========================
// = REPOST BUTTON AND COUNT =
// ===========================

var repost_countInt = parseInt(post.repost_count);

var repostCountLabel = Titanium.UI.createLabel({
	color:'#666',
	text: repost_countInt,
	textAlign:'right',
	font: {
		fontSize:20,
		fontFamily:'Helvetica',
		fontWeight: 'bold'
	},
	bottom: 12,
	right:50,
	width:100,
	height:29,
	zIndex: 2
});

whiteBox.add(repostCountLabel);

var btn_repost = Titanium.UI.createButton({
	backgroundImage:'images/btn_repost.png',
	width:36,
	height:36,
	bottom: 10,
	right: 10
});
whiteBox.add(btn_repost);

var repostActInd = Titanium.UI.createActivityIndicator({
	width:36,
	height:36,
	bottom: 10,
	right: 10,
	style: Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
	backgroundColor: 'white',
	zIndex: 2
});
whiteBox.add(repostActInd);


// Checks if the user logged in is the Author or the Origin or a Vi and disables the Repost Button
if (myMemeInfo){
	if (_guid == myMemeInfo.guid || post.via_guid == myMemeInfo.guid || post.origin_guid == myMemeInfo.guid){
		btn_repost.enabled = false;	
	} else {
		btn_repost.enabled = true;	
	}
}

// =============
// = LISTENERS =
// =============


btn_repost.addEventListener("click", function(e)
{
	// repostActInd.show();
	yqlQuery = "INSERT INTO meme.user.posts (guid, pubid) VALUES ('" + _guid + "', '" + _pubId + "')";
		Ti.API.debug(" ####### YQL Query executed: " + yqlQuery);

	var yqlInsert = yql.query(yqlQuery);
	var response = yqlInsert.query.results.status;
	
	if (response.message == "ok"){
		
		repostCountLabel.text = repost_countInt+=1 ;
		btn_repost.enabled = false;
		
	} else {
		
		Ti.API.info("Error while reposting");
		
	}

	// setTimeout(repostActInd.hide(),2000);

});

		
// Hides the loading indicator indicator
Ti.App.fireEvent('hide_indicator');

//link to Permalink Page on the Web in the bottom

pos_BtnOpenSafari = 80 + (post.url.length * 8) + 30;

var LinkPermalinkLabel = Titanium.UI.createLabel({
	color:'#FFF',
	text: post.url ,
	textAlign:'left',
	font: {
		fontSize:14,
		fontFamily:'Georgia',
		fontStyle: 'italic',
		fontWeight: 'bold'
	},
	bottom:35,
	left:73,
	width:500,
	height:15
});

win.add(LinkPermalinkLabel);

var btn_openSafari = Titanium.UI.createButton({
	backgroundImage:'images/btn_fwd.png',
	width:22,
	height:17,
	bottom: 35,
	left: pos_BtnOpenSafari
});
win.add(btn_openSafari);

//Alert to Open Safari for the Post Permalink
var alertOpenPermalink= Titanium.UI.createAlertDialog({

});

btn_openSafari.addEventListener("click", function(e)
{
	Ti.API.info('Permalink Open on Safari Fired');
	alertOpenPermalink.title = 'Open link';
	alertOpenPermalink.message = 'Are you sure you want to leave this application to open this link?';
	alertOpenPermalink.buttonNames = ['Yes','Cancel'];
	alertOpenPermalink.cancel = 1;
	alertOpenPermalink.show();
});


// Opens the Permalink page on Safari
alertOpenPermalink.addEventListener('click',function(e)
{
	if (e.index == 0){
		// Open Link to the Guidelines Page on Safari
		Ti.Platform.openURL(post.url);	
	}
});
