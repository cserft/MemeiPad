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

var border = Ti.UI.createView({
	backgroundColor:'#EBEBEB',
	height:1,
	bottom:60,
	width: '100%',
})
whiteBox.add(border);

//link in the bottom
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
	bottom:50,
	left:73,
	width:500,
	height:15
});

win.add(LinkPermalinkLabel);

var btn_openSafari = Titanium.UI.createButton({
	backgroundImage:'images/btn_fwd.png',
	width:22,
	height:17,
	bottom: 50,
	left: 450
});
win.add(btn_openSafari);


var closeX = Titanium.UI.createImageView({
	image: 'images/btn_close.png',
	top:32,
	left:931,
	width:36,
	height:36,
	zIndex:2
});
win.add(closeX);

var scrollView = Ti.UI.createScrollView({
	backgroundColor:'yellow',
	contentWidth:826,
	contentHeight:1000,
	top:36,
	left: 30,
	width:826,
	height:516,
	showVerticalScrollIndicator:true,
	showHorizontalScrollIndicator:false
});

whiteBox.add(scrollView);

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

//Guid Name / Title
var guidNameLabel = Titanium.UI.createLabel({
	color:'#853885',
	text: post.title ,
	textAlign:'left',
	font: {
		fontSize:18,
		fontFamily:'Helvetica',
		fontWeight: 'bold'
	},
	bottom: 30,
	left:60,
	width:400,
	height:29,
	zIndex: 99
});

whiteBox.add(guidNameLabel);

