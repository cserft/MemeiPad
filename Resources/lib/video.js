var getVideoData = function(pContent, callback) {
	var videoId, videoThumb;
	
	if (pContent.indexOf("vimeo") != -1){
		Ti.API.debug("Found Vimeo Video: " + pContent);
		// If VIMEO VIDEO
		
		var xhr = Titanium.Network.createHTTPClient();
	
		xhr.onreadystatechange = function() {

		    try {
		      if (this.readyState == 4) {
		           var results = JSON.stringify(this.responseText);
					Ti.API.debug("Response Text on State 4: " + results);

		        }
		    } catch(e) {
		        Ti.API.debug("Error: " + e.error);
		    }
		};
	
	    xhr.onerror = function(e) {
	        Ti.API.error("ERROR: " + e.error);
	    };
	
	    xhr.onload = function(e) {
			var vimeoEmbed = JSON.parse(this.responseText);

	        videoThumb = vimeoEmbed.thumbnail_url;
			Ti.API.debug('got thumbnail for vimeo: ' + videoThumb);
			
			callback(videoThumb, vimeoEmbed);
	    };
	
		eContent = encodeURIComponent(pContent);
	    xhr.open('GET','http://vimeo.com/api/oembed.json?maxwidth=640&maxheight=385&url=' + eContent);
		xhr.setRequestHeader('X-Requested-With', '');
		xhr.send();
	} else {
		//ELSE YOUTUBE
		videoId = pContent.match(/v.([a-zA-Z0-9_-]{11})&?/)[1];
        videoThumb = "http://img.youtube.com/vi/" + videoId + "/0.jpg";
		callback(videoThumb);
	}
};