
import { Ticker } from "./Ticker";
import { Container } from "./Container";
import { TextStyle } from './TextStyle';
import { Text } from './Text';
import { Texture } from './Texture';
import { BaseTexture } from './BaseTexture';
import { TextMetrics } from './TextMetrics';
import { CountLimiter } from './CountLimiter';
import { WebGLSettings } from './WebGLSettings';

export class BasePrepare //extends Renderer
{
    limiter
    uploadHookHelper
    ticking
    addHooks
    uploadHooks
    delayedTick
    queue
    completes
    renderer
    constructor(renderer)
    {
        // super(null);

	    /**
	     * The limiter to be used to control how quickly items are prepared.
	     * @type {PIXI.prepare.CountLimiter|PIXI.prepare.TimeLimiter}
	     */
	    this.limiter = new CountLimiter(WebGLSettings.UPLOADS_PER_FRAME);

	    /**
	     * Reference to the renderer.
	     * @type {PIXI.AbstractRenderer}
	     * @protected
	     */
	    this.renderer = renderer;

	    /**
	     * The only real difference between CanvasPrepare and WebGLPrepare is what they pass
	     * to upload hooks. That different parameter is stored here.
	     * @type {PIXI.prepare.CanvasPrepare|PIXI.Renderer}
	     * @protected
	     */
	    this.uploadHookHelper = renderer;

	    /**
	     * Collection of items to uploads at once.
	     * @type {Array<*>}
	     * @private
	     */
	    this.queue = [];

	    /**
	     * Collection of additional hooks for finding assets.
	     * @type {Array<Function>}
	     * @private
	     */
	    this.addHooks = [];

	    /**
	     * Collection of additional hooks for processing assets.
	     * @type {Array<Function>}
	     * @private
	     */
	    this.uploadHooks = [];

	    /**
	     * Callback to call after completed.
	     * @type {Array<Function>}
	     * @private
	     */
	    this.completes = [];

	    /**
	     * If prepare is ticking (running).
	     * @type {boolean}
	     * @private
	     */
	    this.ticking = false;

	    /**
	     * 'bound' call for prepareItems().
	     * @type {Function}
	     * @private
	     */
	    this.delayedTick = function () {
	        // unlikely, but in case we were destroyed between tick() and delayedTick()
	        if (!this.queue)
	        {
	            return;
	        }
	        this.prepareItems();
	    };

	    // hooks to find the correct texture
	    this.registerFindHook(BasePrepare.findText);
	    this.registerFindHook(BasePrepare.findTextStyle);
	    this.registerFindHook(BasePrepare.findMultipleBaseTextures);
	    this.registerFindHook(BasePrepare.findBaseTexture);
	    this.registerFindHook(BasePrepare.findTexture);

	    // upload hooks
	    this.registerUploadHook(BasePrepare.drawText);
	    this.registerUploadHook(BasePrepare.calculateTextStyle);
    }

    /**
	 * Upload all the textures and graphics to the GPU.
	 *
	 * @param {Function|PIXI.DisplayObject|PIXI.Container|PIXI.BaseTexture|PIXI.Texture|PIXI.Graphics|PIXI.Text} item -
	 *    Either the container or display object to search for items to upload, the items to upload themselves,
	 *    or the callback function, if items have been added using `prepare.add`.
	 * @param {Function} [done] - Optional callback when all queued uploads have completed
	 */
	upload (item, done)
	{
	    if (typeof item === 'function')
	    {
	        done = item;
	        item = null;
	    }

	    // If a display object, search for items
	    // that we could upload
	    if (item)
	    {
	        this.add(item);
	    }

	    // Get the items for upload from the display
	    if (this.queue.length)
	    {
	        if (done)
	        {
	            this.completes.push(done);
	        }

	        if (!this.ticking)
	        {
	            this.ticking = true;
	            Ticker.system.addOnce(this.tick, this, Ticker.UPDATE_PRIORITY.UTILITY);
	        }
	    }
	    else if (done)
	    {
	        done();
	    }
	};

	/**
	 * Handle tick update
	 *
	 * @private
	 */
	tick ()
	{
	    setTimeout(this.delayedTick, 0);
	};

