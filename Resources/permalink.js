Ti.include('lib/commons.js');
Ti.include('lib/meme.js');

var win = Ti.UI.currentWindow;

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var yql = Ti.App.oAuthAdapter.getYql();
var _guid = win.pGuid;
var _pubId = win.pPubId;

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

if (!yqldata.query.results) {
	Ti.App.fireEvent('yqlerror');
} else {
	var post = yqldata.query.results.post;
}

// ============================
// = BULDING PERMALINK LAYOUT =
// ============================

var blackBG = Ti.UI.createView({
	backgroundColor:'black',
	width:  		'100%',
	height: 		'100%',
	opacity: 		0.85,
	zIndex: 		0,
	touchEnabled: 	false
});
win.add(blackBG);

var whiteBox = Ti.UI.createView({
	backgroundColor:'white',
	width: 		900,
	height: 	632,
	top: 		46,
	left: 		61,
	zIndex: 	2
});
win.add(whiteBox);

var btn_close = Titanium.UI.createButton({
	backgroundImage: 	'images/btn_close.png',
	top: 				32,
	left: 				942,
	width: 				36,
	height: 			36,
	zIndex: 			3
});
win.add(btn_close);

btn_close.addEventListener("click", function(e)
{
	var t3 = Titanium.UI.create2DMatrix();
	t3 = t3.scale(0);
	win.close({transform:t3,duration:200});
	Ti.App.fireEvent('permalinkIsOpenedFalse');
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

// =============================================
// = DEFINITION OF LAYOUT TYPE IN THE WEB VIEW =
// =============================================

var	innerMedia;
var innerCaption;

// Create our Webview to render the Post's content
var postWebView = Ti.UI.createWebView({
        html: '',
		// backgroundImage: 'images/bg.jpg',
		top:0,
		width: '100%',
		height: 567,
        left:0,
        loading: true
});
whiteBox.add(postWebView);

// Loader
var actAjax = Ti.UI.createActivityIndicator({
	top: 			0,
	message: 		'',
	zIndex: 		90,
	visible: 		false,
	style: 			Ti.UI.iPhone.ActivityIndicatorStyle.DARK
});
whiteBox.add(actAjax);

//Border from the WebView to the User Information bottom bar
var border = Ti.UI.createView({
	backgroundColor:'#EBEBEB',
	height:1,
	bottom:65,
	width: '100%',
	zIndex: 2
});
whiteBox.add(border);

var getPostHtml = function(innerMedia, innerCaption) {
	innerCaption = innerCaption.replace(/href="(.+?)"/g, 'href="javascript:link(\'$1\');"');
	return '<html><head><script language="javascript">var link = function(url) { Ti.App.fireEvent("openLinkOnSafari", { url: url }); }</script><style type="text/css">#wrapper {padding: 20px;width: 700px;}.post {font-family:"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;font-size:16px;margin:8px 0;padding-left:8px;font-size: 16px;color:#516064;}.post strong, .post b {font-weight:600;} a { outline:0 none;} a, a:visited {color:#863486;cursor:pointer;text-decoration:none;} .block_clear {display: block;clear: both;} p{margin-bottom:-10px} .post blockquote {background:url("images/quote_innerhtml.png") no-repeat scroll 7px 3px transparent; border-left:2px solid #CCCCCC; font-size:16px; margin:8px 0; padding-left:30px;}</style></head><body><div id="wrapper"><div id="middle">' + innerMedia + '<div class="post">' + innerCaption + '<br/><br/></div></div></div></body></html>';
};

if (post.type == "photo") {
	
	innerMedia= '<img src="' + post.content.content + '" class="block_clear">';
	innerCaption = add_html_entities(post.caption);
	
} else if (post.type == "video") {
	
	if (post.content.indexOf("vimeo") != -1) {
		getVideoData(post.content, function(thumb, data) {
			innerMedia = data.html;
			postWebView.html = getPostHtml(innerMedia, innerCaption);
		});
	} else {
		var youtubeid = post.content.match(/v=([a-zA-Z0-9_-]{11})&?/)[1];
		innerMedia = '<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/' + youtubeid + '" frameborder="0"></iframe>';
	}
	innerCaption = add_html_entities(post.caption);
	
} else if (post.type == "text"){
	
	innerMedia = "";
	innerCaption = add_html_entities(post.content);
	
}

if (innerMedia || innerCaption) {
	postWebView.html = getPostHtml(innerMedia, innerCaption);
	actAjax.show({opacity:1,duration:100});
}

postWebView.addEventListener('load', function(){
	actAjax.hide({opacity:0,duration:200});
});

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
	bottom:14,
	left:10,
	width:40,
	height:40,
	zIndex:3
});
whiteBox.add(guidAvatar);

