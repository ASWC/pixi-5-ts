import { RenderTexture } from "./RenderTexture";
import { Rectangle } from './Rectangle';
import { CanvasRenderTarget } from './CanvasRenderTarget';

export class Extract
{
	static TEMP_RECT = new Rectangle();
	static BYTES_PER_PIXEL = 4;
    renderer
    constructor(renderer)
    {
        this.renderer = renderer;
	    /**
	     * Collection of methods for extracting data (image, pixels, etc.) from a display object or render texture
	     *
	     * @member {PIXI.extract.Extract} extract
	     * @memberof PIXI.Renderer#
	     * @see PIXI.extract.Extract
	     */
	    renderer.extract = this;
    }

    /**
	 * Will return a HTML Image of the target
	 *
	 * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
	 *  to convert. If left empty will use the main renderer
	 * @return {HTMLImageElement} HTML Image of the target
	 */
	image  (target)
	{
	    var image = new Image();

	    image.src = this.base64(target);

	    return image;
	};

	/**
	 * Will return a a base64 encoded string of this target. It works by calling
	 *  `Extract.getCanvas` and then running toDataURL on that.
	 *
	 * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
	 *  to convert. If left empty will use the main renderer
	 * @return {string} A base64 encoded string of the texture.
	 */
	base64 (target)
	{
	    return this.canvas(target).toDataURL();
	};

	/**
	 * Creates a Canvas element, renders this target to it and then returns it.
	 *
	 * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
	 *  to convert. If left empty will use the main renderer
	 * @return {HTMLCanvasElement} A Canvas element with the texture rendered on.
	 */
	canvas  (target)
	{
	    var renderer = this.renderer;
	    var resolution;
	    var frame;
	    var flipY = false;
	    var renderTexture;
	    var generated = false;

	    if (target)
	    {
	        if (target instanceof RenderTexture)
	        {
	            renderTexture = target;
	        }
	        else
	        {
	            renderTexture = this.renderer.generateTexture(target);
	            generated = true;
	        }
	    }

	    if (renderTexture)
	    {
	        resolution = renderTexture.baseTexture.resolution;
	        frame = renderTexture.frame;
	        flipY = false;
	        renderer.renderTexture.bind(renderTexture);
	    }
	    else
	    {
	        resolution = this.renderer.resolution;

	        flipY = true;

	        frame = Extract.TEMP_RECT;
	        frame.width = this.renderer.width;
	        frame.height = this.renderer.height;

	        renderer.renderTexture.bind(null);
	    }

	    var width = frame.width * resolution;
	    var height = frame.height * resolution;

	    var canvasBuffer = new CanvasRenderTarget(width, height, 1);

	    var webglPixels = new Uint8Array(Extract.BYTES_PER_PIXEL * width * height);

	    // read pixels to the array
	    var gl = renderer.gl;

	    gl.readPixels(
	        frame.x * resolution,
	        frame.y * resolution,
	        width,
	        height,
	        gl.RGBA,
	        gl.UNSIGNED_BYTE,
	        webglPixels
	    );

	    // add the pixels to the canvas
	    var canvasData = canvasBuffer.context.getImageData(0, 0, width, height);

	    canvasData.data.set(webglPixels);

	    canvasBuffer.context.putImageData(canvasData, 0, 0);

	    // pulling pixels
	    if (flipY)
	    {
	        canvasBuffer.context.scale(1, -1);
	        canvasBuffer.context.drawImage(canvasBuffer.canvas, 0, -height);
	    }

	    if (generated)
	    {
	        renderTexture.destroy(true);
	    }

	    // send the canvas back..
	    return canvasBuffer.canvas;
	};

	/**
	 * Will return a one-dimensional array containing the pixel data of the entire texture in RGBA
	 * order, with integer values between 0 and 255 (included).
	 *
	 * @param {PIXI.DisplayObject|PIXI.RenderTexture} target - A displayObject or renderTexture
	 *  to convert. If left empty will use the main renderer
	 * @return {Uint8ClampedArray} One-dimensional array containing the pixel data of the entire texture
	 */
	pixels  (target)
	{
	    var renderer = this.renderer;
	    var resolution;
	    var frame;
	    var renderTexture;
	    var generated = false;

	    if (target)
	    {
	        if (target instanceof RenderTexture)
	        {
	            renderTexture = target;
	        }
	        else
	        {
	            renderTexture = this.renderer.generateTexture(target);
	            generated = true;
	        }
	    }

	    if (renderTexture)
	    {
	        resolution = renderTexture.baseTexture.resolution;
	        frame = renderTexture.frame;

	        // bind the buffer
	        renderer.renderTexture.bind(renderTexture);
	    }
	    else
	    {
	        resolution = renderer.resolution;

	        frame = Extract.TEMP_RECT;
	        frame.width = renderer.width;
	        frame.height = renderer.height;

	        renderer.renderTexture.bind(null);
	    }

	    var width = frame.width * resolution;
	    var height = frame.height * resolution;

	    var webglPixels = new Uint8Array(Extract.BYTES_PER_PIXEL * width * height);

	    // read pixels to the array
	    var gl = renderer.gl;

	    gl.readPixels(
	        frame.x * resolution,
	        frame.y * resolution,
	        width,
	        height,
	        gl.RGBA,
	        gl.UNSIGNED_BYTE,
	        webglPixels
	    );

	    if (generated)
	    {
	        renderTexture.destroy(true);
	    }

	    return webglPixels;
	};

	/**
	 * Destroys the extract
	 *
	 */
	destroy  ()
	{
	    this.renderer.extract = null;
	    this.renderer = null;
	};


}

