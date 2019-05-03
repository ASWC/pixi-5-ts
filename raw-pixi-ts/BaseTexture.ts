import { EventDispatcher } from "./EventDispatcher";
import { Event } from './Event';
import { Resource } from "./Resource";
import { BufferResource } from "./BufferResource";
import { DisplaySettings } from './DisplaySettings';
import { MathSettings } from "./MathSettings";
import { WebGLSettings } from './WebGLSettings';
import { CacheSettings } from './CacheSettings';
import { ResourceSettings } from './ResourceSettings';

export class BaseTexture extends EventDispatcher
{
    /**
	 * Global number of the texture batch, used by multi-texture renderers
	 *
	 * @static
	 * @member {number} new texture batch number
	 */
    static _globalBatch = 0;
    
    width
    height
    wrapMode
    _glTextures
    type
    isPowerOfTwo
    uid
    dirtyStyleId
    touched
    resolution
    format
    textureCacheIds
    destroyed
    resource
    _batchEnabled
    valid
    dirtyId
    cacheId
    premultiplyAlpha
    target
    scaleMode
    mipmap
    
    constructor(resource = null, options = null)
    {
        super();
        
        options = options || {};
        var premultiplyAlpha = options.premultiplyAlpha;
        var mipmap = options.mipmap;
        var scaleMode = options.scaleMode;
        var width = options.width;
        var height = options.height;
        var wrapMode = options.wrapMode;
        var format = options.format;
        var type = options.type;
        var target = options.target;
        var resolution = options.resolution;
        var resourceOptions = options.resourceOptions;
        // Convert the resource to a Resource object
        if(resource && resource instanceof ImageBitmap)
        {

        }
        else if (resource && !(resource instanceof Resource))
        {
            
            resource = ResourceSettings.autoDetectResource(resource, resourceOptions);
          
            resource.internal = true;
        }
        /**
         * The width of the base texture set when the image has loaded
         *
         * @readonly
         * @member {number}
         */
        this.width = width || 0;
        /**
         * The height of the base texture set when the image has loaded
         *
         * @readonly
         * @member {number}
         */
        this.height = height || 0;
        /**
         * The resolution / device pixel ratio of the texture
         *
         * @member {number}
         * @default PIXI.settings.RESOLUTION
         */
        this.resolution = resolution || DisplaySettings.RESOLUTION;
        /**
         * Mipmap mode of the texture, affects downscaled images
         *
         * @member {PIXI.MIPMAP_MODES}
         * @default PIXI.settings.MIPMAP_TEXTURES
         */
        this.mipmap = mipmap !== undefined ? mipmap : WebGLSettings.MIPMAP_TEXTURES;
        /**
         * How the texture wraps
         * @member {number}
         */
        this.wrapMode = wrapMode || WebGLSettings.WRAP_MODE;
        /**
         * The scale mode to apply when scaling this texture
         *
         * @member {PIXI.SCALE_MODES}
         * @default PIXI.settings.SCALE_MODE
         */
        this.scaleMode = scaleMode !== undefined ? scaleMode : DisplaySettings.SCALE_MODE;
        /**
         * The pixel format of the texture
         *
         * @member {PIXI.FORMATS}
         * @default PIXI.FORMATS.RGBA
         */
        this.format = format || WebGLSettings.FORMATS.RGBA;
        /**
         * The type of resource data
         *
         * @member {PIXI.TYPES}
         * @default PIXI.TYPES.UNSIGNED_BYTE
         */
        this.type = type || WebGLSettings.TYPES.UNSIGNED_BYTE;
        /**
         * The target type
         *
         * @member {PIXI.TARGETS}
         * @default PIXI.TARGETS.TEXTURE_2D
         */
        this.target = target || WebGLSettings.TARGETS.TEXTURE_2D;
        /**
         * Set to true to enable pre-multiplied alpha
         *
         * @member {boolean}
         * @default true
         */
        this.premultiplyAlpha = premultiplyAlpha !== false;
        /**
         * Global unique identifier for this BaseTexture
         *
         * @member {string}
         * @protected
         */
        this.uid = MathSettings.uid();
        /**
         * Used by automatic texture Garbage Collection, stores last GC tick when it was bound
         *
         * @member {number}
         * @protected
         */
        this.touched = 0;
        /**
         * Whether or not the texture is a power of two, try to use power of two textures as much
         * as you can
         *
         * @readonly
         * @member {boolean}
         * @default false
         */
        this.isPowerOfTwo = false;
        this._refreshPOT();
        /**
         * The map of render context textures where this is bound
         *
         * @member {Object}
         * @private
         */
        this._glTextures = {};
        /**
         * Used by TextureSystem to only update texture to the GPU when needed.
         *
         * @protected
         * @member {number}
         */
        this.dirtyId = 0;
        /**
         * Used by TextureSystem to only update texture style when needed.
         *
         * @protected
         * @member {number}
         */
        this.dirtyStyleId = 0;
        /**
         * Currently default cache ID.
         *
         * @member {string}
         */
        this.cacheId = null;
        /**
         * Generally speaking means when resource is loaded.
         * @readonly
         * @member {boolean}
         */
        this.valid = width > 0 && height > 0;

        /**
         * The collection of alternative cache ids, since some BaseTextures
         * can have more than one ID, short name and longer full URL
         *
         * @member {Array<string>}
         * @readonly
         */
        this.textureCacheIds = [];
        /**
         * Flag if BaseTexture has been destroyed.
         *
         * @member {boolean}
         * @readonly
         */
        this.destroyed = false;
        /**
         * The resource used by this BaseTexture, there can only
         * be one resource per BaseTexture, but textures can share
         * resources.
         *
         * @member {PIXI.resources.Resource}
         * @readonly
         */
        this.resource = null;
        /**
         * Number of the texture batch, used by multi-texture renderers
         *
         * @member {number}
         */
        this._batchEnabled = 0;
        /**
         * Fired when a not-immediately-available source finishes loading.
         *
         * @protected
         * @event PIXI.BaseTexture#loaded
         * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
         */
        /**
         * Fired when a not-immediately-available source fails to load.
         *
         * @protected
         * @event PIXI.BaseTexture#error
         * @param {PIXI.BaseTexture} baseTexture - Resource errored.
         */
        /**
         * Fired when BaseTexture is updated.
         *
         * @protected
         * @event PIXI.BaseTexture#loaded
         * @param {PIXI.BaseTexture} baseTexture - Resource loaded.
         */

        /**
         * Fired when BaseTexture is destroyed.
         *
         * @protected
         * @event PIXI.BaseTexture#error
         * @param {PIXI.BaseTexture} baseTexture - Resource errored.
         */

        /**
         * Fired when BaseTexture is updated.
         *
         * @protected
         * @event PIXI.BaseTexture#update
         * @param {PIXI.BaseTexture} baseTexture - Instance of texture being updated.
         */

        /**
         * Fired when BaseTexture is destroyed.
         *
         * @protected
         * @event PIXI.BaseTexture#dispose
         * @param {PIXI.BaseTexture} baseTexture - Instance of texture being destroyed.
         */

        // Set the resource
        this.setResource(resource);

    }

