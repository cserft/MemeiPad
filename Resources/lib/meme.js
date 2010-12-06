var Meme = {};

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
	if (!Ti.App.oAuthAdapter.isLoggedIn()) {
		throw 'Authentication is required to run this query.';
	}
	
	var yqlQuery = 'INSERT INTO meme.user.following (guid) VALUES ("' + guid + '")';
	var yqlResponse = Ti.App.oAuthAdapter.getYql().query(yqlQuery);
	return yqlResponse.query.results.status;
};

Meme.unfollow = function(guid) {
	if (!Ti.App.oAuthAdapter.isLoggedIn()) {
		throw 'Authentication is required to run this query.';
	}
	
	var yqlQuery = 'DELETE FROM meme.user.following WHERE guid="' + guid + '"';
	var yqlResponse = Ti.App.oAuthAdapter.getYql().query(yqlQuery);
	return yqlResponse.query.results.status;
};