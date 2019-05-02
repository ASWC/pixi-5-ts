import { BaseTexture } from "./BaseTexture";
import { DepthResource } from "./DepthResource";
import { WebGLSettings } from './WebGLSettings';
import { Runner } from './Runner';


export class Framebuffer
{
    width
    height
    stencil
    depth
    dirtySize
    colorTextures
    depthTexture
    glFramebuffers
    dirtyId
	dirtyFormat
	disposeRunner
    constructor(width, height)
    {
        this.width = Math.ceil(width || 100);
	    this.height = Math.ceil(height || 100);

	    this.stencil = false;
	    this.depth = false;

	    this.dirtyId = 0;
	    this.dirtyFormat = 0;
	    this.dirtySize = 0;

	    this.depthTexture = null;
	    this.colorTextures = [];

		this.glFramebuffers = {};
		this.disposeRunner = new Runner('disposeFramebuffer', 2);

	    // this.disposeRunner = new Runner('disposeFramebuffer', 2);
    }

    /**
	 * Reference to the colorTexture.
	 *
	 * @member {PIXI.Texture[]}
	 * @readonly
	 */
	get colorTexture ()
	{
	    return this.colorTextures[0];
	};

	/**
	 * Add texture to the colorTexture array
	 *
	 * @param {number} [index=0] - Index of the array to add the texture to
	 * @param {PIXI.Texture} [texture] - Texture to add to the array
	 */
	addColorTexture (index, texture)
	{
	        if ( index === void 0 ) { index = 0; }

	    // TODO add some validation to the texture - same width / height etc?
	    this.colorTextures[index] = texture || new BaseTexture(null, { scaleMode: 0,
	        resolution: 1,
	        mipmap: false,
	        width: this.width,
	        height: this.height });// || new Texture();

	    this.dirtyId++;
	    this.dirtyFormat++;

	    return this;
	};

	/**
	 * Add a depth texture to the frame buffer
	 *
	 * @param {PIXI.Texture} [texture] - Texture to add
	 */
	addDepthTexture  (texture)
	{
	    /* eslint-disable max-len */
	    this.depthTexture = texture || new BaseTexture(new DepthResource(null, { width: this.width, height: this.height }), { scaleMode: 0,
	        resolution: 1,
	        width: this.width,
	        height: this.height,
	        mipmap: false,
	        format: WebGLSettings.FORMATS.DEPTH_COMPONENT,
	        type: WebGLSettings.TYPES.UNSIGNED_SHORT });// UNSIGNED_SHORT;
	    /* eslint-disable max-len */
	    this.dirtyId++;
	    this.dirtyFormat++;

	    return this;
	};

	/**
	 * Enable depth on the frame buffer
	 */
	enableDepth  ()
	{
	    this.depth = true;

	    this.dirtyId++;
	    this.dirtyFormat++;

	    return this;
	};

	/**
	 * Enable stencil on the frame buffer
	 */
	enableStencil  ()
	{
	    this.stencil = true;

	    this.dirtyId++;
	    this.dirtyFormat++;

	    return this;
	};

	/**
	 * Resize the frame buffer
	 *
	 * @param {number} width - Width of the frame buffer to resize to
	 * @param {number} height - Height of the frame buffer to resize to
	 */
	resize  (width, height)
	{
	    width = Math.ceil(width);
	    height = Math.ceil(height);

	    if (width === this.width && height === this.height) { return; }

	    this.width = width;
	    this.height = height;

	    this.dirtyId++;
	    this.dirtySize++;

	    for (var i = 0; i < this.colorTextures.length; i++)
	    {
	        var texture = this.colorTextures[i];
	        var resolution = texture.resolution;

	        // take into acount the fact the texture may have a different resolution..
	        texture.setSize(width / resolution, height / resolution);
	    }

	    if (this.depthTexture)
	    {
	        var resolution$1 = this.depthTexture.resolution;

	        this.depthTexture.setSize(width / resolution$1, height / resolution$1);
	    }
	};

	/**
	 * disposes WebGL resources that are connected to this geometry
	 */
	dispose  ()
	{
		// this.disposeRunner.run(this, false);
		this.disposeRunner.run(this, false);
	};
}

