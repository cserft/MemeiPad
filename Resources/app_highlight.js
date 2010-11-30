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

var highlightsDisplayed = false;
var getHighlights = function (highlightView) {
	
	if (! highlightsDisplayed) {
		
		getHighlightQuery(function (data) {

			var yql_data = Ti.App.oAuthAdapter.getYql().query("SELECT * FROM meme.search(" + data.amount + ") WHERE query='" + data.query + "'" );

			var posts = yql_data.query.results.post;

			for ( var i=0 ; i< posts.length ; i++ ) {

				// if doesn't have caption, move to next item
				// we don't show posts without caption
				if (!posts[i].caption || (strip_html_entities(posts[i].caption) == '')) {
					continue;
				}

				var highlight = Ti.UI.createView({
					backgroundColor:'black',
					width: 1024,
					height: 273,
					zIndex: 0
				});

				// photo
				var highlightPhoto = Ti.UI.createImageView({
					image: 				posts[i].content,
					backgroundColor: 	'black',
					width: 				1024,
					height: 			'auto',
					defaultImage: 		'images/bg_image_highlight.png',
					zIndex: 			0
				});
				highlight.add(highlightPhoto);


				var captionBgView = Ti.UI.createView({
					backgroundColor:'black',
					opacity: 0.9,
					top: 150,
					left: 634,
					width: 390,
					height: 87,
					zIndex: 2
				});

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

				var boxLink = Ti.UI.createButton({
					backgroundColor: 	'transparent',
					width: 				'100%',
					height: 			'100%',
					zIndex: 			99,
					guid: 				posts[i].guid,
					pubId: 				posts[i].pubid,
					backgroundSelectedImage: 	'images/btn_dashboard_link.png',
					style: 						Titanium.UI.iPhone.SystemButtonStyle.PLAIN
				});
				captionBgView.add(boxLink);

				boxLink.addEventListener('click', function(e) {
					Ti.App.fireEvent('openPermalink', {
						guid: e.source.guid,
						pubId: e.source.pubId
					});
				});

				highlight.add(captionBgView);

				// add to the scrollableview
				highlightView.addView(highlight);
			}
		});
		
		highlightsDisplayed = true;
	}
};


