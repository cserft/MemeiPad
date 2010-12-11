Ti.include('lib/sha1.js');
Ti.include('lib/secrets.js');
Ti.include('lib/commons.js');
Ti.include('lib/meme.js');
Ti.include('newpost_flashlight.js');

var win 			= 	Ti.UI.currentWindow;
Ti.App.newpostIsOpen = true; // controls for multiple clicks on Start new post btn

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var win1 			= 	win.win1; // Window Original created on app.js
var clickTimeout 	= 	0; 	// Sets the initial ClickTimeout for Flashlight Button
var postText 		= 	""; 
var postTitle 		= 	'';
var postBody 		= 	'';
var queryText		=	'';
var theImage 		= 	null;
var videoLink 		=   ''; 
var videoId			=	'';
var videoHtml		= 	'';

// Load post draft
if (Ti.App.Properties.hasProperty('draft_post')) {
	var draft = Ti.App.Properties.getList('draft_post');
	postTitle = draft[0];
	postBody = draft[1];
	queryText = draft[2];
	Ti.App.Properties.removeProperty('draft_post');
}

// animation on close Window
var animeClose = Titanium.UI.createAnimation({
	duration: 300,
	top: -749	
});


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
	height: 50,
	width: 49,
	left: 970,
	top: 10,
	style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
});
postHeaderView.add(btn_close_post);


// =========================
// = Awesome bar TextField =
// =========================

var searchTextField = Titanium.UI.createTextField({
	value: 			queryText,
	hintText: 		L('searchTextField_hint_text'),
	textAlign: 		'left',
	font: 			{fontSize:12,fontFamily:'Helvetica', fontWeight:'regular'},
	width: 			446,
	height: 		41,
	top: 			14,
	left: 			16,
	borderRadius: 	4,
	zIndex: 		2,
	borderStyle: 	Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	keyboardType: 	Titanium.UI.KEYBOARD_DEFAULT,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS
});
postHeaderView.add(searchTextField);

var btn_flashlight = Ti.UI.createButton({
	backgroundImage: 'images/btn_flashlight.png',
	width: 			162,
	height: 		49,
	left: 			456,
	top: 			11,
	zIndex: 		3,
	style: 			Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	
});
postHeaderView.add(btn_flashlight);

//Create Image view for the lamp animation (this is a white blur)
var lamp_bright = Titanium.UI.createImageView({
	image: 		'images/lamp_bright.png',
	left: 		468,
	top: 		12,
	width: 		37,
	height: 	38,
	zIndex: 	4,
	visible: 	false
});
postHeaderView.add(lamp_bright);

//creates the popover for the results
var popoverSearchView = Titanium.UI.iPad.createPopover({ 
	width: 				330, 
	height: 			280,
	borderWidth: 		0,
	title: 				L('popover_flashlight_title'),
	navBarHidden: 		true,
	arrowDirection: 	Ti.UI.iPad.POPOVER_ARROW_DIRECTION_UP
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
	left: 		487,
	top: 		76,
	width:      330
});
postHeaderView.add(popoverGalleryView);

// build the Photo Gallery popover
btn_addPhoto.addEventListener('click', function() {
	Ti.API.info('Dialog Open Gallery was clicked');
	
	Ti.Media.openPhotoGallery({
		success:function(event) {
			handleImageEvent(event);
		},
		cancel:function() {

		},
		error:function(error) {
			Ti.API.debug('Photo Gallery Message: ' + JSON.stringify(error));
			
			Ti.API.debug('Error on Gallery');
			// var a = Titanium.UI.createAlertDialog({ 
			// 		  	    title:'Uh Oh...',
			// 		  	    message: 'We had a problem reading from your photo gallery - please try again'
			// 		  	});
			// 		  	a.show();
		},
		allowEditing:false,
		popoverView:popoverGalleryView,
		arrowDirection:Ti.UI.iPad.POPOVER_ARROW_DIRECTION_UP,
		mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
	});

});
		
