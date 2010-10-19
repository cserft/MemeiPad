var win = Ti.UI.currentWindow;

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var yql = win.yql;
var _guid = win.pGuid;
var _pubId = win.pPubId;
var myMemeInfo = win.myMemeInfo;

var timestamp = function() {
	return((new Date()).getTime());
};

var now  = timestamp();


// =============================
// = CACULATES THE HUMANE DATA =
// =============================

// With this we can create messages like "This post was created 10 minutes ago" or "Just now", etc

function humane_date(date_str){
      var time_formats = [
              [60, 'Just Now'],
              [90, '1 minute'], // 60*1.5
              [3600, 'minutes', 60], // 60*60, 60
              [5400, '1 hour'], // 60*60*1.5
              [86400, 'hours', 3600], // 60*60*24, 60*60
              [129600, '1 day'], // 60*60*24*1.5
              [604800, 'days', 86400], // 60*60*24*7, 60*60*24
              [907200, '1 week'], // 60*60*24*7*1.5
              [2628000, 'weeks', 604800], // 60*60*24*(365/12), 60*60*24*7
              [3942000, '1 month'], // 60*60*24*(365/12)*1.5
              [31536000, 'months', 2628000], // 60*60*24*365, 60*60*24*(365/12)
              [47304000, '1 year'], // 60*60*24*365*1.5
              [3153600000, 'years', 31536000], // 60*60*24*365*100, 60*60*24*365
              [4730400000, '1 century'], // 60*60*24*365*100*1.5
      ];
				var dt = timestamp(); 
				var seconds = (dt - date_str)/1000;
              	var token = ' ago';
          		var prepend = '';
              	var i = 0;
              	var format;

      if (seconds < 0) {
              seconds = Math.abs(seconds);
              token = '';
          prepend = 'in ';
      }

      while (format = time_formats[i++]) {
              if (seconds < format[0]) {
                      if (format.length == 2) {
                              return (i>1?prepend:'') + format[1] + (i > 1 ? token : ''); // Conditional so we don't return Just Now Ago
                      } else {
                              return prepend + Math.round(seconds / format[2]) + ' ' + format[1] + (i > 1 ? token : '');
                      }
              }
      }

      // overflow for centuries
      if(seconds > 4730400000)
              return Math.round(seconds / 4730400000) + ' Centuries' + token;

      return date_str;
  };



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
	zIndex:3
});
win.add(btn_close);


// var scrollView = Ti.UI.createScrollView({
// 	backgroundColor:'transparent',
// 	contentWidth:826,
// 	contentHeight:'auto',
// 	top:36,
// 	left: 10,
// 	width:826,
// 	height:516,
// 	showVerticalScrollIndicator:true,
// 	showHorizontalScrollIndicator:false
// });

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
	
	innerMedia= '<img src="' + post.content.content + '" class="block_clear">';
	innerCaption = post.caption;
	
} else if (post.type == "video"){
	
	var youtubeid = post.content.match(/v=([a-zA-Z0-9_-]{11})&?/)[1];
	
	innerMedia = '<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/' + youtubeid + '" frameborder="0"></iframe>';
	innerCaption = post.caption;
	
} else if (post.type == "text"){
	innerMedia = "";

	innerCaption = post.content;

}


var text_in_html = '<html><head><title></title><style type="text/css">#wrapper {padding: 20px;width: 700px;}.post {font-family:"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;font-size:16px;margin:8px 0;padding-left:8px;font-size: 16px;color:#516064;}.post strong, .post b {font-weight:600;} a { outline:0 none;} a, a:visited {color:#863486;cursor:pointer;text-decoration:none;} .block_clear {display: block;clear: both;} p{margin-bottom:-10px}</style></head><body><div id="wrapper"><div id="middle">' + innerMedia + '<div class="post">' + innerCaption + '<br/><br/><br/></div></div></div></body></html>';

// Create our Webview to render the Post's content
var postWebView = Ti.UI.createWebView({
        html:text_in_html,
        title:'Title goes here',
		top:0,
		width: '100%',
		height: 565,
        left:0,
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


// ====================================
// = OWNER GUID INFORMATION RETRIEVAL =
// ====================================

yqlQuery = "SELECT * FROM meme.info where owner_guid='" + _guid + "' | meme.functions.thumbs(width=40,height=40)";

Ti.API.debug(" ####### YQL Query executed: " + yqlQuery);

var yqlMemeInfo = yql.query(yqlQuery);
var meme = yqlMemeInfo.query.results.meme;

// Users Post Owner Avatar
var guidAvatar = Titanium.UI.createImageView({
	image: meme.avatar_url.thumb,
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
	text: titleStripped ,
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


//POsted X times ago message
var post_update_time = humane_date(post.timestamp);

var pos_postUpdatedTimeLabel = 70 + (titleStripped.length * 8) + 10;

var postUpdatedTimeLabel = Titanium.UI.createLabel({
	color:'#999',
	text: ' •  ' + post_update_time,
	textAlign:'left',
	font: {
		fontSize:13,
		fontFamily:'Georgia',
		fontStyle: 'italic'
	},
	bottom: 19,
	left:pos_postUpdatedTimeLabel,
	width:150,
	height:29,
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

if (_guid == myMemeInfo.guid || post.via_guid == myMemeInfo.guid || post.origin_guid == myMemeInfo.guid){
	btn_repost.enabled = false;	
} else {
	btn_repost.enabled = true;	
}

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
		btn_repost.enabled = false;
		
	} else {
		
		Ti.API.info("Error while reposting");
		
	}

	// setTimeout(repostActInd.hide(),2000);

});


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
