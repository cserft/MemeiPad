Ti.include('lib/commons.js');

var win = Ti.UI.currentWindow;

win.orientationModes =  [
	Titanium.UI.LANDSCAPE_LEFT,
	Titanium.UI.LANDSCAPE_RIGHT
];

var openingDetails = false; // controls multiple Permalinks Opened

//Set current timestamp
var timestamp = function() {
	return((new Date()).getTime());
};

var now = timestamp();

//RETRIEVING YQL OBJECT
var yql = win.yql; // Holds YQL Object to make queries
var win1 = win.win1; // Window Original created on app.js
var pDashboardType = win.pDashboardType;
var myMemeInfo = win.myMemeInfo; 

// Creating the List Post Table View

var baseView = Ti.UI.createView({
    backgroundColor:'transparent',
	width:'100%',
	height: '100%',
	top:0
});
win.add(baseView);

// =======================
// = DASHBOARD TABLEVIEW =
// =======================

Ti.App.addEventListener('remove_tableview', function(e) {
	Ti.API.debug("Removing TableView!!!!!!");
    baseView.remove(tableView);
});

var tableView = Titanium.UI.createTableView({
	top:0,
	backgroundColor: "transparent",
	separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
	selectionStyle:'none',
	zIndex: 3
});

baseView.add(tableView);

// ===================================================
// = CREATING POST VIEW TO EMBED IN THE TABLEVIEW =
// ===================================================
var createPostCaption = function(blackBoxView, pCaption) {
	if (pCaption != undefined && pCaption.length >0 && pCaption != "") {
		var __id_bg_caption = Titanium.UI.createView({
			backgroundColor: 	'#000',
			top: 				177,
			left: 				5,
			width: 				307,
			height: 			64,
			opacity: 			0.8,
			zIndex: 			50
		});
		blackBoxView.add(__id_bg_caption);

		//Strips HTML Entities and Tags from the Caption
		var pCaptionStripped = strip_html_entities(pCaption);

		var __id_caption = Titanium.UI.createLabel({
			color: 		'#FFF',
			text: 		pCaptionStripped,
			font: 		{
							fontSize:12,
							fontFamily:'Helvetica Neue'
						},
		    textAlign:  'left',
			top: 		14,
			left: 		14,
			width: 		274,
			height: 	34
		});
		__id_bg_caption.add(__id_caption);
	}
};

var createPost = function(pContent, pCaption, pPubId, pPostUrl, pType, pColumn, pGuid) {
	var __id_img;
	var __id_bg_caption;
	var __id_caption;
	
	//create a black box view with a unique name
	var blackBoxView = Ti.UI.createView({
		backgroundColor:'black',
		width: 317,
		height: 241,
		top: 5
	});
	
	var blackBoxLink = Ti.UI.createButton({
		backgroundColor: 		'transparent',
		width: 					317,
		height: 				241,
		top: 					0,
		backgroundSelectedImage: 'images/btn_dashboard_link.png',
		style: 					Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		pubId: 					pPubId,
		guid: 					pGuid,
		zindex: 				99
	});
	
	// Sets the proper Column Left position
	if (pColumn == 0) {
		blackBoxView.left = 21;	
	} else if (pColumn == 1) {
		blackBoxView.left = 354;
	} else if (pColumn == 2) {
		blackBoxView.left = 688;
	}
	
	// create a post view
	if (pType == "photo") {
		var postImageView = Ti.UI.createImageView({
			image: pContent,
			top:5,
			left:5,
			width:307,
			height: 'auto',
			zIndex: 0,
			defaultImage: 'images/default_img.png'
		});
		blackBoxView.add(postImageView);

		if (pContent.indexOf(".gifa") != -1){

			var img_play_btn = Ti.UI.createImageView({
	            image:'images/play.png',
	            top:86,
	            left:134,
	            width:38,
	            height:38
	        });
	        blackBoxView.add(img_play_btn);
		}
	}
	
	// create a Video view
	if (pType == "video") {
		getVideoData(pContent, function(_videoThumb) {
			// Ti.API.debug('my video thumb is [' + _videoThumb + ']');

			var postImageView = Ti.UI.createImageView({
				image: _videoThumb,
				top:5,
				left:5,
				width:307,
				height:231,
				defaultImage: 'images/default_img_video.png'
			});
			blackBoxView.add(postImageView);

	        var img_play_btn = Ti.UI.createImageView({
	            image:'images/play.png',
	            top:96,
	            left:134,
	            width:37,
	            height:37
	        });
	        blackBoxView.add(img_play_btn);
			
			// add blackboxview again to ensure it is on top of everything
			// this is necessary because this function is executed assynchronously
			blackBoxView.add(blackBoxLink);
			
			// same thing for post caption
			createPostCaption(blackBoxView, pCaption);
		});
	}
	
	// create a Text view
	if(pType == "text") {

		var img_quote = Ti.UI.createImageView({
		    image:'images/quote_icon.png',
		    top:25,
		    left:15,
		    width:25,
		    height:20
		});
		blackBoxView.add(img_quote);

		var pContentStripado = strip_html_entities(pContent);

		var minipost_text = Ti.UI.createLabel({
		    color:'#FFF',
		    text: pContentStripado,
		    textAlign:'left',
		    top:20,
		    left:50,
		    width:217,
		    height:181
		});

		// Applying different Font Sizes depending on the Size of the Text Post
		if (pContentStripado.length < 30){
			minipost_text.font = {fontSize:30,fontFamily:'Helvetica Neue'};
		} else if (pContentStripado.length < 60) {
			minipost_text.font = {fontSize:25,fontFamily:'Helvetica Neue'};
		} else {
			minipost_text.font = {fontSize:18,fontFamily:'Helvetica Neue'};
		}

   		blackBoxView.add(minipost_text);
	}

	// add the Caption to the BlackBox
	createPostCaption(blackBoxView, pCaption);
	
	// last but not least, add blackbox on top of everything
	blackBoxView.add(blackBoxLink);
	
	//Returns the BlackBoxView Obj with the complete design
	return(blackBoxView);
	
};

