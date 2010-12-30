// returns timestamp in milliseconds
var timestamp = function() {
	return((new Date()).getTime());
};

// CACULATES THE HUMANE DATE
// With this we can create messages like "This post was created 10 minutes ago" or "Just now", etc
function humane_date(date_str){
	var time_formats = [
		[60, L('time_just_now')],
		[90, L('time_1_minute')], // 60*1.5
		[3600, L('time_minutes'), 60], // 60*60, 60
		[5400, L('time_1_hour')], // 60*60*1.5
		[86400, L('time_hours'), 3600], // 60*60*24, 60*60
		[129600, L('time_1_day')], // 60*60*24*1.5
		[604800, L('time_days'), 86400], // 60*60*24*7, 60*60*24
		[907200, L('time_1_week')], // 60*60*24*7*1.5
		[2628000, L('time_weeks'), 604800], // 60*60*24*(365/12), 60*60*24*7
		[3942000, L('time_1_month')], // 60*60*24*(365/12)*1.5
		[31536000, L('time_months'), 2628000], // 60*60*24*365, 60*60*24*(365/12)
		[47304000, L('time_1_year')], // 60*60*24*365*1.5
		[3153600000, L('time_years'), 31536000], // 60*60*24*365*100, 60*60*24*365
		[4730400000, L('time_1_century')] // 60*60*24*365*100*1.5
	];
	
	var dt = timestamp(); 
	var seconds = (dt - date_str)/1000;
	var token = L('time_ago');
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
		return Math.round(seconds / 4730400000) + L('time_centuries') + token;
	}
	
	return date_str;
};

// Returns date formatted like '12/12/2010 06:51 PM'
function formatted_date() {
	var date = new Date,
		minstr = date.getMinutes(); if (minstr<10) {minstr="0"+minstr;} 		// fixes minutes when less than 10
		
		// i18n of the date 
		if (Ti.Locale.currentLanguage == 'en') { 
			//if english the Month/Day/Year
			datestr = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
		} else { 
			//if any other language then Day/Month/Year
			datestr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear(),
		}
		
		hourstr = ' ' + date.getHours() + ':' + minstr + ' AM'; 
		
	if (date.getHours() >= 12) {
		hourstr = ' ' + (date.getHours() == 12 ? date.getHours() : date.getHours() - 12) + ':' + minstr + ' PM';
	}
	
	return datestr + hourstr;
}

// ====================================
// = FUNCTION TO GET VIDEO THUMBNAILS =
// ====================================
var getVideoData = function(pContent, callback) {

	//Loop to present the Search Results for YouTube
	var results = [], request_url;
	
	if (pContent.indexOf("vimeo") != -1) {
		// vimeo
		request_url = 'http://vimeo.com/api/oembed.json?maxwidth=640&maxheight=385&url=' + pContent;
	} else {
		// youtube
		var videoId = pContent.match(/v.([a-zA-Z0-9_-]{11})&?/)[1];
		var videoLink = "http://youtube.com/watch?v=" + videoId;
		request_url = 'http://www.youtube.com/oembed?format=json&url=' + videoLink;
	}
	
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
        var videoThumb = data.thumbnail_url;
		callback(videoThumb, data);
    };

	//eContent = encodeURIComponent(pContent);
    xhr.open('GET', request_url);
	xhr.setRequestHeader('X-Requested-With', '');
	xhr.send();
};

var getPhotoData = function(pContent, pWidth, pHeight, yql, callback) {
	var photoThumb;
    photoThumb = pContent;
	callback(photoThumb);
};

var strip_html_entities = function(string) {
	var new_string = string.replace(/(<([^>]+)>)/ig, ' ');
	new_string = new_string.replace(/&[\w\#]+;/g, ' ');
	new_string = new_string.replace(/\n/g, ' ');
	new_string = new_string.replace(/\s+/g, ' ');
	new_string = new_string.trim();
	//Ti.API.debug('strip_html_entities, was [' + string + '] and now is [' + new_string + ']');
	return new_string;
};

var add_html_entities = function(string) {
	return string.replace(/\n/g, '<br>');
};