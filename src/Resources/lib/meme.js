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
	var createTextPost, createPhotoPost, createVideoPost, isFollowing, follow, unfollow;
		
	// private functions
	var createPost, execute;
	
	createTextPost = function(content) {
		return createPost('text', content);
	};

	createPhotoPost = function(content, caption) {
		return createPost('photo', content, caption);
	};

	createVideoPost = function(content, caption) {
		return createPost('video', content, caption);
	};

	isFollowing = function(guid) {
		if (!Ti.App.oAuthAdapter.isLoggedIn()) {
			throw 'sAuthentication is required to run this query.';
		}

		var yqlQuery = 'SELECT * FROM meme.following WHERE owner_guid=me and guid="' + guid + '"';
		var yqlResponse = Ti.App.oAuthAdapter.getYql().query(yqlQuery);
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

	// =====================
	// = Private functions =
	// =====================

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
		if (requireAuth && !Ti.App.oAuthAdapter.isLoggedIn()) {
			throw 'Authentication is required to run this query.';
		}
		var yqlResponse = yql.query(yqlQuery);
		return yqlResponse.query.results.status;
	};
	
	return ({
		createTextPost: createTextPost,
		createPhotoPost: createPhotoPost,
		createVideoPost: createVideoPost,
		isFollowing: isFollowing,
		follow: follow,
		unfollow: unfollow
	});	
}();