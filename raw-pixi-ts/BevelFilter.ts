import { Filter } from "./Filter";
import { MathSettings } from "./MathSettings";
import { ColorSettings } from "./ColorSettings";

/**
 * Bevel Filter.<br>
 * ![original](../tools/screenshots/dist/original.png)![filter](../tools/screenshots/dist/bevel.png)
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {object} [options] - The optional parameters of the filter.
 * @param {number} [options.rotation = 45] - The angle of the light in degrees.
 * @param {number} [options.thickness = 2] - The tickness of the bevel.
 * @param {number} [options.lightColor = 0xffffff] - Color of the light.
 * @param {number} [options.lightAlpha = 0.7] - Alpha of the light.
 * @param {number} [options.shadowColor = 0x000000] - Color of the shadow.
 * @param {number} [options.shadowAlpha = 0.7] - Alpha of the shadow.
 */

export class BevelFilter extends Filter
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
        precision mediump float;
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform vec4 filterArea;
        uniform float transformX;
        uniform float transformY;
        uniform vec3 lightColor;
        uniform float lightAlpha;
        uniform vec3 shadowColor;
        uniform float shadowAlpha;
        void main(void) {
            vec2 transform = vec2(1.0 / filterArea) * vec2(transformX, transformY);
            vec4 color = texture2D(uSampler, vTextureCoord);
            float light = texture2D(uSampler, vTextureCoord - transform).a;
            float shadow = texture2D(uSampler, vTextureCoord + transform).a;
            color.rgb = mix(color.rgb, lightColor, clamp((color.a - light) * lightAlpha, 0.0, 1.0));
            color.rgb = mix(color.rgb, shadowColor, clamp((color.a - shadow) * shadowAlpha, 0.0, 1.0));
            gl_FragColor = vec4(color.rgb * color.a, color.a);
        }
        `
    _thickness
    _angle
    constructor() 
    {
        super(BevelFilter.vertex, BevelFilter.fragment);

        this.uniforms.lightColor = new Float32Array(3);
        this.uniforms.shadowColor = new Float32Array(3);
        this.rotation = 45;
        this._thickness = 2;
        this.lightColor = 0xffffff
        this.lightAlpha = 0.7
        this.shadowColor = 0x000000
        this.shadowAlpha = 0.7

        

    }

    /**
     * Update the transform matrix of offset angle.
     * @private
     */
    _updateTransform() {
        this.uniforms.transformX = this._thickness * Math.cos(this._angle);
        this.uniforms.transformY = this._thickness * Math.sin(this._angle);
    }

    get rotation() {
        return this._angle / MathSettings.DEG_TO_RAD;
    }
    set rotation(value) {
        this._angle = value * MathSettings.DEG_TO_RAD;
        this._updateTransform();
    }

    get thickness() {
        return this._thickness;
    }
    set thickness(value) {
        this._thickness = value;
        this._updateTransform();
    }

    get lightColor() {
        return ColorSettings.rgb2hex(this.uniforms.lightColor);
    }
    set lightColor(value) {
        ColorSettings.hex2rgb(value, this.uniforms.lightColor);
    }

    get lightAlpha() {
        return this.uniforms.lightAlpha;
    }
    set lightAlpha(value) {
        this.uniforms.lightAlpha = value;
    }

    get shadowColor() {
        return ColorSettings.rgb2hex(this.uniforms.shadowColor);
    }
    set shadowColor(value) {
        ColorSettings.hex2rgb(value, this.uniforms.shadowColor);
    }

    get shadowAlpha() {
        return this.uniforms.shadowAlpha;
    }
    set shadowAlpha(value) {
        this.uniforms.shadowAlpha = value;
    }
}