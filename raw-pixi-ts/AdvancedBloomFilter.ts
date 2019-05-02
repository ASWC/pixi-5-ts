import { Filter } from "./Filter";
import { DisplaySettings } from "./DisplaySettings";
import { KawaseBlurFilter } from "./KawaseBlurFilter";
import { ExtractBrightnessFilter } from "./ExtractBrightnessFilter";

export class AdvancedBloomFilter extends Filter
{
    private static vertex:string = `
        attribute vec2 aVertexPosition;
        attribute vec2 aTextureCoord;
        uniform mat3 projectionMatrix;
        varying vec2 vTextureCoord;
        void main(void)
        {
            gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            vTextureCoord = aTextureCoord;
        }
    `
    private static fragment = `
        uniform sampler2D uSampler;
        varying vec2 vTextureCoord;
        uniform sampler2D bloomTexture;
        uniform float bloomScale;
        uniform float brightness;
        void main() {
            vec4 color = texture2D(uSampler, vTextureCoord);
            color.rgb *= brightness;
            vec4 bloomColor = vec4(texture2D(bloomTexture, vTextureCoord).rgb, 0.0);
            bloomColor.rgb *= bloomScale;
            gl_FragColor = color + bloomColor;
        }`

    bloomScale
    brightness
    _extractFilter
    _blurFilter
    _resolution

    constructor() 
    {

        super(AdvancedBloomFilter.vertex, AdvancedBloomFilter.fragment);

        // this.threshold = 0.5
        this.bloomScale = 1.0
        this.brightness = 1.0
        // this.blur = 8;
        // this.quality = 4
        // this.pixelSize = 1
        this.resolution = DisplaySettings.RESOLUTION
        this.bloomScale = 1;
        this.brightness = 1;
        let kernels = null;
        // let blur = 8
        let resolution = DisplaySettings.RESOLUTION
        // let quality = 4
        // let pixelSize = 1
        // const { kernels, blur, quality, pixelSize, resolution } = options;
        this._extractFilter = new ExtractBrightnessFilter(0.5);
        this._extractFilter.resolution = resolution;
        this._blurFilter = kernels ?
            new KawaseBlurFilter(kernels) :
            new KawaseBlurFilter(8, 4);
        this.pixelSize = 1;
        this.resolution = resolution;
    }

    /**
     * Override existing apply method in PIXI.Filter
     * @private
     */
    apply(filterManager, input, output, clear, currentState) {

        const brightTarget = filterManager.getFilterTexture();

        this._extractFilter.apply(filterManager, input, brightTarget, true, currentState);

        const bloomTarget = filterManager.getFilterTexture();

        this._blurFilter.apply(filterManager, brightTarget, bloomTarget, true, currentState);

        this.uniforms.bloomScale = this.bloomScale;
        this.uniforms.brightness = this.brightness;
        this.uniforms.bloomTexture = bloomTarget;

        filterManager.applyFilter(this, input, output, clear);

        filterManager.returnFilterTexture(bloomTarget);
        filterManager.returnFilterTexture(brightTarget);
    }

    /**
     * The resolution of the filter.
     *
     * @member {number}
     */
    get resolution() {
        return this._resolution;
    }
    set resolution(value) {
        this._resolution = value;

        if (this._extractFilter) {
            this._extractFilter.resolution = value;
        }
        if (this._blurFilter) {
            this._blurFilter.resolution = value;
        }
    }

    /**
     * Defines how bright a color needs to be to affect bloom.
     *
     * @member {number}
     * @default 0.5
     */
    get threshold() {
        return this._extractFilter.threshold;
    }
    set threshold(value) {
        this._extractFilter.threshold = value;
    }

    /**
     * Sets the kernels of the Blur Filter
     *
     * @member {number}
     * @default 4
     */
    get kernels() {
        return this._blurFilter.kernels;
    }
    set kernels(value) {
        this._blurFilter.kernels = value;
    }

    /**
     * Sets the strength of the Blur properties simultaneously
     *
     * @member {number}
     * @default 2
     */
    get blur() {
        return this._blurFilter.blur;
    }
    set blur(value) {
        this._blurFilter.blur = value;
    }

    /**
     * Sets the quality of the Blur Filter
     *
     * @member {number}
     * @default 4
     */
    get quality() {
        return this._blurFilter.quality;
    }
    set quality(value) {
        this._blurFilter.quality = value;
    }

    /**
     * Sets the pixelSize of the Kawase Blur filter
     *
     * @member {number|number[]|PIXI.Point}
     * @default 1
     */
    get pixelSize() {
        return this._blurFilter.pixelSize;
    }
    set pixelSize(value) {
        this._blurFilter.pixelSize = value;
    }
}