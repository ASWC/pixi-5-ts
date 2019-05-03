import { EventDispatcher } from "./EventDispatcher";
import { Rectangle } from "./Rectangle";
import { Point } from "./Point";
import { Event } from "./Event";
import { TextureUvs } from "./TextureUvs";
import { BaseTexture } from "./BaseTexture";
import { ImageResource } from "./ImageResource";
import { CanvasResource } from "./CanvasResource";
import { MathSettings } from './MathSettings';
import { CacheSettings } from './CacheSettings';
import { DisplaySettings } from './DisplaySettings';
import { NetworkSettings } from './NetworkSettings';
import { trace } from "./Logger";

export class Texture extends EventDispatcher
{
    static DEFAULT_UVS = new TextureUvs();
    noFrame
    baseTexture
    valid
    _uvs
    _frame
    requiresUpdate
    _updateID
    trim
    uvMatrix
    defaultAnchor
    _rotate    
    orig
    textureCacheIds
    constructor(baseTexture:BaseTexture, frame = null, orig = null, trim = null, rotate = null, anchor = null)
    {
        super();
        this.noFrame = false;
        if (!frame)
        {
            this.noFrame = true;
            frame = new Rectangle(0, 0, 1, 1);
        }
        if (baseTexture instanceof Texture)
        {
            baseTexture = baseTexture.baseTexture;
        }
        /**
         * The base texture that this texture uses.
         *
         * @member {PIXI.BaseTexture}
         */
        this.baseTexture = baseTexture;
        /**
         * This is the area of the BaseTexture image to actually copy to the Canvas / WebGL when rendering,
         * irrespective of the actual frame size or placement (which can be influenced by trimmed texture atlases)
         *
         * @member {PIXI.Rectangle}
         */
        this._frame = frame;
        /**
         * This is the trimmed area of original texture, before it was put in atlas
         * Please call `updateUvs()` after you change coordinates of `trim` manually.
         *
         * @member {PIXI.Rectangle}
         */
        this.trim = trim;
        /**
         * This will let the renderer know if the texture is valid. If it's not then it cannot be rendered.
         *
         * @member {boolean}
         */
        this.valid = false;
        /**
         * This will let a renderer know that a texture has been updated (used mainly for WebGL uv updates)
         *
         * @member {boolean}
         */
        this.requiresUpdate = false;
        /**
         * The WebGL UV data cache. Can be used as quad UV
         *
         * @member {PIXI.TextureUvs}
         * @protected
         */
        this._uvs = Texture.DEFAULT_UVS;
        /**
         * Default TextureMatrix instance for this texture
         * By default that object is not created because its heavy
         *
         * @member {PIXI.TextureMatrix}
         */
        this.uvMatrix = null;
        /**
         * This is the area of original texture, before it was put in atlas
         *
         * @member {PIXI.Rectangle}
         */
        this.orig = orig || frame;// new Rectangle(0, 0, 1, 1);
        this._rotate = Number(rotate || 0);
        if (rotate === true)
        {
            // this is old texturepacker legacy, some games/libraries are passing "true" for rotated textures
            this._rotate = 2;
        }
        else if (this._rotate % 2 !== 0)
        {
            throw new Error('attempt to use diamond-shaped UVs. If you are sure, set rotation manually');
        }
        if (baseTexture.valid)
        {
            if (this.noFrame)
            {
                frame = new Rectangle(0, 0, baseTexture.width, baseTexture.height);
                // if there is no frame we should monitor for any base texture changes..
                baseTexture.addEventListener("update", this.onBaseTextureUpdated)
                // baseTexture.on('update', this.onBaseTextureUpdated, this);
            }
            this.frame = frame;
        }
        else
        {
            baseTexture.addEventListener("loaded", this.onBaseTextureUpdated)


            // baseTexture.once('loaded', this.onBaseTextureUpdated, this);
        }
        /**
         * Anchor point that is used as default if sprite is created with this texture.
         * Changing the `defaultAnchor` at a later point of time will not update Sprite's anchor point.
         * @member {PIXI.Point}
         * @default {0,0}
         */
        if(anchor)
        {
            this.defaultAnchor = new Point(anchor.x, anchor.y)
        }
        else
        {
            this.defaultAnchor = new Point(0, 0)
        }
        /**
         * Update ID is observed by sprites and TextureMatrix instances.
         * Call updateUvs() to increment it.
         *
         * @member {number}
         * @protected
         */
        this._updateID = 0;
        /**
         * The ids under which this Texture has been added to the texture cache. This is
         * automatically set as long as Texture.addToCache is used, but may not be set if a
         * Texture is added directly to the TextureCache array.
         *
         * @member {string[]}
         */
        this.textureCacheIds = [];
    }

    /**
     * Updates this texture on the gpu.
     *
     */
    update()
    {
        this.baseTexture.update();
    };

