// =====================================================
// = presents the comments view from a given permalink =
// =====================================================

Ti.include('lib/commons.js');
Ti.include('lib/analytics.js');

var commentView = Titanium.UI.createView({
	backgroundColor: 	'white',
	bottom: 			81,
	left: 				50,
	width: 				924,
	height: 			1, //550,
	zIndex: 			10,
	visible: 			true
});

var commentBoxView = Titanium.UI.createView({
	backgroundImage: 	'images/bg_comment_field_permalink.png',
	top: 				30,
	width: 				811,
	height: 			80,
	zIndex: 			2,
	opacity: 			0
});
commentView.add(commentBoxView);

var commentField = Titanium.UI.createTextField({
	value: 			'',
	backgroundColor: 'transparent',
	hintText: 		L('repostCommentField_hint_text'),
	color: 			'#666',
	textAlign: 		'left',
	font: 			{fontSize:14,fontFamily:'Georgia', fontStyle:'italic'},
	width: 			580,
	height: 		44,
	top: 			18,
	left: 			50,
	zIndex: 		1,
	borderStyle: 	Titanium.UI.INPUT_BORDERSTYLE_NONE,
	keyboardType: 	Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: 	Titanium.UI.RETURNKEY_DONE,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});
commentBoxView.add(commentField);

// SEND COMMENT BUTTON
var btn_send_comment2 = Titanium.UI.createButton({
	backgroundImage: 	L('path_btn_send_commentbackground_image'),
	title: 				L('btn_send_comment_title'),
	color: 				'white',
	textAlign: 			'center',
	font: 				{fontSize:14, fontFamily:'Helvetica', fontWeight:'bold'},
	width: 				125,
	height: 			34,
	top: 				23,
	left: 				662,
	zIndex: 			1
});
commentBoxView.add(btn_send_comment2);

if (!Ti.App.oAuthAdapter.isLoggedIn()) {
	btn_send_comment2.enabled = false;
	commentField.enabled = false;
	commentField.hintText = L('comment_field_hint_text');
}

// Comments Tableview

var commentsTableView = Ti.UI.createTableView({
	backgroundColor: 	'transparent',
	top: 				125,
	height: 			400,
	width: 				810,
	separatorStyle: 	Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
	// separatorColor: 	'#CCC',
	selectionStyle: 	'none',
	style: 				0, //Ti.UI.iPhone.TableViewStyle.PLAIN
	opacity: 			1
});

// row for results not found
var notFoundRow = Ti.UI.createTableViewRow({height:112});
var notFoundTitle = Ti.UI.createLabel({
	text: L('zero_comments_text'),
	color: '#999',
	bottom: 0,
	height:50,
	width: 800,	
	textAlign:'center',
	font:{fontSize:20, fontFamily:'Helvetica', fontWeight:'regular'}
});
notFoundRow.add(notFoundTitle);

var nocomments;

var addUserInfo = function(comments) {
	var guids = [];
	for (var i=0; i < comments.length; i++) {
		guids.push(comments[i].guid);
	};
	Ti.API.info('guids to query are: ' + guids);
	var usersInfo = Ti.App.meme.userInfo(guids, 40, 40, true);
	if (typeof usersInfo.length == 'undefined') {
		usersInfo = [usersInfo];
	}
	for (var i=0; i < comments.length; i++) {
		comments[i].userInfo = usersInfo[i];
	}
	return comments;
};

