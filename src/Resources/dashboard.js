Ti.include('lib/commons.js');

var win = Ti.UI.currentWindow;

win.orientationModes =  [
	Titanium.UI.LANDSCAPE_LEFT,
	Titanium.UI.LANDSCAPE_RIGHT
];

var win1 = win.win1; // Window Original created on app.js
var clickTimeoutPermalink = 0; // Sets the initial ClickTimeout for Open a permalink
Ti.App.Dashboard = false; // controls if the Logged in Dashboard will be presented or not

// Creating the List Post Table View

var baseView = Ti.UI.createView({
    backgroundColor:'transparent',
	width:'100%',
	height: '100%',
	top:0
});
win.add(baseView);

Ti.App.activityPostClick = Titanium.UI.createActivityIndicator({
	style: 				Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
	top: 				60,
	backgroundColor: 	'black',
	width: 				90,
	height: 			90,
	borderRadius: 		7,
	opacity: 			0.7,
	zIndex: 			2
});

// =======================
// = DASHBOARD TABLEVIEW =
// =======================

var tableView = Titanium.UI.createTableView({
	top:0,
	backgroundColor: "transparent",
	separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
	selectionStyle:'none',
	zIndex: 3
});

baseView.add(tableView);

// ===================================================
// = CREATING POST VIEW TO EMBED IN THE TABLEVIEW =
// ===================================================
var createPostCaption = function(blackBoxView, pCaption) {
	if (pCaption != undefined && pCaption.length >0 && pCaption != "") {
		var __id_bg_caption = Titanium.UI.createView({
			backgroundColor: 	'#000',
			top: 				177,
			left: 				5,
			width: 				307,
			height: 			64,
			opacity: 			0.8,
			zIndex: 			50
		});
		blackBoxView.add(__id_bg_caption);

		//Strips HTML Entities and Tags from the Caption
		var pCaptionStripped = strip_html_entities(pCaption);

		var __id_caption = Titanium.UI.createLabel({
			color: 		'#FFF',
			text: 		pCaptionStripped,
			font: 		{
							fontSize:12,
							fontFamily:'Helvetica Neue'
						},
		    textAlign:  'left',
			top: 		14,
			left: 		14,
			width: 		274,
			height: 	34
		});
		__id_bg_caption.add(__id_caption);
	}
};

