var win = Ti.UI.currentWindow;

var baseView = Ti.UI.createView({
	backgroundColor:'transparent',
	width:'100%',
	height: '100%',
	top:0,
});
win.add(baseView);

//Set current timestamp

var timestamp = function() {
	return((new Date()).getTime());
};

var now   = timestamp();

// =======================
// = DASHBOARD TABLEVIEW =
// =======================

//RETRIEVING YQL OBJECT
var yql = win.yql; // Holds YQL Object to make queries
var myMemeInfo = win.memeInfo; //holds the LoggedIn User Meme's Information

// ==============================
// = LOADING PLACE HOLDER LABEL =
// ==============================
// var loadingPlaceholder = Titanium.UI.createLabel({
//     color:'#999999',
//     text: "Loading Posts...",
//     textAlign:'center',
// 	font: {
// 		fontSize:45,
// 		fontFamily:'Helvetica Neue'
// 		},
// 	zIndex: 3
// });
// baseView.add(loadingPlaceholder);
// 
// loadingPlaceholder.show();


// Creating the List Post Table View

var tableView = Titanium.UI.createTableView({
	backgroundColor: "transparent",
	separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
	selectionStyle:'none'
});

baseView.add(tableView);



// ================================
// = GET LAST DASHBOARD TIMESTAMP =
// ================================

// var getLastItem = function(){
// 	var yqldata = yql.query("SELECT timestamp FROM meme.user.dashboard | tail(count=1)");
// 	var last_timestamp = yqldata.query.results.post.timestamp;	
// 
// 	//Ti.API.debug(" ============= Last Timestamp on Dashboard: " + last_timestamp);
// 	
// 	return(last_timestamp);
// 	
// }
// 
// getLastItem();

/*

SELECT * FROM meme.user.dashboard WHERE start_timestamp IN (
	SELECT timestamp FROM meme.user.dashboard WHERE start_timestamp IN (
		SELECT timestamp FROM meme.user.dashboard |tail(count=1) // ultimo timestamp do primeiro dashboard
	)|tail(count=1) | tail(count=9)
) | tail(count=1)

// tras o segundo page do dashboard
SELECT * FROM meme.user.dashboard WHERE start_timestamp IN (SELECT timestamp FROM meme.user.dashboard |tail(count=1)) | tail (count=9)

SELECT * FROM meme.user.dashboard WHERE start_timestamp IN (SELECT timestamp FROM meme.user.dashboard WHERE start_timestamp IN (SELECT timestamp FROM meme.user.dashboard |tail(count=1)) |tail(count=1)) | tail (count=9)


*/



// ===================================================
// = CREATING POST VIEW TO EMBEDDED IN THE TABLEVIEW =
// ===================================================