    /**
     * Pixel width of the source of this texture
     *
     * @readonly
     * @member {number}
     */
    get realWidth ()
    {
        return this.width * this.resolution;
    };

    /**
     * Pixel height of the source of this texture
     *
     * @readonly
     * @member {number}
     */
    get realHeight ()
    {
        return this.height * this.resolution;
    };

    /**
     * Changes style options of BaseTexture
     *
     * @param {PIXI.SCALE_MODES} [scaleMode] - Pixi scalemode
     * @param {PIXI.MIPMAP_MODES} [mipmap] - enable mipmaps
     * @returns {BaseTexture} this
     */
    BsetStyle(scaleMode, mipmap)
    {
        var dirty;

        if (scaleMode !== undefined && scaleMode !== this.scaleMode)
        {
            this.scaleMode = scaleMode;
            dirty = true;
        }

        if (mipmap !== undefined && mipmap !== this.mipmap)
        {
            this.mipmap = mipmap;
            dirty = true;
        }

        if (dirty)
        {
            this.dirtyStyleId++;
        }

        return this;
    };

    /**
     * Changes w/h/resolution. Texture becomes valid if width and height are greater than zero.
     *
     * @param {number} width Visual width
     * @param {number} height Visual height
     * @param {number} [resolution] Optionally set resolution
     * @returns {BaseTexture} this
     */
    setSize(width, height, resolution = null)
    {
        this.resolution = resolution || this.resolution;
        this.width = width;
        this.height = height;
        this._refreshPOT();
        this.update();

        return this;
    };