	/**
	 * Actually prepare items. This is handled outside of the tick because it will take a while
	 * and we do NOT want to block the current animation frame from rendering.
	 *
	 * @private
	 */
	prepareItems ()
	{
	    this.limiter.beginFrame();
	    // Upload the graphics
	    while (this.queue.length && this.limiter.allowedToUpload())
	    {
	        var item = this.queue[0];
	        var uploaded = false;

	        if (item && !item._destroyed)
	        {
	            for (var i = 0, len = this.uploadHooks.length; i < len; i++)
	            {
	                if (this.uploadHooks[i](this.uploadHookHelper, item))
	                {
	                    this.queue.shift();
	                    uploaded = true;
	                    break;
	                }
	            }
	        }

	        if (!uploaded)
	        {
	            this.queue.shift();
	        }
	    }

	    // We're finished
	    if (!this.queue.length)
	    {
	        this.ticking = false;

	        var completes = this.completes.slice(0);

	        this.completes.length = 0;

	        for (var i$1 = 0, len$1 = completes.length; i$1 < len$1; i$1++)
	        {
	            completes[i$1]();
	        }
	    }
	    else
	    {
	        // if we are not finished, on the next rAF do this again
	        Ticker.system.addOnce(this.tick, this, Ticker.UPDATE_PRIORITY.UTILITY);
	    }
	};

	/**
	 * Adds hooks for finding items.
	 *
	 * @param {Function} addHook - Function call that takes two parameters: `item:*, queue:Array`
	 *      function must return `true` if it was able to add item to the queue.
	 * @return {PIXI.prepare.BasePrepare} Instance of plugin for chaining.
	 */
	registerFindHook  (addHook)
	{
	    if (addHook)
	    {
	        this.addHooks.push(addHook);
	    }

	    return this;
	};

	/**
	 * Adds hooks for uploading items.
	 *
	 * @param {Function} uploadHook - Function call that takes two parameters: `prepare:CanvasPrepare, item:*` and
	 *      function must return `true` if it was able to handle upload of item.
	 * @return {PIXI.prepare.BasePrepare} Instance of plugin for chaining.
	 */
	registerUploadHook  (uploadHook)
	{
	    if (uploadHook)
	    {
	        this.uploadHooks.push(uploadHook);
	    }

	    return this;
	};

	/**
	 * Manually add an item to the uploading queue.
	 *
	 * @param {PIXI.DisplayObject|PIXI.Container|PIXI.BaseTexture|PIXI.Texture|PIXI.Graphics|PIXI.Text|*} item - Object to
	 *    add to the queue
	 * @return {PIXI.prepare.BasePrepare} Instance of plugin for chaining.
	 */
	add  (item)
	{
	    // Add additional hooks for finding elements on special
	    // types of objects that
	    for (var i = 0, len = this.addHooks.length; i < len; i++)
	    {
	        if (this.addHooks[i](item, this.queue))
	        {
	            break;
	        }
	    }

	    // Get children recursively
	    if (item instanceof Container)
	    {
	        for (var i$1 = item.children.length - 1; i$1 >= 0; i$1--)
	        {
	            this.add(item.children[i$1]);
	        }
	    }

	    return this;
	};

	/**
	 * Destroys the plugin, don't use after this.
	 *
	 */
	destroy  ()
	{
	    if (this.ticking)
	    {
	        Ticker.system.remove(this.tick, this);
	    }
	    this.ticking = false;
	    this.addHooks = null;
	    this.uploadHooks = null;
	    this.renderer = null;
	    this.completes = null;
	    this.queue = null;
	    this.limiter = null;
	    this.uploadHookHelper = null;
	};

