import { Event } from "./Event";
import { EventDispatcher } from './EventDispatcher';
import { Runner } from './Runner';


export class Resource extends EventDispatcher
{
    _width
    internal
    destroyed
    _height
    onResize
    onUpdate
    constructor(width= 0, height= 0)
    {
		super();
	    /**
	     * Internal width of the resource
	     * @member {number}
	     * @protected
	     */
	    this._width = width;

	    /**
	     * Internal height of the resource
	     * @member {number}
	     * @protected
	     */
	    this._height = height;

	    /**
	     * If resource has been destroyed
	     * @member {boolean}
	     * @readonly
	     * @default false
	     */
	    this.destroyed = false;

	    /**
	     * `true` if resource is created by BaseTexture
	     * useful for doing cleanup with BaseTexture destroy
	     * and not cleaning up resources that were created
	     * externally.
	     * @member {boolean}
	     * @protected
	     */
	    this.internal = false;

	    /**
	     * Mini-runner for handling resize events
	     *
	     * @member {Runner}
	     * @private
	     */
        // this.onResize = Event.getEvent("setRealSize")
        // Runner('setRealSize', 2);

	    /**
	     * Mini-runner for handling update events
	     *
	     * @member {Runner}
	     * @private
	     */
        
        // this.onUpdate = Event.getEvent("update")
		// new Runner('update');
		this.onResize = new Runner('setRealSize', 2);

	    /**
	     * Mini-runner for handling update events
	     *
	     * @member {Runner}
	     * @private
	     */
	    this.onUpdate = new Runner('update');
    }

	/**
	 * Bind to a parent BaseTexture
	 *
	 * @param {PIXI.BaseTexture} baseTexture - Parent texture
	 */
	bind  (baseTexture)
	{
		this.onResize.add(baseTexture);
	    this.onUpdate.add(baseTexture);

	    // Call a resize immediate if we already
	    // have the width and height of the resource
	    if (this._width || this._height)
	    {
	        this.onResize.run(this._width, this._height);
	    }
	    // this.onResize.add(baseTexture);
	    // this.onUpdate.add(baseTexture);

	    // Call a resize immediate if we already
	    // have the width and height of the resource
	    // if (this._width || this._height)
	    // {
		// 	this.dispatchEvent(Event.getEvent("setRealSize"))
	    //     // this.onResize.run(this._width, this._height);
	    // }
	};

	/**
	 * Unbind to a parent BaseTexture
	 *
	 * @param {PIXI.BaseTexture} baseTexture - Parent texture
	 */
	unbind  (baseTexture)
	{
		this.onResize.remove(baseTexture);
	    this.onUpdate.remove(baseTexture);
	    // this.onResize.remove(baseTexture);
	    // this.onUpdate.remove(baseTexture);
	};

	/**
	 * Trigger a resize event
	 */
	resize  (width, height)
	{
	    if (width !== this._width || height !== this._height)
	    {
	        this._width = width;
			this._height = height;
			this.onResize.run(width, height);
			this.dispatchEvent(Event.getEvent("setRealSize"));
			// Event.getEvent("setRealSize")
	        // this.onResize.run(width, height);
	    }
	};

	/**
	 * Has been validated
	 * @readonly
	 * @member {boolean}
	 */
	get valid ()
	{
	    return !!this._width && !!this._height;
	};

	/**
	 * Has been updated trigger event
	 */
	update(deltaTime)
	{
	    if (!this.destroyed)
	    {
			this.dispatchEvent(Event.getEvent("update"));	        
	    }
	};

	/**
	 * This can be overridden to start preloading a resource
	 * or do any other prepare step.
	 * @protected
	 * @return {Promise<void>} Handle the validate event
	 */
	load  ()
	{
	    return Promise.resolve();
	};

	/**
	 * The width of the resource.
	 *
	 * @member {number}
	 * @readonly
	 */
	get width ()
	{
	    return this._width;
	};

	/**
	 * The height of the resource.
	 *
	 * @member {number}
	 * @readonly
	 */
	get height ()
	{
	    return this._height;
	};

	/**
	 * Uploads the texture or returns false if it cant for some reason. Override this.
	 *
	 * @param {PIXI.Renderer} renderer - yeah, renderer!
	 * @param {PIXI.BaseTexture} baseTexture - the texture
	 * @param {PIXI.GLTexture} glTexture - texture instance for this webgl context
	 * @returns {boolean} true is success
	 */
	upload  (renderer, baseTexture, glTexture, source) // eslint-disable-line no-unused-vars
	{
	    return false;
	};

	/**
	 * Set the style, optional to override
	 *
	 * @param {PIXI.Renderer} renderer - yeah, renderer!
	 * @param {PIXI.BaseTexture} baseTexture - the texture
	 * @param {PIXI.GLTexture} glTexture - texture instance for this webgl context
	 * @returns {boolean} `true` is success
	 */
	style (renderer, baseTexture, glTexture) // eslint-disable-line no-unused-vars
	{
	    return false;
	};

	/**
	 * Clean up anything, this happens when destroying is ready.
	 *
	 * @protected
	 */
	dispose  ()
	{
	    // override
	};	

	/**
	 * Call when destroying resource, unbind any BaseTexture object
	 * before calling this method, as reference counts are maintained
	 * internally.
	 */
	destroy  ()
	{
	    if (!this.destroyed)
	    {
	        this.onResize.removeAll();
	        this.onResize = null;
	        this.onUpdate.removeAll();
	        this.onUpdate = null;
	        this.destroyed = true;
	        this.dispose();
	    }
	};

}

