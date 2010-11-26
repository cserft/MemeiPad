Ti.include('lib/commons.js');

var getHighlightQuery = function(callback) {

	//Loop to present the Search Results for YouTube
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
		callback(data);
    };

    xhr.open('GET', 'http://api.memeapp.net/v1/highlight/meme_ipad_dashboard');
	// xhr.setRequestHeader('X-Requested-With', '');
	xhr.send();
};


var getHighlights = function (yql, highlightView) {
	
	getHighlightQuery(function (data) {
		
		var yql_data = yql.query("SELECT * FROM meme.search(" + data.amount + ") WHERE query='" + data.query + "'" );
		
		var posts = yql_data.query.results.post;
		
		Ti.API.info("YQL SEARCH HIGHTLIGHT: " + JSON.stringify(posts));
		
		for ( var i=0 ; i< posts.length ; i++ ) {
			
			var highlight = Ti.UI.createImageView({
				image: 				posts[i].content,
				backgroundColor: 	'black',
				width: 				1024,
				height: 			'auto',
				zIndex: 			0
			});

			var captionBgView = Ti.UI.createView({
				backgroundColor:'black',
				opacity: 0.9,
				top: 150,
				left: 634,
				width: 390,
				height: 87,
				zIndex: 2
			});
			highlight.add(captionBgView);

			var featuredLabel = Ti.UI.createLabel({
				color: 			'#ffffff',
				text:  			'FEATURED CONTENT',
				font: 			{fontSize:11, fontFamily:'Helvetica', fontWeight:'regular'},
				opacity: 		0.5,
				textAlign: 		'left',
				top: 			10,
				left:  			15,
				height: 		20,
				width: 			150,
				zIndex: 		3
			});
			captionBgView.add(featuredLabel);

			Ti.API.info("Caption: " + posts[i].caption);
			
			var captionLabel = Ti.UI.createLabel({
				color: 			'#ffffff',
				text:  			strip_html_entities(posts[i].caption),
				font: 			{fontSize:18, fontFamily:'Helvetica', fontWeight:'bold'},
				textAlign: 		'left',
				top: 			30,
				left:  			15,
				height: 		50,
				width: 			361,
				zIndex: 		3
			});
			captionBgView.add(captionLabel);

			highlightView.addView(highlight);
			
		}
			
	});
	
	
};


