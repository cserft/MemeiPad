var win = Ti.UI.currentWindow;

//RETRIEVING YQL OBJECT
var yql = win.yql;

Ti.API.debug("YQL DENTRO DO JS: " + yql.query("SELECT * FROM meme.user.dashboard"));

var scrollView = Ti.UI.createScrollView({
	backgroundColor:'transparent',
	contentWidth:1024,
	contentHeight:'auto',
	top:0,
	showVerticalScrollIndicator:true,
	showHorizontalScrollIndicator:false
});
win.add(scrollView);
/*
var label1 = Titanium.UI.createLabel({
	color:'black',
	text:'Dashboard Window',
	font:{fontSize:35,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	left:10,
	width:'auto',
	zIndex:1
});

scrollView.add(label1);
*/
var miniPostView = Ti.UI.createView({
	backgroundColor:'black',
	width: 317,
	height: 241,
	left: 35
});
scrollView.add(miniPostView);


var miniPostView_txt = Ti.UI.createView({
	backgroundColor:'#141414',
	width: 307,
	height: 231,
	top: 5,
	left: 5
});
miniPostView.add(miniPostView_txt);

	var img_quote = Titanium.UI.createImageView({
		image:'images/minipost_txt_quote.png',
		top:25,
		left:15,
		width:20,
		height:18
	});
	miniPostView_txt.add(img_quote);
	
	var minipost_text = Titanium.UI.createLabel({
		color:'#FFF',
		text: 'The new iPod touch is almost like an iPhone 4, without the phone. Even thinner than the original, it has a Retina display, Apple A4 processor, gyroscope, and a digital camera, both on the back  A4 processor, gyroscope, and a digital can thinner than the original, it has a Retina display, Apple A4 processor, gyroscope, and a digital camera, both on the back and for...',
		font:{fontSize:12,fontFamily:'Helvetica Neue'},
	    textAlign:'left',
		top:15,
		left:50,
		width:217,
		height:181
	});
	miniPostView_txt.add(minipost_text);



var miniPostView2 = Ti.UI.createView({
	backgroundColor:'black',
	width: 317,
	height: 241,
	left: 355
});
scrollView.add(miniPostView2);

	var miniPostView_img_post = Titanium.UI.createImageView({
		image:'images/DUMMY_IMAGE.png',
		top:5,
		left:5,
		width:307,
		height:231
	});
	miniPostView2.add(miniPostView_img_post);
	
	
	var miniPostView_img_bg_label = Titanium.UI.createView({
		backgroundColor:'#000',
		top:177,
		left:5,
		width:307,
		height:64,
		opacity:0.9 
	});
	miniPostView2.add(miniPostView_img_bg_label);

	var minipost_img_txt_label = Titanium.UI.createLabel({
		color:'#FFF',
		text: 'The new iPod touch is almost like an iPhone 4, without the phone. Even thinner than the original, it has a Retina display, App',
		font:{fontSize:12,fontFamily:'Helvetica Neue'},
	    textAlign:'left',
		top:14,
		left:14,
		width:274,
		height:34,
	});
	miniPostView_img_bg_label.add(minipost_img_txt_label);




var miniPostView3 = Ti.UI.createView({
	backgroundColor:'black',
	width: 317,
	height: 241,
	left: 675
});
scrollView.add(miniPostView3);

	var miniPostView_video_post = Titanium.Media.createVideoPlayer({
		setURL:'http://www.youtube.com/v/tPAFK_3nx9k?f=videos&app=youtube_gdata',
		backgroundColor:'#111',
		movieControlMode:Titanium.Media.VIDEO_CONTROL_DEFAULT,
		scalingMode:Titanium.Media.VIDEO_SCALING_MODE_FILL,
		top:5,
		left:5,
		width:307,
		height:231
	});
	miniPostView3.add(miniPostView_video_post);
	
	


