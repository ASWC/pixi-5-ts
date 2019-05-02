

export class CacheSettings
{
	static ProgramCache = {};
	static nameCache = {};
	static programCache = {};
    static TextureCache = {};
	static BaseTextureCache = {};
	static defaultGroupCache = {};

	static clearTextureCache()
	{
	    var key;

	    for (key in CacheSettings.TextureCache)
	    {
	        delete CacheSettings.TextureCache[key];
	    }
	    for (key in CacheSettings.BaseTextureCache)
	    {
	        delete CacheSettings.BaseTextureCache[key];
	    }
	}
	static destroyTextureCache()
	{
	    var key;

	    for (key in CacheSettings.TextureCache)
	    {
	        CacheSettings.TextureCache[key].destroy();
	    }
	    for (key in CacheSettings.BaseTextureCache)
	    {
	        CacheSettings.BaseTextureCache[key].destroy();
	    }
	}
}