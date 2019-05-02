import { ArrayResource } from "./ArrayResource";
import { WebGLSettings } from './WebGLSettings';

export class CubeResource extends ArrayResource
{
    	/**
	 * Number of texture sides to store for CubeResources
	 *
	 * @name PIXI.resources.CubeResource.SIDES
	 * @static
	 * @member {number}
	 * @default 6
	 */
	static SIDES = 6;
    constructor(source, options)
    {
        super(source, options);
        options = options || {};
        if (this.length !== CubeResource.SIDES)
        {
            throw new Error(("Invalid length. Got " + (this.length) + ", expected 6"));
        }

        for (var i = 0; i < CubeResource.SIDES; i++)
        {
            this.items[i].target = WebGLSettings.TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + i;
        }

        if (options.autoLoad !== false)
        {
            this.load();
        }
    }

    /**
     * Add binding
     *
     * @override
     * @param {PIXI.BaseTexture} baseTexture - parent base texture
     */
    bind  (baseTexture)
    {
        super.bind(baseTexture);

        baseTexture.target = WebGLSettings.TARGETS.TEXTURE_CUBE_MAP;
    };

    /**
     * Upload the resource
     *
     * @returns {boolean} true is success
     */
    upload  (renderer, baseTexture, glTexture)
    {
        var dirty = this.itemDirtyIds;

        for (var i = 0; i < CubeResource.SIDES; i++)
        {
            var side = this.items[i];

            if (dirty[i] < side.dirtyId)
            {
                dirty[i] = side.dirtyId;
                if (side.valid)
                {
                    side.resource.upload(renderer, side, glTexture);
                }
            }
        }

        return true;
    };
}
