// =====================================================
// = presents the comments view from a given permalink =
// =====================================================

Ti.include('lib/commons.js');

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
	opacity: 			0,
	visible: 			true
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

// Send COMMENT
btn_send_comment2.addEventListener("click", function(e) {
	if (commentField.value != '') {
		var ok = Ti.App.meme.createComment(_guid, _pubId, commentField.value);
		
		//removes the label to add the animation
		btn_send_comment2.title = "saving...";
		
		if (ok) {
			//Analytics Request
			doYwaRequest(analytics.ADD_COMMENT);
			
			setTimeout(function()
			{
				btn_send_comment2.title = "done!";
				
			// Close Keyboard
			// Empty commentField
			// Set btn_send_comment2.title to original string

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

// Comments Tableview

var commentsTableView = Ti.UI.createTableView({
	backgroundColor: 	'transparent',
	top: 				125,
	height: 			400,
	width: 				810,
	separatorColor: 	'#CCC',
	selectionStyle: 	'none',
	style: 				0, //Ti.UI.iPhone.TableViewStyle.PLAIN
	opacity: 			1
});

// row for results not found
var notFoundRow = Ti.UI.createTableViewRow({height:112});
var notFoundTitle = Ti.UI.createLabel({
	text: L('flashlight_no_results'),
	color: '#863486',
	backgroundColor: 'red',
	height:50,
	width: 192,	
	textAlign:'center',
	font:{fontSize:20, fontFamily:'Helvetica', fontWeight:'regular'}
});
notFoundRow.add(notFoundTitle);


var results = [];

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
	var commentItems = comments.results.comment;
	
	if (typeof commentItems.length == 'undefined') {
		commentItems = [commentItems];
	}
	
	commentItems = addUserInfo(commentItems);
	
	//Ti.API.debug("Comments Query JSON: " + JSON.stringify(commentItems) + "\nLength: [" + commentItems.length + "]");

	// coments loop
	if (commentItems) {
		for (var c=0 ; c < commentItems.length ; c++) {
			var item = commentItems[c];
			
			//Ti.API.debug("Comments ITEM loop JSON: " + JSON.stringify(item));
			
			var row = Ti.UI.createTableViewRow({height:112});
			row.animationStyle = Titanium.UI.iPhone.RowAnimationStyle.FADE;
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

			results[c] = row;
		}	
	} else {
		results[0] = notFoundRow;
	}
	
	commentsTableView.data = results;
	commentView.add(commentsTableView);	
}

// Query Comments
// SELECT guid FROM meme.comments(100) WHERE owner_guid='U3SFNJ3PEDHICFGXZ7X7CKAQJQ' and pubid='Ue6IZbS'

//Meme Info
// SELECT * FROM meme.info WHERE owner_guid in (SELECT guid FROM meme.comments(110) WHERE owner_guid='U3SFNJ3PEDHICFGXZ7X7CKAQJQ' and pubid='Ue6IZbS')
// SELECT * FROM meme.info WHERE owner_guid in ('U3SFNJ3PEDHICFGXZ7X7CKAQJQ', 'U3SFNJ3PEDHICFGXZ7X7CKAQJQ', 'U3SFNJ3PEDHICFGXZ7X7CKAQJQ')

// 
// // Loading more comments as it scrolls
// var navActInd = Titanium.UI.createActivityIndicator();
// 
// var updating = false;
// var loadingRow = Ti.UI.createTableViewRow({title:"Loading..."});
// 
// function beginUpdate()
// {
// 	updating = true;
// 	navActInd.show();
// 
// 	tableView.appendRow(loadingRow);
// 
// 	// just mock out the reload
// 	setTimeout(endUpdate,2000);
// }
// 
// function endUpdate()
// {
// 	updating = false;
// 
// 	tableView.deleteRow(lastRow,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.BOTTOM});
// 
// 	// simulate loading
// 	for (var c=lastRow;c<lastRow+10;c++)
// 	{
// 		tableView.appendRow({title:"Row "+(c+1)},{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.TOP});
// 	}
// 	lastRow += 10;
// 
// 	// just scroll down a bit to the new rows to bring them into view
// 	tableView.scrollToIndex(lastRow-9,{animated:true,position:Ti.UI.iPhone.TableViewScrollPosition.BOTTOM});
// 
// 	navActInd.hide();
// }
// 
// var lastDistance = 0; // calculate location to determine direction
// 
// commentsTableView.addEventListener('scroll',function(e)
// {
// 	var offset = e.contentOffset.y;
// 	var height = e.size.height;
// 	var total = offset + height;
// 	var theEnd = e.contentSize.height;
// 	var distance = theEnd - total;
// 
// 	// going down is the only time we dynamically load,
// 	// going up we can safely ignore -- note here that
// 	// the values will be negative so we do the opposite
// 	if (distance < lastDistance)
// 	{
// 		// adjust the % of rows scrolled before we decide to start fetching
// 		var nearEnd = theEnd * .75;
// 
// 		if (!updating && (total >= nearEnd))
// 		{
// 			beginUpdate();
// 		}
// 	}
// 	lastDistance = distance;
// });
