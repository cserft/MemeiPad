Ti.include('lib/sha1.js');
Ti.include('lib/secrets.js');
Ti.include('lib/commons.js');
Ti.include('newpost_flashlight.js');
Ti.include('lib/analytics.js');

//Analytics Request
doYwaRequest(analytics.NEW_POST_OPEN);

var win 				= 	Ti.UI.currentWindow;
Ti.App.newpostIsOpen 	= true; // controls for multiple clicks on Start new post btn
var mediaPreview   	= ""; // var used to save the media files, links in draft
var mediaType 		= ""; // var that holds the media draft type: ("vimeo", "youtube", "photo", "file")
var mediaLink 		= ""; // var that holds the media link for draft Post from Flashlight 
var flashlight 		= ""; // var that controls if the post is a Flashlight result (true|false)

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

// animation on close Window
var animeClose = Ti.UI.createAnimation({
	duration: 300,
	top: -749	
});

//Function to set the Flashlight Field Font size
function setFlashlightFont (size) {
		searchTextField.font = {fontSize:size, fontFamily:'Georgia', fontStyle:'Italic'};
}


// ===============
// = Header View =
// ===============
var postHeaderView = Ti.UI.createView({
	backgroundImage: 	'images/bg_post_top_bar_black.png',
	left: 				0,
	top: 				0,
	height: 			61,
	width: 				1024,
	zIndex: 			2

});
win.add(postHeaderView);

// ===============
// = BACK BUTTON =
// ===============
var btn_close_post = Ti.UI.createButton({
	backgroundImage: 'images/btn_close_post2.png',
	height: 36,
	width: 36,
	left: 970,
	top: 12,
	style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
});
postHeaderView.add(btn_close_post);


// =========================
// = Awesome bar TextField =
// =========================
var BgSearchTextField = Titanium.UI.createView({
	backgroundImage: 			'images/bg_flashlight_form.png',
	backgroundLeftCap: 			20,
	backgroundRightCap: 		20,
	left: 						300, 
	top: 						9,
	width: 						540,
	height: 					41,
	zIndex: 					1,
});
postHeaderView.add(BgSearchTextField);

var searchTextField = Titanium.UI.createTextField({
	value: 					queryText,
	hintText: 				L('searchTextField_hint_text'),
	backgroundColor: 		'transparent',
	backgroundLeftCap: 		20,
	backgroundRightCap: 	20,
	textAlign: 				'left',
	verticalAlign: 			'center',
	color: 					"#999",
	font: 					{fontSize:13, fontFamily:'Georgia', fontStyle:'Italic'},
	width: 					485,
	height: 				41,
	top: 					9,
	left: 					310,
	borderRadius: 			4,
	zIndex: 				2,
	borderStyle: 			Titanium.UI.INPUT_BORDERSTYLE_NONE,
	// clearButtonMode: 		Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	keyboardType: 			Titanium.UI.KEYBOARD_DEFAULT
});
postHeaderView.add(searchTextField);

//Photo delete Button
var btn_search_clear = Titanium.UI.createButton({
	backgroundImage:'images/btn_close_white.png',
	width: 			25,
	height: 		25,
	top: 			8,
	right: 			10,
	zIndex: 		10,
	style: 			Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	
});
// BgSearchTextField.add(btn_search_clear);

var btn_flashlight = Ti.UI.createButton({
	backgroundImage: 'images/btn_flashlight_new.png',
	width: 			120,
	height: 		40,
	left: 			173,
	top: 			9,
	zIndex: 		2,
	style: 			Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	
});
postHeaderView.add(btn_flashlight);