var createPost = function(pContent, pCaption, pPubId, pPostUrl, pType, pColumn, pGuid, pTypeDash) {
	var __id_img, __id_bg_caption, __id_caption;
	var widthBoxView, heightBoxView, leftColumn0, leftColumn1, leftColumn2;

	if (pTypeDash == "full") {
		//create a black box view with a unique name
		var blackBoxView = Ti.UI.createView({
			backgroundColor:'black',
			width: 317,
			height: 241,
			top: 5,
			zIndex: 0
		});

		var blackBoxLink = Ti.UI.createButton({
			backgroundColor: 		'transparent',
			width: 					317,
			height: 				241,
			top: 					0,
			backgroundSelectedImage: 'images/btn_dashboard_link.png',
			style: 					Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
			pubId: 					pPubId,
			guid: 					pGuid,
			zindex: 				99
		});

		//Click to Open Permalink
		blackBoxLink.addEventListener('click', function(e){

			clearTimeout(clickTimeoutPermalink);

			clickTimeoutPermalink = setTimeout(function() {	

				blackBoxLink.add(Ti.App.activityPostClick);
				Ti.App.activityPostClick.show();

				Ti.App.fireEvent('openPermalink', { guid: e.source.guid, pubId: e.source.pubId, x: e.globalPoint.x, y:e.globalPoint.y});

			},500);

		});

		// Sets the proper Column Left position
		if (pColumn == 0) {
			blackBoxView.left = 21;	
		} else if (pColumn == 1) {
			blackBoxView.left = 354;
		} else if (pColumn == 2) {
			blackBoxView.left = 688;
		}

		// create a post view
		if (pType == "photo") {
			var postImageView = Ti.UI.createImageView({
				image: pContent,
				top:5,
				left:5,
				width:307,
				height: 'auto',
				zIndex: 0,
				defaultImage: 'images/default_img.png'
			});
			blackBoxView.add(postImageView);

			if (pContent.indexOf(".gifa") != -1){

				var img_play_btn = Ti.UI.createImageView({
		            image:'images/play.png',
		            width:37,
		            height:37
		        });
		        blackBoxView.add(img_play_btn);
			}
		}

		// create a Video view
		if (pType == "video") {
			getVideoData(pContent, function(_videoThumb) {
				// Ti.API.debug('my video thumb is [' + _videoThumb + ']');

				var postImageView = Ti.UI.createImageView({
					image: _videoThumb,
					top:5,
					left:5,
					width:307,
					height:231,
					defaultImage: 'images/default_img_video.png'
				});
				blackBoxView.add(postImageView);

		        var img_play_btn = Ti.UI.createImageView({
		            image:'images/play.png',
		            width:37,
		            height:37
		        });
		        blackBoxView.add(img_play_btn);

				// add blackboxview again to ensure it is on top of everything
				// this is necessary because this function is executed assynchronously
				blackBoxLink.zIndex = blackBoxLink.zIndex+1;
				blackBoxView.add(blackBoxLink);


				// same thing for post caption
				createPostCaption(blackBoxView, pCaption);
			});
		}

		// create a Text view
		if(pType == "text") {

			var img_quote = Ti.UI.createImageView({
			    image:'images/quote_icon.png',
			    top:25,
			    left:15,
			    width:25,
			    height:20
			});
			blackBoxView.add(img_quote);

			var pContentStripado = strip_html_entities(pContent);

			var minipost_text = Ti.UI.createLabel({
			    color:'#FFF',
			    text: pContentStripado,
			    textAlign:'left',
			    top:20,
			    left:50,
			    width:217,
			    height:181
			});

			// Applying different Font Sizes depending on the Size of the Text Post
			if (pContentStripado.length < 30){
				minipost_text.font = {fontSize:30,fontFamily:'Helvetica Neue'};
			} else if (pContentStripado.length < 60) {
				minipost_text.font = {fontSize:25,fontFamily:'Helvetica Neue'};
			} else {
				minipost_text.font = {fontSize:18,fontFamily:'Helvetica Neue'};
			}

	   		blackBoxView.add(minipost_text);
		}

		// add the Caption to the BlackBox
		createPostCaption(blackBoxView, pCaption);

		// last but not least, add blackbox on top of everything
		blackBoxLink.zIndex = blackBoxLink.zIndex+1;
		blackBoxView.add(blackBoxLink);

		//Returns the BlackBoxView Obj with the complete design
		return(blackBoxView);
		
	} else {
		// mini post
		
		// Ti.API.info("CreatePost 'mini' GUID(" + pGuid + "), PUBID("+ pPubId + ")");
		
		//create a black box view with a unique name
		var blackBoxView = Ti.UI.createView({
			backgroundColor:'black',
			width: 235,
			height: 177,
			top: 5,
			zIndex: 0
		});

		var blackBoxLink = Ti.UI.createButton({
			backgroundColor: 		'transparent',
			width: 					235,
			height: 				177,
			top: 					0,
			backgroundSelectedImage: 'images/btn_dashboard_link.png',
			style: 					Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
			pubId: 					pPubId,
			guid: 					pGuid,
			zindex: 				99
		});

		//Click to Open Permalink
		blackBoxLink.addEventListener('click', function(e){

			clearTimeout(clickTimeoutPermalink);

			clickTimeoutPermalink = setTimeout(function() {	

				blackBoxLink.add(Ti.App.activityPostClick);
				Ti.App.activityPostClick.show();

				Ti.App.fireEvent('openPermalink', { guid: e.source.guid, pubId: e.source.pubId, x: e.globalPoint.x, y:e.globalPoint.y});

			},500);

		});

		// Sets the proper Column Left position
		if (pColumn == 0) {
			blackBoxView.left = 2;	
		} else if (pColumn == 1) {
			blackBoxView.left = 251;
		}

		// create a post view
		if (pType == "photo") {
			var postImageView = Ti.UI.createImageView({
				image: pContent,
				left:0,
				width:235,
				height: 'auto',
				zIndex: 0,
				defaultImage: 'images/default_img.png'
			});
			blackBoxView.add(postImageView);

			if (pContent.indexOf(".gifa") != -1){

				var img_play_btn = Ti.UI.createImageView({
		            image:'images/play.png',
		            width:37,
		            height:37
		        });
		        blackBoxView.add(img_play_btn);
			}
		}

		// create a Video view
		if (pType == "video") {
			getVideoData(pContent, function(_videoThumb) {
				// Ti.API.debug('my video thumb is [' + _videoThumb + ']');

				var postImageView = Ti.UI.createImageView({
					image: _videoThumb,
					left:0,
					width:235,
					height:177,
					defaultImage: 'images/default_img_video.png'
				});
				blackBoxView.add(postImageView);

		        var img_play_btn = Ti.UI.createImageView({
		            image:'images/play.png',
		            width:37,
		            height:37
		        });
		        blackBoxView.add(img_play_btn);

				// add blackboxview again to ensure it is on top of everything
				// this is necessary because this function is executed assynchronously
				blackBoxLink.zIndex = blackBoxLink.zIndex+1;
				blackBoxView.add(blackBoxLink);

			});
		}

		// create a Text view
		if(pType == "text") {

			var pContentStripado = strip_html_entities(pContent);

			var minipost_text = Ti.UI.createLabel({
			    color:'#FFF',
			    text: pContentStripado,
			    textAlign:'left',
			    top:18,
			    left:20,
			    width:194,
			    height:145
			});

			// Applying different Font Sizes depending on the Size of the Text Post
			if (pContentStripado.length < 30){
				minipost_text.font = {fontSize:20,fontFamily:'Helvetica'};
			} else if (pContentStripado.length < 60) {
				minipost_text.font = {fontSize:18,fontFamily:'Helvetica'};
			} else {
				minipost_text.font = {fontSize:12,fontFamily:'Helvetica'};
			}

	   		blackBoxView.add(minipost_text);
		}

		// last but not least, add blackbox on top of everything
		blackBoxLink.zIndex = blackBoxLink.zIndex+1;
		blackBoxView.add(blackBoxLink);

		//Returns the BlackBoxView Obj with the complete design
		return(blackBoxView);
		
	} // end mini post

};