    /**
     * Sets real size of baseTexture, preserves current resolution.
     *
     * @param {number} realWidth Full rendered width
     * @param {number} realHeight Full rendered height
     * @param {number} [resolution] Optionally set resolution
     * @returns {BaseTexture} this
     */
    setRealSize(realWidth, realHeight, resolution = null)
    {
        this.resolution = resolution || this.resolution;
        this.width = realWidth / this.resolution;
        this.height = realHeight / this.resolution;
        this._refreshPOT();
        this.update();

        return this;
    };

    /**
     * Refresh check for isPowerOfTwo texture based on size
     *
     * @private
     */
    _refreshPOT  ()
    {
        this.isPowerOfTwo = MathSettings.isPow2(this.realWidth) && MathSettings.isPow2(this.realHeight);
    };

    /**
     * Changes resolution
     *
     * @param {number} [resolution] res
     * @returns {BaseTexture} this
     */
    setResolution(resolution)
    {
        var oldResolution = this.resolution;

        if (oldResolution === resolution)
        {
            return this;
        }

        this.resolution = resolution;

        if (this.valid)
        {
            this.width = this.width * oldResolution / resolution;
            this.height = this.height * oldResolution / resolution;
            this.dispatchEvent(Event.getEvent("update"));
            // this.emit('update');
        }

        this._refreshPOT();

        return this;
    };

    /**
     * Sets the resource if it wasn't set. Throws error if resource already present
     *
     * @param {PIXI.resources.Resource} resource - that is managing this BaseTexture
     * @returns {BaseTexture} this
     */
    setResource  (resource:Resource)
    {
        if (this.resource === resource)
        {
            return this;
        }

        if (this.resource)
        {
            throw new Error('Resource can be set only once');
        }
        this.resource = resource;
        if(resource instanceof ImageBitmap)
        {
            this.setRealSize(this.resource.width, this.resource.height);
            this.handleUpdate(null);
        }
        else
        {
            resource.addEventListener("update", this.handleUpdate)
            resource.addEventListener("setRealSize", this.handleResize)
            this.setRealSize(this.resource.width, this.resource.height);
        }

        


        // resource.bind(this);

        

        

        return this;
    };

    handleResize = (event:Event)=>
    {
        this.setRealSize(this.resource.width, this.resource.height);
    }

    handleUpdate = (event:Event)=>
    {
        this.update()
    }

    /**
     * Invalidates the object. Texture becomes valid if width and height are greater than zero.
     */
    update  ()
    {
        
        if (!this.valid)
        {
            if (this.width > 0 && this.height > 0)
            {
                this.valid = true;
                this.dispatchEvent(Event.getEvent("loaded"));
                this.dispatchEvent(Event.getEvent("update"));
                // this.emit('loaded', this);
                // this.emit('update', this);
            }
        }
        else
        {
            this.dirtyId++;
            this.dirtyStyleId++;
            this.dispatchEvent(Event.getEvent("update"));
            // this.emit('update', this);
        }
    };

    /**
     * Destroys this base texture.
     * The method stops if resource doesn't want this texture to be destroyed.
     * Removes texture from all caches.
     */
    destroy ()
    {
        // remove and destroy the resource
        if (this.resource)
        {
            this.resource.unbind(this);
            // only destroy resourced created internally
            if (this.resource.internal)
            {
                this.resource.destroy();
            }
            this.resource = null;
        }

        if (this.cacheId)
        {
            delete CacheSettings.BaseTextureCache[this.cacheId];
            delete CacheSettings.TextureCache[this.cacheId];

            this.cacheId = null;
        }

        // finally let the WebGL renderer know..
        this.dispose();

        BaseTexture.removeFromCache(this);
        this.textureCacheIds = null;

        this.destroyed = true;
    };