// ===============
// = POST BUTTON =
// ===============
var btn_post = Ti.UI.createButton({
	backgroundImage: L('path_btn_post_top_background_image'),
	height: 					85,
	title: 						L('btn_post_top_title'),
	color: 						'white',
	textAlign: 					'center',
	font: 						{fontSize:22, fontFamily:'Helvetica Neue', fontWeight:'bold'},
	width: 						192,
	left: 						780,
	top: 						-10
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
	value: 			postTitle,
	hintText: 		L('editTitleField_hint_text'),
	textAlign: 		'left',
	font: 			{fontSize:26,fontFamily:'Helvetica', fontWeight:'bold'},
	width: 			950,
	height: 		55,
	top: 			0,
	left: 			38,
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
	// backgroundColor: 'red',
	zIndex: 		2
});
editView.add(viewContainerPhoto);

// Create our Webview to render the Video Preview
var webViewPreview = Ti.UI.createWebView({
        html: videoHtml,
		top:0,
        left:0,
		width: 650,
		height: 420,
		backgroundColor: 'transparent',
        loading: true,
		scalesPageToFit: false,
		visible: false
});

//Create Image view to display Photo from Selection from the Gallery
var img = Titanium.UI.createImageView({
	// image: 		theImage,
	left: 		0,
	top: 		0,
	width: 		'auto',
	height: 	'auto'
});
viewContainerPhoto.add(img);

//Photo delete Button
var btn_photo_close = Titanium.UI.createButton({
	backgroundImage:'images/btn_close_gray.png',
	width: 			19,
	height: 		19,
	top: 			0,
	left: 			0,
	zIndex: 		10
});
viewContainerPhoto.add(btn_photo_close);

var actAjax = Ti.UI.createActivityIndicator({
	zIndex: 		90,
	visible: 		false,
	style: 			Ti.UI.iPhone.ActivityIndicatorStyle.DARK
});
viewContainerPhoto.add(actAjax);

//Main TextArea
var textArea = Titanium.UI.createTextArea({
	value: 			postBody,
	height: 		600,
	width: 			900,
	left: 			38,
	top: 			79,
	font: 			{fontSize:16,fontFamily:'Helvetica', fontWeight:'regular'},
	color: 			'#666',
	textAlign: 		'left',
	// backgroundColor: 	'red',
	appearance: 	Titanium.UI.KEYBOARD_APPEARANCE_ALERT,	
	keyboardType: 	Titanium.UI.KEYBOARD_DEFAULT,
	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	suppressReturn: false,
	zIndex: 		0
	
});
editView.add(textArea);

//Temporary Text when open the New Post Window, helping users to know where to click
var tempPostLabel = Titanium.UI.createLabel({
	text: 		L('tempPostLabel_text'),
	align: 		'center',
	color: 		'#CCC',
	top: 		300,
	width: 		600,
	height: 	100,
	font: 		{fontSize:50, fontFamily:'Helvetica', fontWeight:'bold'},
	zIndex: 	1
});