guidAvatar.addEventListener('click', function(e) {
	// popover must be shown only when logged in
	// and for user different than me
	if (Ti.App.myMemeInfo && (Ti.App.myMemeInfo.guid != meme.guid)) {
		var popover = Ti.UI.iPad.createPopover({
			width:100,
			height:30,
			backgroundColor: 'white',
			navBarHidden: true,
			arrowDirection:Ti.UI.iPad.POPOVER_ARROW_DIRECTION_DOWN
		});

		var label = Titanium.UI.createButton({
			style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
			backgroundColor: 'transparent',
			selectedColor: 'gray',
			color: 'black',
			font: {
				fontSize: 14,
				fontFamily:'Helvetica',
				fontWeight: 'bold'
			}
		});

		var updateFollowing = null;
		if (Meme.isFollowing(meme.guid)) {
			label.title = 'unfollow';
			updateFollowing = Meme.unfollow
		} else {
			label.title = 'follow';
			updateFollowing = Meme.follow;
		}

		label.addEventListener('click', function(e) {
			label.hide();
			
			var activity = Titanium.UI.createActivityIndicator({
				style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
				height: 20,
				width: 20,
				left: 40
			});
			popover.add(activity);
			activity.show();
			
			updateFollowing(meme.guid);
			
			activity.hide();
			var okImg = Titanium.UI.createImageView({
				image: 'images/icon_reposted_small.png',
				width: 'auto',
				height: 'auto',
				left: 40
			});
			popover.add(okImg);
		
			setTimeout(function(){
				popover.hide()
			}, 500);
		});

		popover.add(label);

		popover.show({
			view:guidAvatar,
			animated:true,
		});
	}
});

//Guid Name / Title
var guidNameLabel = Titanium.UI.createLabel({
	color:'#A9379C',
	text: strip_html_entities(meme.title),
	textAlign:'left',
	font: {
		fontSize: 18,
		fontFamily:'Helvetica',
		fontWeight: 'bold'
	},
	bottom: 28,
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
	text: L('posted') + post_update_time,
	textAlign: 'left',
	font: {
		fontSize: 13,
		fontFamily: 'Georgia',
		fontStyle: 'italic'
	},
	bottom: 11,
	left: 59,
	width: 150,
	height: 29,
	zIndex: 2
});

whiteBox.add(postUpdatedTimeLabel);

// ===========================
// = REPOST BUTTON AND COUNT =
// ===========================

var btn_repost = Titanium.UI.createView({
	backgroundImage:'images/btn_repost2.png',
	width:150,
	height:65,
	bottom: 1,
	right: 0,
	opacity: 1,
	zIndex: 1
});
whiteBox.add(btn_repost);

// Already Reposted Icon
var icon_reposted = Titanium.UI.createImageView({
	image: 		'images/icon_reposted.png',
	top: 		16,
	left: 		30,
	width: 		30,
	height: 	30,
	opacity: 	1,
	zIndex: 	10
});

// IF HAS ZERO REPOSTS DOES NOT SHOW ZERO
if (parseInt(post.repost_count) == 0) {
	var repost_countInt = "";
} else {
	var repost_countInt = parseInt(post.repost_count);
}

var repostCountLabel = Titanium.UI.createLabel({
	color:'#666',
	text: repost_countInt,
	textAlign:'left',
	font: {
		fontSize:21,
		fontFamily:'Helvetica',
		fontWeight: 'regular'
	},
	bottom: 21,
	left:815,
	width:100,
	height:29,
	zIndex: 3
});

whiteBox.add(repostCountLabel);

// REPORT ABUSE Button
var btn_report_abuse = Titanium.UI.createButton({
	backgroundImage:'images/btn_report_abuse.png',
	width:17,
	height:17,
	bottom: 25,
	right: 170,
	zIndex: 1
});

// Delete Button
var btn_delete = Titanium.UI.createButton({
	backgroundImage:'images/btn_trash.png',
	width:15,
	height:19,
	bottom: 25,
	right: 170,
	zIndex: 1
});

