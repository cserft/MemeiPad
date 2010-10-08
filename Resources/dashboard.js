var win = Ti.UI.currentWindow;

// var scrollView = Ti.UI.createScrollView({
// 	backgroundColor:'transparent',
// 	contentWidth:1024,
// 	contentHeight:1000,
// 	top:0,
// 	showVerticalScrollIndicator:true,
// 	showHorizontalScrollIndicator:false
// });
//win.add(scrollView);


// ================
// = LAYOUT POSTS =
// ================

// var miniPostView1 = Ti.UI.createView({
// 	backgroundColor:'black',
// 	width: 317,
// 	height: 241,
// 	left: 35
// });
// scrollView.add(miniPostView1);
// 
// 
// var miniPostView_txt = Ti.UI.createView({
// 	backgroundColor:'#141414',
// 	width: 307,
// 	height: 231,
// 	top: 5,
// 	left: 5
// });
// miniPostView1.add(miniPostView_txt);
// 
// 	var img_quote = Titanium.UI.createImageView({
// 		image:'images/minipost_txt_quote.png',
// 		top:25,
// 		left:15,
// 		width:20,
// 		height:18
// 	});
// 	miniPostView_txt.add(img_quote);
// 	
// 	var minipost_text = Titanium.UI.createLabel({
// 		color:'#FFF',
// 		text: 'The new iPod touch is almost like an iPhone 4, without the phone. Even thinner than the original, it has a Retina display, Apple A4 processor, gyroscope, and a digital camera, both on the back  A4 processor, gyroscope, and a digital can thinner than the original, it has a Retina display, Apple A4 processor, gyroscope, and a digital camera, both on the back and for...',
// 		font:{fontSize:12,fontFamily:'Helvetica Neue'},
// 	    textAlign:'left',
// 		top:15,
// 		left:50,
// 		width:217,
// 		height:181
// 	});
// 	miniPostView_txt.add(minipost_text);
// 
// 
// 
// var miniPostView2 = Ti.UI.createView({
// 	backgroundColor:'black',
// 	width: 317,
// 	height: 241,
// 	left: 355
// });
// scrollView.add(miniPostView2);
// 
// 	var miniPostView_img_post = Titanium.UI.createImageView({
// 		image:'images/DUMMY_IMAGE.png',
// 		top:5,
// 		left:5,
// 		width:307,
// 		height:231
// 	});
// 	miniPostView2.add(miniPostView_img_post);
// 	
// 	
// 	var miniPostView_img_bg_label = Titanium.UI.createView({
// 		backgroundColor:'#000',
// 		top:177,
// 		left:5,
// 		width:307,
// 		height:64,
// 		opacity:0.9 
// 	});
// 	miniPostView2.add(miniPostView_img_bg_label);
// 
// 	var minipost_img_txt_label = Titanium.UI.createLabel({
// 		color:'#FFF',
// 		text: 'The new iPod touch is almost like an iPhone 4, without the phone. Even thinner than the original, it has a Retina display, App',
// 		font:{fontSize:12,fontFamily:'Helvetica Neue'},
// 	    textAlign:'left',
// 		top:14,
// 		left:14,
// 		width:274,
// 		height:34,
// 	});
// 	miniPostView_img_bg_label.add(minipost_img_txt_label);
// 
// 
// var miniPostView3 = Ti.UI.createView({
// 	backgroundColor:'black',
// 	width: 317,
// 	height: 241,
// 	left: 675
// });
// scrollView.add(miniPostView3);
// 
// 	var miniPostView_video_post = Titanium.Media.createVideoPlayer({
// 		setURL:'http://www.youtube.com/v/tPAFK_3nx9k?f=videos&app=youtube_gdata',
// 		backgroundColor:'#111',
// 		movieControlMode:Titanium.Media.VIDEO_CONTROL_DEFAULT,
// 		scalingMode:Titanium.Media.VIDEO_SCALING_MODE_FILL,
// 		top:5,
// 		left:5,
// 		width:307,
// 		height:231
// 	});
// 	miniPostView3.add(miniPostView_video_post);

// =======================
// = DASHBOARD TABLEVIEW =
// =======================

//RETRIEVING YQL OBJECT
var yql = win.yql;