    /**
     * Called when the base texture is updated
     *
     * @protected
     * @param {PIXI.BaseTexture} baseTexture - The base texture.
     */
    onBaseTextureUpdated = (baseTexture)=>
    {
        trace("onBaseTextureUpdated")
        this._updateID++;

        // TODO this code looks confusing.. boo to abusing getters and setters!
        if (this.noFrame)
        {
            this.frame = new Rectangle(0, 0, baseTexture.width, baseTexture.height);
        }
        else
        {
            this.frame = this._frame;
            // TODO maybe watch out for the no frame option
            // updating the texture will should update the frame if it was set to no frame..
        }
        this.valid = this.baseTexture.valid

        this.dispatchEvent(Event.getEvent("update"));
        // this.emit('update', this);
        // this.baseTexture.addEventListener("update", this.onBaseTextureUpdated)
    };

    /**
     * Destroys this texture
     *
     * @param {boolean} [destroyBase=false] Whether to destroy the base texture as well
     */
    destroy(destroyBase)
    {
        if (this.baseTexture)
        {
            if (destroyBase)
            {
                // delete the texture if it exists in the texture cache..
                // this only needs to be removed if the base texture is actually destroyed too..
                if (CacheSettings.TextureCache[this.baseTexture.imageUrl])
                {
                    Texture.removeFromCache(this.baseTexture.imageUrl);
                }

                this.baseTexture.destroy();
            }

            // this.baseTexture.remo('update', this.onBaseTextureUpdated, this);

            this.baseTexture = null;
        }

        this._frame = null;
        this._uvs = null;
        this.trim = null;
        this.orig = null;

        this.valid = false;

        Texture.removeFromCache(this);
        this.textureCacheIds = null;
    };

    /**
     * Creates a new texture object that acts the same as this one.
     *
     * @return {PIXI.Texture} The new texture
     */
    clone()
    {
        return new Texture(this.baseTexture, this.frame, this.orig, this.trim, this.rotate, this.defaultAnchor);
    };

    /**
     * Updates the internal WebGL UV cache. Use it after you change `frame` or `trim` of the texture.
     * Call it after changing the frame
     */
    updateUvs()
    {
        if (this._uvs === Texture.DEFAULT_UVS)
        {
            this._uvs = new TextureUvs();
        }

        this._uvs.set(this._frame, this.baseTexture, this.rotate);

        this._updateID++;
    };

    /**
     * Helper function that creates a new Texture based on the source you provide.
     * The source can be - frame id, image url, video url, canvas element, video element, base texture
     *
     * @static
     * @param {number|string|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|PIXI.BaseTexture} source
     *        Source to create texture from
     * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
     * @return {PIXI.Texture} The newly created texture
     */
    static from (source, options:any = {})
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

        var texture = CacheSettings.TextureCache[cacheId];

        if (!texture)
        {
            if (options['resolution'] == undefined)
            {
                options.resolution = NetworkSettings.getResolutionOfUrl(source);
            }

            texture = new Texture(new BaseTexture(source, options));
            texture.baseTexture.cacheId = cacheId;

            BaseTexture.addToCache(texture.baseTexture, cacheId);
            Texture.addToCache(texture, cacheId);
        }

