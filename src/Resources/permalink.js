Ti.include('lib/commons.js');
Ti.include('lib/analytics.js');
Ti.include('comments_view.js');

//Analytics Request
doYwaRequest(analytics.PERMALINK_VIEW);

var win = Ti.UI.currentWindow;

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var _guid = win.pGuid;
var _pubId = win.pPubId;
var clickTimeoutViewPopoverUser = 0;
var toggleCommentsOpen = false;

//Retrieves Post info
var post = Ti.App.meme.getPost(_guid, _pubId);
var comments = Ti.App.meme.getComments(_guid, _pubId);

Ti.API.debug("Comments Query JSON: " + JSON.stringify(comments));

//Retrieves the Post owner Info
var memeInfo = Ti.App.meme.userInfo(_guid, 40, 40);

// ============================
// = BULDING PERMALINK LAYOUT =
// ============================
var whiteBox = Ti.UI.createView({
	backgroundColor: 	'black',
	width:  			'100%',
	height: 			'100%',
	zIndex: 			0
});
win.add(whiteBox);

// Create our Theme Background WebView

var themeBg;
if (memeInfo.bgimage == undefined) {
	themeBg = 'images/bg.png';
} else {
	themeBg = memeInfo.bgimage.content;
} 

var themeBackgroundWebView = Ti.UI.createWebView({
	backgroundColor: 	'black',
    html: 				"<html><head></head><body background = '" + themeBg + "' style = '-webkit-transition-property: background; -webkit-transition-duration: 300ms; -webkit-transition-timing-function: ease-in; -webkit-transition-delay: 100ms;'> </body></html>",
	top: 				0,
    left: 				0,
	touchEnabled: 		false,
	loading: 			true,
	width: 				'100%',
	height: 			'100%',
	opacity: 			1,
	zIndex: 			1
});
whiteBox.add(themeBackgroundWebView);

// DropShadow behind the Post box
var dropShadowView = Ti.UI.createView({
	backgroundImage: 	'images/drop_shadow_postbox.png',
	top: 				30,
	left: 				30,
	backgroundLeftCap: 	33,
	backgroundTopCap: 	33,
	width:  			965,
	height: 			660,
	opacity: 			0.7,
	zIndex: 			2
});
whiteBox.add(dropShadowView);

var btn_close = Titanium.UI.createButton({
	backgroundImage: 	'images/btn_close.png',
	top: 				32,
	left: 				955,
	width: 				36,
	height: 			36,
	zIndex: 			4
});
win.add(btn_close);

btn_close.addEventListener("click", function(e)
{
	var t3 = Titanium.UI.create2DMatrix();
	t3 = t3.scale(0);
	win.close({transform:t3,duration:200});
	whiteBox.remove(postWebView);
	
	// allows for other Permalinks to Open
	Ti.App.permalinkIsOpened = false;
});



// =============================================
// = DEFINITION OF LAYOUT TYPE IN THE WEB VIEW =
// =============================================

var	innerMedia, innerCaption;

