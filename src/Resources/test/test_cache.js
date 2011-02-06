Ti.include('../lib/cache.js');

var CacheTestSuite = {
	suiteName: 'Cache Test Suite',
	
	testCacheGet: function() {
		var cache = Cache();
		jsUnity.assertions.assertNull(cache.get('my_fake_key'));
		
		var obj = { my: 'obj' };
		cache.put('fake_key', obj);
		
		cached_obj = cache.get('fake_key');
		jsUnity.assertions.assertNotNull(cached_obj);
		jsUnity.assertions.assertEqual(obj, cached_obj);
	}	
};