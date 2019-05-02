import { Resource } from "./Resource";
import { BaseTexture } from "./BaseTexture";
import { ResourceSettings } from './ResourceSettings';
import { WebGLSettings } from './WebGLSettings';


export class ArrayResource extends Resource
{
    items
    itemDirtyIds
    _load
    length
    constructor(source, options)
    {
        options = options || {};
        var urls;
        var length = source;
        if (Array.isArray(source))
        {
            urls = source;
            length = source.length;
        }
        super(options.width, options.height);
        /**
         * Collection of resources.
         * @member {Array<PIXI.BaseTexture>}
         * @readonly
         */
        this.items = [];

        /**
         * Dirty IDs for each part
         * @member {Array<number>}
         * @readonly
         */
        this.itemDirtyIds = [];

        for (var i = 0; i < length; i++)
        {
            var partTexture = new BaseTexture();

            this.items.push(partTexture);
            this.itemDirtyIds.push(-1);
        }

        /**
         * Number of elements in array
         *
         * @member {number}
         * @readonly
         */
        this.length = length;

        /**
         * Promise when loading
         * @member {Promise}
         * @private
         * @default null
         */
        this._load = null;

        if (urls)
        {
            for (var i$1 = 0; i$1 < length; i$1++)
            {
                this.addResourceAt(ResourceSettings.autoDetectResource(urls[i$1], options), i$1);
            }
        }
    }

    /**
     * Destroy this BaseImageResource
     * @override
     */
    dispose  ()
    {
        for (var i = 0, len = this.length; i < len; i++)
        {
            this.items[i].destroy();
        }
        this.items = null;
        this.itemDirtyIds = null;
        this._load = null;
    };

    /**
     * Set a resource by ID
     *
     * @param {PIXI.resources.Resource} resource
     * @param {number} index - Zero-based index of resource to set
     * @return {PIXI.resources.ArrayResource} Instance for chaining
     */
    addResourceAt  (resource, index)
    {
        var baseTexture = this.items[index];

        if (!baseTexture)
        {
            throw new Error(("Index " + index + " is out of bounds"));
        }

        // Inherit the first resource dimensions
        if (resource.valid && !this.valid)
        {
            this.resize(resource.width, resource.height);
        }

        this.items[index].setResource(resource);

        return this;
    };

    /**
     * Set the parent base texture
     * @member {PIXI.BaseTexture}
     * @override
     */
    bind  (baseTexture)
    {
        super.bind(baseTexture);

        baseTexture.target = WebGLSettings.TARGETS.TEXTURE_2D_ARRAY;

        for (var i = 0; i < this.length; i++)
        {
            this.items[i].on('update', baseTexture.update, baseTexture);
        }
    };

    /**
     * Unset the parent base texture
     * @member {PIXI.BaseTexture}
     * @override
     */
    unbind  (baseTexture)
    {
        super.unbind(baseTexture);

        for (var i = 0; i < this.length; i++)
        {
            this.items[i].off('update', baseTexture.update, baseTexture);
        }
    };

    /**
     * Load all the resources simultaneously
     * @override
     * @return {Promise<void>} When load is resolved
     */
    load  ()
    {
        var this$1 = this;

        if (this._load)
        {
            return this._load;
        }

        var resources = this.items.map(function (item) { return item.resource; });

        // TODO: also implement load part-by-part strategy
        var promises = resources.map(function (item) { return item.load(); });

        this._load = Promise.all(promises)
            .then(function () {
                var ref = resources[0];
                var width = ref.width;
                var height = ref.height;

                this$1.resize(width, height);

                return Promise.resolve(this$1);
            }
            );

        return this._load;
    };

    /**
     * Upload the resources to the GPU.
     * @param {PIXI.Renderer} renderer
     * @param {PIXI.BaseTexture} texture
     * @param {PIXI.GLTexture} glTexture
     * @returns {boolean} whether texture was uploaded
     */
    upload (renderer, texture, glTexture)
    {
        var ref = this;
        var length = ref.length;
        var itemDirtyIds = ref.itemDirtyIds;
        var items = ref.items;
        var gl = renderer.gl;

        if (glTexture.dirtyId < 0)
        {
            gl.texImage3D(
                gl.TEXTURE_2D_ARRAY,
                0,
                texture.format,
                this._width,
                this._height,
                length,
                0,
                texture.format,
                texture.type,
                null
            );
        }

        for (var i = 0; i < length; i++)
        {
            var item = items[i];

            if (itemDirtyIds[i] < item.dirtyId)
            {
                itemDirtyIds[i] = item.dirtyId;
                if (item.valid)
                {
                    gl.texSubImage3D(
                        gl.TEXTURE_2D_ARRAY,
                        0,
                        0, // xoffset
                        0, // yoffset
                        i, // zoffset
                        item.resource.width,
                        item.resource.height,
                        1,
                        texture.format,
                        texture.type,
                        item.resource.source
                    );
                }
            }
        }

        return true;
    };
}
