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

// =======================
// = DASHBOARD TABLEVIEW =
// =======================

//RETRIEVING YQL OBJECT
var yql = win.yql;


// ===================================================
// = CREATING POST VIEW TO EMBEDDED IN THE TABLEVIEW =
// ===================================================

var createPost = function(pContent, pCaption, pPubId, pPostUrl, pType, pColumn, pGuid)
{
	var __id_img;
	var __id_bg_caption;
	var __id_caption;
	
	//create a black box view
	
	var blackBoxView = "blackBoxView" + pColumn;
	// Ti.API.debug("blackBoxView: " + blackBoxView);
	
	var blackBoxView = Ti.UI.createView({
		backgroundColor:'black',
		width: 317,
		height: 241,
		top: 5,
		pubId:pPubId,
		guid:pGuid
	});
	
	// Sets the proper Column Left position
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
			height:"auto",
			clickName:"Photo"
		});
		blackBoxView.add(postImageView);	
	}
	
	// create an Video view
	if (pType == "video"){	
		
		var youtubeid = pContent.match(/v=([a-zA-Z0-9_-]{11})&?/)[1];
        var _videoThumb = "http://img.youtube.com/vi/" + youtubeid + "/0.jpg";
	
		var postImageView = Titanium.UI.createImageView({
			image: _videoThumb,
			top:5,
			left:5,
			width:307,
			height:231,
			clickName:pPubId
		});
		blackBoxView.add(postImageView);
	
        var img_play_btn = Titanium.UI.createImageView({
            image:'images/minipost_play_icon.png',
            top:60,
            left:102,
            width:104,
            height:61
        });
        blackBoxView.add(img_play_btn);

	}
	
	// create an Text view
	
	if(pType == "text"){

        var img_quote = Titanium.UI.createImageView({
            image:'images/minipost_txt_quote.png',
            top:25,
            left:15,
            width:20,
            height:18,
			clickName:pPubId
        });
        blackBoxView.add(img_quote);

       var pContentStripado = pContent.replace(/(<([^>]+)>)/ig,"").replace(/&.+;/,"");

       var minipost_text = Titanium.UI.createLabel({
           color:'#FFF',
           text: pContentStripado,
           //minimumFontSize:12,
           font:{fontSize:18,fontFamily:'Helvetica Neue'},
           textAlign:'left',
           top:20,
           left:50,
           width:217,
           height:181,		
		   clickName:"Post Text"
       });
       blackBoxView.add(minipost_text);
   }
	
	// add the Caption to the BlackBox
	
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
			clickName:"Caption"
		});
		__id_bg_caption.add(__id_caption);
	}
	
	//Returns the BlackBoxView Obj with the complete design
	return(blackBoxView);
	
}

// ===============================
// = FUNCTION TO BUILD DASHBOARD =
// ===============================

function setTableViewData()
{
<<<<<<< HEAD
	
	var data = [];
	var count = 0;
	
	//RETRIEVING YQL DASHBOARD DATA TO BUILD DE DASHBOARD
	var dashboard_data = yql.query("SELECT * FROM meme.user.dashboard | meme.functions.thumbs(width=307,height=231) | unique(field='origin_pubid')");
	var posts = dashboard_data.query.results.post;	

	 Ti.API.debug(" =================== YQL DENTRO DO JS: " + JSON.stringify(posts));
	
	// create THE TABLE ROWS
	for (var k=0; k < posts.length; k++)
	{
		var post 		= posts[k];
		var _caption 	= post.caption;
		var _pubId 		= post.pubid;
		var _postUrl 	= post.url;
		var _type 		= post.type;
		var _guid 		= post.guid;

		// Checks the types of posts and then sets the proper content
		switch(_type)
		{
			case 'photo':
			{
				var _content = post.content.thumb;				
				break;
			}
			case 'video':
			{
				var _content = post.content;

				//IF VIMEO 
				if (_content.indexOf("vimeo") != -1)
				{
					continue;
				}
				break;
			}
			case 'text':
			{
				var _content = post.content;
				break;
			}
			case 'comment':
			{
				var _caption = post.comment;
				break;
			}
		}
	
		// Creates the ROW
=======

		
	
	Ti.API.debug("Entered on POst Loop");
	
	var post = posts[k];
	var _caption = post.caption;
	var _pubId = post.pubid;
	var _postUrl = post.url;
	var _type = post.type;
	// var _videoUrl = posts
		
	if (_type != "comment") {


		if (_type == "photo")
		{
			var _content = post.content.thumb;
			
		} else if (_type == "video")
		{
			var _content = post.content;
			
		} else if (_type == "text")
		{
			var _content = post.content;
			
		} else {
			
			var _content = "";
		}
		
		
>>>>>>> 847cd2d57914f8e151206be31a79aca705fba7be
	    if (count == 0) {
			var row = Ti.UI.createTableViewRow();
			row.height = 245;
			row.className = 'datarow';
<<<<<<< HEAD
			//row.clickName = 'row';
		}
	
		// Adds the post view
		var postView = createPost(_content, _caption, _pubId, _postUrl, _type, count, _guid);	
		row.add(postView);

		count++;
	
=======
			row.clickName = 'row';
		}
		
		
		
		var postView = createPost(_content, _caption, _pubId, _postUrl, _type, count);	
		row.add(postView);
	
		count++;
		
>>>>>>> 847cd2d57914f8e151206be31a79aca705fba7be
		// Verifies if it is the third post and closes the row
		if (count == 3){
			
			data.push(row);
		 	count = 0;
<<<<<<< HEAD

		}

	}
	//Sets the new Table with updated Posts
	tableView.setData(data);
=======
	
		}

	}
