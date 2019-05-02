import { Filter } from "./Filter";


export class ExtractBrightnessFilter extends Filter
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

        uniform float threshold;

        void main() {
            vec4 color = texture2D(uSampler, vTextureCoord);

            // A simple & fast algorithm for getting brightness.
            // It's inaccuracy , but good enought for this feature.
            float _max = max(max(color.r, color.g), color.b);
            float _min = min(min(color.r, color.g), color.b);
            float brightness = (_max + _min) * 0.5;

            if(brightness > threshold) {
                gl_FragColor = color;
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            }
        }
        `

    constructor(threshold = 0.5) 
    {
        super(ExtractBrightnessFilter.vertex, ExtractBrightnessFilter.fragment);

        this.threshold = threshold;
    }

    /**
     * Defines how bright a color needs to be extracted.
     *
     * @member {number}
     * @default 0.5
     */
    get threshold() {
        return this.uniforms.threshold;
    }
    set threshold(value) {
        this.uniforms.threshold = value;
    }
}