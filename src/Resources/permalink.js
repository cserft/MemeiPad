Ti.include('lib/commons.js');
Ti.include('lib/meme.js');

var win = Ti.UI.currentWindow;

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var _guid = win.pGuid;
var _pubId = win.pPubId;

var post = Meme.getPost(_guid, _pubId);

// ============================
// = BULDING PERMALINK LAYOUT =
// ============================
var whiteBox = Ti.UI.createView({
	backgroundColor:'white',
	width:  		'100%',
	height: 		'100%',
	zIndex: 	0
});
win.add(whiteBox);

var btn_close = Titanium.UI.createButton({
	backgroundImage: 	'images/btn_close.png',
	top: 				22,
	left: 				960,
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
	whiteBox.remove(postWebView);
	Ti.App.fireEvent('permalinkIsOpenedFalse');
    // allows for other Permalinks to Open
	
});

// =============================================
// = DEFINITION OF LAYOUT TYPE IN THE WEB VIEW =
// =============================================

var	innerMedia;
var innerCaption;

// Create our Webview to render the Post's content
var postWebView = Ti.UI.createWebView({
        html: '',
		// backgroundColor: 	'transparent',
		// backgroundImage: 'images/bg.jpg',
		top:0,
		width: '100%',
		height: 683,
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
	zIndex: 4
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
var memeInfo = Meme.userInfo(_guid, 40, 40);

// User Post Owner View (Avatar + Label + time of the post Label)
var guidView = Titanium.UI.createView({
	backgroundColor: 	'transparent',
	bottom: 			4,
	left: 				10,
	width: 				440,
	height: 			60,
	zIndex: 			2
});
whiteBox.add(guidView);

// Users Post Owner Avatar
var guidAvatar = Titanium.UI.createImageView({
	image: memeInfo.avatar_url.thumb,
	defaultImage: 'images/default_img_avatar.png',
	top:10,
	left:4,
	width:40,
	height:40,
	zIndex:2
});
guidView.add(guidAvatar);

//Guid Name / Title
var guidNameLabel = Titanium.UI.createLabel({
	color:'#A9379C',
	text: strip_html_entities(memeInfo.title),
	textAlign:'left',
	font: {
		fontSize: 18,
		fontFamily:'Helvetica',
		fontWeight: 'bold'
	},
	top: 5,
	left: 56,
	width: 400,
	height: 29,
	zIndex: 2
});

guidView.add(guidNameLabel);

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
	top: 25,
	left: 54,
	width: 250,
	height: 29,
	zIndex: 2
});

guidView.add(postUpdatedTimeLabel);

// POPOVER WITH DETAILED INFO FROM USER OWNER OF THE POST
guidView.addEventListener('click', function(e) {
	// popover must be shown only when logged in
	// and for user different than me
	if (Ti.App.myMemeInfo && (Ti.App.myMemeInfo.guid != memeInfo.guid)) {
		
		var popover = Ti.UI.iPad.createPopover({
			width:330,
			height:100,
			backgroundColor: 'white',
			navBarHidden: true,
			arrowDirection:Ti.UI.iPad.POPOVER_ARROW_DIRECTION_DOWN
		});
		
		var main = Ti.UI.createWindow({
			top: 0,
			left: 0,
			width: 340,
			height: 420,
			backgroundColor:"#FFF",
			navBarHidden: true
		});
		
		popover.add(main);
		
		// BUILDING THE TABLE VIEW
		var data = [];
		
		// ROW 1 LINK TO MEME AND FOLLOW/UNFOLLOW BUTTON
		var row1 = Ti.UI.createTableViewRow({
			selectionStyle:'none', // no color when clicking in the row
			height: 60
		});
		
		var linkMeme = Ti.UI.createLabel({
		 	color: 			'#7D0670',
			text: 			L('meme_short_domain') + memeInfo.name,
			textAlign: 		'left',
			font: 			{fontSize:14, fontWeight:'regular'},
			top: 			14,
			left: 			14,
			height: 		30,
			width: 			185
		});	
		row1.add(linkMeme);

		linkMeme.addEventListener("click", function(e) {
			Ti.App.fireEvent('openLinkOnSafari', {
				url: memeInfo.url,
				title: L('open_link_title'),
				message: L('open_link_message')
			});
		});

		var btn_follow = Ti.UI.createButton({
			top: 						14,
			left: 						207,
			width: 						100,
			height: 					30,
			style: 						Titanium.UI.iPhone.SystemButtonStyle.PLAIN
		});
		row1.add(btn_follow);
		
		var updateFollowing = null;
		if (Meme.isFollowing(memeInfo.guid)) {
			btn_follow.backgroundImage = L('path_btn_following_background_image');
			updateFollowing = Meme.unfollow;
		} else {
			btn_follow.backgroundImage = L('path_btn_follow_background_image');
			updateFollowing = Meme.follow;
		}
		
		//Follow listener
		btn_follow.addEventListener('click', function()
		{
			btn_follow.hide();
			
			var activity = Titanium.UI.createActivityIndicator({
				style: 		Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
				top: 		18,
				left: 		246,
				height: 	20,
				width: 		20
			});
			popover.add(activity);
			
			activity.show();
			
			updateFollowing(memeInfo.guid);
			
			setTimeout(function()
			{
				activity.hide();
				
				if (Meme.isFollowing(memeInfo.guid)) {
					btn_follow.backgroundImage = L('path_btn_following_background_image');
					updateFollowing = Meme.unfollow;
				} else {
					btn_follow.backgroundImage = L('path_btn_follow_background_image');
					updateFollowing = Meme.follow;
				}
				
				btn_follow.show();
			},1000);

		});
		
		data[0] = row1;
		
		// ROW 2 FOLLOWERS
		var row2 = Ti.UI.createTableViewRow({
			height: 40,
			selectionStyle:'none'
		});
		
		var iconGraphic = Ti.UI.createImageView({
			image: 			'images/icon_graphic.png',
			top: 			10,
			left: 			14,
			width: 			23,
			height: 		16
		});
		row2.add(iconGraphic);
		
		var followLabel = Ti.UI.createLabel({
			color: 			'#666',
			text: 			L('followers') + memeInfo.followers + L('following') + memeInfo.following,
			textAlign: 		'left',
			font: 			{fontSize:13, fontWeight:'regular'},
			top: 			3,
			left: 			50,
			height: 		34,
			width: 			260
		});	
		row2.add(followLabel);
		
		data[1] = row2;
		
		var guidTableView = Ti.UI.createTableView({
			data: 			data,
			scrollable: 	false,
			top: 			0,
			left: 			0,
			width: 			340,
			height: 		160,
			separatorColor: '#CCC',
			style: 			Ti.UI.iPhone.TableViewStyle.PLAIN
		});
		main.add(guidTableView);
		
		popover.show({
			view:     guidAvatar,
			animated: true
		});
	}
});


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
	zIndex: 4
});
whiteBox.add(btn_repost);

