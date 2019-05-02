import { ObjectRenderer } from "./ObjectRenderer";
import { Shader } from "./Shader";
import { QuadUv } from "./QuadUv";
import { Matrix } from "./Matrix";
import { WebGLSettings } from './WebGLSettings';
import { ColorSettings } from './ColorSettings';
import { BlendModesSettings } from './BlendModesSettings';

export class TilingSpriteRenderer extends ObjectRenderer
{
    static fragmentSimple = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform vec4 uColor;\r\n\r\nvoid main(void)\r\n{\r\n    vec4 sample = texture2D(uSampler, vTextureCoord);\r\n    gl_FragColor = sample * uColor;\r\n}\r\n";

    static fragment$2 = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform vec4 uColor;\r\nuniform mat3 uMapCoord;\r\nuniform vec4 uClampFrame;\r\nuniform vec2 uClampOffset;\r\n\r\nvoid main(void)\r\n{\r\n    vec2 coord = mod(vTextureCoord - uClampOffset, vec2(1.0, 1.0)) + uClampOffset;\r\n    coord = (uMapCoord * vec3(coord, 1.0)).xy;\r\n    coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);\r\n\r\n    vec4 sample = texture2D(uSampler, coord);\r\n    gl_FragColor = sample * uColor;\r\n}\r\n";

    static vertex$3 = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\nuniform mat3 translationMatrix;\r\nuniform mat3 uTransform;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n\r\n    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\r\n}\r\n";

    static tempMat$1 = new Matrix();
    shader
    simpleShader
    quad
    constructor(renderer)
    {
        super(renderer);
        var uniforms = { globals: this.renderer.globalUniforms };

        this.shader = Shader.from(TilingSpriteRenderer.vertex$3, TilingSpriteRenderer.fragment$2, uniforms);
      
        this.simpleShader = Shader.from(TilingSpriteRenderer.vertex$3, TilingSpriteRenderer.fragmentSimple, uniforms);
       


        this.quad = new QuadUv();
    }

    /**
     *
     * @param {PIXI.TilingSprite} ts tilingSprite to be rendered
     */
    render  (ts)
    {
        var renderer = this.renderer;
        var quad = this.quad;

        var vertices = quad.vertices;

        vertices[0] = vertices[6] = (ts._width) * -ts.anchor.x;
        vertices[1] = vertices[3] = ts._height * -ts.anchor.y;

        vertices[2] = vertices[4] = (ts._width) * (1.0 - ts.anchor.x);
        vertices[5] = vertices[7] = ts._height * (1.0 - ts.anchor.y);

        if (ts.uvRespectAnchor)
        {
            vertices = quad.uvs;

            vertices[0] = vertices[6] = -ts.anchor.x;
            vertices[1] = vertices[3] = -ts.anchor.y;

            vertices[2] = vertices[4] = 1.0 - ts.anchor.x;
            vertices[5] = vertices[7] = 1.0 - ts.anchor.y;
        }

        quad.invalidate();

        var tex = ts._texture;
        var baseTex = tex.baseTexture;
        var lt = ts.tileTransform.localTransform;
        var uv = ts.uvMatrix;
        var isSimple = baseTex.isPowerOfTwo
            && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;

        // auto, force repeat wrapMode for big tiling textures
        if (isSimple)
        {
            if (!baseTex._glTextures[renderer.CONTEXT_UID])
            {
                if (baseTex.wrapMode === WebGLSettings.WRAP_MODES.CLAMP)
                {
                    baseTex.wrapMode = WebGLSettings.WRAP_MODES.REPEAT;
                }
            }
            else
            {
                isSimple = baseTex.wrapMode !== WebGLSettings.WRAP_MODES.CLAMP;
            }
        }

        var shader = isSimple ? this.simpleShader : this.shader;

        var w = tex.width;
        var h = tex.height;
        var W = ts._width;
        var H = ts._height;

        TilingSpriteRenderer.tempMat$1.set(lt.a * w / W,
            lt.b * w / H,
            lt.c * h / W,
            lt.d * h / H,
            lt.tx / W,
            lt.ty / H);

        // that part is the same as above:
        // tempMat.identity();
        // tempMat.scale(tex.width, tex.height);
        // tempMat.prepend(lt);
        // tempMat.scale(1.0 / ts._width, 1.0 / ts._height);

        TilingSpriteRenderer.tempMat$1.invert();
        if (isSimple)
        {
            TilingSpriteRenderer.tempMat$1.prepend(uv.mapCoord);
        }
        else
        {
            shader.uniforms.uMapCoord = uv.mapCoord.toArray(true);
            shader.uniforms.uClampFrame = uv.uClampFrame;
            shader.uniforms.uClampOffset = uv.uClampOffset;
        }

        shader.uniforms.uTransform = TilingSpriteRenderer.tempMat$1.toArray(true);
        shader.uniforms.uColor = ColorSettings.premultiplyTintToRgba(ts.tint, ts.worldAlpha,
            shader.uniforms.uColor, baseTex.premultiplyAlpha);
        shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);
        shader.uniforms.uSampler = tex;

        renderer.shader.bind(shader);
        renderer.geometry.bind(quad);// , renderer.shader.getGLShader());

        renderer.state.setBlendMode(BlendModesSettings.correctBlendMode(ts.blendMode, baseTex.premultiplyAlpha));
        renderer.geometry.draw(this.renderer.gl.TRIANGLES, 6, 0);
    };
}