// ===============================
// = FUNCTION TO BUILD DASHBOARD =
// ===============================

//defines the variable that will hold the last timestamp from a given dashboard query
var lastTimestamp;

//variable to hold incomplete rows
var tempRow = null;
var tempItemRowCount = 0;
var data = [];

var getDashboardData = function (pTimestamp, pDashboardType) {
	Ti.API.info("DashboardType from getDashboardData Function: " + pDashboardType);
	
	if (pDashboardType === "logged") {
		
		if (pTimestamp == null)
		{
			// Reload TableVIew or First Build
			
		//	clear Table
			lastRow = 0;
			data = [];
			tempRow = null;
			tempItemRowCount = 0;
			
			Ti.API.info(" ####### STARTING DASHBOARD QUERY ##########");
			yqlQuery = "SELECT * FROM meme.user.dashboard | meme.functions.thumbs(width=307,height=231)";
		
		} else {
	
			Ti.API.info(" ####### STARTING UPDATE 'PRA BAIXO' QUERY ##########");
			yqlQuery = "SELECT * from meme.user.dashboard where start_timestamp =" + (pTimestamp-1) + " | meme.functions.thumbs(width=307,height=231)";

		}
		
	} else {
		
		if (pTimestamp == null)
		{
			// NOT LOGGED IN SO GETS THE FEATURED POSTS
			// Reload TableVIew or First Build
			lastRow = 0;
			data = [];
			tempRow = null;
			tempItemRowCount = 0;
		
			Ti.API.info(" ####### STARTING FEATURED DASHBOARD (NOT LOGGED IN) ##########");

			yqlQuery = "SELECT * FROM meme.posts.featured WHERE locale='en' | meme.functions.thumbs(width=307,height=231)";
		}
	}

	var itemPerRowCount = 0;
	
	Ti.API.info(" ####### YQL Query executed: " + yqlQuery);

	var yqldata = yql.query(yqlQuery);
	var posts = yqldata.query.results.post;
	
	// Ti.API.debug(" ####### YQL Query POSTS RESULT: " + JSON.stringify(posts));

	//Defines the last post timestamp so we can paginate the Dashboard
	lastTimestamp = posts[(posts.length - 1)].timestamp;
	lastTimestamp = parseInt(lastTimestamp);
	
	//Ti.API.debug("last Time Stamp: " + lastTimestamp );


	// create THE TABLE ROWS
	for (var k=1; k < posts.length; k++)
	{
		var post 		= posts[k-1];
		var _caption 	= post.caption;
		var _pubId 		= post.pubid;
		var _postUrl 	= post.url;
		var _type 		= post.type;
		var _guid 		= post.guid;
		var _originPubId = post.origin_pubid;
		
		// Checks the types of posts and then sets the proper content
		// We don't render Video Videos and Comments

		if (_type != "comment"){

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
					break;
				}
				case 'text':
				{
					var _content = post.content;
					break;
				}
				case 'audio':
				{				
					continue; 
				}

			}

		} else {

			//IF Type == Comment then break the current Loop and move to the next post item.
			continue;

		}
		
		// verifies if there is any incomplete row and continues from there.
		if (tempRow != null) {
			
		//	Ti.API.info("Temp Row Found, number of items in this Row: " + tempItemRowCount);
			
			itemPerRowCount = tempItemRowCount;
			
			//itemPerRowCount++;
			
			var row = tempRow;
			
		} else {
			
		//	Ti.API.info("Temp Row NOT Found. Creating a new Row");
			
			if (itemPerRowCount == 0) {
				var row = Ti.UI.createTableViewRow();
				row.height = 256;
			}
			
		}
		
		// Adds the post view to a ROW 	
		// Verifying the variables for each post
		row.add(createPost(_content, _caption, _pubId, _postUrl, _type, itemPerRowCount, _guid));

		itemPerRowCount++;
		
		// Verifies if it is the third post and closes the row
		if (itemPerRowCount == 3){
			
				tempRow = null;
				itemPerRowCount = 0;
				lastRow += 1;
				tempItemRowCount = 0;

				if (pTimestamp == null)
				{
					data.push(row);
										
				//	Ti.API.info("###### Just ADDED row number: " + lastRow );
			
				} else {
					
					// Ti.API.info("###### Appending ROW ");
				
					tableView.appendRow(row,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.NONE});

					//	Ti.API.info("###### APPENDING Row number: " + lastRow );
				}
			
		} else {
			
			//Ti.API.info("Temp Row Updated, number of items on TEMP Row: " + itemPerRowCount);
			
			// if loop ends with an incomplete row it safes this ROW for the next request
			tempRow = row;
			tempItemRowCount = itemPerRowCount;
			
		}

	} //End FOR loop

	//Sets the new Table rows with updated Posts
	if (pTimestamp == null)
	{
		Ti.API.debug("reseting TableView data");
		tableView.setData(data);
		
	} else {
		
		return(posts);
	}
	
	
	// open Main Window from app.js with Transition
	win1.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
	
}