// Already Reposted Icon
var icon_btn_repost = Titanium.UI.createImageView({
	image: 		'images/btn_repost.png',
	top: 		16,
	left: 		35,
	width: 		30,
	height: 	30,
	opacity: 	1,
	visible: 	false,
	zIndex: 	2
});
// btn_repost.add(icon_btn_repost);

// Already Reposted Icon
var icon_reposted = Titanium.UI.createImageView({
	image: 		'images/icon_reposted.png',
	top: 		15,
	left: 		29,
	width: 		32,
	height: 	32,
	opacity: 	1,
	zIndex: 	1
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
	left:939,
	width:100,
	height:29,
	zIndex: 5
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
	
	// 1) Delete Button should display only when the user is the owner of the post
	if (_guid == Ti.App.myMemeInfo.guid) {
		whiteBox.add(btn_delete);
	}
	
	// 2) Repost button will be enabled only for posts that were not reposted yet
	var origin_guid = post.origin_guid;
	var origin_pubid = post.origin_pubid;
	
	// if there's no origin guid/pubid, it means that the post is original
	if (!origin_guid || !origin_pubid) {
		origin_guid = post.guid;
		origin_pubid = post.pubid;
	}
	
	var alreadyReposted = Meme.isReposted(origin_guid, origin_pubid);
	
	if (_guid == Ti.App.myMemeInfo.guid || post.via_guid == Ti.App.myMemeInfo.guid || alreadyReposted) {
		btn_repost.touchEnabled = false;	
		btn_repost.add(icon_reposted);
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
	width: 				1024,
	height: 			65,
	zIndex: 			3,
	opacity: 			0
});

var repostCommentField = Titanium.UI.createTextField({
	value: 			'',
	hintText: 		L('repostCommentField_hint_text'),
	color: 			'#666',
	textAlign: 		'left',
	font: 			{fontSize:14,fontFamily:'Georgia', fontStyle:'italic'},
	width: 			580,
	height: 		38,
	top: 			15,
	left: 			52,
	zIndex: 		2,
	borderStyle: 	Titanium.UI.INPUT_BORDERSTYLE_NONE,
	keyboardType: 	Titanium.UI.KEYBOARD_DEFAULT
	// clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});
repost_comment_view.add(repostCommentField);

// SEND COMMENT BUTTON
var btn_send_comment = Titanium.UI.createButton({
	backgroundImage: 	L('path_btn_send_commentbackground_image'),
	title: 				L('btn_send_comment_title'),
	color: 				'white',
	textAlign: 			'center',
	font: 				{fontSize:14, fontFamily:'Helvetica', fontWeight:'bold'},
	width: 				125,
	height: 			34,
	top: 				16,
	left: 				688,
	zIndex: 			1
});
repost_comment_view.add(btn_send_comment);

// CLOSE COMMENT BUTTON
var btn_close_comment = Titanium.UI.createButton({
	backgroundImage: 	'images/btn_close_comment.png',
	width: 				25,
	height: 			25,
	top: 				20,
	left: 				825,
	zIndex: 			1
});
repost_comment_view.add(btn_close_comment);

// =============
// = LISTENERS =
// =============
// BTN to close the Comment form
btn_close_comment.addEventListener('click', function(e) {
	repost_comment_view.animate({opacity:0, duration: 300}, function(){
			whiteBox.remove(repost_comment_view);
	});
});


// MOVE WINDOW ON COMMENT FOCUS SO KEYBOARD WON'T BE OVER THE COMMENT FIELD
repostCommentField.addEventListener('focus', function(e) {
	whiteBox.animate({top: -350, duration: 200});
	btn_close.animate({top:-364, duration: 200});
});

// MOVE WINDOW BACK ON COMMENT BLUR
repostCommentField.addEventListener('blur', function(e) {
	whiteBox.animate({top: 0, duration: 200});
	btn_close.animate({top: 32, duration: 200});
});

// REPOST ANIMATION TO ADD COMMENT
btn_repost.addEventListener('click', function(e) {
	var reposted = Meme.repost(_guid, _pubId);
	
	var activity = Titanium.UI.createActivityIndicator({
		style: 				Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
		backgroundImage: 	'images/bg_repost_activity.png',
		top: 				15,
		left: 				29,
		width: 				32,
		height: 			32,
		opacity: 			1,
		zIndex: 			2
	});
	btn_repost.add(activity);
	
	activity.show();
		
	if (reposted) {
		
		setTimeout(function()
		{
			activity.hide();
			
			btn_repost.add(icon_reposted);
			icon_reposted.opacity = 1;
			btn_repost.opacity = 1;	
			btn_repost.touchEnabled = true;
			repostCountLabel.text = repost_countInt += 1;
			
			// Add Comment Box after Reposting
			whiteBox.add(repost_comment_view);
			repost_comment_view.animate({opacity:1, duration: 300});
			
		},2000);

			
	} else {
		Ti.API.info("Error while reposting");	
	}	
});

// REPOST AND COMMENT
btn_send_comment.addEventListener("click", function(e) {
	if (repostCommentField.value != '') {
		var ok = Meme.createComment(_guid, _pubId, repostCommentField.value);
		
		//removes the label to add the animation
		btn_send_comment.title = "saving...";
		
		if (ok) {
			
			setTimeout(function()
			{
				btn_send_comment.title = "done!";
				
				//Hides Comment Box
				repost_comment_view.animate({opacity:0, duration: 300}, function(){
						whiteBox.remove(repost_comment_view);
				});

			},2000);
			

		} else {
			Ti.API.info("Error while saving Comment on reposting");	
		}
	} else {
		//Hides Comment Box
		repost_comment_view.animate({opacity:0, duration: 300}, function(){
				whiteBox.remove(repost_comment_view);
		});
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
			var postDeleted = Meme.deletePost(_pubId);
			
			if (postDeleted){
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

// TODO: Add new Share icon in the permalink and reuse the code below 

//link to Open Permalink Web Page in the bottom
// pos_BtnOpenSafari = 80 + (post.url.length * 8) + 20;
// 
// var LinkPermalinkLabel = Titanium.UI.createLabel({
// 	color: 				'#FFF',
// 	text: 				post.url ,
// 	textAlign: 			'left',
// 	font: 				{
// 						fontSize:14,
// 						fontFamily:'Georgia',
// 						fontStyle: 'italic',
// 						fontWeight: 'bold'
// 					 	},
// 	bottom: 			38,
// 	left: 				61,
// 	width: 				500,
// 	height: 			15,
// 	opacity: 			1,
// 	zIndex: 			3
// });
// 
// win.add(LinkPermalinkLabel);

// var btn_openSafari = Titanium.UI.createButton({
// 	backgroundImage: 	'images/btn_fwd.png',
// 	width: 				22,
// 	height: 			17,
// 	bottom: 			40,
// 	opacity: 			1,
// 	zIndex: 			99,
// 	left: 				pos_BtnOpenSafari
// });
// win.add(btn_openSafari);

// //Alert to Open Safari for the Post Permalink
// var alertOpenPermalink = Titanium.UI.createAlertDialog({
// 	title: L('open_link_title'),
// 	message: L('open_link_message'),
// 	buttonNames: [L('btn_alert_YES'),L('btn_alert_CANCEL')],
// 	cancel: 1
// });
// 
// btn_openSafari.addEventListener("click", function(e)
// {
// 	alertOpenPermalink.show();
// });
// 
// LinkPermalinkLabel.addEventListener("click", function(e)
// {
// 	alertOpenPermalink.show();
// });
// 
// 
// // Opens the Permalink page on Safari
// alertOpenPermalink.addEventListener('click',function(e)
// {
// 	if (e.index == 0){
// 		// Open Link to the Guidelines Page on Safari
// 		Ti.Platform.openURL(post.url);	
// 	}
// });


// ============================
// = CLOSE PERMALINK LISTENER =
// ============================
Ti.App.addEventListener('close_permalink', function(e)
{
	//Closes New Post Window
	win.close({opacity:0,duration:200});

});
