Ti.include('lib/secrets.js')

var win 			= 	Ti.UI.currentWindow;

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var yql 			= 	win.yql;
var win1 			= 	win.win1; // Window Original created on app.js
var theImage 		= 	null;

// ===============
// = Header View =
// ===============

var postHeaderView = Ti.UI.createView({
	backgroundImage: 	'images/bg_post_top_bar.png',
	left: 				0,
	top: 				0,
	height: 			65,
	width: 				1024,
	zIndex: 			2

});
win.add(postHeaderView);

// ===============
// = BACK BUTTON =
// ===============

var btn_close_post = Ti.UI.createButton({
	backgroundImage: 'images/btn_close_post.png',
	height: 16,
	width: 16,
	left: 988,
	top: 24,
	style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
});

postHeaderView.add(btn_close_post);

btn_close_post.addEventListener('click', function()
{
	win.close();
});


// =========================
// = Awesome bar TextField =
// =========================

var queryText = "";

var searchTextField = Titanium.UI.createTextField({
	value: 			queryText,
	hintText: 		'Do a search to illustrate your post',
	textAlign: 		'left',
	font: 			{fontSize:16,fontFamily:'Helvetica', fontWeight:'regular'},
	width: 			447,
	height: 		41,
	top: 			14,
	left: 			16,
	borderRadius: 	4,
	borderStyle: 	Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	keyboardType: 	Titanium.UI.KEYBOARD_DEFAULT
	// clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});

postHeaderView.add(searchTextField);

var btn_flashlight = Ti.UI.createButton({
	backgroundImage: 'images/btn_flashlight.png',
	width: 			162,
	height: 		49,
	left: 			456,
	top: 			11,
	style: 			Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	
});
postHeaderView.add(btn_flashlight);

//creates the popover for the results
var popoverSearchView = Titanium.UI.iPad.createPopover({ 
	width:330, 
	height:260,
	borderWidth: 0,
	title:'Suggested Content',
	arrowDirection:Ti.UI.iPad.POPOVER_ARROW_DIRECTION_UP
});

// ==========================
// = ADD PHOTO FROM GALLERY =
// ==========================

var btn_addPhoto = Ti.UI.createButton({
	backgroundImage: 'images/btn_add_photos.png',
	width: 			59,
	height: 		50,
	borderRadius: 	4,
	left: 			629,
	top: 			11,
	style: 			Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	
});
postHeaderView.add(btn_addPhoto);

var popoverGalleryView = Titanium.UI.createView({
	title: 		'Add a photo',
	left: 		487,
	top: 		76,
	width:      330
});
postHeaderView.add(popoverGalleryView);


// build the Photo Gallery popover
btn_addPhoto.addEventListener('click', function()
{
	Ti.API.info('Dialog Open Gallery was clicked');
	
	Ti.Media.openPhotoGallery({

		success:function(event)
		{
			handleImageEvent(event);
		},
		cancel:function()
		{

		},
		error:function(error)
		{
			Ti.API.debug('Photo Gallery Message: ' + JSON.stringify(error));
			var a = Titanium.UI.createAlertDialog({ 
		  	    title:'Uh Oh...',
		  	    message: 'We had a problem reading from your photo gallery - please try again'
		  	  });
		  		a.show();
		},
		allowEditing:false,
		popoverView:popoverGalleryView,
		arrowDirection:Ti.UI.iPad.POPOVER_ARROW_DIRECTION_UP,
		mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
	});

});

		
// ===============
// = POST BUTTON =
// ===============

var btn_post = Ti.UI.createButton({
	//title:'Show Popover 1',
	backgroundImage: 'images/btn_post_top.png',
	height:85,
	width:192,
	left: 800,
	top:-10
});
postHeaderView.add(btn_post);


// ======================
// = END OF THE TOP BAR =
// ======================

// =============
// = EDIT VIEW =
// =============

var editView = Titanium.UI.createScrollView({
	left: 		0,
	top: 		66,
	width:      '100%',
	height:     683,
	contentWidth: 1024,
	contentHeight:'auto',
	showVerticalScrollIndicator:true,
	showHorizontalScrollIndicator:false
});
win.add(editView);

var editTitleField = Titanium.UI.createTextField({
	value: 			'',
	hintText: 		'Add Title',
	textAlign: 		'center',
	font: 			{fontSize:26,fontFamily:'Helvetica', fontWeight:'bold'},
	width: 			970,
	height: 		55,
	top: 			0,
	left: 			16,
	borderStyle: 	Titanium.UI.INPUT_BORDERSTYLE_NONE,
	keyboardType: 	Titanium.UI.KEYBOARD_DEFAULT,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});

editView.add(editTitleField);

var dotted_lineView = Titanium.UI.createView({
	backgroundImage: 'images/dotted_line.png',
	top:56,
	left: 0,
	width: 1024,
	height: 2
});
editView.add(dotted_lineView);


//Create Image view to display Photo
var viewContainerPhoto = Titanium.UI.createView({
	top: 			79,
	left: 			33,	
	width: 			'auto',
	height: 		'auto',
	borderRadius: 	0,
	visible: 		false,
	zIndex: 		2
});
editView.add(viewContainerPhoto);

//Create Image view to display Photo from Selection from the Gallery
var img = Titanium.UI.createImageView({
	img: 		theImage,
	width: 		'auto',
	height: 	'auto'
});
viewContainerPhoto.add(img);

//Photo delete Button
var btn_photo_close = Titanium.UI.createButton({
	backgroundImage:'images/btn_close_gray.png',
	width: 			22,
	height: 		22,
	top: 			2
});
viewContainerPhoto.add(btn_photo_close);

//Main TextArea

var postText = '';

var textArea = Titanium.UI.createTextArea({
	value: postText,
	height: 		200,
	width: 			954,
	top: 			79,
	font: 			{fontSize:16,fontFamily:'Helvetica', fontWeight:'regular'},
	color: 			'#666',
	// backgroundColor: 'blue',
	textAlign: 		'left',
	appearance: 	Titanium.UI.KEYBOARD_APPEARANCE_ALERT,	
	keyboardType: 	Titanium.UI.KEYBOARD_DEFAULT,
	//returnKeyType:Titanium.UI.RETURNKEY_EMERGENCY_CALL,
	suppressReturn: false,
	zIndex: 		0
	
});
editView.add(textArea);

//Temporary Text when open the New Post Window, helping users to know where to click
var tempPostLabel = Titanium.UI.createLabel({
	text: 		'write your post here',
	align: 		'center',
	color: 		'#CCC',
	top: 		320,
	left: 		300,
	width: 		800,
	height: 	100,
	font: 		{fontSize:50, fontFamily:'Helvetica', fontWeight:'bold'},
	zIndex: 	1
});
editView.add(tempPostLabel);

if (postText == ''){
	tempPostLabel.show();	
}


// White Gradient in the Bottom
var whiteShadow = Titanium.UI.createImageView({
	image: 'images/white_shadow.png',
	bottom: 	0,
	left: 		0,
	width: 		1024,
	height: 	91
});
win.add(whiteShadow);

//Disclaimer
var disclaimerLabel = Titanium.UI.createLabel({
	text: 		'Don’t infringe copyright or post adult content. Check the Community Guidelines for more information. Your Post will be shared via Yahoo! Updates. ',
	color: 		'#CCC',
	width: 		800,
	height: 	15,
	font: 		{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'},
	bottom: 	18
});
win.add(disclaimerLabel);

// =============
// = LISTENERS =
// =============

// ======================
// = AWESOME SEARCH BAR =
// ======================

var monitor_started = false;
var monitor_value;
var last_monitor_value;

var text_change_monitor = function(new_monitor_value) {
	monitor_value = new_monitor_value;
	if (!monitor_started) {
		monitor_started = true;
		setInterval(monitor, 1000);
	}
};

var monitor = function() {
	if (monitor_value) {
		if (monitor_value == last_monitor_value) {
			Ti.App.fireEvent("showAwesomeSearch", {searchType: 0});
		}
		last_monitor_value = monitor_value;
	}
};

//Captures the value on the textArea form and hide hintText
searchTextField.addEventListener('change', function(e)
{	
	
	Ti.API.info('Awesome Bar form: you typed ' + e.value + ' act val ' + searchTextField.value);
	queryText = searchTextField.value;
	
	var resultsTableView = Ti.UI.createTableView({
		top:50,
		height:204
	});

	popoverSearchView.add(resultsTableView);
	
	// Tabs
	var tabsButtons = [
		{image:'images/tab_icon_video.png'},
		{image:'images/tab_icon_foto.png'},
		{image:'images/tab_icon_web.png'},	
		{image:'images/tab_icon_twitter.png'}	
	];
	var searchTabs = Titanium.UI.createTabbedBar({
		labels:tabsButtons,
		backgroundColor:'#333',
		top:0,
		height:49,
		style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
		index:0,
	});

	popoverSearchView.add(searchTabs);
	
	Ti.App.addEventListener('showAwesomeSearch', function (e) {
	
		Ti.API.info("####### Type of search: " + e.searchType);
	
		switch(e.searchType) {
		
			case 0: // Video 
		
				Ti.API.info("####### Video Search ");
			
				yqlQuery = "select * from youtube.search where query='" + queryText + "'";

				var yqlData = yql.query(yqlQuery);
				var videos = yqlData.query.results.video;

				//Loop to present the Search Results for YouTube
				var results = [];
				for (var c=0 ; c < videos.length ; c++)	
				{
					var video = videos[c];

					var thumb = video.thumbnails.thumbnail[0].content;

					var row = Ti.UI.createTableViewRow({height:78});

					var title = Ti.UI.createLabel({
						text: video.title,
						height:50,
						width: 192,
						left:110,
						textAlign:'left',
						font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'regular'},
					});

					var image = Ti.UI.createImageView({
						image : thumb,
						backgroundColor: 'black',
						height:75,
						width:100,
						left:2,
						defaultImage:'images/default_img.png'
					});
				
					var img_play_btn = Titanium.UI.createImageView({
			            image:'images/play.png',
			            top:20,
			            left:30,
			            width:37,
			            height:37
			        });

					row.add(image);
			        row.add(img_play_btn);
					row.add(title);
					results[c] = row;
				}
				resultsTableView.setData(results);
				resultsTableView.scrollToIndex(0,{animated:true})
			
				break;
			
			case 1: // Flickr
		
				Ti.API.info("####### Photo Search ");
		
				yqlQuery = "SELECT * FROM flickr.photos.search WHERE text='" + queryText + "' AND license='4'";

				var yqlData = yql.query(yqlQuery);
				var photos = yqlData.query.results.photo;

				//Loop to present the Search Results for Flickr
				var results = [];
				
				for (var c=0 ; c < photos.length ; c++)	
				{
					var photo = photos[c];
				
					// form the flickr url
					var thumb = 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_t_d.jpg';

					var row = Ti.UI.createTableViewRow({height:78});

					var title = Ti.UI.createLabel({
						text: photo.title,
						height:55,
						width: 200,
						left:110,
						textAlign:'left',
						font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'regular'},
					});

					var image = Ti.UI.createImageView({
						image : thumb,
						backgroundColor: 'black',
						height:75,
						width:100,
						left:2,
						defaultImage:'images/default_img.png'
					});

					row.add(image);
					row.add(title);
					results[c] = row;
				}
				resultsTableView.setData(results);
				resultsTableView.scrollToIndex(0,{animated:true})

				break;
			
			case 2: // Web Search
		
				Ti.API.info("####### Web Search ");
		
				yqlQuery = "SELECT title, abstract FROM search.web WHERE query='" + queryText + "'";

				var yqlData = yql.query(yqlQuery);
				var items = yqlData.query.results.result;

				//Loop to present the Search Results from the Web
				var results = [];

				for (var c=0 ; c < items.length ; c++)	
				{
					var item = items[c];
				
					var row = Ti.UI.createTableViewRow({height:78});
				
					var titleStripped = item.title.replace(/(<([^>]+)>)/ig,"").replace(/&.+;/,"");

					var title = Ti.UI.createLabel({
						text: titleStripped,
						width: 310,
						height:15,
						top: 10,
						left:10,
						textAlign:'left',
						font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'bold'}
					});
					row.add(title);
				
					if (item.abstract != null) {
					
						var abstractContent = item.abstract;

						var abstractStripped = abstractContent.replace(/(<([^>]+)>)/ig,"").replace(/&.+;/,"");

						var abstract = Ti.UI.createLabel({
							text: abstractStripped,
							height:50,
							width: 310,
							top: 25,
							left: 10,
							textAlign:'left',
							font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'regular'}
						});
					
						row.add(abstract);
					}
				
					results[c] = row;
				}
				resultsTableView.setData(results);
				resultsTableView.scrollToIndex(0,{animated:true})

				break;
				
				case 3: // Twitter Search

				Ti.API.info("####### Twitter Search ");

				yqlQuery = "SELECT * FROM twitter.search WHERE q='" + queryText + "'";

				var yqlData = yql.query(yqlQuery);
				var items = yqlData.query.results.results;

				//Loop to present the Search Results from the Web
				var results = [];

				for (var c=0 ; c < items.length ; c++)	
				{
					var item = items[c];

					var row = Ti.UI.createTableViewRow({height:78});
					
					var avatar = Ti.UI.createImageView({
						image : item.profile_image_url,
						backgroundColor: 'black',
						height:48,
						width:48,
						top:10,
						left:2,
						defaultImage:'images/default_img_avatar.png'
					});

					row.add(avatar);

					var username = Ti.UI.createLabel({
						text: '@' + item.from_user,
						width: 250,
						height:15,
						top: 8,
						left:55,
						textAlign:'left',
						font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'bold'}
					});
					row.add(username);

					var tweet = Ti.UI.createLabel({
						text: item.text,
						height:52,
						width: 270,
						top: 23,
						left: 55,
						textAlign:'left',
						font:{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'}
					});
					
					row.add(tweet);
			
					results[c] = row;
				}
				resultsTableView.setData(results);
				resultsTableView.scrollToIndex(0,{animated:true})

				break;
		
		}
	
		//show the Popover
		popoverSearchView.show({
			view:btn_flashlight,
			animated:true,
		});
	
	});
	

	
	//Tabs listeners
	searchTabs.addEventListener('click',function(e) {
		switch(e.index) {
			case 0: // Video
				Ti.App.fireEvent("showAwesomeSearch", {
					   searchType: 0
				});
				break;
		
			case 1: // Flickr
				Ti.App.fireEvent("showAwesomeSearch", {
					   searchType: 1
				});
				break;	
		
			case 2: // Web Search
				Ti.App.fireEvent("showAwesomeSearch", {
					   searchType: 2
				});
				break;
			case 3: // Twitter Search
				Ti.App.fireEvent("showAwesomeSearch", {
					   searchType: 3
				});
				break;
	
		}
	});
	
	Ti.App.fireEvent("showAwesomeSearch", {searchType: 0});
	
	// TODO: gc
	//text_change_monitor(queryText);
});