// ===============================
// = FUNCTION TO BUILD DASHBOARD =
// ===============================

var baseViewDashboard;

var createEmptyDashboard = function () {
	// Redefining Positions and dimensions
	win.top = 51;
	win.height = 697;
	win.backgroundColor = '#0B0B0B';
	
	tableView.hide();
	
	baseViewDashboard = Ti.UI.createView({
		backgroundColor: 		'transparent',
		width: 					'100%',
		height: 				'100%',
		zIndex: 				1,
		visible: 				true
	});
	win.add(baseViewDashboard);
	
	var welcomeLabel = Titanium.UI.createLabel({
		text: 		L('welcome_message'),
		align: 		'left',
		textAlign: 	'left',
		color: 		'#FFF',
		// backgroundColor: 'red',
		top: 		44,
		left: 		63,
		width: 		900,
		height: 	65,
		font: 		{fontSize:58, fontFamily:'Gotham Rounded', fontWeight:'Light'},
		zIndex: 	1
	});
	baseViewDashboard.add(welcomeLabel);
	
	var welcomeLabel2 = Titanium.UI.createLabel({
		text: 		L('welcome_message2'),
		align: 		'left',
		textAlign: 	'left',
		color: 		'#FFF',
		top: 		95,
		left: 		63,
		width: 		900,
		height: 	60,
		font: 		{fontSize:58, fontFamily:'Gotham Rounded', fontWeight:'Light'},
		zIndex: 	1
	});
	baseViewDashboard.add(welcomeLabel2);
	
	var descriptionLabel = Titanium.UI.createLabel({
		text: 		L('welcome_description'),
		align: 		'left',
		textAlign: 	'left',
		color: 		'#999',
		top: 		146,
		left: 		63,
		width: 		770,
		height: 	60,
		font: 		{fontSize:14, fontFamily:'Helvetica', fontWeight:'Regular'},
		zIndex: 	1
	});
	baseViewDashboard.add(descriptionLabel);
	
	var goDashboardView = Ti.UI.createView({
		backgroundImage: 		'images/bg_goDashboardView.png',
		opacity: 				1,
		backgroundLeftCap: 		10,
		bottom: 				-51,
		width:  				1024,
		height: 				51,
		zIndex: 				2
	});
	baseViewDashboard.add(goDashboardView);
	
	var goDashboardButton = Ti.UI.createButton({
		backgroundImage: 	'transparent',
		title: 				L('go_dashboard_title'),
		color: 				'white',
		textAlign: 			'center',
		width: 				600,
		height: 			35,
		top: 				8,
		font: 				{fontFamily:'Helvetica',fontWeight:'bold',fontSize:18},
		opacity: 			1,
		visible: 			true
	});
	goDashboardView.add(goDashboardButton);
	
	goDashboardButton.addEventListener('click', function (e) {
		Ti.App.fireEvent('goDashboard');
	});
	
	var recommendedTitleLabel = Titanium.UI.createLabel({
		text: 		L('recommended_label_title'),
		align: 		'left',
		textAlign: 	'left',
		color: 		'#999',
		top: 		234,
		left: 		63,
		width: 		600,
		height: 	30,
		font: 		{fontSize:22, fontFamily:'Gotham Rounded', fontWeight:'Light'},
		zIndex: 	1
	});
	baseViewDashboard.add(recommendedTitleLabel);
	
	//create the ScrollView that will hold recomended posts
	var postsView = Ti.UI.createScrollView({
		backgroundColor: 				'transparent',
		layout: 						'vertical',
		width: 							490,
		height: 						370,
		top: 							270,
		left: 							63,
		contentWidth: 					490,
		contentHeight: 					'auto',
		showVerticalScrollIndicator: 	true,
		showHorizontalScrollIndicator: 	false,
		zIndex: 						1
	});
	baseViewDashboard.add(postsView);
	
	// NOT LOGGED IN SO GETS THE FEATURED POSTS
	
	Ti.App.meme.featuredPosts(235, 177, function(posts){
		var _column;
		
		// Ti.API.info("Callback called from Featured Posts [" + JSON.stringify(posts) + "]");

		for (var i=0; i<posts.length; i++) {
			var post 		= posts[i];
			var _pubId 		= post.pubid;
			var _type 		= post.type;
			var _guid 		= post.guid;
			var _originPubId = post.origin_pubid;

			switch(_type) {
				case 'photo': {	
					var _content = post.content.thumb;			
					break;
				} case 'video': {
					var _content = post.content;
					break;
				} case 'text': {
					var _content = post.content;
					break;
				} case 'audio': {
					Ti.API.debug('Skipping audio post (cannot be displayed on dashboard)');	
					continue; 
				} case 'comment': {
					Ti.API.debug('Skipping comment (cannot be displayed on dashboard)');	
					continue;
				}
			}

			if (i%2 == 0) {
				var rowView = Ti.UI.createView({
					backgroundColor: 	'transparent',
					top: 				7,
					height: 			177,
					width: 				488,
					zIndex: 			2
				});
				_column = 0;
			} else {
				_column = 1;
				postsView.add(rowView);
			}

			rowView.add(createPost(_content, "", _pubId, "", _type, _column, _guid, "mini"));

		}
	});
	
	
	
	// ================================
	// = recommended users scrollview =
	// ================================
	
	var usersTableView = Titanium.UI.createTableView({
		width: 							400,
		height: 						370,
		top: 							270,
		left: 							608,
		rowHeight: 						70,
		backgroundColor: 				"transparent",
		separatorStyle: 				Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
		selectionStyle: 				'none',
		zIndex: 						1
	});
	baseViewDashboard.add(usersTableView);
	
	var data = [];
	
	Ti.App.meme.userFeatured(6, 60, 60, function (users) {
		// Ti.API.debug("User Search Results" + JSON.stringify(users));

		for (var i=0; i<users.length; i++) {
			var user 		= users[i];
			var _guid 		= user.guid;
			var _name 		= user.name;
			var _title 		= user.title;
			var _followers  = user.followers;
			var _following  = user.following;
			var _avatar     = user.avatar_url;
			var _lang		= user.language;

			var rowView = Ti.UI.createTableViewRow({
				className: user
			});

			var guidAvatar = Titanium.UI.createImageView({
				image: _avatar.thumb,
				defaultImage: 'images/default_img_avatar.png',
				top:0,
				left:0,
				width:60,
				height:60,
				zIndex:1
			});
			rowView.add(guidAvatar);

			var nameLabel = Titanium.UI.createLabel({
				text: 		strip_html_entities(_title),
				align: 		'left',
				textAlign: 	'left',
				color: 		'#FFF',
				top: 		4,
				left: 		110,
				width: 		290,
				height: 	29,
				font: 		{fontSize:18, fontFamily:'Helvetica', fontWeight:'Bold'},
				zIndex: 	1
			});
			rowView.add(nameLabel);

			var iconGraphic = Ti.UI.createImageView({
				image: 			'images/icon_graphic_small.png',
				top: 			42,
				left: 			73,
				width: 			10,
				height: 		8
			});
			rowView.add(iconGraphic);

			var followLabel = Ti.UI.createLabel({
				color: 			'#666',
				text: 			L('followers') + _followers + L('following') + _following,
				textAlign: 		'left',
				font: 			{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'},
				top: 			37,
				left: 			iconGraphic.left + iconGraphic.width + 10,
				height: 		20,
				width: 			260
			});	
			rowView.add(followLabel);

			var btn_follow = Ti.UI.createButton({
				top: 						7,
				left: 						73,
				width: 						24,
				height: 					24,
				_title: 					_title,
				_guid: 						_guid,
				// updateFollowing: 			null,
				style: 						Titanium.UI.iPhone.SystemButtonStyle.PLAIN
			});
			rowView.add(btn_follow);

			rowView.updateFollowing = null;
			if (Ti.App.meme.isFollowing(_guid)) {
				btn_follow.backgroundImage = 'images/btn_icon_following.png';
				rowView.updateFollowing = Ti.App.meme.unfollow;
			} else {
				btn_follow.backgroundImage = 'images/btn_icon_follow.png';
				rowView.updateFollowing = Ti.App.meme.follow;
			}

			data.push(rowView);

		}

		usersTableView.setData(data);

		usersTableView.addEventListener('click', function(e) {
			if (e.source._guid) {

				var btn_follow = e.source; // gets the source of the click

				btn_follow.hide();

				//show the go to Dashboard Button
				goDashboardView.animate({bottom: 0, duration: 400});

				var activity = Titanium.UI.createActivityIndicator({
					style: 		Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
					top: 		7,
					left: 		73,
					height: 	24,
					width: 		24
				});
				e.row.add(activity);

				activity.show();

				e.row.updateFollowing(btn_follow._guid);

				setTimeout(function()
				{
					activity.hide();

					if (Ti.App.meme.isFollowing(e.source._guid)) {
						btn_follow.backgroundImage = 'images/btn_icon_following.png';
						e.row.updateFollowing = Ti.App.meme.unfollow;
					} else {
						btn_follow.backgroundImage = 'images/btn_icon_follow.png';
						e.row.updateFollowing = Ti.App.meme.follow;
					}

					btn_follow.show();
				},1000);
			}	

		});
		
	});

	
	// open Main Window from app.js with Transition
	win1.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
	//Presents the Status Bar after launching
	Ti.UI.iPhone.showStatusBar();
	
};

//defines the variable that will hold the last timestamp from a given dashboard query
var lastTimestamp;

//variable to hold incomplete rows
var lastRow = 0;
var tempRow = null;
var tempItemRowCount = 0;
var data = [];

var getDashboardData = function (pTimestamp) {
	var posts, queryTimestamp;
	
	// Funtion That builds the Dashboard (unless user follows no one)
	function mountDashboard() {
		var itemPerRowCount = 0;

		//Defines the last post timestamp so we can paginate the Dashboard
		lastTimestamp = posts[(posts.length - 1)].timestamp;
		lastTimestamp = parseInt(lastTimestamp);

		// create THE TABLE ROWS
		for (var i=0; i<posts.length; i++) {
			var post 		= posts[i];
			var _caption 	= post.caption;
			var _pubId 		= post.pubid;
			var _postUrl 	= post.url;
			var _type 		= post.type;
			var _guid 		= post.guid;
			var _originPubId = post.origin_pubid;

			switch(_type) {
				case 'photo': {	
					var _content = post.content.thumb;			
					break;
				} case 'video': {
					var _content = post.content;
					break;
				} case 'text': {
					var _content = post.content;
					break;
				} case 'audio': {
					Ti.API.debug('Skipping audio post (cannot be displayed on dashboard)');	
					continue; 
				} case 'comment': {
					Ti.API.debug('Skipping comment (cannot be displayed on dashboard)');	
					continue;
				}
			}

			// verifies if there is any incomplete row and continues from there.
			if (tempRow != null) {

				// Ti.API.info("Temp Row Found, number of items in this Row: " + tempItemRowCount);
				itemPerRowCount = tempItemRowCount;
				var row = tempRow;

			} else {

				// Ti.API.info("Temp Row NOT Found. Creating a new Row");
				if (itemPerRowCount == 0) {
					var row = Ti.UI.createTableViewRow();
					row.height = 256;
				}

			}

			// Adds the post view to a ROW
			row.add(createPost(_content, _caption, _pubId, _postUrl, _type, itemPerRowCount, _guid, "full"));

			itemPerRowCount++;

			// Verifies if it is the third post and closes the row
			if (itemPerRowCount == 3){

					tempRow = null;
					itemPerRowCount = 0;
					lastRow += 1;
					tempItemRowCount = 0;

					if (pTimestamp == null) {
						data.push(row);			
						// Ti.API.info("###### Just ADDED row number: " + lastRow );

					} else {

						tableView.appendRow(row,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.NONE});
						//	Ti.API.info("###### APPENDING Row number: " + lastRow );
					}

			} else {

				//Ti.API.info("Temp Row Updated, number of items on TEMP Row: " + itemPerRowCount);

				// if loop ends with an incomplete row it safes this ROW for the next request
				tempRow = row;
				tempItemRowCount = itemPerRowCount;

			}

		} //End FOR loop

		//Sets the new Table rows with updated Posts
		if (pTimestamp == null) {
			Ti.API.debug("reseting TableView data");
			tableView.setData(data);
		}

		// open Main Window from app.js with Transition
		win1.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
		//Presents the Status Bar after launching
		Titanium.UI.iPhone.showStatusBar();

		if (Ti.App.oAuthAdapter.isLoggedIn() && (lastRow < 3)) {
			Ti.API.info('Less than 3 rows on dashboard (currently ' + lastRow + '), will fetch more posts...');
			getDashboardData(lastTimestamp);
		}
	};
	
	
	// ====================================
	// = CHOOSES WHICH DASHBOARD TO BUILD =
	// ====================================
	
	if (Ti.App.oAuthAdapter.isLoggedIn()) {
		
		var userInfo = Ti.App.meme.userInfo('me', 35, 35, false); // without cache
		
		if (userInfo.following == 0) {
			Ti.API.info(" ####### STARTING DASHBOARD EMPTY (LOGGED IN) ##########");

			// Reload TableVIew or First Build
			createEmptyDashboard();
			
		} else {

			//confirms the proper size
			win.top = 59;
			win.height = 689;
			win.backgroundColor = 'transparent';
			tableView.show();
			
			// User is Following some blogs so must show the Logged In Dashboard
			if (pTimestamp == null) {
				// Reload TableVIew or First Build
				//	clear Table
				lastRow = 0;
				data = [];
				tempRow = null;
				tempItemRowCount = 0;
				queryTimestamp = null;
			} else {
				queryTimestamp = pTimestamp - 1;
			}

			posts = Ti.App.meme.dashboardPosts(307, 231, queryTimestamp);
			mountDashboard();

		}
		
	} else {
		Ti.API.info(" ####### STARTING FEATURED DASHBOARD (NOT LOGGED IN) ##########");
		
		// NOT LOGGED IN SO GETS THE FEATURED POSTS
		posts = Ti.App.meme.featuredPosts(307, 231);
		
		// Reload TableVIew or First Build
		lastRow = 0;
		data = [];
		tempRow = null;
		tempItemRowCount = 0;
		mountDashboard();
	}

	
};