>>>>>>> 847cd2d57914f8e151206be31a79aca705fba7be
}

var tableView = Titanium.UI.createTableView({
	backgroundColor: "transparent",
	separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
	selectionStyle:'none'
});


win.add(tableView);

// ==================
// = CLICK LISTENER =
// ==================

tableView.addEventListener('click', function(e)
{
	Ti.API.info('table view row clicked - Guid: ' + e.source.guid + 'e PubID: ' + e.source.pubId);
	// use rowNum property on object to get row number
	// var rowNum = e.index;
	// var updateRow = createUpdateRow('You clicked on the '+e.source.clickName);
	// tableView.updateRow(rowNum,updateRow,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.LEFT});	
})

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

// ===================
// = PULL TO REFRESH =
// ===================
function formatDate()
{
	var date = new Date;
	var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
	if (date.getHours()>=12)
	{
		datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
	}
	else
	{
		datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
	}
	return datestr;
}


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
	text:"Pull to reload",
	// left:55,
	width:200,
	bottom:30,
	height:"auto",
	color:"Gray",
	textAlign:"center",
	font:{fontSize:13,fontWeight:"bold"}
});

var lastUpdatedLabel = Ti.UI.createLabel({
	text:"Last Updated: "+formatDate(),
	// left:55,
	width:200,
	bottom:15,
	height:"auto",
	color:"Gray",
	textAlign:"center",
	font:{fontSize:12}
});


tableHeader.add(arrow);
tableHeader.add(statusLabel);
tableHeader.add(lastUpdatedLabel);
tableHeader.add(actInd);

tableView.headerPullView = tableHeader;

var pulling = false;
var reloading = false;

function beginReloading()
{
	tableView.setData([]);
	setTimeout(function()
	{	
		setTableViewData();
	},1000)
	
	setTimeout(endReloading,3000);
}

function endReloading()
{
	// when you're done, just reset
	tableView.setContentInsets({top:0},{animated:true});
	reloading = false;
	lastUpdatedLabel.text = "Last Updated: "+formatDate();
	statusLabel.text = "Pull down to refresh...";
	actInd.hide();
	arrow.show();
}

tableView.addEventListener('scroll',function(e)
{
	var offset = e.contentOffset.y;
	if (offset <= -65.0 && !pulling)
	{
		var t = Ti.UI.create2DMatrix();
		t = t.rotate(-180);
		pulling = true;
		arrow.animate({transform:t,duration:180});
		statusLabel.text = "Release to refresh...";
	}
	else if (pulling && offset > -65.0 && offset < 0)
	{
		pulling = false;
		var t = Ti.UI.create2DMatrix();
		arrow.animate({transform:t,duration:180});
		statusLabel.text = "Pull down to refresh...";
	}
});

tableView.addEventListener('scrollEnd',function(e)
{
	if (pulling && !reloading && e.contentOffset.y <= -65.0)
	{
		reloading = true;
		pulling = false;
		arrow.hide();
		actInd.show();
		statusLabel.text = "Reloading...";
		tableView.setContentInsets({top:60},{animated:true});
		arrow.transform=Ti.UI.create2DMatrix();
		beginReloading();
	}
});

setTableViewData();
