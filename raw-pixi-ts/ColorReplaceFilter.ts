import { Filter } from "./Filter";
import { ColorSettings } from "./ColorSettings";

export class ColorReplaceFilter extends Filter
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

    private static fragment:string = `
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform vec3 originalColor;
        uniform vec3 newColor;
        uniform float epsilon;
        void main(void) {
            vec4 currentColor = texture2D(uSampler, vTextureCoord);
            vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));
            float colorDistance = length(colorDiff);
            float doReplace = step(colorDistance, epsilon);
            gl_FragColor = vec4(mix(currentColor.rgb, (newColor + colorDiff) * currentColor.a, doReplace), currentColor.a);
        }
        `

    _originalColor
    _newColor
    constructor(originalColor = 0xFF0000, newColor = 0x000000, epsilon = 0.4) 
    {
        super(ColorReplaceFilter.vertex, ColorReplaceFilter.fragment);
        this.uniforms.originalColor = new Float32Array(3);
        this.uniforms.newColor = new Float32Array(3);
        this.originalColor = originalColor;
        this.newColor = newColor;
        this.epsilon = epsilon;
    }

    /**
     * The color that will be changed, as a 3 component RGB e.g. [1.0, 1.0, 1.0]
     * @member {number|Array<number>}
     * @default 0xFF0000
     */
    set originalColor(value) {
        let arr = this.uniforms.originalColor;
        if (typeof value === 'number') {
            ColorSettings.hex2rgb(value, arr);
            this._originalColor = value;
        }
        else {
            arr[0] = value[0];
            arr[1] = value[1];
            arr[2] = value[2];
            this._originalColor = ColorSettings.rgb2hex(arr);
        }
    }
    get originalColor() {
        return this._originalColor;
    }

    /**
     * The resulting color, as a 3 component RGB e.g. [1.0, 0.5, 1.0]
     * @member {number|Array<number>}
     * @default 0x000000
     */
    set newColor(value) {
        let arr = this.uniforms.newColor;
        if (typeof value === 'number') {
            ColorSettings.hex2rgb(value, arr);
            this._newColor = value;
        }
        else {
            arr[0] = value[0];
            arr[1] = value[1];
            arr[2] = value[2];
            this._newColor = ColorSettings.rgb2hex(arr);
        }
    }
    get newColor() {
        return this._newColor;
    }

    /**
     * Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
     * @member {number}
     * @default 0.4
     */
    set epsilon(value) {
        this.uniforms.epsilon = value;
    }
    get epsilon() {
        return this.uniforms.epsilon;
    }
}