var createPost = function(pContent, pCaption, pPubId, pPostUrl, pType, pColumn, pGuid)
{
	var __id_img;
	var __id_bg_caption;
	var __id_caption;
	
	//create a black box view with a unique name including the PubId
	
	var blackBoxView = "blackBoxView_" + pPubId + "_" + pGuid;
	 Ti.API.debug("blackBoxView: " + blackBoxView);
	
	var blackBoxView = Ti.UI.createView({
		backgroundColor:'black',
		width: 317,
		height: 241,
		top: 5
		//className:"basicBackBoxView"
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
			height: 'auto'
		});
		blackBoxView.add(postImageView);
		
		if (pContent.indexOf(".gifa") != -1){
			
			//Ti.API.info("Found a Animated GIF: " + pContent);
			
			var img_play_btn = Titanium.UI.createImageView({
	            image:'images/play.png',
	            top:96,
	            left:134,
	            width:38,
	            height:38
	        });
	        blackBoxView.add(img_play_btn);
			
		} else {
			
			
		}	
	}
	
	// create an Video view
	if (pType == "video"){	
		
		var _videoThumb;
		var _videoId;
		
		if (pContent.indexOf("vimeo") != -1){
			
			Ti.API.info("Found Vimeo Video: " + pContent);
			// If VIMEO VIDEO
			
			//REQUEST VIMEO oEmbed DATA
			// var xhr = Titanium.Network.createHTTPClient();
			//     // xhr.setTimeout([99000]);
			// 
			//     xhr.onerror = function(e) {
			//         Ti.API.info("ERROR: " + e.error);
			//     };
			// 
			//     xhr.onload = function(e) {
			//         Ti.API.info('Vimeo RESPONSE CODE: ' + this.status + ' And Response Text: ' + this.responseText + ' and This is the XML' + this.responseXML);
			// 	//	var vimeoEmbed = JSON.parse(this.responseText);
			// 	
			// 		//Ti.API.info('Vimeo RESPONSE' + vimeoEmbed.title);
			//     };
			// 
			// 	eContent = encodeURIComponent(pContent);
			// 	
			//     xhr.open('GET','http://vimeo.com/api/oembed.xml?url=' + eContent);
			// 	Ti.API.info('http://vimeo.com/api/oembed.json?url=' + eContent);
			// 	
			// 	// xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8', 'Content-Length', '0');
			//     xhr.send(); 
			
	       // _videoId = pContent.match(/v=([a-zA-Z0-9_-]{11})&?/)[1];
	       // _videoThumb = "http://img.youtube.com/vi/" + _videoId + "/0.jpg";
			
		} else {
			
			//ELSE YOUTUBE
			_videoId = pContent.match(/v=([a-zA-Z0-9_-]{11})&?/)[1];
	        _videoThumb = "http://img.youtube.com/vi/" + _videoId + "/0.jpg";
		}

			var postImageView = Titanium.UI.createImageView({
				image: _videoThumb,
				top:5,
				left:5,
				width:307,
				height:231
			});
			blackBoxView.add(postImageView);

	        var img_play_btn = Titanium.UI.createImageView({
	            image:'images/play.png',
	            top:96,
	            left:134,
	            width:38,
	            height:38
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
            height:18
        });
        blackBoxView.add(img_quote);

       var pContentStripado = pContent.replace(/(<([^>]+)>)/ig,"").replace(/&.+;/,"");

       var minipost_text = Titanium.UI.createLabel({
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
			// minipost_text.top = 0;
			
		} else if (pContentStripado.length < 60) {
			
			minipost_text.font = {fontSize:25,fontFamily:'Helvetica Neue'};
			
		} else {
			
			minipost_text.font = {fontSize:18,fontFamily:'Helvetica Neue'};
		}

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
			font:{
				fontSize:12,
				fontFamily:'Helvetica Neue'
			},
		    textAlign:'left',
			top:14,
			left:14,
			width:274,
			height:34
		});
		__id_bg_caption.add(__id_caption);
	}
	
	//Creating the new 
	var blackBoxLink = "blackBoxLink_" + pPubId + "_" + pGuid;
	//Ti.API.debug("blackBoxView: " + blackBoxView);
	
	var blackBoxLink = Ti.UI.createView({
		backgroundColor:'transparent',
		width: 317,
		height: 241,
		top: 0,
		pubId:pPubId,
		guid:pGuid,
		zindex:99
	});
	blackBoxView.add(blackBoxLink);
	
	
	//Returns the BlackBoxView Obj with the complete design
	return(blackBoxView);
	
}

// ===============================
// = FUNCTION TO BUILD DASHBOARD =
// ===============================

// Creates an empty array to handle the Unique PubIDs from posts to show on Dashboard
var pubIdList = [];

//defines the variable that will hold the last timestamp from a given dashboard query
var lastTimestamp;

//variable to hold incomplete rows
var tempRow = null;
var tempItemRowCount = 0;



