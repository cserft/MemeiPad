var Meme = {};

Meme.createTextPost = function(content) {
	return Meme.internal.createPost('text', content);
};

Meme.createPhotoPost = function(content, caption) {
	return Meme.internal.createPost('photo', content, caption);
};

Meme.createVideoPost = function(content, caption) {
	return Meme.internal.createPost('video', content, caption);
};

Meme.isFollowing = function(guid) {
	if (!Ti.App.oAuthAdapter.isLoggedIn()) {
		throw 'Authentication is required to run this query.';
	}
	
	var yqlQuery = 'SELECT * FROM meme.following WHERE owner_guid=me and guid="' + guid + '"';
	var yqlResponse = Ti.App.oAuthAdapter.getYql().query(yqlQuery);
	if (yqlResponse.query.results) {
		return true;
	}
	return false;
};

Meme.follow = function(guid) {
	var yqlQuery = 'INSERT INTO meme.user.following (guid) VALUES ("' + guid + '")';
	return Meme.internal.execute(true, yqlQuery);
};

Meme.unfollow = function(guid) {
	var yqlQuery = 'DELETE FROM meme.user.following WHERE guid="' + guid + '"';
	return Meme.internal.execute(true, yqlQuery);
};

// ======================
// = Internal functions =
// ======================
Meme.internal = {};

// Creates a post on Meme given the type provided
Meme.internal.createPost = function(type, content, caption) {
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
	return Meme.internal.execute(true, yqlQuery);
};

// Executes an API query that does not expect response (insert, update, delete)
Meme.internal.execute = function(requireAuth, yqlQuery) {
	if (requireAuth && !Ti.App.oAuthAdapter.isLoggedIn()) {
		throw 'Authentication is required to run this query.';
	}
	var yqlResponse = yql.query(yqlQuery);
	return yqlResponse.query.results.status;
};