// Gradient in the end of the screen to smooth the design
var dashboardShadow = Titanium.UI.createImageView({
	image: 				'images/shadow.png',
	backgroundColor: 	"transparent",
	bottom: 			0,
	left: 				0,
	width: 				1024,
	height: 			26,
	zIndex: 			999
});
win.add(dashboardShadow);

// ==================
// = CLICK LISTENER =
// ==================

tableView.addEventListener('click', function(e) {
// 	
// 	// clearTimeout(clickTimeoutPermalink);
// 	// 
// 	// clickTimeoutPermalink = setTimeout(function() {	
// 	// 		Ti.API.debug('table view row clicked - Guid: ' + e.source.guid + ' e PubID: ' + e.source.pubId + ' e Column: ' + e.source.column + ' e Row number: ' + e.index);
// 	// 		Ti.App.fireEvent('openPermalink', { guid: e.source.guid, pubId: e.source.pubId, column: e.source.column, rowNumber: e.index});
// 	// 	
// 	// },500);
// 
});

// =======================
// = SCROLL DOWN LOADING =
// =======================
var updating = false;

var loadingRow = Ti.UI.createTableViewRow({
	className: "LoadingRow", 
	height: 100
});

var bellowActInd = Titanium.UI.createActivityIndicator({
	left:420,
	bottom:50,
	width:30,
	height:30
});