// Checks if the user logged in is the Author or the Origin or a Vi and disables the Repost Button
if (! Ti.App.oAuthAdapter.isLoggedIn()) {
	// When not loggedIn, disables the Repost Button and adds the Report Abuse button
	btn_repost.opacity = 0.7;	
	btn_repost.touchEnabled = false;
	whiteBox.add(btn_report_abuse);
	
} else {
	
	if (_guid == Ti.App.myMemeInfo.guid || post.via_guid == Ti.App.myMemeInfo.guid || post.origin_guid == Ti.App.myMemeInfo.guid) {
		
		// If the loggedIn User is the Origin or Via, disables the Repost Button and applies the iCon reposted	
		btn_repost.touchEnabled = false;	
		btn_repost.add(icon_reposted);
		whiteBox.add(btn_delete);
		
	} else {
		
		// When Logged In and not the owner of the Post, enables Repost and Report Abuse Btn
		btn_repost.opacity = 1;	
		btn_repost.touchEnabled = true;
		whiteBox.add(btn_report_abuse);
	}
}


// REPOST ADD COMMENT VIEWS
var repost_comment_view = Titanium.UI.createView({
	backgroundImage: 	'images/bg_btn_repost_comment.png',
	bottom: 			1,
	left: 				0, 
	width: 				753,
	height: 			65,
	zIndex: 			4,
	opacity: 			0
});

var repostCommentField = Titanium.UI.createTextField({
	value: 			'',
	hintText: 		L('repostCommentField_hint_text'),
	color: 			'#666',
	textAlign: 		'left',
	font: 			{fontSize:14,fontFamily:'Georgia', fontStyle:'italic'},
	width: 			500,
	height: 		38,
	top: 			15,
	left: 			52,
	borderStyle: 	Titanium.UI.INPUT_BORDERSTYLE_NONE,
	keyboardType: 	Titanium.UI.KEYBOARD_DEFAULT,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});
repost_comment_view.add(repostCommentField);

// SEND COMMENT BUTTON
var btn_send_comment = Titanium.UI.createButton({
	backgroundImage: 	L('path_btn_send_commentbackground_image'),
	width: 				125,
	height: 			34,
	top: 				16,
	left: 				564,
	zIndex: 			1
});
repost_comment_view.add(btn_send_comment);

// CLOSE COMMENT BUTTON
var btn_close_comment = Titanium.UI.createButton({
	backgroundImage: 	'images/btn_close_comment.png',
	width: 				25,
	height: 			25,
	top: 				20,
	left: 				708,
	zIndex: 			1
});
repost_comment_view.add(btn_close_comment);

// =============
// = LISTENERS =
// =============
// BTN to close the Comment form
btn_close_comment.addEventListener('click', function(e) {
	repost_comment_view.animate({opacity:0, duration: 200});
	whiteBox.remove(repost_comment_view);
});


// MOVE WINDOW ON COMMENT FOCUS SO KEYBOARD WON'T BE OVER THE COMMENT FIELD
repostCommentField.addEventListener('focus', function(e) {
	whiteBox.animate({top: -250, duration: 200});
	btn_close.animate({top:-264, duration: 200});
});

// MOVE WINDOW BACK ON COMMENT BLUR
repostCommentField.addEventListener('blur', function(e) {
	whiteBox.animate({top: 46, duration: 200});
	btn_close.animate({top: 32, duration: 200});
});

// REPOST ANIMATION TO ADD COMMENT
btn_repost.addEventListener('click', function(e) {
	
	yqlQuery = "INSERT INTO meme.user.posts (guid, pubid) VALUES ('" + _guid + "', '" + _pubId + "')";

	var yqlInsert = yql.query(yqlQuery);
	var response = yqlInsert.query.results.status;
	
	if (response.message == "ok"){
			btn_repost.add(icon_reposted);
			icon_reposted.opacity = 1;
			btn_repost.opacity = 1;	
			btn_repost.touchEnabled = true;
			repostCountLabel.text = repost_countInt+=1 ;
			
			// Add Comment Box after Reposting
			whiteBox.add(repost_comment_view);
			repost_comment_view.animate({opacity:1, duration: 200});
			
	} else {
		Ti.API.info("Error while reposting");	
	}
		
});

