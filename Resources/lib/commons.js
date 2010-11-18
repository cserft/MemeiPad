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

	//Loop to present the Search Results for YouTube
	var results = [];
	
	var videoId, videoThumb, videoLink;
	
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
		//	Ti.API.debug('got thumbnail for vimeo: ' + videoThumb);
			
			callback(videoThumb, data);
	    };
	
		//eContent = encodeURIComponent(pContent);
	    xhr.open('GET','http://vimeo.com/api/oembed.json?maxwidth=640&maxheight=385&url=' + pContent);
		xhr.setRequestHeader('X-Requested-With', '');
		xhr.send();
		
	} else {
		
		videoId = pContent.match(/v.([a-zA-Z0-9_-]{11})&?/)[1];
		videoLink = "http://youtube.com/watch?v=" + videoId;
		
		//ELSE YOUTUBE
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
			callback(videoThumb, data);
	    };
	
		//eContent = encodeURIComponent(pContent);
	    xhr.open('GET','http://www.youtube.com/oembed?format=json&url=' + videoLink);
		xhr.setRequestHeader('X-Requested-With', '');
		xhr.send();
	}
};

var getPhotoData = function(pContent, pWidth, pHeight, yql, callback) {
	var photoThumb;
    photoThumb = pContent;
	callback(photoThumb);
};