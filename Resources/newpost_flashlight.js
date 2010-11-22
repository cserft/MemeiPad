// ======================
// = AWESOME SEARCH BAR =
// ======================
var monitor_id;
var monitor_started = false;
var monitor_value;
var last_monitor_value;
var flashlight_created = false;

var flashlight_text_change_monitor = function(new_monitor_value) {
	
	Ti.API.debug('flashlight_text_change_monitor invoked for query = ' + new_monitor_value);
	
	// updates text change monitor value
	monitor_value = new_monitor_value;
	
	// CHECKS IF THIS IS A YOUTUBE/VIMEO/FLICKR LINK 
	// Detects what type of YouTube link
	var youtubeVideoArray = new_monitor_value.match(/v=([a-zA-Z0-9_-]{11})/);
	var youtubeShortArray = new_monitor_value.match(/youtu.be\/([a-zA-Z0-9_-]{11})/);
	var vimeoArray = new_monitor_value.match(/vimeo.com\/([\d]+)&?$/);
	
	// Flickr REGEX
	// $flickr_url = preg_match('/flickr.com\/photos\/[^\/]+\/([0-9]+)/i', $url, $flickr_match);
	// $farm_url = preg_match('/flickr\.com\/[0-9]+\/([0-9]+)_(.*)/i', $url, $farm_match);
	
	if (youtubeVideoArray != null && youtubeVideoArray != undefined) {
		
		getVideoData(new_monitor_value, function(_videoThumb, _data) {
		//	Ti.API.debug('my video thumb is [' + _videoThumb + ']');
			editTitleField.value = _data.title;	
			postTitle = _data.title;
			
			//Sets the Image to the Video Thumbnail
			theImage = _data.thumbnail_url;
			videoLink = new_monitor_value;
			videoId = youtubeVideoArray[1];
			Ti.App.fireEvent("photoChosen", {typePhoto: 'flashlight'});
	
		});
		
	} else if (youtubeShortArray != null && youtubeShortArray != undefined) {
		
		getVideoData(new_monitor_value, function(_videoThumb, _data) {
		//	Ti.API.debug('my video thumb is [' + _videoThumb + ']');
			editTitleField.value = _data.title;	
			postTitle = _data.title;
			
			//Sets the Image to the Video Thumbnail
			theImage = _data.thumbnail_url;
			videoLink = new_monitor_value;
			videoId = youtubeShortArray[1];
			Ti.App.fireEvent("photoChosen", {typePhoto: 'flashlight'});
	
		});
		
	} else if (vimeoArray != null && vimeoArray != undefined) {
		
		getVideoData(new_monitor_value, function(_videoThumb, _data) {
		//	Ti.API.debug('my video thumb is [' + _videoThumb + ']');
			editTitleField.value = _data.title;	
			postTitle = _data.title;
			
			//Sets the Image to the Video Thumbnail
			theImage = _data.thumbnail_url;
			videoHtml = _data.html;
			videoLink = new_monitor_value;
			videoId = vimeoArray[1];
			Ti.App.fireEvent("photoChosen", {typePhoto: 'flashlight'});
	
		});
		
		Ti.API.info("Pasted link Vimeo ID: " + vimeoArray[1]);
		
	} else {
		
		flashlight_monitor_start();
	}
};

var flashlight_monitor_start = function() {
	if (!monitor_started) {
		Ti.API.debug('change monitor started');
		monitor_started = true;
		monitor_id = setInterval(flashlight_monitor, 1000);
	}
}

var flashlight_monitor_stop = function() {
	clearInterval(monitor_id);
	monitor_started = false;
	monitor_value = null;
	last_monitor_value = null;
}

var flashlight_monitor = function() {
	if (monitor_value) {
		if (monitor_value == last_monitor_value) {
			Ti.API.debug('TIMEOUT reached with no changes, firing search!');
			flashlight_show();
			flashlight_monitor_stop();
		} else {
			last_monitor_value = monitor_value;
		}
	}
};

// Tabs
var tabsButtons = [
	{image:'images/tab_icon_video.png'},
	{image:'images/tab_icon_foto.png'},
	{image:'images/tab_icon_web.png'},	
	{image:'images/tab_icon_twitter.png'}	
];
var searchTabs = Titanium.UI.createTabbedBar({
	labels:tabsButtons,
	backgroundColor:'#333',
	top:0,
	height:49,
	style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
	index:0,
});

var flashlight_show = function() {
	if (searchTextField.value == '') {
		Ti.UI.createAlertDialog({
			title: 'Oops...',
			message: 'You need to write something before hitting the search button.',
		}).show();
	} else {
		flashlight_create();
	}
	
	Ti.App.fireEvent("showAwesomeSearch", {searchType: 0});
};

