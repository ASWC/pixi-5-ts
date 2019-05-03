
import { Rectangle } from "../flash/geom/Rectangle";
import { Texture } from "./Texture";
import { NetworkSettings } from './NetworkSettings';
import { trace } from "./Logger";
import { InstanceCounter } from "./InstanceCounter";
import { FlashBaseObject } from "./FlashBaseObject";


export class Spritesheet extends FlashBaseObject
{
    baseTexture
    animations
    textures
    resolution
    _batchIndex
    _frameKeys
    _frames
    _callback
    data
    constructor(baseTexture, data, resolutionFilename = null)
    {
		super();

	    /**
	     * Reference to ths source texture
	     * @type {PIXI.BaseTexture}
	     */
	    this.baseTexture = baseTexture;

	    /**
	     * A map containing all textures of the sprite sheet.
	     * Can be used to create a {@link PIXI.Sprite|Sprite}:
	     * ```js
	     * new PIXI.Sprite(sheet.textures["image.png"]);
	     * ```
	     * @member {Object}
	     */
	    this.textures = {};

	    /**
	     * A map containing the textures for each animation.
	     * Can be used to create an {@link PIXI.AnimatedSprite|AnimatedSprite}:
	     * ```js
	     * new PIXI.AnimatedSprite(sheet.animations["anim_name"])
	     * ```
	     * @member {Object}
	     */
	    this.animations = {};

	    /**
	     * Reference to the original JSON data.
	     * @type {Object}
	     */
	    this.data = data;

	    /**
	     * The resolution of the spritesheet.
	     * @type {number}
	     */
	    this.resolution = this._updateResolution(
	        resolutionFilename
	        || (this.baseTexture.resource ? this.baseTexture.resource.url : null)
	    );

	    /**
	     * Map of spritesheet frames.
	     * @type {Object}
	     * @private
	     */
	    this._frames = this.data.frames;

	    /**
	     * Collection of frame names.
	     * @type {string[]}
	     * @private
	     */
	    this._frameKeys = Object.keys(this._frames);

	    /**
	     * Current batch index being processed.
	     * @type {number}
	     * @private
	     */
	    this._batchIndex = 0;

	    /**
	     * Callback when parse is completed.
	     * @type {Function}
	     * @private
	     */
	    this._callback = null;
    }

    _updateResolution  (resolutionFilename)
	{
	    var scale = this.data.meta.scale;

	    // Use a defaultValue of `null` to check if a url-based resolution is set
	    var resolution = NetworkSettings.getResolutionOfUrl(resolutionFilename, null);

	    // No resolution found via URL
	    if (resolution === null)
	    {
	        // Use the scale value or default to 1
	        resolution = scale !== undefined ? parseFloat(scale) : 1;
	    }

	    // For non-1 resolutions, update baseTexture
	    if (resolution !== 1)
	    {
	        this.baseTexture.setResolution(resolution);
	    }

	    return resolution;
    };

	/**
	 * Generate the resolution from the filename or fallback
	 * to the meta.scale field of the JSON data.
	 *
	 * @private
	 * @param {string} resolutionFilename - The filename to use for resolving
	 *    the default resolution.
	 * @return {number} Resolution to use for spritesheet.
	 */
	static get BATCH_SIZE ()
	{
	    return 1000;
	};

	/**
	 * Parser spritesheet from loaded data. This is done asynchronously
	 * to prevent creating too many Texture within a single process.
	 *
	 * @param {Function} callback - Callback when complete returns
	 *    a map of the Textures for this spritesheet.
	 */
	parse  (callback)
	{
	    this._batchIndex = 0;
	    this._callback = callback;

	    if (this._frameKeys.length <= Spritesheet.BATCH_SIZE)
	    {
	        this._processFrames(0);
	        this._processAnimations();
	        this._parseComplete();
	    }
	    else
	    {
	        this._nextBatch();
	    }
	};