    /**
     * Frees the texture from WebGL memory without destroying this texture object.
     * This means you can still use the texture later which will upload it to GPU
     * memory again.
     *
     * @fires PIXI.BaseTexture#dispose
     */
    dispose  ()
    {
        this.dispatchEvent(Event.getEvent("dispose"));
        // this.emit('dispose', this);
    };

    /**
     * Helper function that creates a base texture based on the source you provide.
     * The source can be - image url, image element, canvas element. If the
     * source is an image url or an image element and not in the base texture
     * cache, it will be created and loaded.
     *
     * @static
     * @param {string|HTMLImageElement|HTMLCanvasElement|SVGElement|HTMLVideoElement} source - The
     *        source to create base texture from.
     * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
     * @returns {PIXI.BaseTexture} The new base texture.
     */
    static from  (source, options)
    {
        var cacheId = null;

        if (typeof source === 'string')
        {
            cacheId = source;
        }
        else
        {
            if (!source._pixiId)
            {
                source._pixiId = "pixiid_" + (MathSettings.uid());
            }

            cacheId = source._pixiId;
        }

        var baseTexture = CacheSettings.BaseTextureCache[cacheId];

        if (!baseTexture)
        {
            baseTexture = new BaseTexture(source, options);
            baseTexture.cacheId = cacheId;
            BaseTexture.addToCache(baseTexture, cacheId);
        }

        return baseTexture;
    };

    /**
     * Create a new BaseTexture with a BufferResource from a Float32Array.
     * RGBA values are floats from 0 to 1.
     * @static
     * @param {Float32Array|Uint8Array} buffer The optional array to use, if no data
     *        is provided, a new Float32Array is created.
     * @param {number} width - Width of the resource
     * @param {number} height - Height of the resource
     * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
     * @return {PIXI.BaseTexture} The resulting new BaseTexture
     */
    static fromBuffer  (buffer, width, height, options)
    {
        buffer = buffer || new Float32Array(width * height * 4);

        var resource = new BufferResource(buffer, { width: width, height: height });
        var type = buffer instanceof Float32Array ? WebGLSettings.TYPES.FLOAT : WebGLSettings.TYPES.UNSIGNED_BYTE;

        return new BaseTexture(resource, Object.assign(WebGLSettings.defaultBufferOptions, options || { width: width, height: height, type: type }));
    };

    /**
     * Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
     *
     * @static
     * @param {PIXI.BaseTexture} baseTexture - The BaseTexture to add to the cache.
     * @param {string} id - The id that the BaseTexture will be stored against.
     */
    static addToCache  (baseTexture, id)
    {
        if (id)
        {
            if (baseTexture.textureCacheIds.indexOf(id) === -1)
            {
                baseTexture.textureCacheIds.push(id);
            }

            if (CacheSettings.BaseTextureCache[id])
            {
                // eslint-disable-next-line no-console
                console.warn(("BaseTexture added to the cache with an id [" + id + "] that already had an entry"));
            }

            CacheSettings.BaseTextureCache[id] = baseTexture;
        }
    };

    /**
     * Remove a BaseTexture from the global BaseTextureCache.
     *
     * @static
     * @param {string|PIXI.BaseTexture} baseTexture - id of a BaseTexture to be removed, or a BaseTexture instance itself.
     * @return {PIXI.BaseTexture|null} The BaseTexture that was removed.
     */
    static removeFromCache (baseTexture)
    {
        if (typeof baseTexture === 'string')
        {
            var baseTextureFromCache = CacheSettings.BaseTextureCache[baseTexture];

            if (baseTextureFromCache)
            {
                var index = baseTextureFromCache.textureCacheIds.indexOf(baseTexture);

                if (index > -1)
                {
                    baseTextureFromCache.textureCacheIds.splice(index, 1);
                }

                delete CacheSettings.BaseTextureCache[baseTexture];

                return baseTextureFromCache;
            }
        }
        else if (baseTexture && baseTexture.textureCacheIds)
        {
            for (var i = 0; i < baseTexture.textureCacheIds.length; ++i)
            {
                delete CacheSettings.BaseTextureCache[baseTexture.textureCacheIds[i]];
            }

            baseTexture.textureCacheIds.length = 0;

            return baseTexture;
        }

        return null;
    };
}


