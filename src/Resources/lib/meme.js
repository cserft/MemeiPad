/***************************************************
"Meme" module provides all functionality available
on the Meme API.

Usage:
	// follow an user
	Meme.follow('guid_of_the_user_to_follow');
	
	// creates a text post
	Meme.createTextPost('A text post');
***************************************************/

// Meme holds a reference to the result of the execution
// of the following function (a.k.a. closure), therefore 
// you should not invoke (as in "Meme().[...]"), use 
// "Meme.[...]" directly.
var Meme = function() {	
	// public functions
	var createTextPost, createPhotoPost, createVideoPost, deletePost, getPost,
		featuredPosts, dashboardPosts, isFollowing, follow, unfollow, 
		createComment, repost, isReposted, userInfo, flashlightPhotos, 
		flashlightVideos, flashlightWeb, flashlightTweets;
		
	// private functions
	var getYql, cacheGet, cachePut, loginRequired, throwYqlError, createPost, 
		execute, cachedYqlQuery;
	
	createTextPost = function(content) {
		return createPost('text', content);
	};

	createPhotoPost = function(content, caption) {
		return createPost('photo', content, caption);
	};

	createVideoPost = function(content, caption) {
		return createPost('video', content, caption);
	};
	
	deletePost = function(pubid) {
		var yqlQuery = 'DELETE FROM meme.user.posts WHERE pubid = "' + pubid + '"';
		return execute(true, yqlQuery);
	};
	
	getPost = function(guid, pubid) {
		var params = {
			cacheKey: 'post:' + guid + ':' + pubid,
			cacheSeconds: 86400, // 24 hours
			yqlQuery: 'SELECT * FROM meme.posts WHERE owner_guid="' + guid + '" and pubid="' + pubid + '"'
		};
		var post;
		cachedYqlQuery(params, function(results) {
			post = results.post;
		});
		return post;
	};
	
	featuredPosts = function() {
		var params = {
			cacheKey: 'featuredPosts',
			cacheSeconds: 7200, // 2 hours
			yqlQuery: 'SELECT * FROM meme.posts.featured WHERE locale="en" | meme.functions.thumbs(width=307,height=231)'
		};
		var posts;
		cachedYqlQuery(params, function(results) {
			posts = results.post;
		});
		return posts;
	};
	
	dashboardPosts = function(thumbWidth, thumbHeight, startTimestamp) {
		loginRequired();
		
		var yqlQuery = 'SELECT * FROM meme.user.dashboard ';
		if (startTimestamp) {
			yqlQuery += 'WHERE start_timestamp = "' + startTimestamp + '" ';
		}
		yqlQuery += '| meme.functions.thumbs(width=' + thumbWidth + ',height=' + thumbHeight + ')';
		
		var yqlResponse = getYql().query(yqlQuery);
		
		if (!yqlResponse.query.results) {
			throwYqlError();
		}
		
		return yqlResponse.query.results.post;
	};

	isFollowing = function(guid) {
		loginRequired();

		var yqlQuery = 'SELECT * FROM meme.following WHERE owner_guid=me and guid="' + guid + '"';
		var yqlResponse = getYql().query(yqlQuery);
		if (yqlResponse.query.results) {
			return true;
		}
		return false;
	};

	follow = function(guid) {
		var yqlQuery = 'INSERT INTO meme.user.following (guid) VALUES ("' + guid + '")';
		return execute(true, yqlQuery);
	};

	unfollow = function(guid) {
		var yqlQuery = 'DELETE FROM meme.user.following WHERE guid="' + guid + '"';
		return execute(true, yqlQuery);
	};
	
	createComment = function(guid, pubid, comment) {
		var yqlQuery = 'INSERT INTO meme.user.comments (guid, pubid, comment) VALUES ("' + guid + '", "' + pubid + '", "' + comment + '")';
		return execute(true, yqlQuery);
	};
	
	repost = function(guid, pubid) {
		var yqlQuery = 'INSERT INTO meme.user.posts (guid, pubid) VALUES ("' + guid + '", "' + pubid + '")';
		return execute(true, yqlQuery);
	};
	
	isReposted = function(guid, pubid) {
		loginRequired();

		var yqlQuery = 'SELECT * FROM meme.posts WHERE owner_guid=me and origin_guid="' + guid + '" and origin_pubid="' + pubid + '"';
		var yqlResponse = getYql().query(yqlQuery);
		if (yqlResponse.query.results) {
			return true;
		}
		return false;
	};
	
	userInfo = function(guid, thumbWidth, thumbHeight) {
		if (guid == 'me') {
			loginRequired();
		}
		var queryGuid = (guid == 'me') ? guid : '"' + guid + '"';
		var params = {
			cacheKey: 'userInfo:' + guid,
			cacheSeconds: 86400, // 24 hours
			yqlQuery: 'SELECT * FROM meme.info where owner_guid=' + queryGuid + ' | meme.functions.thumbs(width=' + thumbWidth + ',height=' + thumbHeight + ')'
		};
		var userInfo;
		cachedYqlQuery(params, function(results) {
			userInfo = results.meme;
		});
		return userInfo;
	};
	
	flashlightPhotos = function(query) {
		var params = {
			cacheKey: 'flashlight:photos:' + query,
			yqlQuery: 'SELECT * FROM flickr.photos.search WHERE text="' + query + '" AND license="4"'
		};
		var photos;
		cachedYqlQuery(params, function(results) {
			photos = results.photo;
		});
		return photos;
	};
	
	flashlightVideos = function(query) {
		var params = {
			cacheKey: 'flashlight:videos:' + query,
			yqlQuery: 'SELECT * FROM youtube.search WHERE query="' + query + '"'
		};
		var videos;
		cachedYqlQuery(params, function(results) {
			videos = results.video;
		});
		return videos;
	};
	
	flashlightWeb = function(query) {
		var params = {
			cacheKey: 'flashlight:web:' + query,
			yqlQuery: 'SELECT title, abstract FROM search.web WHERE query="' + query + '"'
		};
		var items;
		cachedYqlQuery(params, function(results) {
			items = results.result;
		});
		return items;
	};
	
	flashlightTweets = function(query) {
		var params = {
			cacheKey: 'flashlight:tweets:' + query,
			yqlQuery: 'SELECT * FROM twitter.search WHERE q="' + query + '"'
		};
		var items;
		cachedYqlQuery(params, function(results) {
			items = results.results;
		});
		return items;
	};

	// =====================
	// = Private functions =
	// =====================
	
	// TODO: inject YQL
	getYql = function() {
		return Ti.App.oAuthAdapter.getYql();
	};
	
	// TODO: inject Cache
	cacheGet = function(key) {
		return Ti.App.cache.get(key);
	};
	
	// TODO: inject Cache
	cachePut = function(key, value, seconds) {
		Ti.App.cache.put(key, value, seconds);
	};
	
	// TODO: inject OAdapter
	loginRequired = function() {
		if (!Ti.App.oAuthAdapter.isLoggedIn()) {
			throw 'Authentication is required to run this query.';
		}
	};
	
	// TODO: refactor to isolate fireEvent (?)
	throwYqlError = function() {
		Ti.App.fireEvent('yqlerror');
	};

	// Creates a post on Meme given the type provided
	createPost = function(type, content, caption) {
		var columns = 'type';
		var values = '"' + type + '"';
		if (content) {
			columns += ', content';
			values += ', "' + content + '"';
		}
		if (caption) {
			columns += ', caption';
			values += ', "' + caption + '"';
		}
		var yqlQuery = 'INSERT INTO meme.user.posts (' + columns + ') VALUES (' + values + ')';
		return execute(true, yqlQuery);
	};

	// Executes an API query that does not expect response (insert, update, delete)
	execute = function(requireAuth, yqlQuery) {
		if (requireAuth) {
			loginRequired();
		}
		var yqlResponse = getYql().query(yqlQuery);
		var results = yqlResponse.query.results;
		
		if (!results) {
			throwYqlError();
		}
		
		if (results.status && results.status.message == 'ok') {
			return true;
		}
		return false;
	};
	
	// Executes SELECT YQL queries caching results and returning them in a callback
	cachedYqlQuery = function(params, callback) {
		// default cache time is 15 minutes
		var cacheSeconds = 900;
		if (params.cacheSeconds) {
			cacheSeconds = params.cacheSeconds;
		}
		
		var items = cacheGet(params.cacheKey);
		if (!items) {
			var yqlResponse = getYql().query(params.yqlQuery);

			if (!yqlResponse.query.results) {
				throwYqlError();
			}

			items = yqlResponse.query.results;
			
			// cache results
			cachePut(params.cacheKey, items, cacheSeconds);
		}
		
		// return to caller using callback
		callback(items);
	};
	
	return ({
		createTextPost: createTextPost,
		createPhotoPost: createPhotoPost,
		createVideoPost: createVideoPost,
		deletePost: deletePost,
		getPost: getPost,
		featuredPosts: featuredPosts,
		dashboardPosts: dashboardPosts,
		isFollowing: isFollowing,
		follow: follow,
		unfollow: unfollow,
		createComment: createComment,
		repost: repost,
		isReposted: isReposted,
		userInfo: userInfo,
		flashlightPhotos: flashlightPhotos, 
		flashlightVideos: flashlightVideos, 
		flashlightWeb: flashlightWeb, 
		flashlightTweets: flashlightTweets
	});	
}();