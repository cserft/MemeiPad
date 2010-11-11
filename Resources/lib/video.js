var getVideoData = function(pContent, callback) {
	var _videoId, _videoThumb;
	
	if (pContent.indexOf("vimeo") != -1){
		Ti.API.info("Found Vimeo Video: " + pContent);
		// If VIMEO VIDEO
		
		//REQUEST VIMEO oEmbed DATA
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
	        Ti.API.info("ERROR: " + e.error);
	    };
	
	    xhr.onload = function(e) {
	        Ti.API.debug('Vimeo RESPONSE CODE: ' + this.status + ' And Response Text: [' + this.responseText + ']');
			var vimeoEmbed = JSON.parse(this.responseText);

	        _videoThumb = vimeoEmbed.thumbnail_url;
			Ti.API.debug('got thumbnail for vimeo: ' + _videoThumb);
			
			callback(_videoThumb, vimeoEmbed);
	    };
	
		eContent = encodeURIComponent(pContent);
	    xhr.open('GET','http://vimeo.com/api/oembed.json?maxwidth=640&maxheight=385&url=' + eContent);
		xhr.setRequestHeader('X-Requested-With', '');
		xhr.send();
	} else {
		//ELSE YOUTUBE
		_videoId = pContent.match(/v.([a-zA-Z0-9_-]{11})&?/)[1];
        _videoThumb = "http://img.youtube.com/vi/" + _videoId + "/0.jpg";
		callback(_videoThumb);
	}
};