// Comments Array
function getComments(comments) {
	var results = [];
	
	if (comments.results) {
		var commentItems = comments.results.comment;

		if (typeof commentItems.length == 'undefined') {
			commentItems = [commentItems];
		}

		commentItems = addUserInfo(commentItems);

		for (var c=0 ; c < commentItems.length ; c++) {
			var item = commentItems[c];

			//Ti.API.debug("Comments ITEM loop JSON: " + JSON.stringify(item));

			var row = Ti.UI.createTableViewRow({height:112});
			row.animationStyle = Titanium.UI.iPhone.RowAnimationStyle.DOWN;
			row.className = "comment";

			var avatar = Ti.UI.createImageView({
				image: item.userInfo.avatar_url.thumb,
				height: 40,
				width: 40,
				top: 24,
				left: 13,
				defaultImage:'images/default_img_avatar.png'
			});
			row.add(avatar);

			var quote_icon = Ti.UI.createImageView({
				image : 		'images/quote_innerhtml.png',
				height: 		14,
				width: 			16,
				top: 			24,
				left: 			62
			});
			row.add(quote_icon); 

			var commentTxt = Ti.UI.createLabel({
				text: 			strip_html_entities(item.comment),
				color: 			'#333',
				height: 		52,
				width: 			620,
				top: 			26,
				left: 			88,
				textAlign: 		'left',
				font: 			{fontSize:14,fontFamily:'Georgia', fontStyle:'italic'},
			});
			row.add(commentTxt);

			var title_width = item.userInfo.title.length * 7;

			var username = Ti.UI.createLabel({
				text: 					item.userInfo.title,
				// backgroundColor: 		'red',
				color: 					'#863486',
				width: 					title_width,
				height: 				23,
				top: 					68,
				left: 					88,
				textAlign: 				'left',
				font: 					{fontSize:12, fontFamily:'Helvetica', fontWeight:'bold'}
			});
			row.add(username);

			var commentTime = Ti.UI.createLabel({
				// backgroundColor: 	'yellow',
				text: 			humane_date(item.timestamp),
				color: 			'#999',
				height: 		23,
				width: 			150,
				top: 			68,
				left: 			username.left + title_width + 10,
				textAlign: 		'left',
				font: 			{fontSize:12,fontFamily:'Helvetica',fontWeight:'regular'},
			});
			row.add(commentTime);
			
			var line = Titanium.UI.createView({
				backgroundColor: 	'#E0E0E0',
				width: 				924,
				height: 			1,
				bottom: 			0,
				right: 				0,
				opacity: 			1,
				zIndex: 			2
			});
			row.add(line);

			results[c] = row;
		}
		
	} else {
		results[0] = notFoundRow;
		nocomments = true;
	}
	
	commentsTableView.data = results;
	commentView.add(commentsTableView);
	
	setTimeout(function() {
		Ti.App.fireEvent('hide_indicator');
	}, 1000);
}


// Send COMMENT
btn_send_comment2.addEventListener("click", function(e) {
	if (commentField.value != '') {
		var ok = Ti.App.meme.createComment(_guid, _pubId, commentField.value);
		
		//removes the label to add the animation
		btn_send_comment2.title = L('btn_send_comment_title_2');
		
		if (ok) {
			//Analytics Request
			doYwaRequest(analytics.ADD_COMMENT);
			var comment_temp = commentField.value;
			commentField.blur();
			
			setTimeout(function()
			{
				btn_send_comment2.title = L('btn_done_title');
				commentField.value = "";
				btn_send_comment2.title = L('btn_send_comment_title');
				
				//Adds Line in the TableView with Comments with the recent Comment
				var row = Ti.UI.createTableViewRow({height:112});
				row.animationStyle = Titanium.UI.iPhone.RowAnimationStyle.DOWN;
				row.className = "comment";
				
				var avatar = Ti.UI.createImageView({
					image: Ti.App.myMemeInfo.avatar_url.thumb,
					height: 40,
					width: 40,
					top: 24,
					left: 13,
					defaultImage:'images/default_img_avatar.png'
				});
				row.add(avatar);

				var quote_icon = Ti.UI.createImageView({
					image : 		'images/quote_innerhtml.png',
					height: 		14,
					width: 			16,
					top: 			24,
					left: 			62
				});
				row.add(quote_icon); 

				var commentTxt = Ti.UI.createLabel({
					text: 			comment_temp,
					color: 			'#333',
					height: 		52,
					width: 			620,
					top: 			26,
					left: 			88,
					textAlign: 		'left',
					font: 			{fontSize:14,fontFamily:'Georgia', fontStyle:'italic'},
				});
				row.add(commentTxt);

				var title_width = Ti.App.myMemeInfo.title.length * 7;

				var username = Ti.UI.createLabel({
					text: 					Ti.App.myMemeInfo.title,
					color: 					'#863486',
					width: 					title_width,
					height: 				23,
					top: 					68,
					left: 					88,
					textAlign: 				'left',
					font: 					{fontSize:12, fontFamily:'Helvetica', fontWeight:'bold'}
				});
				row.add(username);
				
				var ts = new Date().getTime();

				var commentTime = Ti.UI.createLabel({
					text: 			humane_date(ts),
					color: 			'#999',
					height: 		23,
					width: 			150,
					top: 			68,
					left: 			username.left + title_width + 10,
					textAlign: 		'left',
					font: 			{fontSize:12,fontFamily:'Helvetica',fontWeight:'regular'},
				});
				row.add(commentTime);

				var line = Titanium.UI.createView({
					backgroundColor: 	'#E0E0E0',
					width: 				924,
					height: 			1,
					bottom: 			0,
					right: 				0,
					opacity: 			1,
					zIndex: 			2
				});
				row.add(line);
				
				function insertRow(callback) {
					commentsTableView.insertRowBefore(0,row);
					callback();
				};
				
				insertRow(function () {
					if (nocomments == true) {
						commentsTableView.deleteRow(1, {animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
					}
				});

			},2000);

		} else {
			Ti.API.info("Error while saving Commenting");	
		}
	} else {
		Ti.UI.createAlertDialog({
			title: L('comment_alert_empty_title'),
			message: L('comment_alert_empty_message')
		}).show();
	}
});
