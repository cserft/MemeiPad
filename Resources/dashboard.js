var win = Ti.UI.currentWindow;

//RETRIEVING YQL OBJECT
var yql = win.yql;
var dashboard_data = yql.query("SELECT * FROM meme.user.dashboard limit 30");
Ti.API.debug("YQL DENTRO DO JS: " + dashboard_data);

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

var miniPostView1 = Ti.UI.createView({
	backgroundColor:'black',
	width: 317,
	height: 241,
	left: 35
});
//scrollView.add(miniPostView1);


var miniPostView_txt = Ti.UI.createView({
	backgroundColor:'#141414',
	width: 307,
	height: 231,
	top: 5,
	left: 5
});
//miniPostView.add(miniPostView_txt);

	var img_quote = Titanium.UI.createImageView({
		image:'images/minipost_txt_quote.png',
		top:25,
		left:15,
		width:20,
		height:18
	});
	//miniPostView_txt.add(img_quote);
	
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
	//miniPostView_txt.add(minipost_text);



var miniPostView2 = Ti.UI.createView({
	backgroundColor:'black',
	width: 317,
	height: 241,
	left: 355
});
//scrollView.add(miniPostView2);

	var miniPostView_img_post = Titanium.UI.createImageView({
		image:'images/DUMMY_IMAGE.png',
		top:5,
		left:5,
		width:307,
		height:231
	});
	//miniPostView2.add(miniPostView_img_post);
	
	
	var miniPostView_img_bg_label = Titanium.UI.createView({
		backgroundColor:'#000',
		top:177,
		left:5,
		width:307,
		height:64,
		opacity:0.9 
	});
	//miniPostView2.add(miniPostView_img_bg_label);

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
	//miniPostView_img_bg_label.add(minipost_img_txt_label);




var miniPostView3 = Ti.UI.createView({
	backgroundColor:'black',
	width: 317,
	height: 241,
	left: 675
});
//scrollView.add(miniPostView3);

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
	//miniPostView3.add(miniPostView_video_post);
*/	
	

//Ti.API.debug("----------------------");
//Ti.API.debug(dashboard_data);
Ti.API.debug("----------------------");
var posts = dashboard_data['query']['results']['post'];
var count = 0;
var _xcount = 0;
var _yline = 0;
var _y = 0;
var _x = 0;
var __id;
var __id_img;
var __id_bg_caption;
var __id_caption;
for (post in posts) {

	_x = (_xcount * 317) + 35 + (_xcount * 5);
	_y = (_yline * 241) + ((_yline+1) * 5);
	count++;

	if(count % 3 == 0){
		_xcount = 0; // if it gets to 3, go back to zero
		_yline++; //add another line
		
	}else{
		_xcount++;
		
	}


	//create a black box
	var __id = "minipost_view_"+count;
	__id = Ti.UI.createView({
		backgroundColor:'black',
		width: 317,
		height: 241,
		left: _x,
		top: _y
	});
	scrollView.add(__id);
	//Add a black box
	
	
	if(posts[post]['type'] == "photo") {
		
		var _image = posts[post]['content']['content'];
		// create an image view
		var __id_img = Titanium.UI.createImageView({
			image: _image,
			top:5,
			left:5,
			width:307,
			height:231
		});
		__id.add(__id_img);
		// add an image view to the black box

		
		
	
	} else if (posts[post]['type'] == "video") {
	
	}


	if (posts[post]['caption'] != "") {
	
		var __id_bg_caption = Titanium.UI.createView({
			backgroundColor:'#000',
			top:177,
			left:5,
			width:307,
			height:64,
			opacity:0.9 
		});
		__id.add(__id_bg_caption);
	
	
	
	
		var texto = posts[post]['caption'];
		var __id_caption = Titanium.UI.createLabel({
			color:'#FFF',
			text: texto,
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
		    textAlign:'left',
			top:14,
			left:14,
			width:274,
			height:34,
		});
		__id_bg_caption.add(__id_caption);
	
	}


	Ti.API.debug(posts[post]);
	Ti.API.debug("----");
}
Ti.API.debug("----------------------");
