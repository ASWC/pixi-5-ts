import { Filter } from "./Filter";
import { Matrix } from "./Matrix";
import { Point } from "./Point";

export class DisplacementFilter extends Filter
{
    static fragment$5 = "varying vec2 vFilterCoord;\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform vec2 scale;\r\nuniform mat2 rotation;\r\nuniform sampler2D uSampler;\r\nuniform sampler2D mapSampler;\r\n\r\nuniform highp vec4 inputSize;\r\nuniform vec4 inputClamp;\r\n\r\nvoid main(void)\r\n{\r\n  vec4 map =  texture2D(mapSampler, vFilterCoord);\r\n\r\n  map -= 0.5;\r\n  map.xy = scale * inputSize.zw * (rotation * map.xy);\r\n\r\n  gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), inputClamp.xy, inputClamp.zw));\r\n}\r\n";

    static vertex$4 = "attribute vec2 aVertexPosition;\r\n\r\nuniform mat3 projectionMatrix;\r\nuniform mat3 filterMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\nvarying vec2 vFilterCoord;\r\n\r\nuniform vec4 inputSize;\r\nuniform vec4 outputFrame;\r\n\r\nvec4 filterVertexPosition( void )\r\n{\r\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\r\n\r\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\r\n}\r\n\r\nvec2 filterTextureCoord( void )\r\n{\r\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\r\n}\r\n\r\nvoid main(void)\r\n{\r\n\tgl_Position = filterVertexPosition();\r\n\tvTextureCoord = filterTextureCoord();\r\n\tvFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;\r\n}\r\n";

    maskSprite
    scale
    maskMatrix
    constructor(sprite, scale = 1)
    {
        var maskMatrix = new Matrix();

        sprite.renderable = false;
        super(DisplacementFilter.vertex$4, DisplacementFilter.fragment$5, {mapSampler: sprite._texture, filterMatrix: maskMatrix, scale: { x: 1, y: 1 },rotation: new Float32Array([1, 0, 0, 1]), });
        this.maskSprite = sprite;
        this.maskMatrix = maskMatrix;

        if (scale === null || scale === undefined)
        {
            scale = 20;
        }

        /**
         * scaleX, scaleY for displacements
         * @member {PIXI.Point}
         */
        this.scale = new Point(scale, scale);
    }

    /**
     * Applies the filter.
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The manager.
     * @param {PIXI.RenderTexture} input - The input target.
     * @param {PIXI.RenderTexture} output - The output target.
     */
    apply  (filterManager, input, output)
    {
        this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
        this.uniforms.scale.x = this.scale.x;
        this.uniforms.scale.y = this.scale.y;

        // Extract rotation from world transform
        var wt = this.maskSprite.transform.worldTransform;
        var lenX = Math.sqrt((wt.a * wt.a) + (wt.b * wt.b));
        var lenY = Math.sqrt((wt.c * wt.c) + (wt.d * wt.d));

        if (lenX !== 0 && lenY !== 0)
        {
            this.uniforms.rotation[0] = wt.a / lenX;
            this.uniforms.rotation[1] = wt.b / lenX;
            this.uniforms.rotation[2] = wt.c / lenY;
            this.uniforms.rotation[3] = wt.d / lenY;
        }

        // draw the filter...
        filterManager.applyFilter(this, input, output);
    };

    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {PIXI.Texture}
     */
    get map ()
    {
        return this.uniforms.mapSampler;
    };

    set map (value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.mapSampler = value;
    };
}

	    