// REPOST AND COMMENT
btn_send_comment.addEventListener("click", function(e) {
	
	if (repostCommentField.value != '') {
		yqlQuery = "INSERT INTO meme.user.comments (guid, pubid, comment) VALUES ('" + _guid + "', '" + _pubId + "', '" + repostCommentField.value + "')";

		var yqlInsert = yql.query(yqlQuery);
		var response = yqlInsert.query.results.status;

		if (response.message == "ok"){
				repost_comment_view.animate({opacity:0, duration: 200});
				whiteBox.remove(repost_comment_view);

		} else {
			Ti.API.info("Error while saving Comment on reposting");	
		}
			
	} else {
		repost_comment_view.animate({opacity:0, duration: 200});
		whiteBox.remove(repost_comment_view);
	}

});

// DELETE POST
btn_delete.addEventListener("click", function(e) {
	
	//Alert to Open Safari for the Post Permalink
	var alertOpenPermalink = Titanium.UI.createAlertDialog({
		title: L('delete_alert_title'),
		message: L('delete_alert_message'),
		buttonNames: [L('btn_alert_YES'),L('btn_alert_NO')],
		cancel: 1
	});	
	alertOpenPermalink.show();

	// Opens the Permalink page on Safari
	alertOpenPermalink.addEventListener('click',function(e)	{
		if (e.index == 0){
			yqlQuery = "DELETE FROM meme.user.posts WHERE pubid = '" + _pubId + "'";
			var yql_data = yql.query(yqlQuery);
			var response = yql_data.query.results.status;

			if (response.message == "ok"){
				var t3 = Titanium.UI.create2DMatrix();
				t3 = t3.scale(0);
				win.close({transform:t3,duration:200, opacity:0});
				Ti.App.fireEvent('permalinkIsOpenedFalse');
				Ti.App.fireEvent('reloadDashboard');

			} else {
				Ti.API.error("Error while deleting Post: " + JSON.stringify(response));	
			}	
		}
	});
});

// REPORT ABUSE LISTENER
btn_report_abuse.addEventListener("click", function(e) {
	//Alert to Open Report Abuse page on Safari
	var alertOpenPermalink = Titanium.UI.createAlertDialog({
		title: L('report_abuse_alert_title'),
		message: L('report_abuse_alert_message'),
		buttonNames: [L('btn_alert_YES'),L('btn_alert_CANCEL')],
		url: post.url + 'abuse/',
		cancel: 1
	});	
	alertOpenPermalink.show();

	alertOpenPermalink.addEventListener('click',function(e)
	{
		if (e.index == 0){
			Ti.Platform.openURL(alertOpenPermalink.url);	
		}
	});
});

		
// Hides the loading indicator indicator
Ti.App.fireEvent('hide_indicator');

//link to Open Permalink Web Page in the bottom
pos_BtnOpenSafari = 80 + (post.url.length * 8) + 20;

var LinkPermalinkLabel = Titanium.UI.createLabel({
	color: 				'#FFF',
	text: 				post.url ,
	textAlign: 			'left',
	font: 				{
						fontSize:14,
						fontFamily:'Georgia',
						fontStyle: 'italic',
						fontWeight: 'bold'
					 	},
	bottom: 			38,
	left: 				61,
	width: 				500,
	height: 			15,
	opacity: 			1,
	zIndex: 			3
});

win.add(LinkPermalinkLabel);

var btn_openSafari = Titanium.UI.createButton({
	backgroundImage: 	'images/btn_fwd.png',
	width: 				22,
	height: 			17,
	bottom: 			40,
	opacity: 			1,
	zIndex: 			99,
	left: 				pos_BtnOpenSafari
});
win.add(btn_openSafari);

//Alert to Open Safari for the Post Permalink
var alertOpenPermalink = Titanium.UI.createAlertDialog({
	title: L('open_link_title'),
	message: L('open_link_message'),
	buttonNames: [L('btn_alert_YES'),L('btn_alert_CANCEL')],
	cancel: 1
});

btn_openSafari.addEventListener("click", function(e)
{
	alertOpenPermalink.show();
});

LinkPermalinkLabel.addEventListener("click", function(e)
{
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


// ============================
// = CLOSE PERMALINK LISTENER =
// ============================
Ti.App.addEventListener('close_permalink', function(e)
{
	//Closes New Post Window
	win.close({opacity:0,duration:200})

});