// ===========================
// = TEXT AREA FORM HANDLERS =
// ===========================

// Hide Text hint on Text Area
tempPostLabel.addEventListener('touchend', function(e) {
	Ti.API.info('Touch End Gesture captured on Label Write your POst Here?');
	tempPostLabel.hide(); // hide the hint text when touches the TEXT AREA bar
	textArea.focus(); //Focus on the Text Area and bring up the Keyboard
});

//Captures the value on the textArea form and hide hintText
textArea.addEventListener('change', function(e) {
	Ti.API.info('textArea form: you typed ' + e.value + ' act val ' + textArea.value);
	tempPostLabel.hide(); // hide the hint text when starts using the keyboard
	postText = e.value;
});

textArea.addEventListener('focus', function(e) {
   	Ti.API.info('TextArea: focus received');
	tempPostLabel.hide(); // hide the hint text when textArea receives Focus
	
});

// =======================
// = POST BUTTON TRIGGER =
// =======================

btn_post.addEventListener('click', function() {
	Ti.API.info('Post BTN fired');
	
	if ( /*(!postText || postText == null || postText = "")  && */theImage == null ) {
		
		Ti.API.debug('Error: Nothing To Post');
		
		var alertNothing = Titanium.UI.createAlertDialog({
		    title: 'Ops!',
		    message: 'Write something before hitting the Post Button',
		    buttonNames: ['OK']
		});
		
		alertNothing.show();
		
	} else {
	
		Titanium.App.fireEvent("postClicked", {
			   message: postText
		});
	}
	  
});