var flashlight_create = function() {
	queryText = searchTextField.value;
	
	if (!flashlight_created) {
		Ti.API.info('building flashlight (this must be done only once)');
		
		var flashlightTableView = Ti.UI.createTableView({
			top:50,
			height:204
		});
		popoverSearchView.add(flashlightTableView);
		popoverSearchView.add(searchTabs);
		
		Ti.App.addEventListener('showAwesomeSearch', function (e) {
		
			actIndFlashlight.show();

			Ti.API.debug("####### Type of search: " + e.searchType);

			switch(e.searchType) {
				case 0: // Video 
					Ti.API.info("####### Video Search ");
					yqlQuery = 'select * from youtube.search where query="' + queryText + '"';

					var yqlData = yql.query(yqlQuery);
					var videos = yqlData.query.results.video;
				
					// Ti.API.info("Videos Results: " + JSON.stringify(videos));

					//Loop to present the Search Results for YouTube
					var results = [];
					for (var c=0 ; c < videos.length ; c++)	
					{
						var video = videos[c];

						var thumb = video.thumbnails.thumbnail[0].content;
						var thumbFull = video.thumbnails.thumbnail[4].content;
					
						//Ti.API.info("Videos Link: " + JSON.stringify(videoLink));
						var row = Ti.UI.createTableViewRow({height:78});

						var title = Ti.UI.createLabel({
							text: video.title,
							color: '#863486',
							height:50,
							width: 192,
							left:110,
							textAlign:'left',
							font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'regular'},
						});

						var image = Ti.UI.createImageView({
							image : thumb,
							backgroundColor: 'black',
							height:75,
							width:100,
							left:2,
							defaultImage:'images/default_img.png'
						});
				
						var img_play_btn = Titanium.UI.createImageView({
				            image:'images/play.png',
				            top:20,
				            left:30,
				            width:37,
				            height:37
				        });

						row.add(image);
				        row.add(img_play_btn);
						row.add(title);
						row.add(Ti.UI.createView({
							height: 78,
							width: 310,
							zIndex: 2,
							title: video.title,
							content: video.content,
							image: thumbFull,
							videoId: video.id,
							videoLink: video.url,
							type: 'video'
						}));
					
						results[c] = row;
					}
					flashlightTableView.setData(results);
					flashlightTableView.scrollToIndex(0,{animated:true});
					searchTabs.index = e.searchType;
			
					break;
			
				case 1: // Flickr
					Ti.API.info("####### Photo Search ");
					yqlQuery = "SELECT * FROM flickr.photos.search WHERE text='" + queryText + "' AND license='4'";

					var yqlData = yql.query(yqlQuery);
					var photos = yqlData.query.results.photo;

					//Loop to present the Search Results for Flickr
					var results = [];
				
					for (var c=0 ; c < photos.length ; c++)	{
						var photo = photos[c];
				
						// form the flickr url
						var thumb = 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_t_d.jpg';
						var fullPhoto = 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';
						var title = Ti.UI.createLabel({
							text: photo.title,
							color: '#863486',
							height:55,
							width: 200,
							left:110,
							textAlign:'left',
							font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'regular'},
						});
						var image = Ti.UI.createImageView({
							image: thumb,
							backgroundColor: 'black',
							height:75,
							width:100,
							left:2,
							defaultImage:'images/default_img.png'
						});
					
						// create new row
						var row = Ti.UI.createTableViewRow({height:78});
						row.add(image);
						row.add(title);
						row.add(Ti.UI.createView({
							height: 78,
							width: 310,
							zIndex: 2,
							title: photo.title,
							fullPhoto: fullPhoto,
							type: 'photo'
						}));
					
						// add row to result
						results[c] = row;
					}
					flashlightTableView.setData(results);
					flashlightTableView.scrollToIndex(0,{animated:true});
					searchTabs.index = e.searchType;

					break;
			
				case 2: // Web Search
					Ti.API.info("####### Web Search ");
					yqlQuery = "SELECT title, abstract FROM search.web WHERE query='" + queryText + "'";
				
					var yqlData = yql.query(yqlQuery);
					var items = yqlData.query.results.result;
				
					//Loop to present the Search Results from the Web
					var results = [];
				
					for (var c=0 ; c < items.length ; c++) {
						var item = items[c];
						var titleStripped = item.title.replace(/(<([^>]+)>)/ig,"").replace(/&.+;/,"");
						var title = Ti.UI.createLabel({
							text: titleStripped,
							width: 310,
							height:15,
							top: 10,
							left:10,
							color: '#863486',
							textAlign:'left',
							font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'bold'}
						});
					
						if (item.abstract != null) {
							var abstractContent = item.abstract;
							var abstractStripped = abstractContent.replace(/(<([^>]+)>)/ig,"").replace(/&.+;/,"");
							var abstract = Ti.UI.createLabel({
								text: abstractStripped,
								color:'#333',
								height:50,
								width: 310,
								top: 25,
								left: 10,
								textAlign:'left',
								font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'regular'}
							});
						}
					
						// create new row
						var row = Ti.UI.createTableViewRow({
							height: 78
						});
						row.add(title);
						row.add(abstract);
						row.add(Ti.UI.createView({
							height: 78,
							width: 310,
							zIndex: 2,
							title: titleStripped,
							abstract: abstractStripped,
							type: 'text'
						}));
					
						// add row to result
						results[c] = row;
					}
					flashlightTableView.setData(results);
					flashlightTableView.scrollToIndex(0,{animated:true});
					searchTabs.index = e.searchType;
				
					break;
				
				case 3: // Twitter Search

					Ti.API.info("####### Twitter Search ");

					yqlQuery = "SELECT * FROM twitter.search WHERE q='" + queryText + "'";

					var yqlData = yql.query(yqlQuery);
					var items = yqlData.query.results.results;

					//Loop to present the Search Results from the Web
					var results = [];

					for (var c=0 ; c < items.length ; c++) {
						var item = items[c];

						var row = Ti.UI.createTableViewRow({height:78});
					
						var avatar = Ti.UI.createImageView({
							image : item.profile_image_url,
							backgroundColor: 'black',
							height:48,
							width:48,
							top:10,
							left:2,
							defaultImage:'images/default_img_avatar.png'
						});

						row.add(avatar);

						var username = Ti.UI.createLabel({
							text: '@' + item.from_user,
							color: '#863486',
							width: 250,
							height:15,
							top: 8,
							left:55,
							textAlign:'left',
							font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'bold'}
						});
						row.add(username);

						var tweet = Ti.UI.createLabel({
							text: item.text,
							color: '#333',
							height:52,
							width: 270,
							top: 23,
							left: 55,
							textAlign:'left',
							font:{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'}
						});
					
						row.add(tweet);
						row.add(Ti.UI.createView({
							height: 78,
							width: 310,
							zIndex: 2,
							username: '@' + item.from_user,
							tweet: item.text,
							type: 'twitter'
						}));
			
						results[c] = row;
					}
					flashlightTableView.setData(results);
					flashlightTableView.scrollToIndex(0,{animated:true});
					searchTabs.index = e.searchType;

					break;
			}
	
			//show the Popover
			popoverSearchView.show({
				view:btn_flashlight,
				animated:true
			});
		
			actIndFlashlight.hide();
		});
	
		//Tabs listeners
		searchTabs.addEventListener('click', function(e) {
			Ti.App.fireEvent("showAwesomeSearch", { searchType: e.index });
		});
	
		flashlightTableView.addEventListener('click', function(e) {
		
			// Ti.API.info("Full Photo:  [" + e.source.fullPhoto + "] and Title: [" + e.source.title + "]");
		
			switch (e.source.type) {
				case 'photo':
					if (e.source.title != "") {
						editTitleField.value = e.source.title;	
						postTitle = e.source.title;
					}
					postBody = '';
					textArea.value = '';
					tempPostLabel.show();
					theImage = e.source.fullPhoto;
					Ti.App.fireEvent("photoChosen", {typePhoto: 'flashlight'});
					break;
				
				case 'text':
			    	//Removes whatever medias where ther ebefore
					Ti.App.fireEvent("photoRemoved");
					if (e.source.abstract != "") {
						textArea.value = e.source.abstract;
						postBody = e.source.abstract;
						tempPostLabel.hide();
					}
					editTitleField.value = e.source.title;	
					postTitle = e.source.title;
					break;
				
				case 'video':
					if (e.source.content != "") {
						textArea.value = e.source.content;
						postBody = e.source.content;
						tempPostLabel.hide();
					}
					editTitleField.value = e.source.title;	
					postTitle = e.source.title;
				
					//Sets the Image to the Videos Thumbnail
					theImage = e.source.image;
				
					videoLink = e.source.videoLink;
					videoId = e.source.videoId;
					Ti.App.fireEvent("photoChosen", {typePhoto: 'flashlight'});

					break;
				
				case 'twitter':
		    	//Removes whatever medias where there ebefore
				Ti.App.fireEvent("photoRemoved");
				
				editTitleField.value = "";	
				postTitle = "";
				textArea.value = e.source.username + '\n' + e.source.tweet;
				postBody = '<blockquote><strong>' + e.source.username + '</strong>\n' + e.source.tweet + '</blockquote>';
				tempPostLabel.hide();
			
				break;
			}
		
			popoverSearchView.hide();
		});
		
		flashlight_created = true;
	}
}