// Create our Webview to render the Post's content
var postWebView = Ti.UI.createWebView({
        html: 		'',
		top: 		50,
	    left: 		50,
		width: 		924,
		height: 	550,
        loading: 	true,
		zIndex: 	3
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

var getPostHtml = function(innerMedia, innerCaption) {
	// "(" & word & ")(?=[^>]*?<)"  // does not replace word inside Tags <>
	// (?i)\b((?:[a-z][\w-]+:(?:/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))
	var exp = /(\b(?:(?:https?|ftp|[A-Za-z]+):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))(?=[^>]*?(<|$))/ig;
	innerCaption = innerCaption.replace(exp, '<a href="$1">$1</a>');
	innerCaption = innerCaption.replace(/href="(.+?)"/g, 'href="javascript:link(\'$1\');"');
	innerCaption = innerCaption.replace(/link\(\'(Http)/g, 'link(\'http');
	return '<html><head><script language="javascript">var link = function(url) { Ti.App.fireEvent("openBrowser", { url: url }); }</script><style type="text/css">#wrapper {padding: 20px;width: 700px;}.post {font-family:"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;font-size:16px;margin:8px 0;padding-left:8px;font-size: 16px;color:#516064;}.post strong, .post b {font-weight:600;} a { outline:0 none;} a, a:visited {color:#863486;cursor:pointer;text-decoration:none;} .block_clear {display: block;clear: both;} p{margin-bottom:-10px} .post blockquote {background:url("images/quote_innerhtml.png") no-repeat scroll 7px 3px transparent; border-left:2px solid #CCCCCC; font-size:16px; margin:8px 0; padding-left:30px;}</style></head><body><div id="wrapper"><div id="middle">' + innerMedia + '<div class="post">' + innerCaption + '<br/><br/></div></div></div></body></html>';
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

//FOOTER

var footerView = Ti.UI.createView({
	backgroundColor: 	'white',
	left: 				50,
	height: 			67,
	bottom: 			81,
	width: 				924,
	zIndex: 			4
});
whiteBox.add(footerView);

// REPOST ADD COMMENT VIEWS
var whiteShadow = Titanium.UI.createView({
	backgroundImage: 	'images/white_gradient_shadow.png',
	bottom: 			148,
	left: 				50, 
	width: 				924,
	height: 			20,
	zIndex: 			5,
	opacity: 			1
});
whiteBox.add(whiteShadow);


//Border from the WebView to the User Information bottom bar
var border = Ti.UI.createView({
	backgroundColor: 	'#EBEBEB',
	height: 			1,
	top: 				0,
	width: 				'100%',
	zIndex: 			1
});
footerView.add(border);

//Guid Name / Title
var guidNameLabel = Titanium.UI.createLabel({
	color: 				'#A9379C',
	text: 				Encoder.htmlDecode(memeInfo.title),
	textAlign: 			'left',
	minimumFontSize: 	15,
	font: {
		fontSize:  		18,
		fontFamily: 	'Helvetica',
		fontWeight: 	'bold'
	},
	top: 				5,
	left: 				56,
	width: 				240,
	height: 			29,
	zIndex: 			2
});

// User Post Owner View (Avatar + Label + time of the post Label)
var guidView = Titanium.UI.createView({
	backgroundLeftCap: 	15,
	backgroundTopCap: 	15,
	bottom: 			4,
	left: 				10,
	width: 				300,
	height: 			60,
	zIndex: 			2
});
footerView.add(guidView);

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

guidView.addEventListener('touchend', function()	{
	guidView.backgroundImage = '';
});

// POPOVER WITH DETAILED INFO FROM USER OWNER OF THE POST
guidView.addEventListener('click', function(e) {
	// popover must be shown only when logged in
	// and for user different than me
	
	guidView.backgroundImage = 'images/bg_btn_generic_translucid.png';
	
	clearTimeout(clickTimeoutViewPopoverUser);
	
	clickTimeoutViewPopoverUser = setTimeout(function() {	
		
		if (Ti.App.myMemeInfo && (Ti.App.myMemeInfo.guid != memeInfo.guid)) {

			var popoverGuid = Ti.UI.iPad.createPopover({
				width:330,
				height:100,
				backgroundColor: 'white',
				navBarHidden: true
			});
			
			if (toggleCommentsOpen == false) {
				popoverGuid.arrowDirection = Ti.UI.iPad.POPOVER_ARROW_DIRECTION_DOWN;
			} else {
				popoverGuid.arrowDirection = Ti.UI.iPad.POPOVER_ARROW_DIRECTION_UP;
			}

			var main = Ti.UI.createWindow({
				top: 0,
				left: 0,
				width: 330,
				height: 100,
				backgroundColor:"#FFF",
				navBarHidden: true
			});

			popoverGuid.add(main);
			
			guidAvatar.add(Ti.App.activitySmall);

			Ti.App.activitySmall.show();

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
				popoverGuid.hide();
				Ti.App.fireEvent('openBrowser', {
					url: memeInfo.url
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
			if (Ti.App.meme.isFollowing(memeInfo.guid)) {
				btn_follow.backgroundImage = L('path_btn_following_background_image');
				updateFollowing = Ti.App.meme.unfollow;
				Ti.App.activitySmall.hide();
			} else {
				btn_follow.backgroundImage = L('path_btn_follow_background_image');
				updateFollowing = Ti.App.meme.follow;
				Ti.App.activitySmall.hide();
			}

			//Follow listener
			btn_follow.addEventListener('click', function()	{
				btn_follow.hide();

				var activity = Titanium.UI.createActivityIndicator({
					style: 		Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
					top: 		18,
					left: 		246,
					height: 	20,
					width: 		20
				});
				popoverGuid.add(activity);

				activity.show();

				updateFollowing(memeInfo.guid);

				setTimeout(function()
				{
					activity.hide();

					if (Ti.App.meme.isFollowing(memeInfo.guid)) {
						btn_follow.backgroundImage = L('path_btn_following_background_image');
						updateFollowing = Ti.App.meme.unfollow;
					} else {
						btn_follow.backgroundImage = L('path_btn_follow_background_image');
						updateFollowing = Ti.App.meme.follow;
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

			popoverGuid.show({
				view:     guidAvatar,
				animated: true
			});
		} // end if

	},500);

});
Ti.API.debug("AppID>>>>>>>>>>>>>>>>>> : " + post.appid);

//Retrieves AppInfo
if (post.appid != undefined || post.appid != null) {
	
	Ti.App.meme.appInfo(post.appid, function (appInfo) {
		
		//App name of the application
		var iconApp = Titanium.UI.createImageView({
			image: 		'images/icon_app.png',
			top: 		27,
			left: 		320,
			width: 		15,
			height: 	15,
			zIndex: 	2
		});
		footerView.add(iconApp);

		// Label for the Application
		var appName = Titanium.UI.createLabel({
			color: 					'#666',
			// backgroundColor: 		'red',
			text:  					'using ' + appInfo.name,
			textAlign: 				'left',
			minimumFontSize: 		11,
			font: {
				fontSize: 			12,
				fontFamily: 		'Helvetica',
				fontWeight: 		'bold'
			},
			bottom: 				21,
			left: 					340,
			width: 					170,
			height: 				21,
			zIndex: 				2
		});
		footerView.add(appName);
	});
}


// ===========================
// = REPOST BUTTON AND COUNT =
// ===========================

var btn_repost = Titanium.UI.createView({
	backgroundImage: 	'images/btn_repost2.png',
	width: 				150,
	height: 			65,
	bottom: 			1,
	right: 				0,
	opacity: 			1,
	zIndex: 			4
});
footerView.add(btn_repost);

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
	color: 				'#666',
	text: 				repost_countInt,
	textAlign: 			'left',
	font: {
		fontSize: 		21,
		fontFamily: 	'Helvetica',
		fontWeight: 	'regular'
	},
	bottom: 			21,
	right: 				10,
	width: 				70,
	height: 			29,
	zIndex: 			5
});

footerView.add(repostCountLabel);

//Button for comments
var btn_comments = Titanium.UI.createView({
	backgroundImage: 	'images/btn_comments.png',
	width: 				150,
	height: 			65,
	bottom: 			1,
	right: 				149,
	opacity: 			1,
	zIndex: 			4
});
footerView.add(btn_comments);

if (comments == undefined) {
	var commentCount = 0;
} else {
	var commentCount = comments.count;
}

//TODO IF ZERO COMMENTS
var commentCountLabel = Titanium.UI.createLabel({
	color: 				'#666',
	text: 				commentCount,
	textAlign: 			'left',
	font: {
		fontSize: 		21,
		fontFamily: 	'Helvetica',
		fontWeight: 	'regular'
	},
	right: 				10,
	width: 				70,
	height: 			29,
	zIndex: 			5
});
btn_comments.add(commentCountLabel);

// adds the Comments View
whiteBox.add(commentView);

//BTN Comments TOGGLE Listener
btn_comments.addEventListener('touchstart', function(e) {
	// Click visual Feedback
	btn_comments.opacity = 0.7;
	
	if (toggleCommentsOpen == false) {
		//Open
		footerView.animate({bottom: 631, duration: 300}, function(e){
				whiteShadow.hide();
		});
		commentView.animate({height: 555, bottom: 81, duration: 300}, function(e){
			commentBoxView.animate({opacity: 1, delay: 200, duration: 200});
		});
		toggleCommentsOpen = true;
		
	} else {
		//Close
		commentBoxView.animate({opacity: 0, duration: 100});
		footerView.animate({bottom: 81, duration: 300}, function(e){
				whiteShadow.show();
		});
		commentView.animate({height: 1, duration: 300}, function(e){
		});
		toggleCommentsOpen = false;
	}
});

// Repost bck to normal
btn_comments.addEventListener('touchend', function(e) {
	// Click visual Feedback
	btn_comments.opacity = 1;
});


// Button to share Post
var btn_share = Titanium.UI.createButton({
	backgroundImage: 	'images/btn_fwd2.png',
	width: 				34,
	height: 			28,
	right: 				370,
	bottom: 			20,
	opacity: 			1,
	zIndex: 			1
});
footerView.add(btn_share);

//BTN Share popover

// POPOVER WITH DETAILED INFO FROM USER OWNER OF THE POST
btn_share.addEventListener('touchstart', function(e) {
	
	clearTimeout(clickTimeoutViewPopoverUser);
	
	clickTimeoutViewPopoverUser = setTimeout(function() {	

		var popoverShare = Ti.UI.iPad.createPopover({
			width:330,
			height:180,
			backgroundColor: 'white',
			navBarHidden: true
		});
		
		if (toggleCommentsOpen == false) {
			popoverShare.arrowDirection = Ti.UI.iPad.POPOVER_ARROW_DIRECTION_DOWN;
		} else {
			popoverShare.arrowDirection = Ti.UI.iPad.POPOVER_ARROW_DIRECTION_UP;
		}

		var main = Ti.UI.createWindow({
			top: 0,
			left: 0,
			width: 330,
			height: 180,
			backgroundColor:"#FFF",
			navBarHidden: true
		});

		popoverShare.add(main);

		// BUILDING THE TABLE VIEW
		var data = [];

		// ROW 1 LINK TO MEME AND FOLLOW/UNFOLLOW BUTTON
		var row1 = Ti.UI.createTableViewRow({
			selectionStyle: 2, // GRAY color when clicking in the row
			height: 60
		});
		
		var icon_share_link = Ti.UI.createImageView({
			image: 			'images/icon_share_link.png',
			top: 			18,
			left: 			8,
			width: 			24,
			height: 		24
		});
		row1.add(icon_share_link);
		
		// REGEXP original: /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/
		var parseLinkMeme = post.url.match(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);
		
		var linkMeme = Ti.UI.createLabel({
		 	color: 			'#7D0670',
			text: 			L('meme_short_domain') + parseLinkMeme[6],
			textAlign: 		'left',
			font: 			{fontSize:13, fontWeight:'bold'},
			top: 			15,
			left: 			40,
			height: 		30,
			width: 			282
		});	
		row1.add(linkMeme);

		data[0] = row1;

		// ROW 2 COPY CLIPBOARD
		var row2 = Ti.UI.createTableViewRow({
			height: 40,
			selectionStyle: 2 // GRAY color when clicking in the row
		});
		
		var icon_share_copy = Ti.UI.createImageView({
			image: 			'images/icon_share_copy.png',
			top: 			8,
			left: 			8,
			width: 			24,
			height: 		24
		});
		row2.add(icon_share_copy);

		var copyLabel = Ti.UI.createLabel({
			color: 			'#333',
			text: 			L('copy_link_text'),
			textAlign: 		'left',
			font: 			{fontSize:16, fontFamily:'Helvetica', fontWeight:'regular'},
			top: 			7,
			left: 			40,
			height: 		26,
			width: 			260
		});	
		row2.add(copyLabel);

		data[1] = row2;
		
		// ROW 3 MAIL LINK
		var row3 = Ti.UI.createTableViewRow({
			height: 40,
			selectionStyle: 2 // GRAY color when clicking in the row
		});
		
		var icon_share_mail = Ti.UI.createImageView({
			image: 			'images/icon_share_mail.png',
			top: 			8,
			left: 			8,
			width: 			24,
			height: 		24
		});
		row3.add(icon_share_mail);

		var copyLabel = Ti.UI.createLabel({
			color: 			'#333',
			text: 			L('mail_post_text'),
			textAlign: 		'left',
			font: 			{fontSize:16, fontFamily:'Helvetica', fontWeight:'regular'},
			top: 			7,
			left: 			40,
			height: 		26,
			width: 			260
		});	
		row3.add(copyLabel);

		data[2] = row3;
		
		// ROW 4 SHARE WITH TWITTER FOR IPAD
		var row4 = Ti.UI.createTableViewRow({
			height: 40,
			selectionStyle: 2 // GRAY color when clicking in the row
		});
		
		var icon_share_mail = Ti.UI.createImageView({
			image: 			'images/icon_share_twitter.png',
			top: 			8,
			left: 			8,
			width: 			24,
			height: 		24
		});
		row4.add(icon_share_mail);

		var copyLabel = Ti.UI.createLabel({
			color: 			'#333',
			text: 			L('share_with_twitter'), 
			textAlign: 		'left',
			font: 			{fontSize:16, fontFamily:'Helvetica', fontWeight:'regular'},
			top: 			7,
			left: 			40,
			height: 		26,
			width: 			260
		});	
		row4.add(copyLabel);

		data[3] = row4;

		var shareTableView = Ti.UI.createTableView({
			data: 			data,
			scrollable: 	false,
			top: 			0,
			left: 			0,
			width: 			340,
			height: 		180,
			separatorColor: '#CCC',
			style: 			Ti.UI.iPhone.TableViewStyle.PLAIN
		});
		main.add(shareTableView);
		
		// Listeners
		shareTableView.addEventListener('click', function(e)	{
			//If Clicked on Permalink Link, then Open Internal Browser
			if (e.index == 0) {
				
				Ti.App.fireEvent('openBrowser', {
					url: post.url
				});			
				popoverShare.hide();
			}
			// If Clicked on Line 2 - Then copy link to Clipboard
			else if (e.index == 1) {
				//Analytics Request
				doYwaRequest(analytics.COPY_LINK);
				
				Ti.UI.Clipboard.setText(post.url);
				popoverShare.hide();
			}
			
			// If Clicked on Line 3 - Then open Mail Dialog
			else if (e.index == 2) {
				
				var emailDialog = Titanium.UI.createEmailDialog();
				emailDialog.setHtml(true);
	            emailDialog.setBarColor('black');
				
				var messageSubject, bodyHtml, messageBody;
				
				// Setting the Mail Subject
				// TODO: use <content> for Text posts
				if (post.caption != "") {
					messageSubject = strip_html_entities(post.caption).substr(0, 90) + '...'; // shows only the first 100 caracters
				} else {
					messageSubject = L('mail_message_subject_default')
				}
				
		        emailDialog.setSubject(messageSubject);
		
				var setMailMessageBody = function (callback) {
					
					Ti.API.debug("setMailMessageBody function called");
					
					if (post.type == "video") {

						getVideoData(post.content, function(thumb, data) {
							innerMedia = '<a href=' + post.url + '><img src="' + thumb + '" class="block_clear"></a>';
							innerCaption = add_html_entities(post.caption);
							bodyHtml = '<style type="text/css">#wrapper {padding: 20px;width: 700px;}.post {font-family:"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;font-size:16px;margin:8px 0;padding-left:8px;font-size: 16px;color:#516064;}.post strong, .post b {font-weight:600;} a { outline:0 none;} a, a:visited {color:#863486;cursor:pointer;text-decoration:none;} .block_clear {display: block;clear: both;} p{margin-bottom:-10px} .post blockquote {background:url("images/quote_innerhtml.png") no-repeat scroll 7px 3px transparent; border-left:2px solid #CCCCCC; font-size:16px; margin:8px 0; padding-left:30px;}</style><div id="wrapper"><div id="middle">' + innerMedia + '<div class="post">' + innerCaption + '<br/><br/></div></div></div>';
							messageBody = bodyHtml + '<br/>' + L('mail_message_body_source') + '<a href=' + post.url + '>' + post.url + '</a><br/><br/><a href="' + L('memeapp_url') + '">' + L('mail_message_signature') + '</a><!--YWA tracking tag--><img src="http://a.analytics.yahoo.com/p.pl?a=1000671789962&js=no&x=' + analytics.EMAIL_OPEN + '" width="1" height="1" alt="" />';	
							callback(messageBody);
						});

					} else if (post.type == "photo"){
						innerMedia= '<a href=' + post.url + '><img src="' + post.content.content + '" class="block_clear"></a>';
						innerCaption = add_html_entities(post.caption);
						bodyHtml = '<style type="text/css">#wrapper {padding: 20px;width: 700px;}.post {font-family:"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;font-size:16px;margin:8px 0;padding-left:8px;font-size: 16px;color:#516064;}.post strong, .post b {font-weight:600;} a { outline:0 none;} a, a:visited {color:#863486;cursor:pointer;text-decoration:none;} .block_clear {display: block;clear: both;} p{margin-bottom:-10px} .post blockquote {background:url("images/quote_innerhtml.png") no-repeat scroll 7px 3px transparent; border-left:2px solid #CCCCCC; font-size:16px; margin:8px 0; padding-left:30px;}</style><div id="wrapper"><div id="middle">' + innerMedia + '<div class="post">' + innerCaption + '<br/><br/></div></div></div>';
						messageBody = bodyHtml + '<br/>' + L('mail_message_body_source') + '<a href=' + post.url + '>' + post.url + '</a><br/><br/><a href="' + L('memeapp_url') + '">' + L('mail_message_signature') + '</a><!--YWA tracking tag--><img src="http://a.analytics.yahoo.com/p.pl?a=1000671789962&js=no&x=' + analytics.EMAIL_OPEN + '" width="1" height="1" alt="" />';
						callback(messageBody);
					} else {
						bodyHtml = postWebView.html;
						messageBody = bodyHtml + '<br/>' + L('mail_message_body_source') + '<a href=' + post.url + '>' + post.url + '</a><br/><br/><a href="' + L('memeapp_url') + '">' + L('mail_message_signature') + '</a><!--YWA tracking tag--><img src="http://a.analytics.yahoo.com/p.pl?a=1000671789962&js=no&x=' + analytics.EMAIL_OPEN + '" width="1" height="1" alt="" />';
						callback(messageBody);
					}
					
				};
				
				setMailMessageBody(function(messageBody){
					
					emailDialog.setMessageBody(messageBody);
					
			        emailDialog.addEventListener('complete',function(e)
			        {
			            if (e.result == emailDialog.SENT)
			            {
							//Analytics Request
							doYwaRequest(analytics.SHARE_MAIL);

		                    Ti.API.log("Mail message was sent");
			            }
			            else
			            {
			                Ti.API.log("Mail message was not sent. result = " + e.result);
			            }
			        });
			        emailDialog.open();

					popoverShare.hide();
					
				});

			}
			
			// Share with Twitter for iPad app
			else if (e.index == 3) {
				
				//Analytics Request
				doYwaRequest(analytics.SHARE_TWITTER_IPAD);
				
				Ti.App.fireEvent('openLinkOnSafari', {
					url: 		'tweetie:' + 'http://' + L('meme_short_domain') + parseLinkMeme[6],
					title: 		L('share_with_twitter'),
					message: 	L('share_with_twitter_message')
				});
				popoverShare.hide();
			}
		}); // end TableView Listener

		popoverShare.show({
			view:     btn_share,
			animated: true
		});

	},500);

});


// REPORT ABUSE Button
var btn_report_abuse = Titanium.UI.createButton({
	backgroundImage:'images/btn_report_abuse.png',
	width:27,
	height:27,
	bottom: 20,
	right: 320,
	zIndex: 1
});

// Delete Button
var btn_delete = Titanium.UI.createButton({
	backgroundImage:'images/btn_trash.png',
	width:25,
	height:29,
	bottom: 18,
	right: 320,
	zIndex: 1
});

// Checks if the user logged in is the Author or the Origin or a Vi and disables the Repost Button
if (! Ti.App.oAuthAdapter.isLoggedIn()) {
	// When not loggedIn, disables the Repost Button and adds the Report Abuse button
	btn_repost.opacity = 0.7;	
	btn_repost.touchEnabled = false;
	footerView.add(btn_report_abuse);
	
} else {
	
	// 1) Delete Button is displayed only when the user is the owner of the post
	if (_guid == Ti.App.myMemeInfo.guid) {
		footerView.add(btn_delete);
	
	// 2) Report abuse is displayed when user is NOT owner of the post
	} else {
		footerView.add(btn_report_abuse);
	}
	
	// 3) Repost button will be enabled only for posts that were not reposted yet
	var origin_guid = post.origin_guid;
	var origin_pubid = post.origin_pubid;
	
	// if there's no origin guid/pubid, it means that the post is original
	if (!origin_guid || !origin_pubid) {
		origin_guid = post.guid;
		origin_pubid = post.pubid;
	}
	
	var alreadyReposted = Ti.App.meme.isReposted(origin_guid, origin_pubid);
	
	if (_guid == Ti.App.myMemeInfo.guid || post.via_guid == Ti.App.myMemeInfo.guid || alreadyReposted) {
		btn_repost.touchEnabled = false;	
		btn_repost.add(icon_reposted);
	} else {
		// When Logged In and not the owner of the Post, enables Repost and Report Abuse Btn
		btn_repost.opacity = 1;	
		btn_repost.touchEnabled = true;
	}
}

// REPOST ADD COMMENT VIEWS
var repost_comment_view = Titanium.UI.createView({
	backgroundImage: 	'images/bg_btn_repost_comment.png',
	bottom: 			0,
	left: 				0, 
	width: 				776,
	height: 			66,
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
	keyboardType: 	Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: 	Titanium.UI.RETURNKEY_DONE
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
	left: 				570,
	zIndex: 			1
});
repost_comment_view.add(btn_send_comment);

// CLOSE COMMENT BUTTON
var btn_close_comment = Titanium.UI.createButton({
	backgroundImage: 	'images/btn_close_comment.png',
	width: 				25,
	height: 			25,
	top: 				20,
	right: 				35,
	zIndex: 			1
});
repost_comment_view.add(btn_close_comment);

// =============
// = LISTENERS =
// =============
// BTN to close the Comment form
btn_close_comment.addEventListener('click', function(e) {
	repost_comment_view.animate({opacity:0, duration: 300}, function(){
			footerView.remove(repost_comment_view);
	});
});


// MOVE WINDOW ON COMMENT FOCUS SO KEYBOARD WON'T BE OVER THE COMMENT FIELD
repostCommentField.addEventListener('focus', function(e) {
	whiteBox.animate({top: -350, duration: 300});
	btn_close.animate({top:-364, duration: 300});
});

// MOVE WINDOW BACK ON COMMENT BLUR
repostCommentField.addEventListener('blur', function(e) {
	whiteBox.animate({top: 0, duration: 200});
	btn_close.animate({top: 32, duration: 200});
});

// Repost bck to normal
btn_repost.addEventListener('touchend', function()	{
	// Click visual Feedback
	btn_repost.opacity = 1;
});

//Repost
btn_repost.addEventListener('click', function(e) {
	// Click visual Feedback
	btn_repost.opacity = 0.7;

	var reposted = Ti.App.meme.repost(_guid, _pubId);
	
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
		
		doYwaRequest(analytics.REPOST);
		
		setTimeout(function()
		{
			activity.hide();
			
			btn_repost.add(icon_reposted);
			icon_reposted.opacity = 1;
			btn_repost.opacity = 1;	
			btn_repost.touchEnabled = true;
			repostCountLabel.text = repost_countInt += 1;
			
			// Add Comment Box after Reposting
			footerView.add(repost_comment_view);
			repost_comment_view.animate({opacity:1, duration: 300});
			
		},2000);

			
	} else {
		Ti.API.info("Error while reposting");	
	}	
});

// REPOST AND COMMENT
btn_send_comment.addEventListener("click", function(e) {
	if (repostCommentField.value != '') {
		var ok = Ti.App.meme.createComment(_guid, _pubId, repostCommentField.value);
		
		//removes the label to add the animation
		btn_send_comment.title = "saving...";
		
		if (ok) {
			//Analytics Request
			doYwaRequest(analytics.ADD_REPOST_COMMENT);
			
			setTimeout(function()
			{
				btn_send_comment.title = "done!";
				
				//Hides Comment Box
				repost_comment_view.animate({opacity:0, duration: 300}, function(){
						footerView.remove(repost_comment_view);
				});

			},2000);
			

		} else {
			Ti.API.info("Error while saving Comment on reposting");	
		}
	} else {
		//Hides Comment Box
		repost_comment_view.animate({opacity:0, duration: 300}, function(){
				footerView.remove(repost_comment_view);
		});
	}
});

// DELETE POST
btn_delete.addEventListener('click', function(e) {
	
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
			var postDeleted = Ti.App.meme.deletePost(_pubId);
			
			if (postDeleted){
				var t3 = Titanium.UI.create2DMatrix();
				t3 = t3.scale(0);
				win.close({transform:t3,duration:200, opacity:0});
				Ti.App.permalinkIsOpened = false;
				Ti.App.fireEvent('reloadDashboard');
				
				//Analytics Request
				doYwaRequest(analytics.DELETE_POST);
				
			} else {
				Ti.API.error("Error while deleting Post: " + JSON.stringify(response));	
			}	
		}
	});
});

// REPORT ABUSE LISTENER
btn_report_abuse.addEventListener('click', function(e) {	
	Ti.App.fireEvent('openBrowser', {
		url: post.url + 'abuse/'
	});
	
	//Analytics Request
	doYwaRequest(analytics.REPORT_ABUSE);
});

		
// Hides the loading indicator indicator
Ti.App.activityPostClick.hide();


// ============================
// = CLOSE PERMALINK LISTENER =
// ============================
Ti.App.addEventListener('close_permalink', function(e)
{
	//Closes New Post Window
	Ti.App.permalinkIsOpened = false;
	win.close({opacity:0,duration:200});

});