// ===============================
// = PHOTO GALLERY HANDLERS      =
// ===============================

function handleImageEvent(event) {
  theImage = event.media;
  theThumbnail = event.thumbnail;
  Ti.App.fireEvent("photoChosen");
}

Ti.App.addEventListener("photoChosen", function(e) {
	img.image = theImage;
	
	viewContainerPhoto.visible = true;
	
	//detects the size of the image and resizes the Photo Container
	if (img.size.width > 958) {
		viewContainerPhoto.width = 958;
		var photo_close_x = 958 - 24;
		
	} else {
		var photo_close_x = img.size.width - 24;
		
	}

	//adds the close button to the image
	btn_photo_close.left = photo_close_x;
	btn_photo_close.visible = true;
	
	// Repositioned the TextArea below the chosen photo
	var textArea_top =  img.size.height + 109;
	textArea.animate({zIndex: 0, top: textArea_top});
	
	//Repositioned the Temp Caption on top of the TextArea
	tempPostLabel.animate({zIndex: 0, top : 120 + img.size.height});
	
	//Ti.API.debug(img.size.width + "x" + img.size.height + " and Top for Text Area= " + textArea_top + " and typeOf: " + typeof(textArea_top));

});

// to remove the photo chosen
Ti.App.addEventListener("photoRemoved", function(e) {
	theImage = null;
	viewContainerPhoto.visible = false;
	viewContainerPhoto.width = 'auto';
	btn_photo_close.visible = false;
	textArea.animate({top: 79});
	tempPostLabel.animate({top: 320});
  
});

