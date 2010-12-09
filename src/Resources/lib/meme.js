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
		featuredPosts, isFollowing, follow, unfollow, createComment, repost, 
		isReposted, userInfo;
		
	// private functions
	var getYql, cacheGet, cachePut, loginRequired, throwYqlError, createPost, 
		execute;
	
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
		var cacheKey = 'post:' + guid + ':' + pubid;
		var post = cacheGet(cacheKey);
		
		if (!post) {
			var yqlQuery = 'SELECT * FROM meme.posts WHERE owner_guid="' + guid + '" and pubid="' + pubid + '"';
			var yqlResponse = getYql().query(yqlQuery);

			if (!yqlResponse.query.results) {
				throwYqlError();
			}
			
			post = yqlResponse.query.results.post;
			
			// cache post for 24 hours
			cachePut(cacheKey, post, 86400);
		}
		
		return post
	};
	
	featuredPosts = function() {
		var cacheKey = 'featuredPosts';
		var posts = cacheGet(cacheKey);
		
		if (!posts) {
			var yqlQuery = 'SELECT * FROM meme.posts.featured WHERE locale="en" | meme.functions.thumbs(width=307,height=231)';
			var yqlResponse = getYql().query(yqlQuery);

			if (!yqlResponse.query.results) {
				throwYqlError();
			}

			posts = yqlResponse.query.results.post;

			// cache featuredPosts for 2 hours
			cachePut(cacheKey, posts, 7200);
		}
		
		return posts;
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
	
	userInfo = function(guid, thumb_width, thumb_height) {
		if (guid == 'me') {
			loginRequired();
		}
		
		var cacheKey = 'userInfo:' + guid;
		var userInfo = cacheGet(cacheKey);
		
		if (!userInfo) {
			var queryGuid = (guid == 'me') ? guid : '"' + guid + '"';
			var yqlQuery = 'SELECT * FROM meme.info where owner_guid=' + queryGuid + ' | meme.functions.thumbs(width=' + thumb_width + ',height=' + thumb_height + ')';
			var yqlResponse = getYql().query(yqlQuery);

			if (!yqlResponse.query.results) {
				throwYqlError();
			}

			userInfo = yqlResponse.query.results.meme;
			
			// cache userInfo for 24 hours
			cachePut(cacheKey, userInfo, 86400);
		}
		
		return userInfo;
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
		var yqlResponse = yql.query(yqlQuery);
		var results = yqlResponse.query.results;
		
		if (!results) {
			throwYqlError();
		}
		
		if (results.status && results.status.message == 'ok') {
			return true;
		}
		return false;
	};
	
	return ({
		createTextPost: createTextPost,
		createPhotoPost: createPhotoPost,
		createVideoPost: createVideoPost,
		deletePost: deletePost,
		getPost: getPost,
		featuredPosts: featuredPosts,
		isFollowing: isFollowing,
		follow: follow,
		unfollow: unfollow,
		createComment: createComment,
		repost: repost,
		isReposted: isReposted,
		userInfo: userInfo
	});	
}();