// ==================
// = CLICK LISTENER =
// ==================

// Avoiding multiple Permalinks Opening
Ti.App.addEventListener('openingDetailsFalse', function(e)
{
	openingDetails = false;
});

tableView.addEventListener('click', function(e)
{
	// Ti.API.info('event fired was ' + JSON.stringify(e));
	// Ti.API.info('event source is ' + JSON.stringify(e.source));
	Ti.API.debug('table view row clicked - Guid: ' + e.source.guid + 'e PubID: ' + e.source.pubId);
	
	// permalink should open only when click was on the blackBox
	// otherwise there will be no guid and pubid data and the app will crash
	if (e.source.guid && e.source.pubId) {
		// Sets the Permalink Animation startup settings
		var t = Ti.UI.create2DMatrix();
		t = t.scale(0);

		var winPermalink = Ti.UI.createWindow({
		    url: 'permalink.js',
		    name: 'Permalink Window',
		    backgroundColor:'transparent',
			left:0,
			top:0,
			height:'100%',
			width:'100%',
			navBarHidden: true,
			zIndex: 6,
			transform: t,
			pDashboardType: pDashboardType,
			yql: yql, //passing Variables to this Window
			pGuid: e.source.guid,
			pPubId: e.source.pubId
		});

		if (myMemeInfo) {
			winPermalink.myMemeInfo = myMemeInfo;
		}


		// Creating the Open Permalink Transition
		// create first transform to go beyond normal size
		var t1 = Titanium.UI.create2DMatrix();
		t1 = t1.scale(1.1);

		var a = Titanium.UI.createAnimation();
		a.transform = t1;
		a.duration = 200;

		// when this animation completes, scale to normal size
		a.addEventListener('complete', function()
		{
			var t2 = Titanium.UI.create2DMatrix();
			t2 = t2.scale(1.0);
			winPermalink.animate({transform:t2, duration:200});
		});

		if (openingDetails == false){

			Ti.App.fireEvent('show_indicator', {
				message: "Loading...",
				color: "#AB0899",
				size: 200
			});
			openingDetails = true;
			winPermalink.openingDetails = openingDetails;
			winPermalink.open(a);	
		}

		setTimeout(function()
		{
			Ti.App.fireEvent('hide_indicator');
		},10000);
	}
});


