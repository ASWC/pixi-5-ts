import { settings } from "./settings";
import { DisplaySettings } from './DisplaySettings';


export class CanvasRenderTarget
{
    canvas
    resolution
    context
    constructor(width, height, resolution)
    {
/**
	     * The Canvas object that belongs to this CanvasRenderTarget.
	     *
	     * @member {HTMLCanvasElement}
	     */
	    this.canvas = document.createElement('canvas');

	    /**
	     * A CanvasRenderingContext2D object representing a two-dimensional rendering context.
	     *
	     * @member {CanvasRenderingContext2D}
	     */
	    this.context = this.canvas.getContext('2d');

	    this.resolution = resolution || DisplaySettings.RESOLUTION;

	    this.resize(width, height);
    }

    /**
	 * Clears the canvas that was created by the CanvasRenderTarget class.
	 *
	 * @private
	 */
	clear  ()
	{
	    this.context.setTransform(1, 0, 0, 1, 0, 0);
	    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};

	/**
	 * Resizes the canvas to the specified width and height.
	 *
	 * @param {number} width - the new width of the canvas
	 * @param {number} height - the new height of the canvas
	 */
	resize  (width, height)
	{
	    this.canvas.width = width * this.resolution;
	    this.canvas.height = height * this.resolution;
	};

	/**
	 * Destroys this canvas.
	 *
	 */
	destroy  ()
	{
	    this.context = null;
	    this.canvas = null;
	};

	/**
	 * The width of the canvas buffer in pixels.
	 *
	 * @member {number}
	 */
	get width ()
	{
	    return this.canvas.width;
	};

	set width (val) // eslint-disable-line require-jsdoc
	{
	    this.canvas.width = val;
	};

	/**
	 * The height of the canvas buffer in pixels.
	 *
	 * @member {number}
	 */
	get height ()
	{
	    return this.canvas.height;
	};

	set height (val) // eslint-disable-line require-jsdoc
	{
	    this.canvas.height = val;
	};

}