//Alert to remove the photo
var alertCloseImage = Titanium.UI.createAlertDialog({

});

// Listener to delete the Image and start again
btn_photo_close.addEventListener('click', function(e)
{
	alertCloseImage.title = 'Remove';
	alertCloseImage.message = 'Are you sure you to remove the photo?';
	alertCloseImage.buttonNames = ['Yes','No'];
	alertCloseImage.cancel = 1;
	alertCloseImage.show();
});

alertCloseImage.addEventListener('click',function(e)
{
	if (e.index == 0){
		Ti.App.fireEvent("photoRemoved");
	}
});

// Selected Text Listener
textArea.addEventListener('selected', function(e) {
	var selectedText = textArea.value.substr(e.range.location, e.range.length);
	Ti.API.debug("Selected Text: " + selectedText);
});


// ==================================
// = Uploads Image and posts on Meme =
// ==================================

Titanium.App.addEventListener("postClicked", function(e) {
	var xhr = Titanium.Network.createHTTPClient();
	
	xhr.onerror = function(e) {
		Ti.API.debug("Error getting upload URL: " + JSON.stringify(e));
	};
	
	xhr.onload = function(e) {
		Ti.API.debug('Got upload URL from API: ' + this.responseText)
		var result = JSON.parse(this.responseText);
		Ti.App.fireEvent("postClickedReadyToUpload", { url: result.url });
	};
	
 	xhr.open('GET', 'http://meme-ios-backend.appspot.com/img/upload/url');
  	xhr.send();
});