// var startTouchX;
// 
// tableView.addEventListener('touchstart', function(e)
// {
// 	Ti.API.info('Table TouchStarted - Guid: ' + e.source.guid + 'e PubID: ' + e.source.pubId + ' Xstart: ' + e.x);
// 	startTouchX = e.x;
// 	
// 	// Ti.UI.createAlertDialog({
// 	// 	        title: 'SWIPED',
// 	// 	        message: "Great you swipped"
// 	// 	    }).show();
// 	// 
// 	
// });
// 
// tableView.addEventListener('touchend', function(e)
// {
// 	Ti.API.info('Table TouchEnded - Guid: ' + e.source.guid + 'e PubID: ' + e.source.pubId + ' Xend: ' + e.x);
// 	
// 	var endTouchX = e.x;
// 	var swipe_delta = startTouchX - endTouchX;
// 	
// 	if (swipe_delta >= 70) {
// 	
// 		Ti.API.info('Flip This Object');
// 		
// 	} else {
// 				
// 
// 				
// 	}
// 	
// 	// Ti.UI.createAlertDialog({
// 	// 	        title: 'SWIPED',
// 	// 	        message: "Great you swipped"
// 	// 	    }).show();
// 	// 
// 	
// });

// =======================
// = SCROLL DOWN LOADING =
// =======================

var updating = false;

var loadingRow = Ti.UI.createTableViewRow({
	className: "LoadingRow", 
	// backgroundColor: "black",
	// opacity: 0.9,
	height: 100
});

var bellowActInd = Titanium.UI.createActivityIndicator({
	left:420,
	bottom:50,
	width:30,
	height:30
});


var loadingLabel = Ti.UI.createLabel({
	text: "Loading...",
	// left:55,
	width: 200,
	bottom: 50,
	height: 30,
	color: 'white',
	textAlign: 'center',
	font:{fontSize:18,fontWeight:"bold"}
});

loadingRow.add(bellowActInd);
loadingRow.add(loadingLabel);

function beginUpdate()
{
	updating = true;
	bellowActInd.show();

	tableView.appendRow(loadingRow);
	
	setTimeout(endUpdate,2500);
}

function endUpdate()
{

	updating = false;
	
	tableView.deleteRow(lastRow,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
	
	// Get posts from Dashboard
	getDashboardData(lastTimestamp, pDashboardType);

	// just scroll down a bit to the new rows to bring them into view
    //tableView.scrollToIndex(lastRow,{animated:true,position:Ti.UI.iPhone.TableViewScrollPosition.NONE})
	
	bellowActInd.hide();
	// Ti.App.fireEvent('hide_indicator');
	
}

var lastDistance = 0; // calculate location to determine direction

tableView.addEventListener('scroll',function(e)
{	
	// Used for the Pull to Refresh
	Ti.API.warn("scroll activated");
	var offset = e.contentOffset.y;
	var height = e.size.height;
	var total = offset + height;
	var theEnd = e.contentSize.height;
	var distance = theEnd - total;
	
	// going down is the only time we dynamically load,
	// going up we can safely ignore -- note here that 
	// the values will be negative so we do the opposite
	if (distance < lastDistance)
	{
		// adjust the % of rows scrolled before we decide to start fetching
		var nearEnd = theEnd * 0.2; 
		
		if (!updating && pDashboardType === "logged" && (total >= nearEnd))
		{
			beginUpdate();
		}
	}
	lastDistance = distance;
});



// ===================
// = PULL TO REFRESH =
// ===================
function formatDate() {
	var date = new Date,
		minstr = date.getMinutes(); if (minstr<10) {minstr="0"+minstr;} 		// fixes minutes when less than 10
		datestr = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
		hourstr = ' ' + date.getHours() + ':' + minstr + ' AM'; 
		
	if (date.getHours() >= 12) {
		hourstr = ' ' + (date.getHours() == 12 ? date.getHours() : date.getHours() - 12) + ':' + minstr + ' PM';
	}
	
	return datestr + hourstr;
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

// if User is logged in then it will show the Pull to Refresh Feature
if (pDashboardType === "logged"){
	
	tableView.headerPullView = tableHeader;
}


var pulling = false;
var reloading = false;

function beginReloading()
{
	
	//tableView.setData([]);
	setTimeout(function()
	{	
		getDashboardData(null, pDashboardType);
		beginUpdate();

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
	if (pDashboardType === "logged") {
		
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
	}
});

tableView.addEventListener('scrollEnd',function(e)
{
	if (pDashboardType === "logged" && pulling && !reloading && e.contentOffset.y <= -65.0)
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
//variable that configs the number of Dashboard pages that loads when the app starts

if (pDashboardType === "logged") {
	// Ti.API.debug("Mounting Dashboard Logged: pDashboardType= " + pDashboardType);
	getDashboardData(null, pDashboardType);
	beginUpdate();
} else {
	// Ti.API.debug("Mounting Dashboard Not Logged: pDashboardType= " + pDashboardType);
	getDashboardData(null, pDashboardType);
}

Ti.App.addEventListener('reloadDashboard', function(e) {
	// Ti.API.debug("Reloading Dashboard");
	beginReloading();
});
