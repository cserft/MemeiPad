var win 			= 	Ti.UI.currentWindow;

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var yql 			= 	win.yql;
var win1 			= 	win.win1; // Window Original created on app.js
var theImage 		= 	null;
var theThumbnail 	= 	null;

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

var btn_back = Ti.UI.createButton({
	backgroundImage: 'images/btn_back_top.png',
	height: 52,
	width: 85,
	left: 20,
	top: 5,
	style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
});

postHeaderView.add(btn_back);

var backButtonLabel = Titanium.UI.createLabel({
	color:'white',
	text: 'home',
	font:{fontSize:12,fontFamily:'Helvetica Neue', fontWeight:'bold'},
    textAlign:'left',
	top:17,
	left:29,
	height:17,
	width:36
});
btn_back.add(backButtonLabel);

btn_back.addEventListener('click', function()
{
	win.close();
});

// ==========================
// = ADD PHOTO FROM GALLERY =
// ==========================

var btn_addPhoto = Ti.UI.createButton({
	backgroundImage: 'images/btn_add_photos.png',
	height: 		23,
	width: 			109,
	borderRadius: 	3,
	left: 			685,
	top: 			22,
	style: 			Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	
});
postHeaderView.add(btn_addPhoto);

var popoverGalleryView = Titanium.UI.createView({
	left: 		532,
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
	left: 840,
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

// ===========================
// = TEXT AREA FORM HANDLERS =
// ===========================

// Hide Text hint on Text Area
tempPostLabel.addEventListener('touchend', function(e)
{
	Ti.API.info('Touch End Gesture captured on Label Write your POst Here?');
	tempPostLabel.hide(); // hide the hint text when touches the TEXT AREA bar
	textArea.focus(); //Focus on the Text Area and bring up the Keyboard
});

//Captures the value on the textArea form and hide hintText
textArea.addEventListener('change', function(e)
{
	Ti.API.info('textArea form: you typed ' + e.value + ' act val ' + textArea.value);
	tempPostLabel.hide(); // hide the hint text when starts using the keyboard
	postText = e.value;
});

textArea.addEventListener('focus', function(e)
{
   	Ti.API.info('TextArea: focus received');
	tempPostLabel.hide(); // hide the hint text when textArea receives Focus
	
});

// =======================
// = POST BUTTON TRIGGER =
// =======================

btn_post.addEventListener('click', function()
{
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

//numero Amil Mae
// 341-7
// 34191 75868 54227 742936 80101 920009 1 480200000541103

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



var getMediaLink = function (pMediaId, pPostText){
	
	var xhr = Titanium.Network.createHTTPClient();
	
	xhr.onerror = function(e) {
		
		Ti.API.debug("Error when Uploading: " + JSON.stringify(e));
	};
	
	xhr.onload = function() {
		Ti.API.info("Request for more Info Worked!");

		var doc = this.responseXML.documentElement; 
		
		var response_media_link;

		response_media_link = doc.getElementsByTagName("image_link").item(0).text;

		Ti.API.debug('Response Media Link: ' + response_media_link );
		
		Titanium.App.fireEvent("postOnMeme", {
			   media_link: response_media_link,
			   message: pPostText
		});


	}
	//xhr.setRequestHeader("Content-Type", "image/png")
	
	xhr.open('GET','http://yfrog.com/api/xmlInfo?path=' + pMediaId);
	
  	xhr.send();
	
};

Titanium.App.addEventListener("postClicked", function(e) {
	
	var xhr = Titanium.Network.createHTTPClient();
	
	xhr.onerror = function(e) {
		
		Ti.API.debug("Error when Uploading: " + JSON.stringify(e));

	};
	
	xhr.onload = function() {
		
	  var doc = this.responseXML.documentElement;
	  
	  if (doc.getElementsByTagName("err") != null && doc.getElementsByTagName("err").length > 0) {
	    		var a = Titanium.UI.createAlertDialog({ 
			  	    title:'Well, this is awkward...',
			  	    message: 'YFrog error: '+ doc.getElementsByTagName("err").item(0).getAttribute("msg")
		  	  	});

		  		a.show();

	  } else {
	
	  		 	Ti.API.info("Upload complete!");
	
			  	var doc = this.responseXML.documentElement; 

			  	var response_mediaid = doc.getElementsByTagName("mediaid").item(0).text;

			  	Ti.API.debug('Response Media ID: ' + response_mediaid );
			
			 	getMediaLink(response_mediaid, e.message);
		
	  }
	  
	  // ind.value = 0;
	
    // setTimeout(function() {
    //   // showChooser();
    //   // resultLabel.text = 'Magically beaming image...';
    // },2000);

	};
	
	xhr.onsendstream = function(e) {
		// ind.value = e.progress;
	};
	xhr.open('POST','http://yfrog.com/api/upload');
	
  	xhr.send({
		    media: theImage,
			username: "memepost",
		    password: "Yahoo123",
		    message: e.message,
			key: "F3ZA64TM533497a3eaea8b6e298e0fed69512b8b"
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