Titanium.App.addEventListener("postClickedReadyToUpload", function(e) {
	var xhr = Titanium.Network.createHTTPClient();
	
	xhr.onerror = function(e) {
		Ti.API.debug("Error when Uploading: " + JSON.stringify(e));
	};
	
	xhr.onload = function(e) {
 		Ti.API.info("Upload complete!");
		Ti.API.debug('api response was: ' + this.responseText)

		var uploadResult = JSON.parse(this.responseText);

	  	Ti.API.debug('Response Media ID: ' + uploadResult.id + ' And Response URL: ' + uploadResult.url + ' and Message: ' + postText);
		
		Titanium.App.fireEvent("postOnMeme", {
			   media_link: uploadResult.url,
			   message: postText
		});

	  	// ind.value = 0;
	
    	// setTimeout(function() {
	    //   // showChooser();
	    //   // resultLabel.text = 'Magically beaming image...';
	    // },2000);

	};
	
	xhr.onsendstream = function(e) {
		// ind.value = e.progress;
	};
	
	// "type:image/jpeg|800x600|secret:xxx"
	var auth = Ti.Utils.md5HexDigest('type:' + theImage.mimetype + '|' + theImage.width + 'x' + theImage.height + '|secret:' + meme_be_secret);
	
	Ti.API.debug('Starting upload to URL [' + e.url + ']');
	xhr.open('POST', e.url);
	xhr.setRequestHeader('X-MemeApp-AppId', 'MemeAppiPad');
	xhr.setRequestHeader('X-MemeApp-Auth', auth);
	xhr.setRequestHeader('X-MemeApp-Type', theImage.mimetype);
	xhr.setRequestHeader('X-MemeApp-Size', theImage.width + 'x' + theImage.height);
  	xhr.send({
		file: theImage
	});
  // warp.play();
});

Titanium.App.addEventListener("postOnMeme", function(e) {
	
	Ti.API.debug('MediaLink variable: ' + e.media_link );
	
	// repostActInd.show();
	
	//INSERT INTO meme.user.posts (type, content, caption) VALUES ("photo", "http://www.yahoo.com/myphoto.jpg", "this is the photo caption")
	yqlQuery = "INSERT INTO meme.user.posts (type, content, caption) VALUES ('photo', '" + e.media_link + "', '" + e.message + "')";
		Ti.API.debug(" ####### YQL Query executed: " + yqlQuery);

	var yqlInsert = yql.query(yqlQuery);
	var response = yqlInsert.query.results.status;
	
	if (response.message == "ok"){
		
			Ti.API.debug(" ####### YQL INSERT POST executed");
		
	} else {
		
		Ti.API.info("Error while Posting");
		
	}
	
});



