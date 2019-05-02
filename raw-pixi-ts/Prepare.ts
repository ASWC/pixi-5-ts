import { BasePrepare } from "./BasePrepare";
// import { settings } from "./settings";
import { Graphics } from './Graphics';
import { BaseTexture } from './BaseTexture';


export class Prepare extends BasePrepare
{
    constructor(renderer)
    {
		super(renderer);
		
		
        this.uploadHookHelper = this.renderer;

        // Add textures and graphics to upload
        this.registerFindHook(Prepare.findGraphics);
        this.registerUploadHook(Prepare.uploadBaseTextures);
        this.registerUploadHook(Prepare.uploadGraphics);
    }

	static findGraphics(item, queue)
	{
	    if (item instanceof Graphics)
	    {
	        queue.push(item);
	        return true;
	    }
	    return false;
    }
	static uploadBaseTextures(renderer, item)
	{
	    if (item instanceof BaseTexture)
	    {
	        if (!item._glTextures[renderer.CONTEXT_UID])
	        {
	            renderer.textureManager.updateTexture(item);
	        }
	        return true;
	    }
	    return false;
    }
	static uploadGraphics(renderer, item)
	{
	    if (item instanceof Graphics)
	    {
	        if (item.dirty || item.clearDirty || !item._webGL[renderer.plugins.graphics.CONTEXT_UID])
	        {
	            renderer.plugins.graphics.updateGraphics(item);
	        }
	        return true;
	    }
	    return false;
	}
}