//Create Image view for the lamp animation (this is a white blur)
var lamp_bright = Titanium.UI.createImageView({
	image: 		'images/lamp_bright.png',
	left: 		173 , // - 221
	top: 		8,
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

// ==================
// = BOTTOM TOOLBAR =
// ==================

//Creates the bottom toolbar
var toolBar = Titanium.UI.createView({
	bottom: 		0,
	left: 			0,
	translucent: 	false,
	width: 			1024,
	height: 		53,
	backgroundImage: 'images/bg_newpost_toolbar.png',
	zIndex: 		2
});	
win.add(toolBar);

// ==========================
// = ADD PHOTO FROM GALLERY =
// ==========================

var btn_addPhoto = Ti.UI.createView({
	backgroundImage: 'images/bg_btn_add_photo.png',
	width: 			146,
	height: 		53,
	left: 			698,
	top: 			0
	
});
toolBar.add(btn_addPhoto);

// White Gradient in the Bottom
var icon_photo = Titanium.UI.createImageView({
	image: 'images/icon_img.png',
	left: 		20,
	width: 		26,
	height: 	21
});
btn_addPhoto.add(icon_photo);

//Disclaimer Community Guidelines
var btn_addPhotoLabel = Titanium.UI.createLabel({
	text: 		L('add_photo_button_title'),
	textAlign: 'center',
	color: 		'#FFF',
	width: 		80,
	height: 	18,
	left: 		50,
	font: 		{fontSize:12, fontFamily:'Helvetica', fontWeight:'Light'},
	zIndex: 	1
});
btn_addPhoto.add(btn_addPhotoLabel);

var popoverGalleryView = Titanium.UI.createView({
	left: 		605,
	top: 		715,
	width:      330
});
toolBar.add(popoverGalleryView);

// build the Photo Gallery popover
btn_addPhoto.addEventListener('click', function() {
	Ti.API.info('Dialog Open Gallery was clicked');
	
	btn_addPhoto.backgroundImage = 'images/bg_btn_add_photo_selected.png';
	
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
		animated: false,
		arrowDirection:Ti.UI.iPad.POPOVER_ARROW_DIRECTION_DOWN,
		mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
	});

});

btn_addPhoto.addEventListener('touchend', function() {
	btn_addPhoto.backgroundImage = 'images/bg_btn_add_photo.png';
});
		
// ===============
// = POST BUTTON =
// ===============
var btn_post = Ti.UI.createButton({
	backgroundImage: 			'images/bg_btn_post_new.png',
	height: 					53,
	title: 						L('btn_post_top_title'),
	color: 						'white',
	textAlign: 					'center',
	font: 						{fontSize:24, fontFamily:'Helvetica Neue', fontWeight:'Light'},
	width: 						180,
	left: 						845,
	top: 						0
});
toolBar.add(btn_post);

