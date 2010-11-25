var Cache = {
	
	// Cache initialization
	// Must be done only once in application startup
	init: function() {
		var db = Titanium.Database.open('cache');
		db.execute('DROP TABLE IF EXISTS cache');
		db.execute('CREATE TABLE IF NOT EXISTS cache (key TEXT UNIQUE, value TEXT, expiration INTEGER)');
		db.close();
	},
	
	get: function(key) {
		var db = Titanium.Database.open('cache');
		var rs = db.execute('SELECT value, expiration FROM cache WHERE key = ?', key);
		var result = null;
		if (rs.isValidRow()) {
			Ti.API.info('CACHE HIT! [' + key + '][' + JSON.parse(rs.fieldByName('value')) + ']');
			result = JSON.parse(rs.fieldByName('value'));
		}
		rs.close();
		db.close();
		return result;
	},
	
	put: function(key, value, expiration_seconds) {
		if (!expiration_seconds) {
			expiration_seconds = 30;
		}
		var db = Titanium.Database.open('cache');
		var query = 'INSERT OR REPLACE INTO cache (key, value, expiration) VALUES (?, ?, ?);';
		db.execute(query, key, JSON.stringify(value), expiration_seconds);
		db.close();
	}
}