var loadingLabel = Ti.UI.createLabel({
	text: L('loading_message'),
	width: 200,
	bottom: 50,
	height: 30,
	color: 'white',
	textAlign: 'center',
	font:{fontSize:18,fontWeight:"bold"}
});

loadingRow.add(bellowActInd);
loadingRow.add(loadingLabel);

function beginUpdate() {
	updating = true;
	bellowActInd.show();

	tableView.appendRow(loadingRow);
	
	setTimeout(endUpdate,2500);
}

function endUpdate() {

	updating = false;
	
	tableView.deleteRow(lastRow,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
	
	// Get posts from Dashboard
	getDashboardData(lastTimestamp);
	
	bellowActInd.hide();	
}

var lastDistance = 0; // calculate location to determine direction

tableView.addEventListener('scroll',function(e)
{	
	// Used for the Pull to Refresh
	var offset = e.contentOffset.y;
	var height = e.size.height;
	var total = offset + height;
	var theEnd = e.contentSize.height;
	var distance = theEnd - total;
	
	// going down is the only time we dynamically load,
	// going up we can safely ignore -- note here that 
	// the values will be negative so we do the opposite
	if (distance < lastDistance)
	{
		// adjust the % of rows scrolled before we decide to start fetching
		var nearEnd = theEnd * 0.2; 
		
		if (!updating && Ti.App.oAuthAdapter.isLoggedIn() && (total >= nearEnd))
		{
			beginUpdate();
		}
	}
	lastDistance = distance;
});

// ===================
// = PULL TO REFRESH =
// ===================

var border = Ti.UI.createView({
	backgroundColor:"black",
	height:2,
	bottom:0
})

var tableHeader = Ti.UI.createView({
	backgroundColor:"black",
	width:1024,
	height:60
});

// fake it til ya make it..  create a 2 pixel
// bottom border
tableHeader.add(border);

var arrow = Ti.UI.createView({
	backgroundImage:"images/whiteArrow.png",
	width:23,
	height:60,
	bottom:10,
    left:350
});

var actInd = Titanium.UI.createActivityIndicator({
	left:350,
	bottom:13,
	width:30,
	height:30
});

var statusLabel = Ti.UI.createLabel({
	text: L('pull_to_reload_text'),
	// left:55,
	width:220,
	bottom:30,
	height:"auto",
	color:"Gray",
	textAlign:"center",
	font:{fontSize:13,fontWeight:"bold"}
});

var lastUpdatedLabel = Ti.UI.createLabel({
	text: 			L('last_updated_text') + formatted_date(),
	width: 			220,
	bottom: 		15,
	height: 		"auto",
	color: 			"Gray",
	textAlign: 		"center",
	font: 			{fontSize:12}
});


tableHeader.add(arrow);
tableHeader.add(statusLabel);
tableHeader.add(lastUpdatedLabel);
tableHeader.add(actInd);

// if User is logged in then it will show the Pull to Refresh Feature
if (Ti.App.oAuthAdapter.isLoggedIn()) {
	tableView.headerPullView = tableHeader;
}


var pulling = false;
var reloading = false;

function beginReloading()
{
	
	//tableView.setData([]);
	setTimeout(function()
	{	
		getDashboardData(null);
		beginUpdate();

	},1000)
	
	setTimeout(endReloading,3000);
}

function endReloading()
{
	// when you're done, just reset
	tableView.setContentInsets({top:0},{animated:true});
	reloading = false;
	lastUpdatedLabel.text = L('last_updated_text') + formatted_date();
	statusLabel.text = L('pull_down_to_refresh_text');
	actInd.hide();
	arrow.show();
}

tableView.addEventListener('scroll',function(e)
{
	if (Ti.App.oAuthAdapter.isLoggedIn()) {
		
		var offset = e.contentOffset.y;
		if (offset <= -65.0 && !pulling)
		{
			var t = Ti.UI.create2DMatrix();
			t = t.rotate(-180);
			pulling = true;
			arrow.animate({transform:t,duration:180});
			statusLabel.text = L('release_to_refresh_text');
		}
		else if (pulling && offset > -65.0 && offset < 0)
		{
			pulling = false;
			var t = Ti.UI.create2DMatrix();
			arrow.animate({transform:t,duration:180});
			statusLabel.text = L('pull_down_to_refresh_text');
		}
	}
});

tableView.addEventListener('scrollEnd',function(e) {
	if (Ti.App.oAuthAdapter.isLoggedIn() && pulling && !reloading && e.contentOffset.y <= -65.0) {
		reloading = true;
		pulling = false;
		arrow.hide();
		actInd.show();
		statusLabel.text = L('reloading_message');
		tableView.setContentInsets({top:60},{animated:true});
		arrow.transform=Ti.UI.create2DMatrix();
		beginReloading();
	}
});

getDashboardData(null);

Ti.App.addEventListener('reloadDashboard', function(e) {
	beginReloading();
});

Ti.App.addEventListener('close_dashboard', function(e) {
	//Closes Dashboard Window
	win.close({opacity:0,duration:200});
});

Ti.App.addEventListener('goDashboard', function(e) {
	Ti.API.info("BaseView: " + baseViewDashboard);
	baseViewDashboard.animate({top: 768, zIndex: 0, duration: 300}, function(){
		baseViewDashboard.hide();
		getDashboardData(null);
	});
	
});
