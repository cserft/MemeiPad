/***************************************************
"Meme" module provides all functionality available
on the Meme API.

Usage:
	// follow an user
	meme.follow('guid_of_the_user_to_follow');
	
	// creates a text post
	meme.createTextPost('A text post');
***************************************************/

// TODO: inject cache, oadapter, etc.
var Meme = function() {	
	// public functions
	var createTextPost, createPhotoPost, createVideoPost, deletePost, getPost, getComments,
		featuredPosts, dashboardPosts, isFollowing, follow, unfollow, 
		createComment, repost, isReposted, userInfo, userSearch, userFeatured, flashlightPhotos, 
		flashlightVideos, flashlightWeb, flashlightLinkWeb, flashlightTweets, flashlightTwitterTimeline, appInfo;
		
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
	
	getComments = function(guid, pubid, pOffset, pNumItems) {
		var offset = 0;
		var numItems = 110;
		
		if (pOffset) {
			offset = pOffset;
		}
		
		if (pNumItems) {
			numItems = pNumItems;
		}
		
		var params = {
			cacheKey: 'comments:' + guid + ':' + pubid,
			cacheSeconds: 7200, // 24 hours
			yqlQuery: 'SELECT * FROM meme.comments('+ offset +','+ numItems +') WHERE owner_guid="' + guid + '" and pubid="' + pubid + '"',
			node: 'query'
		};
		var query;
		cachedYqlQuery(params, function(pQuery) {
			query = pQuery;
		});
		return query;
	};
	
	featuredPosts = function(thumbWidth, thumbHeight, callback) {
		var params = {
			cacheKey: 'featuredPosts',
			cacheSeconds: 7200, // 2 hours
			yqlQuery: 'SELECT * FROM meme.posts.featured WHERE locale="en" | meme.functions.thumbs(width=' + thumbWidth + ',height=' + thumbHeight + ')'
		};
		var posts;
		cachedYqlQuery(params, function(results) {
			posts = results.post;
		});
		if (!callback) {
			Ti.API.info("No Callback Called");
			return posts;
		} else {
			Ti.API.info("Callback Called");
			return callback(posts);
		}
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
	
	userInfo = function(guid, thumbWidth, thumbHeight, cache) {
		var queryGuid, where;
		
		if (typeof guid == 'string') {
			if (guid == 'me') {
				loginRequired();
			}
			
			queryGuid = (guid == 'me') ? guid : '"' + guid + '"';
			where = 'where owner_guid=' + queryGuid;
		} else {
			queryGuid = '"' + guid.join('","') + '"';
			where = 'where owner_guid IN (' + queryGuid + ')';
		}
		
		var params = {
			cacheKey: 'userInfo:' + queryGuid,
			cacheSeconds: 86400, // 24 hours
			yqlQuery: 'SELECT * FROM meme.info ' + where + ' | meme.functions.thumbs(width=' + thumbWidth + ',height=' + thumbHeight + ')'
		};
		
		var userInfo;
		if (cache) {
			cachedYqlQuery(params, function(results) {
				userInfo = results.meme;
			});
		} else {
			var yqlResponse = getYql().query(params.yqlQuery);
			userInfo = yqlResponse.query.results.meme;
		}

		return userInfo;
	};
	
	userSearch = function(query, num, thumbWidth, thumbHeight, callback) {
		var params = {
			cacheKey: 'userSearch:' + query,
			cacheSeconds: 86400, // 24 hours
			yqlQuery: 'SELECT * FROM meme.people('+ num +') WHERE query="' + query + '"| sort(field="followers") | reverse() | meme.functions.thumbs(width=' + thumbWidth + ',height=' + thumbHeight + ')' 
		};
		var userSearch;
		cachedYqlQuery(params, function(results) {
			userSearch = results.meme;
		});
		
		if (!callback) {
			Ti.API.info("No Callback Called");
			return userSearch;
		} else {
			Ti.API.info("Callback Called");
			return callback(userSearch);
		}
	};
	
	userFeatured = function(num, thumbWidth, thumbHeight, callback) {
		var params = {
			cacheKey: 'userFeatured:' + num,
			cacheSeconds: 86400, // 24 hours
			yqlQuery: 'select * from meme.info(' + num + ') where owner_guid in (select guid from meme.posts.featured where locale="" | unique(field="guid")) | meme.functions.thumbs(width=' + thumbWidth + ',height=' + thumbHeight + ')'
		};
		var userFeatured;
		cachedYqlQuery(params, function(results) {
			userFeatured = results.meme;
		});
		
		if (!callback) {
			Ti.API.info("No Callback Called");
			return userFeatured;
		} else {
			Ti.API.info("Callback Called");
			return callback(userFeatured);
		}
	};
	
	flashlightLinkWeb = function(query) {
		var params = {
			cacheKey: 'flashlight:link:' + query,
			//select * from html where url='http://www.globo.com' and xpath="/html/head/meta[@name='description']|//title"
			yqlQuery: 'SELECT * FROM html WHERE url="' + query + '" and xpath="/html/head/meta[@name=\'description\']|//title"'
		};
		var items;
		var successCallback = function(results) {
			items = results;
		};
		var errorCallback = function() {
			items = null;
		};
		cachedYqlQuery(params, successCallback, errorCallback);
		return items;
	};
	
	flashlightPhotos = function(query) {
		var params = {
			cacheKey: 'flashlight:photos:' + query,
			yqlQuery: 'SELECT * FROM flickr.photos.search WHERE text="' + query + '" AND license="4"'
		};
		var photos;
		var successCallback = function(results) {
			photos = results.photo;
		};
		var errorCallback = function() {
			photos = null;
		};
		cachedYqlQuery(params, successCallback, errorCallback);
		return photos;
	};
	
	flashlightVideos = function(query) {
		var params = {
			cacheKey: 'flashlight:videos:' + query,
			yqlQuery: 'SELECT * FROM youtube.search WHERE query="' + query + '"'
		};
		var videos;
		var successCallback = function(results) {
			videos = results.video;
		};
		var errorCallback = function() {
			videos = null;
		};
		cachedYqlQuery(params, successCallback, errorCallback);
		return videos;
	};
	
	flashlightWeb = function(query) {
		var params = {
			cacheKey: 'flashlight:web:' + query,
			yqlQuery: 'SELECT title, abstract, url FROM search.web WHERE query="' + query + '"'
		};
		var items;
		var successCallback = function(results) {
			items = results.result;
		};
		var errorCallback = function() {
			items = null;
		};
		cachedYqlQuery(params, successCallback, errorCallback);
		return items;
	};
	
	flashlightTweets = function(query) {
		var params = {
			cacheKey: 'flashlight:tweets:' + query,
			yqlQuery: 'SELECT * FROM twitter.search WHERE q="' + query + '"'
		};
		var items;
		var successCallback = function(results) {
			items = results.results;
		};
		var errorCallback = function() {
			ìtems = null;
		};
		cachedYqlQuery(params, successCallback, errorCallback);
		return items;
	};
	
	flashlightTwitterTimeline = function(query) {
		var params = {
			cacheKey: 'flashlight:twitterTimeline:' + query,
			yqlQuery: 'SELECT * FROM twitter.user.timeline(30) WHERE screen_name="' + query + '"'
		};
		var items;
		var successCallback = function(results) {
			items = results.statuses.status;
		};
		var errorCallback = function() {
			ìtems = null;
		};
		cachedYqlQuery(params, successCallback, errorCallback);
		return items;
	};
	
	appInfo = function(appId, callback) {
		var params = {
			cacheKey: 'appInfo:' + appId,
			cacheSeconds: 86400, // 24 hours
			yqlQuery: 'SELECT * FROM appdb.application WHERE appid="' + appId + '"'
		};
		var appInfo;
		
		cachedYqlQuery(params, function(results) {
			appInfo = results.application;
		});
		
		if (!callback) {
			Ti.API.info("No Callback Called");
			return appInfo;
		} else {
			Ti.API.info("Callback Called");
			return callback(appInfo);
		}
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
		// must put query params in single quotes due to an API bug
		var columns = 'type';
		var values = '\'' + type + '\'';
		if (content) {
			columns += ', content';
			values += ', \'' + content + '\'';
		}
		if (caption) {
			columns += ', caption';
			values += ', \'' + caption + '\'';
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
		
		Ti.API.info("Results: ["+ JSON.stringify(results) +"]");
		
		if (!results) {
			throwYqlError();
		}
		
		if (results.status && results.status.message == 'ok') { 
			return true;
		}
		return false;
	};
	
	// Executes SELECT YQL queries caching results and returning them in a callback
	cachedYqlQuery = function(params, successCallback, errorCallback) {
		// default cache time is 15 minutes
		var cacheSeconds = 900;
		if (params.cacheSeconds) {
			cacheSeconds = params.cacheSeconds;
		}

		var items = cacheGet(params.cacheKey);
		
		// if didn't find items in cache, go fetch them on YQL
		if (!items) {
			var yqlResponse = getYql().query(params.yqlQuery);
			
			// checks if it is query what we want as return
			if (params.node == 'query') {
				if (!yqlResponse.query) {
					if (errorCallback) {
						errorCallback();
					} else {
						throwYqlError();
					}
				}
				
			// If not node == query then get the results node
			} else {
				if (!yqlResponse.query.results) {
					if (errorCallback) {
						errorCallback();
					} else {
						throwYqlError();
					}
				}
			}

			//TODO: cache query node.
			items = yqlResponse.query.results;
			
			if (params.node == 'query') {
				items = yqlResponse.query;
			}

			
			// cache valid results only
			if (items) {
				cachePut(params.cacheKey, items, cacheSeconds);
			}
		}
		
		// if there are results (cached or not), execute successCallback
		if (items) {
			successCallback(items);
		}
	};
	
	return ({
		createTextPost: createTextPost,
		createPhotoPost: createPhotoPost,
		createVideoPost: createVideoPost,
		deletePost: deletePost,
		getPost: getPost,
		getComments: getComments,
		featuredPosts: featuredPosts,
		dashboardPosts: dashboardPosts,
		isFollowing: isFollowing,
		follow: follow,
		unfollow: unfollow,
		createComment: createComment,
		repost: repost,
		isReposted: isReposted,
		userInfo: userInfo,
		userSearch: userSearch,
		userFeatured: userFeatured,
		flashlightPhotos: flashlightPhotos, 
		flashlightVideos: flashlightVideos, 
		flashlightWeb: flashlightWeb, 
		flashlightLinkWeb: flashlightLinkWeb,
		flashlightTweets: flashlightTweets,
		flashlightTwitterTimeline: flashlightTwitterTimeline,
		appInfo: appInfo
	});	
};