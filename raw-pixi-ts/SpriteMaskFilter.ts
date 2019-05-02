import { Filter } from "./Filter";
import { Matrix } from "./Matrix";
import { TextureMatrix } from "./TextureMatrix";


export class SpriteMaskFilter extends Filter
{
    static vertex = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\nuniform mat3 otherMatrix;\r\n\r\nvarying vec2 vMaskCoord;\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n\r\n    vTextureCoord = aTextureCoord;\r\n    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\r\n}\r\n";

	static fragment = "varying vec2 vMaskCoord;\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform sampler2D mask;\r\nuniform float alpha;\r\nuniform float npmAlpha;\r\nuniform vec4 maskClamp;\r\n\r\nvoid main(void)\r\n{\r\n    float clip = step(3.5,\r\n        step(maskClamp.x, vMaskCoord.x) +\r\n        step(maskClamp.y, vMaskCoord.y) +\r\n        step(vMaskCoord.x, maskClamp.z) +\r\n        step(vMaskCoord.y, maskClamp.w));\r\n\r\n    vec4 original = texture2D(uSampler, vTextureCoord);\r\n    vec4 masky = texture2D(mask, vMaskCoord);\r\n    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);\r\n\r\n    original *= (alphaMul * masky.r * alpha * clip);\r\n\r\n    gl_FragColor = original;\r\n}\r\n";


    maskSprite
    maskMatrix
    constructor(sprite)
    {
        var maskMatrix = new Matrix();
        super(SpriteMaskFilter.vertex, SpriteMaskFilter.fragment);
        sprite.renderable = false;

        /**
         * Sprite mask
         * @member {PIXI.Sprite}
         */
        this.maskSprite = sprite;

        /**
         * Mask matrix
         * @member {PIXI.Matrix}
         */
        this.maskMatrix = maskMatrix;
    }

    /**
     * Applies the filter
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The renderer to retrieve the filter from
     * @param {PIXI.RenderTexture} input - The input render target.
     * @param {PIXI.RenderTexture} output - The target to output to.
     * @param {boolean} clear - Should the output be cleared before rendering to it.
     */
    apply  (filterManager, input, output, clear)
    {
        var maskSprite = this.maskSprite;
        var tex = this.maskSprite.texture;

        if (!tex.valid)
        {
            return;
        }
        if (!tex.transform)
        {
            // margin = 0.0, let it bleed a bit, shader code becomes easier
            // assuming that atlas textures were made with 1-pixel padding
            tex.transform = new TextureMatrix(tex, 0.0);
        }
        tex.transform.update();

        this.uniforms.npmAlpha = tex.baseTexture.premultiplyAlpha ? 0.0 : 1.0;
        this.uniforms.mask = tex;
        this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite)
            .prepend(tex.transform.mapCoord);
        this.uniforms.alpha = maskSprite.worldAlpha;
        this.uniforms.maskClamp = tex.transform.uClampFrame;

        filterManager.applyFilter(this, input, output, clear);
    };
}

