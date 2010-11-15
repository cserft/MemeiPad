var timestamp = function() {
	return((new Date()).getTime());
};

var now  = timestamp();

// =============================
// = CACULATES THE HUMANE DATA =
// =============================

// With this we can create messages like "This post was created 10 minutes ago" or "Just now", etc

function humane_date(date_str){
	var time_formats = [
		[60, 'Just Now'],
		[90, '1 minute'], // 60*1.5
		[3600, 'minutes', 60], // 60*60, 60
		[5400, '1 hour'], // 60*60*1.5
		[86400, 'hours', 3600], // 60*60*24, 60*60
		[129600, '1 day'], // 60*60*24*1.5
		[604800, 'days', 86400], // 60*60*24*7, 60*60*24
		[907200, '1 week'], // 60*60*24*7*1.5
		[2628000, 'weeks', 604800], // 60*60*24*(365/12), 60*60*24*7
		[3942000, '1 month'], // 60*60*24*(365/12)*1.5
		[31536000, 'months', 2628000], // 60*60*24*365, 60*60*24*(365/12)
		[47304000, '1 year'], // 60*60*24*365*1.5
		[3153600000, 'years', 31536000], // 60*60*24*365*100, 60*60*24*365
		[4730400000, '1 century'] // 60*60*24*365*100*1.5
	];
	
	var dt = timestamp(); 
	var seconds = (dt - date_str)/1000;
	var token = ' ago';
	var prepend = '';
	var i = 0;
	var format;
	
	if (seconds < 0) {
		seconds = Math.abs(seconds);
		token = '';
		prepend = 'in ';
	}
	
	while (format = time_formats[i++]) {
		if (seconds < format[0]) {
			if (format.length == 2) {
				return (i>1?prepend:'') + format[1] + (i > 1 ? token : ''); // Conditional so we don't return Just Now Ago
			} else {
				return prepend + Math.round(seconds / format[2]) + ' ' + format[1] + (i > 1 ? token : '');
			}
		}
	}
	
	// overflow for centuries
	if(seconds > 4730400000) {
		return Math.round(seconds / 4730400000) + ' Centuries' + token;
	}
	
	return date_str;
};


// ====================================
// = FUNCTION TO GET VIDEO THUMBNAILS =
// ====================================
var getVideoData = function(pContent, callback) {
	var videoId, videoThumb;
	
	if (pContent.indexOf("vimeo") != -1){
	//	Ti.API.debug("Found Vimeo Video: " + pContent);
		// If VIMEO VIDEO
		
		var xhr = Titanium.Network.createHTTPClient();
	
		xhr.onreadystatechange = function() {

		    try {
		      if (this.readyState == 4) {
		           var results = JSON.stringify(this.responseText);
		        }
		    } catch(e) {
		        Ti.API.debug("Error: " + e.error);
		    }
		};
	
	    xhr.onerror = function(e) {
	        Ti.API.error("ERROR: " + e.error);
	    };
	
	    xhr.onload = function(e) {
			var data = JSON.parse(this.responseText);

	        videoThumb = data.thumbnail_url;
			Ti.API.debug('got thumbnail for vimeo: ' + videoThumb);
			
			callback(videoThumb, data);
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

var getPhotoData = function(pContent, pWidth, pHeight, yql, callback) {
	var photoThumb;
	
	//Ti.API.info('pContent from Photo Permalink: ' + JSON.stringify(pContent));
	
	 if (pContent.indexOf('flickr') != -1) {
		// IF FLICKR PHOTO
	
		Ti.API.info("####### Embed.ly YQL query ");
		// Embed.ly Query Example for Flickr Photo: SELECT * FROM embedly WHERE url="http://www.flickr.com/photos/36821100@N04/3948666283/" and maxwidth='250' and maxheight='250'
		yqlQuery = "SELECT * FROM embedly WHERE maxwidth='" + pWidth + "' and maxheight='"+ pHeight +"' and url='" + pContent + "'";

		var yqlPhoto = yql.query(yqlQuery);
		var data = yqlPhoto.query.results.json;

		// form the flickr url
		photoThumb = data.url;
		callback(photoThumb, data);

	
	// if (pContent.indexOf("flickr") != -1){
	// 	// IF FLICKR PHOTO called OEmbed
	// 	
	// 	var xhr = Titanium.Network.createHTTPClient();
	// 
	// 	xhr.onreadystatechange = function() {
	// 
	// 	    try {
	// 	      if (this.readyState == 4) {
	// 	           var results = JSON.stringify(this.responseText);
	// 				//Ti.API.debug("Response Text on State 4: " + results);
	// 
	// 	        }
	// 	    } catch(e) {
	// 	        Ti.API.debug("Error: " + e.error);
	// 	    }
	// 	};
	// 
	//     xhr.onerror = function(e) {
	//         Ti.API.error("ERROR: " + e.error);
	//     };
	// 
	//     xhr.onload = function(e) {
	// 		var data = JSON.parse(this.responseText);
	// 		
	// 		// Ti.API.info("Data from Flickr oEmbed Call: " + JSON.stringify(data));
	// 
	//         photoThumb = data.url;
	// 		// Ti.API.debug('got thumbnail for Flickr: ' + photoThumb);
	// 		
	// 		callback(photoThumb, data);
	//     };
	// 
	// 	eContent = encodeURIComponent(pContent);
	//     xhr.open('GET','http://www.flickr.com/services/oembed/?maxwidth=310&format=json&url=' + pContent);
	// 	xhr.setRequestHeader('X-Requested-With', '');
	// 	xhr.send();
		
	} else {
		//ELSE REGULAR PHOTO
        photoThumb = pContent;
		callback(photoThumb);
	}
};