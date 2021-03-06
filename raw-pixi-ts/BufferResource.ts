import { Resource } from "./Resource";


export class BufferResource extends Resource
{
    data
    constructor(source, options)
    {
        var ref = options || {};
        var width = ref.width;
        var height = ref.height;
        if (!width || !height)
        {
            throw new Error('BufferResource width or height invalid');
        }
        super(width, height);
        /**
         * Source array
         * Cannot be ClampedUint8Array because it cant be uploaded to WebGL
         *
         * @member {Float32Array|Uint8Array|Uint32Array}
         */
        this.data = source;
    }

    /**
     * Upload the texture to the GPU.
     * @param {PIXI.Renderer} renderer Upload to the renderer
     * @param {PIXI.BaseTexture} baseTexture Reference to parent texture
     * @param {PIXI.GLTexture} glTexture glTexture
     * @returns {boolean} true is success
     */
    upload  (renderer, baseTexture, glTexture)
    {
        var gl = renderer.gl;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.premultiplyAlpha);

        if (glTexture.width === baseTexture.width && glTexture.height === baseTexture.height)
        {
            gl.texSubImage2D(
                baseTexture.target,
                0,
                0,
                0,
                baseTexture.width,
                baseTexture.height,
                baseTexture.format,
                baseTexture.type,
                this.data
            );
        }
        else
        {
            glTexture.width = baseTexture.width;
            glTexture.height = baseTexture.height;

            var internalFormat = baseTexture.format;

            // guess sized format by type and format
            // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
            if (renderer.context.webGLVersion === 2
                && baseTexture.type === renderer.gl.FLOAT
                && baseTexture.format === renderer.gl.RGBA)
            {
                internalFormat = renderer.gl.RGBA32F;
            }

            gl.texImage2D(
                baseTexture.target,
                0,
                internalFormat,
                baseTexture.width,
                baseTexture.height,
                0,
                baseTexture.format,
                baseTexture.type,
                this.data
            );
        }

        return true;
    };

    /**
     * Destroy and don't use after this
     * @override
     */
    dispose  ()
    {
        this.data = null;
    };

    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {*} source - The source object
     * @return {boolean} `true` if <canvas>
     */
    static test  (source)
    {
        return source instanceof Float32Array
            || source instanceof Uint8Array
            || source instanceof Uint32Array;
    };
}
