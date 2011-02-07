Ti.include('../lib/cache.js');

jsUnity.attachAssertions();

var CacheTestSuite = {
	suiteName: 'Cache Test Suite',
	
	testCacheDelete: function() {
		var cache = Cache();
		
		cache.del('deleted_key');
		assertNull(cache.get('deleted_key'));
		
		cache.put('deleted_key', { deleted: 'obj' });
		assertNotNull(cache.get('deleted_key'));
		
		cache.del('deleted_key');
		assertNull(cache.get('deleted_key'));
	},
	
	testCachePut: function() {
		var cache = Cache();
		cache.del('my_fake_key');
		assertNull(cache.get('my_fake_key'));
		
		var obj = { my: 'obj' };
		cache.put('my_fake_key', obj);
		
		cached_obj = cache.get('my_fake_key');
		assertNotNull(cached_obj);
		assertEqual(obj, cached_obj);
	},
	
	testCacheGet: function() {
		var cache = Cache();		
		cache.del('my_cache_key');
		assertNull(cache.get('my_cache_key'));
		
		var obj = { prop: 'value', other_prop: 'other value' };
		cache.put('my_cache_key', obj);
		
		cached_obj = cache.get('my_cache_key');
		assertNotNull(cached_obj);
		assertEqual(obj, cached_obj);
		assertEqual(obj.prop, cached_obj.prop);
		assertEqual(obj.other_prop, cached_obj.other_prop);
	}
};