import { Filter } from "./Filter";

/**
 * The ability to adjust gamma, contrast, saturation, brightness, alpha or color-channel shift. This is a faster
 * and much simpler to use than {@link http://pixijs.download/release/docs/PIXI.filters.ColorMatrixFilter.html ColorMatrixFilter}
 * because it does not use a matrix.<br>
 * ![original](../tools/screenshots/dist/original.png)![filter](../tools/screenshots/dist/adjustment.png)
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 *
 * @param {object|number} [options] - The optional parameters of the filter.
 * @param {number} [options.gamma=1] - The amount of luminance
 * @param {number} [options.saturation=1] - The amount of color saturation
 * @param {number} [options.contrast=1] - The amount of contrast
 * @param {number} [options.brightness=1] - The overall brightness
 * @param {number} [options.red=1] - The multipled red channel
 * @param {number} [options.green=1] - The multipled green channel
 * @param {number} [options.blue=1] - The multipled blue channel
 * @param {number} [options.alpha=1] - The overall alpha amount
 */
export class AdjustmentFilter extends Filter
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
        uniform float gamma;
        uniform float contrast;
        uniform float saturation;
        uniform float brightness;
        uniform float red;
        uniform float green;
        uniform float blue;
        uniform float alpha;
        void main(void)
        {
            vec4 c = texture2D(uSampler, vTextureCoord);
            if (c.a > 0.0) {
                c.rgb /= c.a;
                vec3 rgb = pow(c.rgb, vec3(1. / gamma));
                rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);
                rgb.r *= red;
                rgb.g *= green;
                rgb.b *= blue;
                c.rgb = rgb * brightness;
                c.rgb *= c.a;
            }
            gl_FragColor = c * alpha;
        }
    `
    gamma
    saturation
    contrast
    brightness
    red
    green
    blue
    alpha
    
    constructor() 
    {
        super(AdjustmentFilter.vertex, AdjustmentFilter.fragment);
        this.gamma = 1
        this.saturation = 1
        this.contrast = 1;
        this.brightness = 1;
        this.red = 1
        this.green = 1;
        this.blue = 1;
        this.alpha = 1;
    }

    /**
     * Override existing apply method in PIXI.Filter
     * @private
     */
    apply(filterManager, input, output, clear) 
    {
        this.uniforms.gamma = Math.max(this.gamma, 0.0001);
        this.uniforms.saturation = this.saturation;
        this.uniforms.contrast = this.contrast;
        this.uniforms.brightness = this.brightness;
        this.uniforms.red = this.red;
        this.uniforms.green = this.green;
        this.uniforms.blue = this.blue;
        this.uniforms.alpha = this.alpha;
        filterManager.applyFilter(this, input, output, clear);
    }
}