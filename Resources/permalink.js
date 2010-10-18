var win = Ti.UI.currentWindow;

var timestamp = function() {
	return((new Date()).getTime());
};

var now  = timestamp();

// =======================
// = DASHBOARD TABLEVIEW =
// =======================

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var yql = win.yql;
var _guid = win.pGuid;
var _pubId = win.pPubId;

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
	zIndex: 0
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
	zIndex:2
});
win.add(btn_close);


var scrollView = Ti.UI.createScrollView({
	backgroundColor:'transparent',
	contentWidth:826,
	contentHeight:'auto',
	top:36,
	left: 10,
	width:826,
	height:516,
	showVerticalScrollIndicator:true,
	showHorizontalScrollIndicator:false
});

//whiteBox.add(scrollView);

// =========================
// = WEBVIEW WITH THE POST =
// =========================

// =============================================
// = DEFINITION OF LAYOUT TYPE IN THE WEB VIEW =
// =============================================

var	innerMedia;
var innerCaption;

if (post.type == "photo"){
	
	Ti.API.info("Photo URL: " + post.content.content)
	
	innerMedia= '<img src="' + post.content.content + '" class="block_clear">';
	innerCaption = post.caption;
	
} else if (post.type == "video"){
	
	var youtubeid = post.content.match(/v=([a-zA-Z0-9_-]{11})&?/)[1];
	
	innerMedia = '<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/' + youtubeid + '" frameborder="0"></iframe>';
	innerCaption = post.caption;
	
} else if (post.type == "text"){

	innerCaption = post.content.content;

}


var text_in_html = '<html><head><title></title><style type="text/css">#wrapper {padding: 0px;width: 804px;}.post {font-family:"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;font-size:16px;margin:8px 0;padding-left:8px;font-size: 16px;color:#516064;}.post strong, .post b {font-weight:600;} a { outline:0 none;} a, a:visited {color:#863486;cursor:pointer;text-decoration:none;} .block_clear {display: block;clear: both;} p{margin-bottom:-10px}</style></head><body><div id="wrapper"><div id="middle">' + innerMedia + '<div class="post">' + innerCaption + '</div></div></div></body></html>';


    // Create our Webview
var postWebView = Ti.UI.createWebView({
        html:text_in_html,
        title:'Title goes here',
		top:36,
		width: 846,
		height: 516,
        left:15,
        loading: true   
});
whiteBox.add(postWebView);

var border = Ti.UI.createView({
	backgroundColor:'#EBEBEB',
	height:1,
	bottom:60,
	width: '100%',
})
whiteBox.add(border);

//link in the bottom

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

// ====================================
// = OWNER GUID INFORMATION RETRIEVAL =
// ====================================

yqlQuery = "SELECT * FROM meme.info where owner_guid='" + _guid + "' | meme.functions.thumbs(width=40,height=40)";

Ti.API.debug(" ####### YQL Query executed: " + yqlQuery);

var yqlMemeInfo = yql.query(yqlQuery);
var meme = yqlMemeInfo.query.results.meme;

var guidAvatar = Titanium.UI.createImageView({
	image: meme.avatar_url.thumb,
	bottom:10,
	left:10,
	width:40,
	height:40,
	zIndex:3
});
whiteBox.add(guidAvatar);

var titleStripado = meme.title.replace(/(<([^>]+)>)/ig,"").replace(/&.+;/,"");

//Guid Name / Title
var guidNameLabel = Titanium.UI.createLabel({
	color:'#853885',
	text: titleStripado ,
	textAlign:'left',
	font: {
		fontSize:18,
		fontFamily:'Helvetica',
		fontWeight: 'bold'
	},
	bottom: 19,
	left:60,
	width:400,
	height:29,
	zIndex: 2
});

whiteBox.add(guidNameLabel);

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

// =============
// = LISTENERS =
// =============

btn_close.addEventListener("click", function(e)
{
	win.close();
});

btn_repost.addEventListener("click", function(e)
{
	// repostActInd.show();
	yqlQuery = "INSERT INTO meme.user.posts (guid, pubid) VALUES ('" + _guid + "', '" + _pubId + "')";
		Ti.API.debug(" ####### YQL Query executed: " + yqlQuery);

	var yqlInsert = yql.query(yqlQuery);
	var response = yqlInsert.query.results.status;
	
	if (response.message == "ok"){
		
		repostCountLabel.text = repost_countInt+=1 ;
		
	} else {
		
		Ti.API.info("Error while reposting");
		
	}

	// setTimeout(repostActInd.hide(),2000);

});

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
