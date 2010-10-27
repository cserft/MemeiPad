var win = Ti.UI.currentWindow;

//RETRIEVING PARAMETERS FROM PREVIOUS WINDOW
var yql = win.yql;
var win1 = win.win1; // Window Original created on app.js

// ===============
// = Header View =
// ===============

var postHeaderView = Ti.UI.createView({
	backgroundImage:'images/bg_post_top_bar.png',
	left:0,
	top:0,
	height:65,
	width:1024,
	zIndex: 2

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
	
	Titanium.Media.openPhotoGallery({

		success:function(event)
		{

		},
		cancel:function()
		{

		},
		error:function(error)
		{
		},
		allowEditing:true,
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

btn_post.addEventListener('click', function()
{

});

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

// Image View Holder
var editImageView = Titanium.UI.createImageView({
	image: 'images/image_placeholder.png',
	top: 		79,
	left: 		33,
	width: 		'auto',
	height: 	'auto'
});
editView.add(editImageView);

//Main Text Area

var TextAreaFake = "The iPhone 4 is no small thing to review. As most readers of Engadget are well aware, in the gadget world a new piece of Apple hardware is a major event, preceded by rumors, speculation, an over-the-top announcement, and finally days, weeks, or months of anticipation from an ever-widening fan base. The iPhone 4 is certainly no exception -- in fact, it may be Apple’s most successful launch yet, despite some bumps on the road.";

var textArea = Titanium.UI.createTextArea({
	value: TextAreaFake,
	height: 		357,
	width: 			953,
	top: 			316,
	font: 			{fontSize:16,fontFamily:'Helvetica', fontWeight:'regular'},
	color:'#666',
	textAlign:'left',
	appearance:Titanium.UI.KEYBOARD_APPEARANCE_ALERT,	
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	//returnKeyType:Titanium.UI.RETURNKEY_EMERGENCY_CALL,
	suppressReturn:false
	
});
editView.add(textArea);



// White Gradient in the Bottom
var whiteShadow = Titanium.UI.createImageView({
	image: 'images/white_shadow.png',
	bottom: 	0,
	left: 		0,
	width: 		1024,
	height: 	91
});
editView.add(whiteShadow);

//Disclaimer
var disclaimerLabel = Titanium.UI.createLabel({
	text: 		'Don’t infringe copyright or post adult content. Check the Ccommunity Guidelines for more information. Your Post will be shared via Yahoo! Updates. ',
	color: 		'#CCC',
	width: 		800,
	height: 	15,
	font: 		{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'},
	bottom: 	18
});
editView.add(disclaimerLabel);



