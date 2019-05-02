import { Shader } from './Shader';
import { Matrix } from './Matrix';
import { Program } from './Program';
import { TextureMatrix } from './TextureMatrix';
import { ColorSettings } from './ColorSettings';

export class MeshMaterial extends Shader
{
    static vertex$6 = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\nuniform mat3 translationMatrix;\r\nuniform mat3 uTextureMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n\r\n    vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;\r\n}\r\n";
	static fragment$8 = "varying vec2 vTextureCoord;\r\nuniform vec4 uColor;\r\n\r\nuniform sampler2D uSampler;\r\n\r\nvoid main(void)\r\n{\r\n    gl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;\r\n}\r\n";

    // TextureMatrix
    _colorDirty
    batchable
    uvMatrix
    _tint
    _tintRGB
    _alpha
    pluginName
    constructor(uSampler, options = null)
    {
        var uniforms = {
            uSampler: uSampler,
            alpha: 1,
            uTextureMatrix: Matrix.IDENTITY,
            uColor: new Float32Array([1, 1, 1, 1]),
        };
        // Set defaults
        options = Object.assign({
            tint: 0xFFFFFF,
            alpha: 1,
            pluginName: 'batch',
        }, options);

        if (options.uniforms)
        {
            Object.assign(uniforms, options.uniforms);
        }
        super(options.program || Program.from(MeshMaterial.vertex$6, MeshMaterial.fragment$8), uniforms);
        /**
         * Only do update if tint or alpha changes.
         * @member {boolean}
         * @private
         * @default false
         */
        this._colorDirty = false;

        /**
         * TextureMatrix instance for this Mesh, used to track Texture changes
         *
         * @member {PIXI.TextureMatrix}
         * @readonly
         */
        this.uvMatrix = new TextureMatrix(uSampler);

        /**
         * `true` if shader can be batch with the renderer's batch system.
         * @member {boolean}
         * @default true
         */
        this.batchable = options.program === undefined;

        /**
         * Renderer plugin for batching
         *
         * @member {string}
         * @default 'batch'
         */
        this.pluginName = options.pluginName;

        this.tint = options.tint;
        this.alpha = options.alpha;
    }

    /**
     * Reference to the texture being rendered.
     * @member {PIXI.Texture}
     */
    get texture ()
    {
        return this.uniforms.uSampler;
    };
    set texture (value)
    {
        if (this.uniforms.uSampler !== value)
        {
            this.uniforms.uSampler = value;
            this.uvMatrix.texture = value;
        }
    };

    /**
     * This gets automatically set by the object using this.
     *
     * @default 1
     * @member {number}
     */
    set alpha (value)
    {
        if (value === this._alpha) { return; }

        this._alpha = value;
        this._colorDirty = true;
    };
    get alpha ()
    {
        return this._alpha;
    };

    /**
     * Multiply tint for the material.
     * @member {number}
     * @default 0xFFFFFF
     */
    set tint (value)
    {
        if (value === this._tint) { return; }

        this._tint = value;
        this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
        this._colorDirty = true;
    };
    get tint ()
    {
        return this._tint;
    };

    /**
     * Gets called automatically by the Mesh. Intended to be overridden for custom
     * MeshMaterial objects.
     */
    update  ()
    {
        if (this._colorDirty)
        {
            this._colorDirty = false;
            var baseTexture = this.texture.baseTexture;

            ColorSettings.premultiplyTintToRgba(this._tint, this._alpha, this.uniforms.uColor, baseTexture.premultiplyAlpha);
        }
        if (this.uvMatrix.update())
        {
            this.uniforms.uTextureMatrix = this.uvMatrix.mapCoord;
        }
    };
}