if (postBody == ''){
	editView.add(tempPostLabel);
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

//Disclaimer Community Guidelines
var disclaimerLabel1 = Titanium.UI.createLabel({
	text: 		L('disclaimer_copyright_guidelines'),
	color: 		'#CCC',
	width: 		525,
	height: 	15,
	left: 		(1024-(525+285))/2, // Total width of the screen (1024) - (width of disclaimer1 + width of disclaimer2), the result divided by 2
	font: 		{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'},
	bottom: 	18,
	zIndex: 	3
});
win.add(disclaimerLabel1);

//Disclaimer Settings Yahoo! Updates.
var disclaimerLabel2 = Titanium.UI.createLabel({
	text: 		L('disclaimer_yahoo_updates'),
	color: 		'#CCC',
	width: 		280,
	height: 	15,
	left: 		disclaimerLabel1.left + disclaimerLabel1.width + 5,
	font: 		{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'},
	bottom: 	18,
	zIndex: 	3
});
win.add(disclaimerLabel2);

// =============================================
// = DISCLAIMERS LISTENERS TO OPEN THE BROWSER =
// =============================================

//Alert to Open Safari for the Post Permalink
var alertOpenPermalink = Titanium.UI.createAlertDialog({
	title: L('open_link_title'),
	message: L('open_link_message'),
	buttonNames: [L('btn_alert_OK'),L('btn_alert_CANCEL')],
	cancel: 1
});

disclaimerLabel1.addEventListener("click", function(e)
{
	alertOpenPermalink.url = L('guidelines_url');
	alertOpenPermalink.show();
});

disclaimerLabel2.addEventListener("click", function(e)
{
	alertOpenPermalink.url = L('settings_url');
	alertOpenPermalink.show();
});


// Opens the Permalink page on Safari
alertOpenPermalink.addEventListener('click',function(e)
{
	if (e.index == 0){
		// Open Link to the Guidelines Page on Safari
		Ti.Platform.openURL(alertOpenPermalink.url);	
	}
});

// Upload Progress Bar
var progressView = Titanium.UI.createView({
	top: 			300,
	width: 			350,
	height: 		80,
	borderRadius: 	5,
	backgroundColor: 'black',
	visible: false,
	zIndex:99
});
win.add(progressView);

var actInd = Ti.UI.createActivityIndicator({
	top: 10, 
	left: 25,
	height: 50,
	width: 10,
	style:Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
});
progressView.add(actInd);

var ind = Ti.UI.createProgressBar({
	width: 250,
	height: 60,
	min: 0,
	max: 1,
	value: 0,
	style:Titanium.UI.iPhone.ProgressBarStyle.BAR,
	message: '',
	font:{fontSize:16, fontWeight:'bold'},
	color:'white'
});
progressView.add(ind);

function showProgressView (pCommand, pMessage) {
	
	if (pCommand == "hide") { // Hides the Progress bar
		progressView.hide();
		ind.hide();
		actInd.hide();
		ind.message = '';	
		
	} else { // Hides the Progress bar
		progressView.show();
		ind.show();
		actInd.show();
		ind.message = pMessage;	
	}	
}

// =============
// = LISTENERS =
// =============

//Close Button
btn_close_post.addEventListener('click', function() {
	
	win.close(animeClose);
	Ti.App.newpostIsOpen = false; // controls for multiple clicks on Start new post btn
	
	//Closes the Keyboard if open
	Ti.App.fireEvent('hide_keyboard');
	
	Ti.API.debug('Saving post on properties: title[' + editTitleField.value + '], body[' + textArea.value + '], Flashlight [' + searchTextField.value + ']');
	Ti.App.Properties.setList('draft_post', [ editTitleField.value, textArea.value, searchTextField.value ]);
});

// ================================
// = AWESOME BAR SEARCH LISTENERS =
// ================================
// Flashlight button listener
btn_flashlight.addEventListener('click', function() {
	
	clearTimeout(clickTimeout);
	
	clickTimeout = setTimeout(function() {	
		//Ti.API.info('queryText when btn_flashlight clicked: ' + queryText);
		flashlight_show();
	},500);
	
});

searchTextField.addEventListener('change', function(e) {
//	Ti.API.info('Awesome Bar form: you typed ' + e.value + ' act val ' + searchTextField.value);
	flashlight_text_change_monitor(searchTextField.value);
});

// ===========================
// = TEXT AREA FORM HANDLERS =
// ===========================
// Hide Text hint on Text Area
tempPostLabel.addEventListener('touchend', function(e) {
	tempPostLabel.hide(); // hide the hint text when touches the TEXT AREA bar
	textArea.focus(); //Focus on the Text Area and bring up the Keyboard
});

//Captures the value on the textArea form and hide hintText
textArea.addEventListener('change', function(e) {
	tempPostLabel.hide(); // hide the hint text when starts using the keyboard
	Ti.API.debug('text is: ' + e.value);
	postBody = e.value;
});

//TextArea Clear Button
var btn_text_clear = Titanium.UI.createButton({
	backgroundImage:'images/btn_close_gray.png',
	width: 			19,
	height: 		19,
	top: 			110,
	right: 			45,
	zIndex: 		2,
	visible: 		true
});

textArea.addEventListener('focus', function(e) {
   	Ti.API.info('TextArea: focus received');
	tempPostLabel.hide(); // hide the hint text when textArea receives Focus
	editView.add(btn_text_clear);
});

textArea.addEventListener('blur', function(e) {
	editView.remove(btn_text_clear);
	editView.scrollTo(0, {animated:true});
});

btn_text_clear.addEventListener('click', function(e) {
	tempPostLabel.show(); // hide the hint text when textArea receives Focus
	editView.remove(btn_text_clear);
	textArea.blur();
	postBody = '';
	textArea.value = '';
});

//Captures the value on the Post Title
editTitleField.addEventListener('change', function(e) {
	Ti.API.info('Post Title: you typed ' + e.value + ' act val ' + editTitleField.value);
	postTitle = editTitleField.value;
});

// =======================
// = POST BUTTON TRIGGER =
// =======================

// This is the FULL Post variable: Title + Body

btn_post.addEventListener('click', function() {
	//Closes the Keyboard if open
	Ti.App.fireEvent('hide_keyboard');
	
	//merging Post Body + Post Title
	if (postTitle != ""){
		postText = "<strong>" + postTitle + "</strong><p>\n</p>";
	}
	postText = postText + postBody;
	postText = postText.replace(/(\')/g, '\\$1');
	
	Ti.API.info("PostText Has the value: " + postText);
	
	if (theImage == null) {
		Ti.API.info("No Image to Upload");
		
		if ( postText == null || postText == "" ) {
			Ti.UI.createAlertDialog({ 
				title: L('oops_alert_title'),
			    message: L('post_message_empty'),
				buttonNames: [L('btn_alert_OK')]
			}).show();
		} else {
			//Shows the Upload Progress bar
			showProgressView ('show', L('preparing_to_post_message'));
			ind.value = 0;
			btn_post.enabled = false;
			
			Titanium.App.fireEvent("postOnMeme", {
				message: postText,
				postType: "text"
			});
		}
	} else {
		Titanium.App.fireEvent("postClicked", {
			   message: postText
		});
	}
});

// ===============================
// = PHOTO GALLERY HANDLERS      =
// ===============================

var handleImageEvent = function(event) {
  theImage = event.media;
  Ti.App.fireEvent("photoChosen");
};

// Get smaller sizes to downsize images
var getImageDownsizedSizes = function(max_width, max_height, original_img) {
    var w = original_img.width, h = original_img.height;
    if (w > max_width) {
        w = max_width;
        h = (max_width * original_img.height) / original_img.width;
    }
    if (h > max_height) {
        h = max_height;
        w = (max_height * original_img.width) / original_img.height;
    }
    return { width: w, height: h };
};

Ti.App.addEventListener("photoChosen", function(e) {
	
	var textArea_top, photo_close_x;
	
	//Closes the Keyboard if open
	Ti.App.fireEvent('hide_keyboard');

	if (e.typePhoto == 'flashlight') {
		//FlashLight Content was clicked
	
		// If the content from FlashLight is a Video then presents a Video Player
		if (theImage.indexOf("ytimg") != -1) {
			
			webViewPreview.html = '';
			// IF AN IMAGE WAS IN THE PREVIEW BEFORE IT REMOVES IT
			img.image = null;
			
			videoHtml = '<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/' + videoId + '" frameborder="0"></iframe>';
			
			// Create our Webview to render the Video
			webViewPreview.html = videoHtml;
			webViewPreview.visible = true;
			viewContainerPhoto.add(webViewPreview);
			viewContainerPhoto.show();
			actAjax.show();
			
		} else if (theImage.indexOf("vimeo") != -1) { 
			
			webViewPreview.html = '';
			// IF AN IMAGE WAS IN THE PREVIEW BEFORE IT REMOVES IT
			img.image = null;

			// Create our Webview to render the Video
			webViewPreview.html = videoHtml;
			webViewPreview.visible = true;
			viewContainerPhoto.add(webViewPreview);
			viewContainerPhoto.show();
			actAjax.show();

		} else {
			// IS A PHOTO
			// IF AN IMAGE WAS IN THE PREVIEW BEFORE IT REMOVES IT
			img.image = null;
				
			webViewPreview.html = '';
			
			// HTML for the Photo
			photoHtml = '<img src="' + theImage + '">';
			
			// Create our Webview to render the Photo
			webViewPreview.html = photoHtml;
			webViewPreview.visible = true;
			viewContainerPhoto.add(webViewPreview);
			viewContainerPhoto.show();
			actAjax.show();
		}
		
		webViewPreview.addEventListener('load', function(){
			actAjax.hide();
			
			//adds the close button to the image
			photo_close_x = 0;
			btn_photo_close.left = 0;
			btn_photo_close.visible = true;
		});
		
		// Repositioned the TextArea below the chosen photo
		textArea_top =  webViewPreview.height + 95;
		btn_text_clear.top = textArea_top+20;
		textArea.animate({zIndex: 0, top: textArea_top});

		//Repositioned the Temp Caption on top of the TextArea
		tempPostLabel.animate({zIndex: 0, top: 100 + viewContainerPhoto.height});

	} else {
		// IF IT IS A LOCAL FILE THEN
		
		// IF AN VIDEO WAS IN THE PREVIEW BEFORE IT REMOVES IT
		webViewPreview.html = '';
		viewContainerPhoto.remove(webViewPreview);
	
		// set smaller size for preview
		preview_sizes = getImageDownsizedSizes(500, 500, theImage);
	
		// img properties
		img.image = theImage.imageAsResized(preview_sizes.width, preview_sizes.height);
		img.top = 10;
		img.left = 10;
		img.height = preview_sizes.height;
		img.width = preview_sizes.width;
		viewContainerPhoto.visible = true;
		
		//adds the close button to the image
		photo_close_x = 0;
		btn_photo_close.left = 0;
		btn_photo_close.visible = true;
		
		// Repositioned the TextArea below the chosen photo
		textArea_top =  img.height + 105;
		btn_text_clear.top = textArea_top+20;
		textArea.animate({zIndex: 0, top: textArea_top});

		//Repositioned the Temp Caption on top of the TextArea
		tempPostLabel.animate({zIndex: 0, top: 120 + img.height});
	}
});

// to remove the photo chosen
Ti.App.addEventListener("photoRemoved", function(e) {
	theImage = null;
	webViewPreview.html = '';
	viewContainerPhoto.remove(webViewPreview);
	viewContainerPhoto.hide();
	viewContainerPhoto.width = 'auto';
	btn_photo_close.visible = false;
	textArea.animate({top: 100});
	btn_text_clear.top = 110;
	tempPostLabel.animate({top: 300});
});

//Alert to remove the photo
var alertCloseImage = Titanium.UI.createAlertDialog({
	title: L('remove_alert_title'),
	message: L('remove_alert_message'),
	buttonNames: [L('btn_alert_YES'),L('btn_alert_NO')],
	cancel: 1
});

// Listener to delete the Image and start again
btn_photo_close.addEventListener('click', function(e) {
	alertCloseImage.show();
});

alertCloseImage.addEventListener('click',function(e) {
	if (e.index == 0) {
		Ti.App.fireEvent("photoRemoved");
	}
});

// Selected Text Listener
// textArea.addEventListener('selected', function(e) {
// 	var selectedText = textArea.value.substr(e.range.location, e.range.length);
// 	Ti.API.debug("Selected Text: " + selectedText);
// });


// ==================================
// = Uploads Image and posts on Meme =
// ==================================

Titanium.App.addEventListener("postClicked", function(e) {
	//DISABLES THE POST BUTTON
	btn_post.enabled = false;
	
	//Shows the Upload Progress bar
	showProgressView('show',  L('preparing_to_post_message'));
	
	if (theImage != null && typeof(theImage) == 'object') {
		// IF there is a Image to Upload
		var xhr = Titanium.Network.createHTTPClient();
		xhr.setTimeout(300000); // timeout to upload is 5 minutes

		xhr.onerror = function(e) {
			// Hides the Progress bar
			showProgressView('hide', null);
			Ti.API.debug("Error when Uploading: " + JSON.stringify(e));
		};

		xhr.onload = function(e) {
			// updates the Message in the Progress Bar
			showProgressView('show', L('publishing_post_meme'));

	 		Ti.API.info('Upload complete!');
			Ti.API.debug('api response was (http status ' + this.status + '): ' + this.responseText);
			
			try {
				var uploadResult = JSON.parse(this.responseText);
				
				if (uploadResult.status == 200) {
					Titanium.App.fireEvent("postOnMeme", {
						   postType: "photo",
						   media_link: uploadResult.imgurl,
						   message: postText
					});
				} else {
					throw 'Upload error: ' + uploadResult.message;
				}
			} catch(exception) {
				Ti.API.error(exception);
				showProgressView('hide', null);
				Titanium.UI.createAlertDialog({
					title: 'Error',
					message: 'Error uploading image. Please try again in a few seconds.'
				}).show();
				btn_post.enabled = true;
			}
		};

		xhr.onsendstream = function(e) {
			showProgressView('show', L('uploading_file'));
			ind.value = e.progress;
			Ti.API.debug('ONSENDSTREAM - PROGRESS: ' + e.progress);
		};

		// Resizes image before uploading
		// Max size accepted by Meme is 780x2500 px
		var new_size = getImageDownsizedSizes(780, 2500, theImage);
		theImage = theImage.imageAsResized(new_size.width, new_size.height);
		
		// Create upload signture
		var time = parseInt(timestamp()/1000);
		var signature = hex_hmac_sha1(meme_upload_secret, Ti.App.myMemeInfo.name + ':' + time);
		
		// Assembling upload URL
		// http://meme/api/upload/?t=timestamp&m=memename&s=signature
		var url = meme_upload_url + '?t=' + time + '&m=' + Ti.App.myMemeInfo.name + '&s=' + signature;

		Ti.API.debug('Will upload to URL [' + url + ']');
		
		// upload it!
		xhr.open('POST', url);
		xhr.send({
			file: theImage
		});
	
	} else if (theImage != null && typeof(theImage) == 'string' && theImage.indexOf("flickr") != -1) {
		Titanium.App.fireEvent("postOnMeme", {
			postType: "photo",
			media_link: theImage,
			message: postText
		});
		Ti.API.info("The Image IndexOf Flickr: " + theImage.indexOf("flickr"));
		
	} else if (theImage != null && typeof(theImage) == 'string' && theImage.indexOf("ytimg") != -1) {
		Titanium.App.fireEvent("postOnMeme", {
			postType: "video",
			media_link: videoLink,
			message: postText
		});
		Ti.API.info("The Image YouTube: " + theImage.indexOf("ytimg"));
	} else if (theImage != null && typeof(theImage) == 'string' && theImage.indexOf("vimeo") != -1) {
		Titanium.App.fireEvent("postOnMeme", {
			postType: "video",
			media_link: videoLink,
			message: postText
		});
		Ti.API.info("The Image YouTube: " + theImage.indexOf("ytimg"));
	} else {
		// Else is Only Text
		Titanium.App.fireEvent("postOnMeme", {
			postType: "text",
			message: postText
		});
	}
});

Titanium.App.addEventListener("postOnMeme", function(e) {
	// Verifies the Type of Post and selects the Proper recording method
	var inserted, alertInfo;
	
	if (e.postType == "photo") {
		inserted = Meme.createPhotoPost(e.media_link, e.message);
	} else if (e.postType == "text"){
		inserted = Meme.createTextPost(e.message);
		
		// updates the Message in the Progress Bar
		showProgressView('show', L('publishing_post_meme'));
		ind.value = 10;
		
	} else if (e.postType == "video"){
		inserted = Meme.createVideoPost(e.media_link, e.message);

		// updates the Message in the Progress Bar
		showProgressView('show', L('publishing_post_meme'));
		ind.value = 10;
	}
	
	if (inserted) {
		Ti.API.debug(" ####### INSERT POST executed");
		alertInfo = { title: L('success_alert_title'), message: L('post_success_message') };
	} else {
		alertInfo = { title: L('error_alert_title'), message: L('post_error_message') };
	}
	
	// hides the Progress Bar
	showProgressView('hide', null);
	ind.value = 0; //resets the Progress Bar

	var alert = Titanium.UI.createAlertDialog(alertInfo);
  	alert.show();
	alert.addEventListener('click',function(e) {
		win.close(animeClose);
		btn_post.enabled = true;
		Ti.App.fireEvent('reloadDashboard');
	});
});

// ======================
// = HIDE ALL KEYBOARDS =
// ======================

Ti.App.addEventListener('hide_keyboard', function(e) {
	//Closes the Keyboard if open
	textArea.blur();
	editTitleField.blur();
	searchTextField.blur();
	popoverSearchView.hide();
});

// ===========================
// = CLOSE NEW POST LISTENER =
// ===========================
Ti.App.addEventListener('close_newpost', function(e) {
	//Closes New Post Window
	win.close({opacity:0,duration:200});
});