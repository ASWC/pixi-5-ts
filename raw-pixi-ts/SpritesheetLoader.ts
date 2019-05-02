import { Spritesheet } from "./Spritesheet";


export class SpritesheetLoader
{
    // INCOMPLETE
    constructor()
    {

    }

    static use  (resource, next)
	{
	    var imageResourceName = (resource.name) + "_image";

	    // skip if no data, its not json, it isn't spritesheet data, or the image resource already exists
	    // if (!resource.data
	    //     || resource.type !== LoaderResource.TYPE.JSON
	    //     || !resource.data.frames
	    //     || this.resources[imageResourceName]
	    // )
	    // {
	    //     next();

	    //     return;
	    // }

	    var loadOptions = {
	        crossOrigin: resource.crossOrigin,
	        metadata: resource.metadata.imageMetadata,
	        parentResource: resource,
	    };

	    // var resourcePath = SpritesheetLoader.getResourcePath(resource, this.baseUrl);

	    // load the image for this sheet
	    // this.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res)
	    // {
	    //     if (res.error)
	    //     {
	    //         next(res.error);

	    //         return;
	    //     }

	    //     var spritesheet = new Spritesheet(
	    //         res.texture.baseTexture,
	    //         resource.data,
	    //         resource.url
	    //     );

	    //     spritesheet.parse(function () {
	    //         resource.spritesheet = spritesheet;
	    //         resource.textures = spritesheet.textures;
	    //         next();
	    //     });
	    // });
	};

	/**
	 * Get the spritesheets root path
	 * @param {PIXI.LoaderResource} resource - Resource to check path
	 * @param {string} baseUrl - Base root url
	 */
	static getResourcePath  (resource, baseUrl)
	{
	    // Prepend url path unless the resource image is a data url
	    if (resource.isDataUrl)
	    {
	        return resource.data.meta.image;
	    }

	    return //url.resolve(resource.url.replace(baseUrl, ''), resource.data.meta.image);
	};
}