	/**
	 * Process a batch of frames
	 *
	 * @private
	 * @param {number} initialFrameIndex - The index of frame to start.
	 */
	_processFrames  (initialFrameIndex)
	{
	    var frameIndex = initialFrameIndex;
	    var maxFrames = Spritesheet.BATCH_SIZE;

	    while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length)
	    {
	        var i = this._frameKeys[frameIndex];
	        var data = this._frames[i];
	        var rect = data.frame;

	        if (rect)
	        {
	            var frame = null;
	            var trim = null;
	            var sourceSize = data.trimmed !== false && data.sourceSize ? data.sourceSize : data.frame;

				InstanceCounter.addCall("Rectangle.getRectangle", "SpriteSheet _processFrames")
	            var orig = Rectangle.getRectangle(0, 0, Math.floor(sourceSize.w) / this.resolution, Math.floor(sourceSize.h) / this.resolution);

	            if (data.rotated)
	            {
					InstanceCounter.addCall("Rectangle.getRectangle", "SpriteSheet _processFrames")
	                frame = Rectangle.getRectangle(Math.floor(rect.x) / this.resolution, Math.floor(rect.y) / this.resolution, Math.floor(rect.h) / this.resolution, Math.floor(rect.w) / this.resolution);
	            }
	            else
	            {
					InstanceCounter.addCall("Rectangle.getRectangle", "SpriteSheet _processFrames")
	                frame = Rectangle.getRectangle(Math.floor(rect.x) / this.resolution, Math.floor(rect.y) / this.resolution, Math.floor(rect.w) / this.resolution, Math.floor(rect.h) / this.resolution);
	            }

	            //  Check to see if the sprite is trimmed
	            if (data.trimmed !== false && data.spriteSourceSize)
	            {
					InstanceCounter.addCall("Rectangle.getRectangle", "SpriteSheet _processFrames")
	                trim = Rectangle.getRectangle(Math.floor(data.spriteSourceSize.x) / this.resolution, Math.floor(data.spriteSourceSize.y) / this.resolution, Math.floor(rect.w) / this.resolution, Math.floor(rect.h) / this.resolution);
	            }

	            this.textures[i] = new Texture(this.baseTexture, frame, orig, trim, data.rotated ? 2 : 0, data.anchor);

	            // lets also add the frame to pixi's global cache for fromFrame and fromImage functions
	            Texture.addToCache(this.textures[i], i);
	        }

	        frameIndex++;
	    }
	};

	/**
	 * Parse animations config
	 *
	 * @private
	 */
	_processAnimations  ()
	{
	    var animations = this.data.animations || {};

	    for (var animName in animations)
	    {
	        this.animations[animName] = [];
	        for (var i = 0; i < animations[animName].length; i++)
	        {
	            var frameName = animations[animName][i];

	            this.animations[animName].push(this.textures[frameName]);
	        }
	    }
	};

	/**
	 * The parse has completed.
	 *
	 * @private
	 */
	_parseComplete  ()
	{
	    var callback = this._callback;

	    this._callback = null;
	    this._batchIndex = 0;
	    callback.call(this, this.textures);
	};

	/**
	 * Begin the next batch of textures.
	 *
	 * @private
	 */
	_nextBatch  ()
	{
	        var this$1 = this;

	    this._processFrames(this._batchIndex * Spritesheet.BATCH_SIZE);
	    this._batchIndex++;
	    setTimeout(function () {
	        if (this$1._batchIndex * Spritesheet.BATCH_SIZE < this$1._frameKeys.length)
	        {
	            this$1._nextBatch();
	        }
	        else
	        {
	            this$1._processAnimations();
	            this$1._parseComplete();
	        }
	    }, 0);
	};

	/**
	 * Destroy Spritesheet and don't use after this.
	 *
	 * @param {boolean} [destroyBase=false] Whether to destroy the base texture as well
	 */
	destroy (destroyBase)
	{
	        if ( destroyBase === void 0 ) { destroyBase = false; }

	    for (var i in this.textures)
	    {
	        this.textures[i].destroy();
	    }
	    this._frames = null;
	    this._frameKeys = null;
	    this.data = null;
	    this.textures = null;
	    if (destroyBase)
	    {
	        this.baseTexture.destroy();
	    }
	    this.baseTexture = null;
	};

}


