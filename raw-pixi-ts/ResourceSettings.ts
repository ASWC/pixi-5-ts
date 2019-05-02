import { ImageResource } from './ImageResource';
import { CanvasResource } from './CanvasResource';
import { VideoResource } from './VideoResource';
import { SVGResource } from './SVGResource';
import { BufferResource } from './BufferResource';
import { CubeResource } from './CubeResource';
import { ArrayResource } from './ArrayResource';


export class ResourceSettings
{
	static INSTALLED = [
		ImageResource,
	    CanvasResource,
	    VideoResource,
	    SVGResource,
	    BufferResource,
	    CubeResource,
	    ArrayResource
	];
	
	static autoDetectResource(source, options)
	{
	    if (!source)
	    {
	        return null;
	    }
	    var extension = '';
	    if (typeof source === 'string')
	    {
	        var result = (/\.(\w{3,4})(?:$|\?|#)/i).exec(source);
	        if (result)
	        {
	            extension = result[1].toLowerCase();
	        }
	    }
	    for (var i = ResourceSettings.INSTALLED.length - 1; i >= 0; --i)
	    {
	        var ResourcePlugin:any = ResourceSettings.INSTALLED[i];
	        if (ResourcePlugin.test && ResourcePlugin.test(source, extension))
	        {
	            return new ResourcePlugin(source, options);
	        }
	    }
	    return new ImageResource(source, options);
    }
}