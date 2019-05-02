import { BaseTexture } from "./BaseTexture";
import { Framebuffer } from './Framebuffer';


export class BaseRenderTexture extends BaseTexture
{
    filterStack
    stencilMaskStack
    framebuffer
    clearColor
    _canvasRenderTarget
    renderer
    constructor(options, arg1 = null, arg2 = null, arg4 = null)
    {
        super(null, options);
        if (typeof options === 'number')
        {
            /* eslint-disable prefer-rest-params */
            // Backward compatibility of signature
            var width$1 = arguments[0];
            var height$1 = arguments[1];
            var scaleMode = arguments[2];
            var resolution = arguments[3];

            options = { width: width$1, height: height$1, scaleMode: scaleMode, resolution: resolution };
            /* eslint-enable prefer-rest-params */
        }


        var ref = options || {};
        var width = ref.width;
        var height = ref.height;

        // Set defaults
        this.mipmap = false;
        this.width = Math.ceil(width) || 100;
        this.height = Math.ceil(height) || 100;
        this.valid = true;

        /**
         * A reference to the canvas render target (we only need one as this can be shared across renderers)
         *
         * @protected
         * @member {object}
         */
        this._canvasRenderTarget = null;

        this.clearColor = [0, 0, 0, 0];

        this.framebuffer = new Framebuffer(this.width * this.resolution, this.height * this.resolution)
            .addColorTexture(0, this)
            .enableStencil();

        // TODO - could this be added the systems?

        /**
         * The data structure for the stencil masks.
         *
         * @member {PIXI.Graphics[]}
         */
        this.stencilMaskStack = [];

        /**
         * The data structure for the filters.
         *
         * @member {PIXI.Graphics[]}
         */
        this.filterStack = [{}];
    }

    /**
     * Resizes the BaseRenderTexture.
     *
     * @param {number} width - The width to resize to.
     * @param {number} height - The height to resize to.
     */
    resize  (width, height)
    {
        width = Math.ceil(width);
        height = Math.ceil(height);
        this.framebuffer.resize(width * this.resolution, height * this.resolution);
    };

    /**
     * Frees the texture and framebuffer from WebGL memory without destroying this texture object.
     * This means you can still use the texture later which will upload it to GPU
     * memory again.
     *
     * @fires PIXI.BaseTexture#dispose
     */
    dispose ()
    {
        this.framebuffer.dispose();

        super.dispose();
    };

    /**
     * Destroys this texture.
     *
     */
    destroy  ()
    {
        super.destroy( );

        this.framebuffer = null;

        this.renderer = null;
    };
}