		/**
	 * Built-in hook to find Text objects.
	 *
	 * @private
	 * @param {PIXI.DisplayObject} item - Display object to check
	 * @param {Array<*>} queue - Collection of items to upload
	 * @return {boolean} if a PIXI.Text object was found.
	 */
	static findText(item, queue)
	{
	    if (item instanceof Text)
	    {
	        // push the text style to prepare it - this can be really expensive
	        if (queue.indexOf(item.style) === -1)
	        {
	            queue.push(item.style);
	        }
	        // also push the text object so that we can render it (to canvas/texture) if needed
	        if (queue.indexOf(item) === -1)
	        {
	            queue.push(item);
	        }
	        // also push the Text's texture for upload to GPU
	        var texture = item._texture.baseTexture;

	        if (queue.indexOf(texture) === -1)
	        {
	            queue.push(texture);
	        }

	        return true;
	    }

	    return false;
	}

		/**
	 * Built-in hook to find TextStyle objects.
	 *
	 * @private
	 * @param {PIXI.TextStyle} item - Display object to check
	 * @param {Array<*>} queue - Collection of items to upload
	 * @return {boolean} if a PIXI.TextStyle object was found.
	 */
	static findTextStyle(item, queue)
	{
	    if (item instanceof TextStyle)
	    {
	        if (queue.indexOf(item) === -1)
	        {
	            queue.push(item);
	        }

	        return true;
	    }

	    return false;
	}

		/**
	 * Built-in hook to find multiple textures from objects like AnimatedSprites.
	 *
	 * @private
	 * @param {PIXI.DisplayObject} item - Display object to check
	 * @param {Array<*>} queue - Collection of items to upload
	 * @return {boolean} if a PIXI.Texture object was found.
	 */
	static findMultipleBaseTextures(item, queue)
	{
	    var result = false;

	    // Objects with multiple textures
	    if (item && item._textures && item._textures.length)
	    {
	        for (var i = 0; i < item._textures.length; i++)
	        {
	            if (item._textures[i] instanceof Texture)
	            {
	                var baseTexture = item._textures[i].baseTexture;

	                if (queue.indexOf(baseTexture) === -1)
	                {
	                    queue.push(baseTexture);
	                    result = true;
	                }
	            }
	        }
	    }

	    return result;
	}

		/**
	 * Built-in hook to find BaseTextures from Sprites.
	 *
	 * @private
	 * @param {PIXI.DisplayObject} item - Display object to check
	 * @param {Array<*>} queue - Collection of items to upload
	 * @return {boolean} if a PIXI.Texture object was found.
	 */
	static findBaseTexture(item, queue)
	{
	    // Objects with textures, like Sprites/Text
	    if (item instanceof BaseTexture)
	    {
	        if (queue.indexOf(item) === -1)
	        {
	            queue.push(item);
	        }

	        return true;
	    }

	    return false;
	}

		/**
	 * Built-in hook to find textures from objects.
	 *
	 * @private
	 * @param {PIXI.DisplayObject} item - Display object to check
	 * @param {Array<*>} queue - Collection of items to upload
	 * @return {boolean} if a PIXI.Texture object was found.
	 */
	static findTexture(item, queue)
	{
	    if (item._texture && item._texture instanceof Texture)
	    {
	        var texture = item._texture.baseTexture;

	        if (queue.indexOf(texture) === -1)
	        {
	            queue.push(texture);
	        }

	        return true;
	    }

	    return false;
	}

	
	/**
	 * Built-in hook to draw PIXI.Text to its texture.
	 *
	 * @private
	 * @param {PIXI.Renderer|PIXI.CanvasPrepare} helper - Not used by this upload handler
	 * @param {PIXI.DisplayObject} item - Item to check
	 * @return {boolean} If item was uploaded.
	 */
	static drawText(helper, item)
	{
	    if (item instanceof Text)
	    {
	        // updating text will return early if it is not dirty
	        item.updateText(true);

	        return true;
	    }

	    return false;
	}

		/**
	 * Built-in hook to calculate a text style for a PIXI.Text object.
	 *
	 * @private
	 * @param {PIXI.Renderer|PIXI.CanvasPrepare} helper - Not used by this upload handler
	 * @param {PIXI.DisplayObject} item - Item to check
	 * @return {boolean} If item was uploaded.
	 */
	static calculateTextStyle(helper, item)
	{
	    if (item instanceof TextStyle)
	    {
	        var font = item.toFontString();

	        TextMetrics.measureFont(font);

	        return true;
	    }

	    return false;
	}
}