//Disclaimer Community Guidelines
var disclaimerLabel1 = Titanium.UI.createLabel({
	text: 		L('disclaimer_copyright_guidelines'),
	color: 		'#666',
	width: 		525,
	height: 	13,
	left: 		19,
	font: 		{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'},
	bottom: 	28,
	zIndex: 	3
});
toolBar.add(disclaimerLabel1);

//Disclaimer Settings Yahoo! Updates.
var disclaimerLabel2 = Titanium.UI.createLabel({
	text: 		L('disclaimer_yahoo_updates'),
	color: 		'#666',
	width: 		280,
	height: 	13,
	left: 		19,
	font: 		{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'},
	bottom: 	10,
	zIndex: 	3
});
toolBar.add(disclaimerLabel2);

// =============================================
// = DISCLAIMERS LISTENERS TO OPEN THE BROWSER =
// =============================================

//Alert to Open Safari for the Post Permalink
disclaimerLabel1.addEventListener("click", function(e)
{
	Ti.App.fireEvent('openBrowser', {
		url: L("guidelines_url")
	});

});

disclaimerLabel2.addEventListener("click", function(e)
{
	Ti.App.fireEvent('openBrowser', {
		url: L("settings_url")
	});
});

// Fucntion that moves the ToolBar with the Keyboard
function moveToolBar(arg) {
	var pos;
	if (arg == true && pos != "up") {
		//Show Keyboard
		toolBar.animate({bottom: 352, duration: 250});
		popoverGalleryView.top = 362;
		editView.height = 277;
		pos = "up";
	} else {
		//hide Keyboard
		toolBar.animate({bottom: 0, duration: 250});
		popoverGalleryView.top = 715;
		editView.height = 634;
		pos = "down";
	}
};


// ======================
// = END OF THE TOP BAR =
// ======================

// =============
// = EDIT VIEW =
// =============
var editView = Titanium.UI.createScrollView({
	left: 		0,
	top: 		61,
	width:      '100%',
	height:     634,
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
	verticalAlign: 	'center',
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
        html: '',
		top:0,
        left:0,
		width: 650,
		height: 420,
		backgroundColor: 'transparent',
        loading: true,
		scalesPageToFit: false,
		visible: true
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
	width: 			29,
	height: 		29,
	top: 			0,
	left: 			0,
	zIndex: 		10,
	style: 			Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	
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
	left: 			36,
	top: 			79,
	font: 			{fontSize:18,fontFamily:'Helvetica', fontWeight:'regular'},
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
	textAlign: 		'center',
	color: 		'#CCC',
	top: 		300,
	width: 		600,
	height: 	100,
	font: 		{fontSize:50, fontFamily:'Helvetica', fontWeight:'bold'},
	zIndex: 	1
});

// Upload Progress Bar
var progressView = Titanium.UI.createView({
	top: 			300,
	width: 			400,
	height: 		80,
	borderRadius: 	5,
	backgroundColor: 'black',
	visible: false,
	zIndex:99
});
win.add(progressView);

var actInd = Ti.UI.createActivityIndicator({
	top: 22, 
	left: 25,
	height: 50,
	width: 10,
	style:Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
});
progressView.add(actInd);

var ind = Ti.UI.createProgressBar({
	width: 250,
	height: 60,
	left: 	55,
	top: 5,
	min: 0,
	max: 1,
	value: 0,
	style:Titanium.UI.iPhone.ProgressBarStyle.BAR,
	message: L('prepare_uploading_file'),
	font:{fontSize:16, fontWeight:'bold'},
	color:'white'
});
progressView.add(ind);

var cancelPostButton = Ti.UI.createButton({
	backgroundImage: 			L('path_btn_back'),
	backgroundLeftCap: 			20,
	backgroundRightCap: 		20,
	left: 						310,
	top: 						13,
	height: 					52, //29
	width: 						90, // 50
    title: 						L('btn_alert_CANCEL'),
	color: 						'white',
	textAlign: 					'center',
	font: 						{fontSize:12, fontFamily:'Helvetica', fontWeight:'bold'},
	style: 						Titanium.UI.iPhone.SystemButtonStyle.PLAIN
});
progressView.add(cancelPostButton);

//TextArea Clear Button
var btn_text_clear = Titanium.UI.createButton({
	backgroundImage:'images/btn_close_gray.png',
	width: 			29,
	height: 		29,
	top: 			95,
	right: 			40,
	zIndex: 		2,
	visible: 		true
});

function showProgressView (pCommand, pMessage) {
	
	if (pCommand == "hide") { // Hides the Progress bar
		progressView.hide();
		ind.hide();
		actInd.hide();
		ind.message =  L('prepare_uploading_file');	
		
	} else { // Hides the Progress bar
		progressView.show();
		ind.show();
		actInd.show();
		ind.message = pMessage;	
	}	
}

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

// ===================
// = DRAFT FUNCTIONS =
// ===================

//Saves Files Locally
function saveLocalFile (filename, media, callback){
	oldf = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
    if (oldf.exists()) {
	  Ti.API.debug('Found previous post draft file, deleting it');
      oldf.deleteFile();
    }
    f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
    f.write(media);
    callback(f);
}

// Saves Draft
function saveDraft (title, body, query, type, mediaPreview, mediaLink) {
	if (type != 'file') {
		Ti.App.Properties.setList('draft_post', [title, body, query, type, mediaPreview, mediaLink]);
	} else {
		saveLocalFile("photo_draft", mediaPreview, function(f){
			Ti.App.Properties.setList('draft_post', [title, body, query, type, f.name, mediaLink]);
			Ti.API.debug('Saving Local File Draft on properties: title[' + title + '], body[' + body + '], Flashlight Query [' + query + '], Media Draft type:[' + type + '] FileName [' + f.name + '] mediaLink ['+ mediaLink +']');
		});
	}
	
	Ti.API.debug('Saving post draft on properties: title[' + title + '], body[' + body + '], Flashlight Query [' + query + '], Media Draft type:[' + type + '] mediaPreview [' + mediaPreview + '] mediaLink ['+ mediaLink +']');
};

// Reads local file
function readLocalFile (filename, callback){
	
	file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
    if (file.exists()) {
		var fileContent = file.read();
		Ti.API.debug('Found previous post draft file, reading it: [' + fileContent + ']');
		callback(fileContent);
    } else {
		Ti.API.debug('No Draft File Found!');
	}
};

// Loads Draft
function loadDraft () {
	Ti.API.debug('Loading Draft');
	
	var draft = Ti.App.Properties.getList('draft_post');
	editTitleField.value = draft[0];
	textArea.value = draft[1];
	searchTextField.value = draft[2];
	mediaType = draft[3];
	mediaPreview = draft[4];
	mediaLink = draft[5];
	
	//Setting Post vars
	postTitle = draft[0];
	postBody = draft[1];
	
	// verifies if the Flashlight Search Field has some value and sets the Bigger Font Size
	if (searchTextField.value != "") {
		setFlashlightFont(18);
		BgSearchTextField.add(btn_search_clear);
	}
	
	// Sets the tempLabel
	if (textArea.value == ''){
		editView.add(tempPostLabel);
		tempPostLabel.show();	
	} else {
		tempPostLabel.hide();
	}
	
	if (mediaType != "") {
		if (mediaType != "file") {
			mediaChosen(true, mediaType, mediaPreview, mediaLink);
		} else {
			readLocalFile(mediaPreview, function(media){
				Ti.API.debug("Media File from loadDraft() ["+ media +"]");
				mediaChosen(false, mediaType, media, mediaLink);
				
			});
		}
	}
	
	Ti.App.Properties.removeProperty('draft_post');
};

// calls load post draft
if (Ti.App.Properties.hasProperty('draft_post')) {
	loadDraft();
}

// verifies if the Flashlight Search Field has some value and sets the Bigger Font Size
if (searchTextField.value != "") {
	setFlashlightFont(18);
	BgSearchTextField.add(btn_search_clear);
}

// end Draft functions

// =============
// = LISTENERS =
// =============

//Close Button
btn_close_post.addEventListener('click', function() {
	
	win.close(animeClose);
	Ti.App.newpostIsOpen = false; // controls for multiple clicks on Start new post btn
	
	//Closes the Keyboard if open
	Ti.App.fireEvent('hide_keyboard');
	
	// Triggers the Save Draft Process
	saveDraft(editTitleField.value, textArea.value, searchTextField.value, mediaType, mediaPreview, mediaLink);
	
});

// ================================
// = AWESOME BAR SEARCH LISTENERS =
// ================================
// Flashlight button listener
btn_flashlight.addEventListener('click', function() {
	
	clearTimeout(clickTimeout);
	
	clickTimeout = setTimeout(function() {	
		//Ti.API.info('queryText when btn_flashlight clicked: ' + queryText);
		//Analytics Request
		doYwaRequest(analytics.FLASHLIGHT_SEARCH);
		if (searchTextField.value == '') {
			Ti.UI.createAlertDialog({
				title: L('flashlight_alert_empty_title'),
				message: L('flashlight_alert_empty_message')
			}).show();
			
		} else {
			flashlight_show();
		}
		
	},500);
	
});

// Keyboard return button listener for the Flashlight
searchTextField.addEventListener('return', function() {
	
	clearTimeout(clickTimeout);
	
	clickTimeout = setTimeout(function() {	
		//Ti.API.info('queryText when btn_flashlight clicked: ' + queryText);
		//Analytics Request
		doYwaRequest(analytics.FLASHLIGHT_SEARCH);
		if (searchTextField.value == '') {
			Ti.UI.createAlertDialog({
				title: L('flashlight_alert_empty_title'),
				message: L('flashlight_alert_empty_message')
			}).show();
			
		} else {
			flashlight_show();
		}
		
	},500);
	
});

searchTextField.addEventListener('change', function(e) {
//	Ti.API.info('Awesome Bar form: you typed ' + e.value + ' act val ' + searchTextField.value);
	flashlight_text_change_monitor(searchTextField.value);
	
	// Controls the Look and Feel of the Font on the Search Box, changing the Fonst Size and the hintText 
	if (searchTextField.value == "") {
		// if the user clears the field, then it should show the hintText and reset the font Size
		setFlashlightFont(13);
		searchTextField.hintText = L('searchTextField_hint_text');
		BgSearchTextField.remove(btn_search_clear);
	} else {
		// else there is something in the Field and it should use the bigger font size
		setFlashlightFont(18);
		BgSearchTextField.add(btn_search_clear);
	}
});

searchTextField.addEventListener('focus', function(e) {
	setFlashlightFont(18);
	searchTextField.hintText = "";
	moveToolBar(true);
});

searchTextField.addEventListener('blur', function(e) {
	if (searchTextField.value == "") {
		setFlashlightFont(13);
		searchTextField.hintText = L('searchTextField_hint_text');
	} else {
		setFlashlightFont(18);
	}
	moveToolBar(false);
});

// Clears the Flashlight Search Field
btn_search_clear.addEventListener('touchstart', function(e) {
	queryText = '';
	searchTextField.value = '';
	setFlashlightFont(13);
	searchTextField.focus();
	BgSearchTextField.remove(btn_search_clear);
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
	
	if (e.value == ''){
		editView.add(tempPostLabel);
		tempPostLabel.show();	
	} else {
		tempPostLabel.hide();
	}
	// Ti.API.debug('text is: ' + e.value);
	postBody = e.value;
});

textArea.addEventListener('focus', function(e) {
   	// Ti.API.info('TextArea: focus received');
	tempPostLabel.hide(); // hide the hint text when textArea receives Focus
	editView.add(btn_text_clear);
	moveToolBar(true);
});

textArea.addEventListener('blur', function(e) {
	editView.remove(btn_text_clear);
	editView.scrollTo(0, {animated:true});
	moveToolBar(false);
});

btn_text_clear.addEventListener('touchstart', function(e) {
	// editView.add(tempPostLabel);
	tempPostLabel.show(); // hide the hint text when textArea receives Focus
	editView.remove(btn_text_clear);
	textArea.blur();
	postBody = '';
	textArea.value = '';
});

//Captures the value on the Post Title
editTitleField.addEventListener('change', function(e) {
	// Ti.API.info('Post Title: you typed ' + e.value + ' act val ' + editTitleField.value);
	postTitle = editTitleField.value;
});

editTitleField.addEventListener('focus', function(e) {
	moveToolBar(true);
});

editTitleField.addEventListener('blur', function(e) {
	moveToolBar(false);
});

// =======================
// = POST BUTTON TRIGGER =
// =======================

// This is the FULL Post variable: Title + Body

btn_post.addEventListener('click', function(e) {
	//Closes the Keyboard if open
	Ti.App.fireEvent('hide_keyboard');
	
	//merging Post Body + Post Title
	if (postTitle != ""){
		postText = "<strong>" + postTitle + "</strong><p>\n</p>";
	}
	postText = postText + postBody;
	postText = postText.replace(/(\')/g, '\\$1'); // cleaning up ' to not mess with YQL insert

	Ti.API.info("Variables passed on PostClicked Event:\n Flashlight ["+ flashlight + "]\n mediaType ["+ mediaType + "]\n mediaLink ["+ mediaLink +"]");
	Ti.App.fireEvent("postClicked", {flashlight: flashlight, mediaType: mediaType, mediaLink: mediaLink});

});

// ===============================
// = PHOTO GALLERY HANDLERS      =
// ===============================

var handleImageEvent = function(event) {
	theImage = event.media;
	mediaType = "file";
	mediaPreview = "";
	mediaLink = "";
	Ti.App.fireEvent("mediaChosen", {flashlight: false, mediaType: mediaType, mediaPreview: mediaPreview, mediaLink: mediaLink });
};

Ti.App.addEventListener("mediaChosen", function(e) {
	mediaChosen(e.flashlight, e.mediaType, e.mediaPreview, e.mediaLink);
});
	
function mediaChosen (pFlashlight, pMediaType, pMediaPreview, pMediaLink) {
	
	var textArea_top;
	
	// updates Flashlight var
	flashlight = pFlashlight;

	//Closes the Keyboard if open
	Ti.App.fireEvent('hide_keyboard');

	if (pFlashlight == true) {
		//FlashLight Content was clicked
		Ti.API.info(">>> Entered on Flashlight Paste");

		// RESETS THE PREVIEW
		img.image = null;
		webViewPreview.html = '';
		
		// Show Ajax animation
		actAjax.show();
	
		// If the content from FlashLight is a Video then presents a Video Player
		if (pMediaType == "youtube") {
			
			Ti.API.info(">>> Entered on Flashlight Type:[" + pMediaType + "] Media [" + pMediaPreview + "] MediaLink ["+ pMediaLink +"]");
			// Create our Webview to render the Video
			webViewPreview.html = pMediaPreview;
			viewContainerPhoto.add(webViewPreview);
			viewContainerPhoto.show();
			
			//Saving Draft vars
			mediaType = pMediaType;
			mediaPreview = pMediaPreview;
			mediaLink = pMediaLink
			
		} else if (pMediaType == "vimeo") { 
			Ti.API.info(">>> Entered on Flashlight Type:[" + pMediaType + "] Media [" + pMediaPreview + "] MediaLink ["+ pMediaLink +"]");
			
			// Create our Webview to render the Video
			webViewPreview.html = pMediaPreview;
			viewContainerPhoto.add(webViewPreview);
			viewContainerPhoto.show();
			
			//Saving Draft vars
			mediaType = pMediaType;
			mediaPreview = pMediaPreview;
			mediaLink = pMediaLink;
		
		} else if (pMediaType == "photo") {
			// IS A PHOTO
			Ti.API.info(">>> Entered on Flashlight Type:[" + pMediaType + "] Media [" + pMediaPreview + "] MediaLink ["+ pMediaLink +"]");
			
			// Create our Webview to render the Photo
			webViewPreview.html = pMediaPreview;
			viewContainerPhoto.add(webViewPreview);
			viewContainerPhoto.show();
			
			//Saving Draft vars
			mediaType = pMediaType;
			mediaPreview = pMediaPreview;
		}
		
		webViewPreview.addEventListener('load', function(){
			actAjax.hide();
			btn_photo_close.show();
		});
		
		// Repositioned the TextArea below the chosen photo
		textArea_top =  webViewPreview.height + 95;

		//Repositioned the Temp Caption on top of the TextArea
		tempPostLabel.animate({zIndex: 0, top: 100 + viewContainerPhoto.height});

	} else {
		// THIS IS A LOCAL FILE THEN
		
		// IF AN VIDEO WAS IN THE PREVIEW BEFORE IT REMOVES IT
		viewContainerPhoto.remove(webViewPreview);
	
		// img properties
		if (pMediaPreview) {
			img.image = pMediaPreview;
			theImage = img.toImage();
			
			// set smaller size for preview
			preview_sizes = getImageDownsizedSizes(500, 500, theImage);
			img.image = theImage.imageAsResized(preview_sizes.width, preview_sizes.height);
			Ti.API.debug("Media Received in the Media Chosen Function: ["+ img.image +"]" );
		} else {
			// set smaller size for preview
			preview_sizes = getImageDownsizedSizes(500, 500, theImage);
			img.image = theImage.imageAsResized(preview_sizes.width, preview_sizes.height);
		}
		
		img.top = 10;
		img.left = 10;
		viewContainerPhoto.show();
		
		//Saving Draft vars
		mediaType = "file";
		mediaPreview = theImage;
		
		//adds the close button to the image
		btn_photo_close.show();
		
		// Repositioned the TextArea below the chosen photo
		textArea_top =  img.height + 105;

		//Repositioned the Temp Caption on top of the TextArea
		tempPostLabel.animate({zIndex: 0, top: 120 + img.height});
	}
	
	// Repositioned the TextArea below the chosen photo
	btn_text_clear.top = textArea_top+20;
	textArea.animate({zIndex: 0, top: textArea_top});
};

// to remove the photo chosen
Ti.App.addEventListener("mediaRemoved", function(e) {
	theImage = null;
	webViewPreview.html = '';
	viewContainerPhoto.remove(webViewPreview);
	viewContainerPhoto.hide();
	viewContainerPhoto.width = 'auto';
	btn_photo_close.visible = false;
	textArea.animate({top: 100});
	btn_text_clear.top = 110;
	tempPostLabel.animate({top: 300});
	
	//reseting Draft vars
	mediaPreview = "";
	mediaType = "";
	mediaLink = "";
});

//Alert to remove the photo
var alertCloseImage = Titanium.UI.createAlertDialog({
	title: L('remove_alert_title'),
	message: L('remove_alert_message'),
	buttonNames: [L('btn_alert_YES'),L('btn_alert_NO')],
	cancel: 1
});

// Listener to delete the Image and start again
btn_photo_close.addEventListener('touchstart', function(e) {
	alertCloseImage.show();
});

alertCloseImage.addEventListener('click',function(e) {
	if (e.index == 0) {
		Ti.App.fireEvent("mediaRemoved");
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
	
	Ti.API.info("postClicked init with: \nFlashLight ["+ e.flashlight +"]\nmediaType ["+ e.mediaType +"]\n mediaLink ["+ e.mediaLink +"]");
	
	// if (mediaType != "photo" || mediaType ||) {
	// 	
	// 	if ( postText == null || postText == "" ) {
	// 		Ti.UI.createAlertDialog({ 
	// 			title: L('oops_alert_title'),
	// 		    message: L('post_message_empty'),
	// 			buttonNames: [L('btn_alert_OK')]
	// 		}).show();
	// 	} else {
	// 		//Shows the Upload Progress bar
	// 		showProgressView ('show', L('preparing_to_post_message'));
	// 		ind.value = 0;
	// 		btn_post.enabled = false;
	// 		
	// 		// Titanium.App.fireEvent("postOnMeme", {
	// 		// 	message: postText,
	// 		// 	postType: "text"
	// 		// });
	// 	}
	
	//Shows the Upload Progress bar
	showProgressView('show',  L('preparing_to_post_message'));
	
//	if (theImage != null && typeof(theImage) == 'object') {
	if (e.mediaType == "file") {
		// IF there is a Image to Upload
		
		var xhr = Titanium.Network.createHTTPClient();
		xhr.setTimeout(300000); // timeout to upload is 5 minutes
		
		// Listener to cancel post
		cancelPostButton.addEventListener('click', function(){
			xhr.abort();
			ind.value = 0;
			btn_post.enabled = true;
			Ti.API.debug("Post canceled");
			showProgressView('hide', null);
		});

		xhr.onerror = function(e) {
			// Hides the Progress bar
			showProgressView('hide', null);
			Ti.API.debug("Error when Uploading: " + JSON.stringify(e));
		};

		xhr.onload = function(e) {
			// updates the Message in the Progress Bar
			showProgressView('show', L('publishing_post_meme'));

	 		Ti.API.info('Upload complete!');
			Ti.API.info('api response was (http status ' + this.status + '): ' + this.responseText);
			
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
		
		// upload it!
		xhr.open('POST', meme_upload_url);
		xhr.send({
			t: time,
			file: theImage,
			m: Ti.App.myMemeInfo.name,
			s: signature
		});
	
	} else if (e.mediaType == "photo") {
		Titanium.App.fireEvent("postOnMeme", {
			postType: "photo",
			media_link: e.mediaLink,
			message: postText
		});
		
	} else if (e.mediaType == "youtube") {
		Titanium.App.fireEvent("postOnMeme", {
			postType: "video",
			media_link: e.mediaLink,
			message: postText
		});
	} else if (e.mediaType == "vimeo") {
		Titanium.App.fireEvent("postOnMeme", {
			postType: "video",
			media_link: e.mediaLink,
			message: postText
		});

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
		//Analytics Request
		doYwaRequest(analytics.PHOTO_POST);
		
		inserted = Ti.App.meme.createPhotoPost(e.media_link, e.message);
		
	} else if (e.postType == "text"){
		//Analytics Request
		doYwaRequest(analytics.TEXT_POST);
		
		inserted = Ti.App.meme.createTextPost(e.message);
		
		// updates the Message in the Progress Bar
		showProgressView('show', L('publishing_post_meme'));
		ind.value = 10;
		
	} else if (e.postType == "video"){
		//Analytics Request
		doYwaRequest(analytics.VIDEO_POST);
		
		inserted = Ti.App.meme.createVideoPost(e.media_link, e.message);

		// updates the Message in the Progress Bar
		showProgressView('show', L('publishing_post_meme'));
		ind.value = 10;
	}
	
	if (inserted) {
		Ti.API.debug(" ####### INSERT POST executed");
		doYwaRequest(analytics.NEW_POST_PUBLISHED);
		
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
		Ti.App.newpostIsOpen = false;
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
	Ti.App.newpostIsOpen = false;
	win.close({opacity:0,duration:200});
});