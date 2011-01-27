Ti.include('lib/analytics.js');

// ======================
// = AWESOME SEARCH BAR =
// ======================
var monitor_id;
var monitor_started = false;
var monitor_value;
var last_monitor_value;
var flashlight_created = false;

// ====================
// = lightbuld effect =
// ====================

function LightbuldEffect () {
	// Animation of the lamp blinking
		lamp_bright.visible = true;
		var t = Ti.UI.create2DMatrix();
		t = t.scale(0.8);

		var a = Titanium.UI.createAnimation();
		a.transform = t;
		a.duration = 300;
		a.autoreverse = true;
		a.repeat = 1000;
		lamp_bright.animate(a);
	// End of the animation Lamp	
};


var flashlight_text_change_monitor = function(new_monitor_value) {
	
	Ti.API.debug('flashlight_text_change_monitor invoked for query = ' + new_monitor_value);
	
	// updates text change monitor value
	monitor_value = new_monitor_value;
	
	// CHECKS IF THIS IS A YOUTUBE/VIMEO/FLICKR/IMAGE OR WEBPAGES LINK 
	// Detects what type of Video link
	var youtubeVideoArray = new_monitor_value.match(/v=([a-zA-Z0-9_-]{11})/);
	var youtubeShortArray = new_monitor_value.match(/youtu.be\/([a-zA-Z0-9_-]{11})/);
	var vimeoArray = new_monitor_value.match(/vimeo.com\/([\d]+)&?$/);
	
	// Flickr REGEX
	var flickrArray = new_monitor_value.match(/flickr.com\/photos\/[^\/]+\/([0-9]+)/i);
	
	//Images REGEX
	var imageArray = new_monitor_value.match(/(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png))(?:\?([^#]*))?(?:#(.*))?/i);
	
	//Web Pages REGEX
	var linksArray = new_monitor_value.match(/(\b(?:(?:https?|ftp|[A-Za-z]+):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$]))(?=[^>]*?(<|$))/i);
	
	//Triggers the Paste command or a FlashLight Search flashlight_monitor_start();
	if (youtubeVideoArray != null && youtubeVideoArray != undefined) {
		
		LightbuldEffect();
		
		getVideoData(new_monitor_value, function(_videoThumb, _data) {
		//	Ti.API.debug('my video thumb is [' + _videoThumb + ']');
			editTitleField.value = _data.title;	
			postTitle = _data.title;
			
			//Sets the Image to the Video Thumbnail
			theImage = _data.thumbnail_url;
			videoLink = new_monitor_value;
			videoId = youtubeVideoArray[1];
			
			mediaType = "youtube";
			mediaPreview = '<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/' + videoId + '" frameborder="0"></iframe>';
			mediaLink = videoLink;
			
			Ti.App.fireEvent("mediaChosen", {flashlight: true, mediaType: mediaType, mediaPreview: mediaPreview, mediaLink: mediaLink });
			
			lamp_bright.hide();
	
		});
		
	} else if (youtubeShortArray != null && youtubeShortArray != undefined) {
		
		LightbuldEffect();
		
		getVideoData(new_monitor_value, function(_videoThumb, _data) {
		//	Ti.API.debug('my video thumb is [' + _videoThumb + ']');
			editTitleField.value = _data.title;	
			postTitle = _data.title;
			
			//Sets the Image to the Video Thumbnail
			theImage = _data.thumbnail_url;
			mediaLink = new_monitor_value;
			videoId = youtubeShortArray[1];
			
			mediaType = "youtube";
			mediaPreview = '<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/' + videoId + '" frameborder="0"></iframe>';
			
			Ti.App.fireEvent("mediaChosen", {flashlight: true, mediaType: mediaType, mediaPreview: mediaPreview, mediaLink: mediaLink });
			
			lamp_bright.hide();
	
		});
		
	} else if (vimeoArray != null && vimeoArray != undefined) {
		
		LightbuldEffect();
		
		getVideoData(new_monitor_value, function(_videoThumb, _data) {
		//	Ti.API.debug('my video thumb is [' + _videoThumb + ']');
			editTitleField.value = _data.title;	
			postTitle = _data.title;
			
			//Sets the Image to the Video Thumbnail
			theImage = _data.thumbnail_url;
			mediaLink = new_monitor_value;
			videoId = vimeoArray[1];
			
			mediaType = "vimeo";
			mediaPreview = _data.html;
			
			Ti.App.fireEvent("mediaChosen", {flashlight: true, mediaType: mediaType, mediaPreview: mediaPreview, mediaLink: mediaLink });
			
			lamp_bright.hide();
		});
		
		Ti.API.info("Pasted link Vimeo ID: " + vimeoArray[1]);
		
	} else if (flickrArray != null && flickrArray != undefined) {
		
		LightbuldEffect();
		
		Ti.API.info("Pasted a Flickr Link: " + flickrArray[0]);
		
		getVideoData(new_monitor_value, function(_photoThumb, _data) {
			editTitleField.value = _data.title;	
			postTitle = _data.title;
			
			//Sets the Image to the Photo Thumbnail
			theImage = _data.url;
			mediaLink = _data.url;
			
			mediaType = "photo";
			mediaPreview = '<img src="' + _data.url + '">';
			
			Ti.App.fireEvent("mediaChosen", {flashlight: true, mediaType: mediaType, mediaPreview: mediaPreview, mediaLink: mediaLink });
			
			lamp_bright.hide();
	
		});
		
	} else if (imageArray != null && imageArray != undefined) {
		
		LightbuldEffect();
		
		Ti.API.info("Pasted a Image Link: JPG/PNG/GIF: " + imageArray[0]);
		
		//Sets the Image to the Image Thumbnail
		theImage = imageArray[0];
		mediaLink = imageArray[0];

		mediaType = "photo";
		mediaPreview = '<img src="' + imageArray[0] + '">';
		
		Ti.App.fireEvent("mediaChosen", {flashlight: true, mediaType: mediaType, mediaPreview: mediaPreview, mediaLink: mediaLink });
		
		lamp_bright.hide();
		
	
	} else if (linksArray != null && linksArray != undefined) {
		
		LightbuldEffect();
		
		Ti.API.info("Pasted a Web Link: " + linksArray[0]);
		
		var items = Ti.App.meme.flashlightLinkWeb(linksArray[0]);
		
		if (items != null) {
			editTitleField.value = items.title;	
			postTitle = items.title;

			if (items.meta != undefined){
				//verifies if the Link has Meta Content Description
				tempPostLabel.hide();

				if (textArea.value != "") {
					textArea.value += '\n\n' + items.meta.content + "\n\n" + L('mail_message_body_source') + linksArray[0];
					postBody = textArea.value;
				} else {
					textArea.value += items.meta.content + "\n\n" + L('mail_message_body_source') + linksArray[0];
					postBody = textArea.value;
				}
			} else {
				Ti.API.debug("No meta Description");
			}
		}
		
		lamp_bright.hide();
			
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
};

var flashlight_monitor_stop = function() {
	clearInterval(monitor_id);
	monitor_started = false;
	monitor_value = null;
	last_monitor_value = null;
};

var flashlight_monitor = function() {
	if (monitor_value) {
		if (monitor_value == last_monitor_value) {
			Ti.API.debug('TIMEOUT reached with no changes, firing search!');
			
			//Analytics Request
			doYwaRequest(analytics.FLASHLIGHT_SEARCH);
			
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
	backgroundColor: '#333',
	top: 0,
	height: 49,
	style: Titanium.UI.iPhone.SystemButtonStyle.BAR,
	index: 0
});

var flashlight_show = function() {
	if (searchTextField.value == '') {
		Ti.UI.createAlertDialog({
			title: L('flashlight_alert_empty_title'),
			message: L('flashlight_alert_empty_message')
		}).show();
	} else {
		flashlight_create();
	}
	
	//TESTS IF THIS IS A TWITTER LINK, THEN CALLS THE DAFAULT SEARCH OR THE TWITTER SEARCH
	var tweetArray = searchTextField.value.match(/^(@[^\s])/i);
	
	if (tweetArray != null && tweetArray != undefined) {
		Ti.App.fireEvent("showAwesomeSearch", {searchType: 3});
	} else {
		Ti.App.fireEvent("showAwesomeSearch", {searchType: 0});
	}
	
};

var flashlight_create = function() {
	queryText = searchTextField.value;
	
	if (!flashlight_created) {
		Ti.API.info('building flashlight (this must be done only once)');
		
		// row for results not found
		var notFoundRow = Ti.UI.createTableViewRow({height:78});
		var notFoundTitle = Ti.UI.createLabel({
			text: L('flashlight_no_results'),
			color: '#863486',
			height:50,
			width: 192,	
			textAlign:'left',
			font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'regular'}
		});
		notFoundRow.add(notFoundTitle);
		
		// flashlight Results Tableview
		var flashlightTableView = Ti.UI.createTableView({
			top:50,
			height:228
		});
		popoverSearchView.add(flashlightTableView);
		popoverSearchView.add(searchTabs);
		
		Ti.App.addEventListener('showAwesomeSearch', function (e) {
			Ti.API.debug("####### Type of search: " + e.searchType);
			
			LightbuldEffect();

			var results = [];

			switch(e.searchType) {
				case 0: // Video 
					Ti.API.info("####### Video Search ");
					var videos = Ti.App.meme.flashlightVideos(queryText);
					
					if (videos) {
						//Loop to present the Search Results for YouTube
						for (var c=0 ; c < videos.length ; c++)	
						{
							var video = videos[c];

							var thumb = video.thumbnails.thumbnail[0].content;
							var thumbFull = video.thumbnails.thumbnail[4].content;

							//Ti.API.info("Videos Link: " + JSON.stringify(videoLink));
							var row = Ti.UI.createTableViewRow({height:78});

							var title = Ti.UI.createLabel({
								text: 			video.title,
								color: 			'#863486',
								height:			42,
								width: 			192,
								top:			10,
								left: 			110,
								textAlign: 		'left',
								font: 			{fontSize:12, fontFamily:'Helvetica', fontWeight:'regular'}
							});
							
							//duration time preparation
							var secondsToHms = function (d) {
								d = Number(d);
								var h = Math.floor(d / 3600);
								var m = Math.floor(d % 3600 / 60);
								var s = Math.floor(d % 3600 % 60);
								return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
							};
							
							var duration = Ti.UI.createLabel({
								text: secondsToHms(video.duration),
								color: 			'#666',
								height: 		10,
								width: 			50,
								top: 			60,
								left: 			110,
								textAlign: 		'left',
								font: 			{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'}
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
							row.add(duration);
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
						
					} else {
						results[0] = notFoundRow;
					}
					
					break;
			
				case 1: // Flickr
					Ti.API.info("####### Photo Search ");
					var photos = Ti.App.meme.flashlightPhotos(queryText);
					
					if (photos) {
						//Loop to present the Search Results for Flickr
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
								font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'regular'}
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
					} else {
						results[0] = notFoundRow;
					}
					
					break;
			
				case 2: // Web Search
					Ti.API.info("####### Web Search ");
					var items = Ti.App.meme.flashlightWeb(queryText);
					
					if (items) {
						//Loop to present the Search Results from the Web
						for (var c=0 ; c < items.length ; c++) {
							var item = items[c];
							var titleStripped = strip_html_entities(item.title);
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
								var abstractStripped = strip_html_entities(abstractContent);
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
								url: item.url,
								type: 'text'
							}));

							// add row to result
							results[c] = row;
						}
					} else {
						results[0] = notFoundRow;
					}
					
					break;
				
				case 3: // Twitter Search
					Ti.API.info("####### Twitter Search ");
					var items = Ti.App.meme.flashlightTweets(queryText);
					
					if (items) {
						//Loop to present the Search Results from the Web
						for (var c=0 ; c < items.length ; c++) {
							var item = items[c];

							var row = Ti.UI.createTableViewRow({height:78});

							var avatar = Ti.UI.createImageView({
								image : item.profile_image_url,
								backgroundColor: 'black',
								height:48,
								width:48,
								top:10,
								left:10,
								defaultImage:'images/default_img_avatar.png'
							});

							row.add(avatar);

							var username = Ti.UI.createLabel({
								text: '@' + item.from_user,
								color: '#863486',
								width: 250,
								height:15,
								top: 8,
								left:67,
								textAlign:'left',
								font:{fontSize:12, fontFamily:'Helvetica', fontWeight:'bold'}
							});
							row.add(username);

							var tweet = Ti.UI.createLabel({
								text: item.text,
								color: '#333',
								height:52,
								width: 262,
								top: 23,
								left: 67,
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
								timestamp: item.created_at.substr(0,25),
								app: Encoder.htmlDecode(item.source),
								// app: item.source,
								avatar: item.profile_image_url,
								link: "http://twitter.com/#!/" + item.from_user + "/status/" + item.id_str + '/',
								type: 'twitter'
							}));

							results[c] = row;
						}	
					} else {
						results[0] = notFoundRow;
					}
					
					break;
			}
			
			flashlightTableView.setData(results);
			flashlightTableView.scrollToIndex(0,{animated:true});
			searchTabs.index = e.searchType;
	
			//show the Popover
			popoverSearchView.show({
				view:postHeaderView,
				animated:true
			});
				// Hides the Flashlight blink
				lamp_bright.visible = false;
		});
	
		//Tabs listeners
		searchTabs.addEventListener('click', function(e) {
			Ti.App.fireEvent("showAwesomeSearch", { searchType: e.index });
		});
	
		flashlightTableView.addEventListener('click', function(e) {
		
			switch (e.source.type) {
				case 'photo':
					if (e.source.title != "") {
						if (editTitleField.value == "") {
							editTitleField.value = e.source.title;	
							postTitle = e.source.title;
						}
					}

					theImage = e.source.fullPhoto; 
					mediaType = "photo";
					mediaPreview = '<img src="' + e.source.fullPhoto + '">';
					mediaLink = e.source.fullPhoto;
					
					Ti.App.fireEvent("mediaChosen", {flashlight: true, mediaType: mediaType, mediaPreview: mediaPreview, mediaLink: mediaLink });
					break;
				
				case 'text':
					if (e.source.abstract != "") {
						if (textArea.value != "") {
							textArea.value += '\n\n' + e.source.abstract + '\n' + L('mail_message_body_source') + e.source.url;
							postBody = textArea.value;
						} else {
							textArea.value += e.source.abstract + '\n' + L('mail_message_body_source') + e.source.url;
							postBody = textArea.value;
						}

						textArea.focus();
					}
					editTitleField.value = e.source.title;	
					postTitle = e.source.title;
					break;
				
				case 'video':
					if (e.source.content != "") {
						
						if (textArea.value != "") {
							textArea.value += '\n\n' + e.source.content;
							postBody = textArea.value;
						} else {
							textArea.value += e.source.content;
							postBody = textArea.value;
						}
						textArea.focus();
					}
					editTitleField.value = e.source.title;	
					postTitle = e.source.title;
				
					//Sets the Image to the Videos Thumbnail
					theImage = e.source.image;
					videoLink = e.source.videoLink;
					videoId = e.source.videoId;
					mediaLink = videoLink;
					
					// Defines the Video Source Type (Vimeo or youTube)
					if (theImage.indexOf("ytimg") != -1) {
						mediaType = "youtube";
						mediaPreview = '<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/' + videoId + '" frameborder="0"></iframe>';
					} else {
						mediaType = "vimeo";
					}

					Ti.App.fireEvent("mediaChosen", {flashlight: true, mediaType: mediaType, mediaPreview: mediaPreview, mediaLink: videoLink });

					break;
				
				case 'twitter':
				
					mediaType = "twitter";
					mediaPreview = '<style type="text/css">a:link {text-decoration:none; color:#278EB3} .bbpBox {background:url(http://a3.twimg.com/a/1294279085/images/themes/theme1/bg.png) #C0DEED;padding:20px; font-family:"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica;} p.bbpTweet{background:#fff;padding:10px 12px 10px 12px;margin:0;min-height:48px;color:#000;font-size:18px !important;line-height:22px;-webkit-border-radius:5px} p.bbpTweet span.metadata{display:block;width:100%;clear:both;margin-top:8px;padding-top:12px;height:40px;border-top:1px solid #fff;border-top:1px solid #e6e6e6} p.bbpTweet span.metadata span.author{line-height:19px; color: #278EB3} p.bbpTweet span.metadata span.author img{float:left;margin:0 7px 0 0px;width:38px;height:38px} p.bbpTweet a:hover{text-decoration:underline}p.bbpTweet span.timestamp{font-size:12px;display:block}</style><div class="bbpBox"><p class="bbpTweet">' + e.source.tweet + '<span class="timestamp">'+ e.source.timestamp + ' via '+ e.source.app + '</span><span class="metadata"><span class="author"><img src="' + e.source.avatar + '" /><strong>' + e.source.username + '</strong></span></span></p></div>';
					mediaLink = e.source.link;
					
					if (textArea.value != "") {
						textArea.value += '\n\nPermalink: ' + e.source.link;
						postBody += '\n\nPermalink: ' + e.source.link;
					} else {
						textArea.value += 'Permalink: ' + e.source.link;
						postBody += 'Permalink: ' + e.source.link;
					}
					tempPostLabel.hide();
					
					Ti.App.fireEvent("mediaChosen", {flashlight: true, mediaType: mediaType, mediaPreview: mediaPreview, mediaLink: mediaLink });
					
					break;
			}
		
			popoverSearchView.hide();
		});
		
		flashlight_created = true;
	}
};