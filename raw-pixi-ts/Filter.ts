import { Shader } from "./Shader";
import { Program } from "./Program";
import { settings } from "./settings";
import { State } from "./State";


export class Filter extends Shader
{
    padding
    enabled
    state
    autoFit
    legacy
    resolution
    /**
	 * Used for caching shader IDs
	 *
	 * @static
	 * @type {object}
	 * @protected
	 */
    static SOURCE_KEY_MAP = {};
    
    constructor(vertexSrc = null, fragmentSrc = null, uniforms = null)
    {
        var program = Program.from(vertexSrc || Filter.defaultVertexSrc, fragmentSrc || Filter.defaultFragmentSrc);
        super(program, uniforms);
        /**
         * The padding of the filter. Some filters require extra space to breath such as a blur.
         * Increasing this will add extra width and height to the bounds of the object that the
         * filter is applied to.
         *
         * @member {number}
         */
        this.padding = 0;

        /**
         * The resolution of the filter. Setting this to be lower will lower the quality but
         * increase the performance of the filter.
         *
         * @member {number}
         */
        this.resolution = settings.FILTER_RESOLUTION;

        /**
         * If enabled is true the filter is applied, if false it will not.
         *
         * @member {boolean}
         */
        this.enabled = true;

        /**
         * If enabled, PixiJS will fit the filter area into boundaries for better performance.
         * Switch it off if it does not work for specific shader.
         *
         * @member {boolean}
         */
        this.autoFit = true;

        /**
         * Legacy filters use position and uvs from attributes
         * @member {boolean}
         * @readonly
         */
        this.legacy = !!this.program.attributeData.aTextureCoord;

        /**
         * The WebGL state the filter requires to render
         * @member {PIXI.State}
         */
        this.state = new State();
    }

    /**
     * Applies the filter
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The renderer to retrieve the filter from
     * @param {PIXI.RenderTexture} input - The input render target.
     * @param {PIXI.RenderTexture} output - The target to output to.
     * @param {boolean} clear - Should the output be cleared before rendering to it
     * @param {object} [currentState] - It's current state of filter.
     *        There are some useful properties in the currentState :
     *        target, filters, sourceFrame, destinationFrame, renderTarget, resolution
     */
    apply  (filterManager, input, output, clear, currentState, derp) // eslint-disable-line no-unused-vars
    {
        // do as you please!

        filterManager.applyFilter(this, input, output, clear, currentState, derp);

        // or just do a regular render..
    };

    /**
     * Sets the blendmode of the filter
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode ()
    {
        return this.state.blendMode;
    };

    set blendMode (value) // eslint-disable-line require-jsdoc
    {
        this.state.blendMode = value;
    };

    /**
     * The default vertex shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    static get defaultVertexSrc ()
    {
        return Filter.defaultVertex$1;
    };

    /**
     * The default fragment shader source
     *
     * @static
     * @type {string}
     * @constant
     */
    static get defaultFragmentSrc ()
    {
        return Filter.defaultFragment$1;
    };

    static defaultVertex$1 = "attribute vec2 aVertexPosition;\r\n\r\nuniform mat3 projectionMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform vec4 inputSize;\r\nuniform vec4 outputFrame;\r\n\r\nvec4 filterVertexPosition( void )\r\n{\r\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\r\n\r\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\r\n}\r\n\r\nvec2 filterTextureCoord( void )\r\n{\r\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\r\n}\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = filterVertexPosition();\r\n    vTextureCoord = filterTextureCoord();\r\n}\r\n";

	static defaultFragment$1 = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\n\r\nvoid main(void){\r\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\r\n}\r\n";

}

	
