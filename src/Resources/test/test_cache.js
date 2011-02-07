Ti.include('../lib/cache.js');

var CacheTestSuite = {
	suiteName: 'Cache Test Suite',
	
	testCacheDelete: function() {
		var cache = Cache();
		
		cache.del('deleted_key');
		jsUnity.assertions.assertNull(cache.get('deleted_key'));
		
		cache.put('deleted_key', { deleted: 'obj' });
		jsUnity.assertions.assertNotNull(cache.get('deleted_key'));
		
		cache.del('deleted_key');
		jsUnity.assertions.assertNull(cache.get('deleted_key'));
	},
	
	testCacheGet: function() {
		var cache = Cache();
		cache.del('my_fake_key');
		
		jsUnity.assertions.assertNull(cache.get('my_fake_key'));
		
		var obj = { my: 'obj' };
		cache.put('fake_key', obj);
		
		cached_obj = cache.get('fake_key');
		jsUnity.assertions.assertNotNull(cached_obj);
		jsUnity.assertions.assertEqual(obj, cached_obj);
	}
};