var getDashboardData = function (pTimestamp){


	
	if (pTimestamp == null)
	{
		lastRow = 0;
		var data = [];
		tempRow = null;
		tempItemRowCount = 0;
		
		yqlQuery = "SELECT * FROM meme.user.dashboard | meme.functions.thumbs(width=307,height=231)";
		
	} else {
	
		Ti.API.info(" ####### STARTING UPDATE 'PRA BAIXO' QUERY ##########");
		
		yqlQuery = "SELECT * from meme.user.dashboard where start_timestamp =" + (pTimestamp-1) + " | meme.functions.thumbs(width=307,height=231)";

	}
	
	var itemPerRowCount = 0;
	
	
	//Ti.API.debug(" ####### YQL Query executed: " + yqlQuery);

	var yqldata = yql.query(yqlQuery);
	var posts = yqldata.query.results.post;

	//Defines the last post timestamp so we can paginate the Dashboard
	lastTimestamp = posts[(posts.length - 1)].timestamp;
	lastTimestamp = parseInt(lastTimestamp);
	
	//Ti.API.debug("last Time Stamp: " + lastTimestamp );


	// create THE TABLE ROWS
	for (var k=0; k < posts.length; k++)
	{

		var post 		= posts[k];
		var _caption 	= post.caption;
		var _pubId 		= post.pubid;
		var _postUrl 	= post.url;
		var _type 		= post.type;
		var _guid 		= post.guid;
		var _originPubId = post.origin_pubid;
		
		// 	//verify and removes the repost repetition in the Dashboard
		// 	// 
		// 	// if (pubIdList.indexOf(_pubId) != -1 && pubIdList.indexOf(_originPubId) != -1) {
		// 	// 	
		// 	// 	if (_originPubId != null && pubIdList.indexOf(_originPubId) == -1){
		// 	// 
		// 	// 		pubIdList.push(_originPubId);
		// 	// 
		// 	// 	} else if (_originPubId == null && pubIdList.indexOf(_pubId) == -1){
		// 	// 
		// 	// 		pubIdList.push(_pubId);
		// 	// 	}
		// 	// 	
		// 	// } else {
		// 	// 
		// 	// 	continue;
		// 	// }
		// Ti.API.info("Content of the pubIdList: " + JSON.stringify(pubIdList));


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

					//Ti.API.debug("Conteudo do Post de Texto: " + _content);

					break;
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
				row.height = 245;
			}
			
		}
		
		// Adds the post view to a ROW 	
		var postView = createPost(_content, _caption, _pubId, _postUrl, _type, itemPerRowCount, _guid);
		
		row.add(postView);

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
				
					// data.push(row);
				}
			
		} else {
			
		//	Ti.API.info("Temp Row Updated, number of items on TEMP Row: " + itemPerRowCount);
			
			// if loop ends with an incomplete row it safes this ROW for the next request
			tempRow = row;
			tempItemRowCount = itemPerRowCount;
			
		}

	} //End FOR loop

		//Sets the new Table rows with updated Posts
	
	if (pTimestamp == null)
	{
		tableView.setData(data);
		
	} else {
		
		return(posts);
	}
	
}


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


// ==================
// = CLICK LISTENER =
// ==================

tableView.addEventListener('click', function(e)
{
	Ti.API.info('table view row clicked - Guid: ' + e.source.guid + 'e PubID: ' + e.source.pubId);
	
	var winPermalink = Ti.UI.createWindow({
	    url: 'permalink.js',
	    name: 'Permalink Details',
	    backgroundColor:'transparent',
		left:0,
		top:0,
		height:'100%',
		width:'100%',
		navBarHidden: true,
		zIndex: 6,
		yql: yql, //passing Variables to this Window
		myMemeInfo: myMemeInfo,
		pGuid: e.source.guid,
		pPubId: e.source.pubId
	});

	winPermalink.open();
	
	// use rowNum property on object to get row number
	// var rowNum = e.index;
	// var updateRow = createUpdateRow('You clicked on the '+e.source.clickName);
	// tableView.updateRow(rowNum,updateRow,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.LEFT});	
});

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
	
	//tableView.setData([]);
	setTimeout(function()
	{	
		getDashboardData(null);

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

// =======================
// = SCROLL DOWN LOADING =
// =======================

//var navActInd = Titanium.UI.createActivityIndicator();
//win.setRightNavButton(navActInd);

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
	
	setTimeout(endUpdate,2000);
}

function endUpdate()
{

	updating = false;
	
	tableView.deleteRow(lastRow,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
	
	// Get posts from Dashboard
	getDashboardData(lastTimestamp);

	// just scroll down a bit to the new rows to bring them into view
	tableView.scrollToIndex(lastRow-3,{animated:true,position:Ti.UI.iPhone.TableViewScrollPosition.NONE})
	
	bellowActInd.hide();
	
}

var lastDistance = 0; // calculate location to determine direction

tableView.addEventListener('scroll',function(e)
{
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
		var nearEnd = theEnd * 1; 
		
		if (!updating && (total >= nearEnd))
		{
			beginUpdate();
		}
	}
	lastDistance = distance;
});

getDashboardData(null);