//RETRIEVING YQL DASHBOARD DATA TO BUILD DE DASHBOARD
var dashboard_data = yql.query("SELECT * FROM meme.user.dashboard | meme.functions.thumbs(width=307,height=231)");
var posts = dashboard_data.query.results.post;	

Ti.API.debug(" =================== YQL DENTRO DO JS: " + JSON.stringify(posts));


var data = [];



var count = 0;
var __id;
var __id_img;
var __id_bg_caption;
var __id_caption;



var createPost = function(pContent, pCaption, pPubId, pPostUrl, pType, pColumn)
{
	//create a black box
	
	var blackBoxView = "blackBoxView" + pColumn;
	Ti.API.debug("blackBoxView: " + blackBoxView);
	
	var blackBoxView = Ti.UI.createView({
		backgroundColor:'black',
		width: 317,
		height: 241,
		top: 5
	});
	
	if (pColumn == 0){
		
		blackBoxView.left = 35;
		
	}
	else if (pColumn == 1){
		
		blackBoxView.left = 355;
		
	} else if (pColumn == 2){
		
		blackBoxView.left = 675;
		
	}
	
	// create an post view
	if (pType == "photo"){	
		var postImageView = Titanium.UI.createImageView({
			image: pContent,
			top:5,
			left:5,
			width:307,
			height:"auto"
		});
		blackBoxView.add(postImageView);	
	}
	
	// create an Video view
	if (pType == "video"){	
		
		//Retrieve Thum from YouTube Video	
		var youtubeid = pContent.match(/v=([a-zA-Z0-9_-]{11})&?/)[1];
        var _videoThumb = "http://img.youtube.com/vi/" + youtubeid + "/0.jpg";
		
		var postImageView = Titanium.UI.createImageView({
			image: _videoThumb,
			top:5,
			left:5,
			width:307,
			height:231
		});
		blackBoxView.add(postImageView);	
	}

	// add an image view to the black box
	
	if (pCaption != undefined && pCaption.length >0 && pCaption != "") {
	
		var __id_bg_caption = Titanium.UI.createView({
			backgroundColor:'#000',
			top:177,
			left:5,
			width:307,
			height:64,
			opacity:0.9
		});
		blackBoxView.add(__id_bg_caption);
		
		//Strips HTML Entities and Tags from the Caption
		var pCaptionStripped = pCaption.replace(/(<([^>]+)>)/ig,"").replace(/&.+;/,"");
	
		var __id_caption = Titanium.UI.createLabel({
			color:'#FFF',
			text: pCaptionStripped,
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
		    textAlign:'left',
			top:14,
			left:14,
			width:274,
			height:34,
		});
		__id_bg_caption.add(__id_caption);
	}
	
	return(blackBoxView);
	
}

//Ti.API.debug("POsts Lenght: ");

// create THE TABLE ROWS
for (var k=0; k < posts.length; k++)
{
	Ti.API.debug("Entered on POst Loop");
	
	var post = posts[k];
	var _caption = post.caption;
	var _pubId = post.pubid;
	var _postUrl = post.url;
	var _type = post.type;
	// var _videoUrl = posts
	
	if (_type == "photo")
	{
		var _content = post.content.thumb;
		
	} else if (_type == "video")
	{
		var _content = post.content;
		
	} else if (_type == "text")
	{
		var _content = post.content;
		
	} else if (_type == "comment") {
		
		var _caption = post.comment;
	} else {
		
		var _content = "";
	}
	
	
    if (count == 0) {
		var row = Ti.UI.createTableViewRow();
		row.height = 245;
		row.className = 'datarow';
		row.clickName = 'row';
	}
	
	var postView = createPost(_content, _caption, _pubId, _postUrl, _type, count);	
	row.add(postView);

	count++;
	
	// Verifies if it is the third post and closes the row
	if (count == 3){
		
		data.push(row);
	 	count = 0;

	}

}

var tableView = Titanium.UI.createTableView({
	backgroundColor: "transparent",
	data:data,
	separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
	selectionStyle:'none'
});

win.add(tableView);

var dashboardShadow = Titanium.UI.createImageView({
	image:'images/shadow.png',
	backgroundColor: "transparent",
	top:630,
	left:0,
	width:1024,
	height:26,
	zIndex:999
});
win.add(dashboardShadow);