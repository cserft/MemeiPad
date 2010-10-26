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