        // lets assume its a base texture!
        return texture;
    };

    /**
     * Create a new Texture with a BufferResource from a Float32Array.
     * RGBA values are floats from 0 to 1.
     * @static
     * @param {Float32Array|Uint8Array} buffer The optional array to use, if no data
     *        is provided, a new Float32Array is created.
     * @param {number} width - Width of the resource
     * @param {number} height - Height of the resource
     * @param {object} [options] See {@link PIXI.BaseTexture}'s constructor for options.
     * @return {PIXI.Texture} The resulting new BaseTexture
     */
    static fromBuffer = function fromBuffer (buffer, width, height, options)
    {
        return new Texture(BaseTexture.fromBuffer(buffer, width, height, options));
    };

    /**
     * Create a texture from a source and add to the cache.
     *
     * @static
     * @param {HTMLImageElement|HTMLCanvasElement} source - The input source.
     * @param {String} imageUrl - File name of texture, for cache and resolving resolution.
     * @param {String} [name] - Human readable name for the texture cache. If no name is
     *        specified, only `imageUrl` will be used as the cache ID.
     * @return {PIXI.Texture} Output texture
     */
    static fromLoader = function fromLoader (source, imageUrl, name)
    {
        var resource = new ImageResource(source);

        resource.url = imageUrl;

        var baseTexture = new BaseTexture(resource, {
            scaleMode: DisplaySettings.SCALE_MODE,
            resolution: NetworkSettings.getResolutionOfUrl(imageUrl),
        });

        var texture = new Texture(baseTexture);

        // No name, use imageUrl instead
        if (!name)
        {
            name = imageUrl;
        }

        // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
        BaseTexture.addToCache(texture.baseTexture, name);
        Texture.addToCache(texture, name);

        // also add references by url if they are different.
        if (name !== imageUrl)
        {
            BaseTexture.addToCache(texture.baseTexture, imageUrl);
            Texture.addToCache(texture, imageUrl);
        }

        return texture;
    };

    /**
     * Adds a Texture to the global TextureCache. This cache is shared across the whole PIXI object.
     *
     * @static
     * @param {PIXI.Texture} texture - The Texture to add to the cache.
     * @param {string} id - The id that the Texture will be stored against.
     */
    static addToCache (texture, id)
    {
        if (id)
        {
            if (texture.textureCacheIds.indexOf(id) === -1)
            {
                texture.textureCacheIds.push(id);
            }

            if (CacheSettings.TextureCache[id])
            {
                // eslint-disable-next-line no-console
                console.warn(("Texture added to the cache with an id [" + id + "] that already had an entry"));
            }

            CacheSettings.TextureCache[id] = texture;
        }
    };

    /**
     * Remove a Texture from the global TextureCache.
     *
     * @static
     * @param {string|PIXI.Texture} texture - id of a Texture to be removed, or a Texture instance itself
     * @return {PIXI.Texture|null} The Texture that was removed
     */
    static removeFromCache  (texture)
    {
        if (typeof texture === 'string')
        {
            var textureFromCache = CacheSettings.TextureCache[texture];

            if (textureFromCache)
            {
                var index = textureFromCache.textureCacheIds.indexOf(texture);

                if (index > -1)
                {
                    textureFromCache.textureCacheIds.splice(index, 1);
                }

                delete CacheSettings.TextureCache[texture];

                return textureFromCache;
            }
        }
        else if (texture && texture.textureCacheIds)
        {
            for (var i = 0; i < texture.textureCacheIds.length; ++i)
            {
                // Check that texture matches the one being passed in before deleting it from the cache.
                if (CacheSettings.TextureCache[texture.textureCacheIds[i]] === texture)
                {
                    delete CacheSettings.TextureCache[texture.textureCacheIds[i]];
                }
            }

            texture.textureCacheIds.length = 0;

            return texture;
        }

        return null;
    };

    /**
     * The frame specifies the region of the base texture that this texture uses.
     * Please call `updateUvs()` after you change coordinates of `frame` manually.
     *
     * @member {PIXI.Rectangle}
     */
    get frame ()
    {
        return this._frame;
    };

    set frame (frame) // eslint-disable-line require-jsdoc
    {
        this._frame = frame;

        this.noFrame = false;

        var x = frame.x;
        var y = frame.y;
        var width = frame.width;
        var height = frame.height;
        var xNotFit = x + width > this.baseTexture.width;
        var yNotFit = y + height > this.baseTexture.height;

        if (xNotFit || yNotFit)
        {
            var relationship = xNotFit && yNotFit ? 'and' : 'or';
            var errorX = "X: " + x + " + " + width + " = " + (x + width) + " > " + (this.baseTexture.width);
            var errorY = "Y: " + y + " + " + height + " = " + (y + height) + " > " + (this.baseTexture.height);

            throw new Error('Texture Error: frame does not fit inside the base Texture dimensions: '
                + errorX + " " + relationship + " " + errorY);
        }

        this.valid = width && height && this.baseTexture.valid;

        if (!this.trim && !this.rotate)
        {
            this.orig = frame;
        }

        if (this.valid)
        {
            this.updateUvs();
        }
    };

    /**
     * Indicates whether the texture is rotated inside the atlas
     * set to 2 to compensate for texture packer rotation
     * set to 6 to compensate for spine packer rotation
     * can be used to rotate or mirror sprites
     * See {@link PIXI.GroupD8} for explanation
     *
     * @member {number}
     */
    get rotate ()
    {
        return this._rotate;
    };

    set rotate (rotate) // eslint-disable-line require-jsdoc
    {
        this._rotate = rotate;
        if (this.valid)
        {
            this.updateUvs();
        }
    };

    /**
     * The width of the Texture in pixels.
     *
     * @member {number}
     */
    get width ()
    {
        return this.orig.width;
    };

    /**
     * The height of the Texture in pixels.
     *
     * @member {number}
     */
    get height ()
    {
        return this.orig.height;
    };

    /**
	 * An empty texture, used often to not have to create multiple empty textures.
	 * Can not be destroyed.
	 *
	 * @static
	 * @constant
	 * @member {PIXI.Texture}
	 */
    static get EMPTY()
    {
        return new Texture(new BaseTexture());
        
    } 

    	/**
	 * A white texture of 10x10 size, used for graphics and other things
	 * Can not be destroyed.
	 *
	 * @static
	 * @constant
	 * @member {PIXI.Texture}
	 */
    static get WHITE()
    {
       return Texture.createWhiteTexture();
    } 

    static createWhiteTexture()
	{
	    var canvas = document.createElement('canvas');

	    canvas.width = 16;
	    canvas.height = 16;

	    var context = canvas.getContext('2d');

	    context.fillStyle = 'white';
	    context.fillRect(0, 0, 16, 16);

	    return new Texture(new BaseTexture(new CanvasResource(canvas)));
	}
}

