import { Filter } from "./Filter";
import { Texture } from "./Texture";
import { WebGLSettings } from "./WebGLSettings";


export class ColorMapFilter extends Filter
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
        uniform sampler2D colorMap;
        uniform float _mix;
        uniform float _size;
        uniform float _sliceSize;
        uniform float _slicePixelSize;
        uniform float _sliceInnerSize;
        void main() {
            vec4 color = texture2D(uSampler, vTextureCoord.xy);

            vec4 adjusted;
            if (color.a > 0.0) {
                color.rgb /= color.a;
                float innerWidth = _size - 1.0;
                float zSlice0 = min(floor(color.b * innerWidth), innerWidth);
                float zSlice1 = min(zSlice0 + 1.0, innerWidth);
                float xOffset = _slicePixelSize * 0.5 + color.r * _sliceInnerSize;
                float s0 = xOffset + (zSlice0 * _sliceSize);
                float s1 = xOffset + (zSlice1 * _sliceSize);
                float yOffset = _sliceSize * 0.5 + color.g * (1.0 - _sliceSize);
                vec4 slice0Color = texture2D(colorMap, vec2(s0,yOffset));
                vec4 slice1Color = texture2D(colorMap, vec2(s1,yOffset));
                float zOffset = fract(color.b * innerWidth);
                adjusted = mix(slice0Color, slice1Color, zOffset);

                color.rgb *= color.a;
            }
            gl_FragColor = vec4(mix(color, adjusted, _mix).rgb, color.a);

        }
        `

        _size
        _sliceSize
        _colorMap
        _slicePixelSize
        _sliceInnerSize
        _scaleMode
        mix
        _nearest
    constructor(colorMap, nearest = false, mix = 1) 
    {
        super(ColorMapFilter.vertex, ColorMapFilter.fragment);

        this._size = 0;
        this._sliceSize = 0;
        this._slicePixelSize = 0;
        this._sliceInnerSize = 0;

        this._scaleMode = null;
        this._nearest = false;
        this.nearest = nearest;

        /**
         * The mix from 0 to 1, where 0 is the original image and 1 is the color mapped image.
         * @member {number}
         */
        this.mix = mix;

        this.colorMap = colorMap;
    }

    /**
     * Override existing apply method in PIXI.Filter
     * @private
     */
    apply(filterManager, input, output, clear) {
        this.uniforms._mix = this.mix;

        filterManager.applyFilter(this, input, output, clear);
    }

    /**
     * the size of one color slice
     * @member {number}
     * @readonly
     */
    get colorSize() {
        return this._size;
    }

    /**
     * the colorMap texture
     * @member {PIXI.Texture}
     */
    get colorMap() {
        return this._colorMap;
    }
    set colorMap(colorMap) {
        if (!(colorMap instanceof Texture)) {
            colorMap = Texture.from(colorMap);
        }
        if (colorMap && colorMap.baseTexture) {
            colorMap.baseTexture.scaleMode = this._scaleMode;
            colorMap.baseTexture.mipmap = false;

            this._size = colorMap.height;
            this._sliceSize = 1 / this._size;
            this._slicePixelSize = this._sliceSize / this._size;
            this._sliceInnerSize = this._slicePixelSize * (this._size - 1);

            this.uniforms._size = this._size;
            this.uniforms._sliceSize = this._sliceSize;
            this.uniforms._slicePixelSize = this._slicePixelSize;
            this.uniforms._sliceInnerSize = this._sliceInnerSize;

            this.uniforms.colorMap = colorMap;
        }

        this._colorMap = colorMap;
    }

    /**
     * Whether use NEAREST for colorMap texture.
     * @member {boolean}
     */
    get nearest() {
        return this._nearest;
    }
    set nearest(nearest) {
        this._nearest = nearest;
        this._scaleMode = nearest ? WebGLSettings.SCALE_MODES.NEAREST : WebGLSettings.SCALE_MODES.LINEAR;

        const texture = this._colorMap;

        if (texture && texture.baseTexture) {
            texture.baseTexture._glTextures = {};

            texture.baseTexture.scaleMode = this._scaleMode;
            texture.baseTexture.mipmap = false;

            texture._updateID++;
            texture.baseTexture.emit('update', texture.baseTexture);
        }
    }

    /**
     * If the colorMap is based on canvas , and the content of canvas has changed,
     *   then call `updateColorMap` for update texture.
     */
    updateColorMap() {
        const texture = this._colorMap;

        if (texture && texture.baseTexture) {
            texture._updateID++;
            texture.baseTexture.emit('update', texture.baseTexture);

            this.colorMap = texture;
        }
    }

    /**
     * Destroys this filter
     *
     * @param {boolean} [destroyBase=false] Whether to destroy the base texture of colorMap as well
     */
    destroy(destroyBase = null) {
        if (this._colorMap) {
            this._colorMap.destroy(destroyBase);
        }
        super.destroy();
    }
}