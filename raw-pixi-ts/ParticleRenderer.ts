import { ObjectRenderer } from "./ObjectRenderer";
import { Matrix } from "./Matrix";
import { Shader } from "./Shader";
import { ParticleBuffer } from "./ParticleBuffer";
import { ColorSettings } from './ColorSettings';
import { BlendModesSettings } from './BlendModesSettings';
import { WebGLSettings } from './WebGLSettings';


export class ParticleRenderer extends ObjectRenderer
{
    static vertex$2 = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\nattribute vec4 aColor;\r\n\r\nattribute vec2 aPositionCoord;\r\nattribute float aRotation;\r\n\r\nuniform mat3 translationMatrix;\r\nuniform vec4 uColor;\r\n\r\nvarying vec2 vTextureCoord;\r\nvarying vec4 vColor;\r\n\r\nvoid main(void){\r\n    float x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);\r\n    float y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);\r\n\r\n    vec2 v = vec2(x, y);\r\n    v = v + aPositionCoord;\r\n\r\n    gl_Position = vec4((translationMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);\r\n\r\n    vTextureCoord = aTextureCoord;\r\n    vColor = aColor * uColor;\r\n}\r\n";
	static fragment$1 = "varying vec2 vTextureCoord;\r\nvarying vec4 vColor;\r\n\r\nuniform sampler2D uSampler;\r\n\r\nvoid main(void){\r\n    vec4 color = texture2D(uSampler, vTextureCoord) * vColor;\r\n    gl_FragColor = color;\r\n}";

    // ParticleBuffer
    shader
    properties
    tempMatrix
    constructor(renderer)
    {
        super(renderer);
        // 65535 is max vertex index in the index buffer (see ParticleRenderer)
        // so max number of particles is 65536 / 4 = 16384
        // and max number of element in the index buffer is 16384 * 6 = 98304
        // Creating a full index buffer, overhead is 98304 * 2 = 196Ko
        // let numIndices = 98304;

        /**
         * The default shader that is used if a sprite doesn't have a more specific one.
         *
         * @member {PIXI.Shader}
         */
        this.shader = null;

        this.properties = null;

        this.tempMatrix = new Matrix();

        this.properties = [
            // verticesData
            {
                attributeName: 'aVertexPosition',
                size: 2,
                uploadFunction: this.uploadVertices,
                offset: 0,
            },
            // positionData
            {
                attributeName: 'aPositionCoord',
                size: 2,
                uploadFunction: this.uploadPosition,
                offset: 0,
            },
            // rotationData
            {
                attributeName: 'aRotation',
                size: 1,
                uploadFunction: this.uploadRotation,
                offset: 0,
            },
            // uvsData
            {
                attributeName: 'aTextureCoord',
                size: 2,
                uploadFunction: this.uploadUvs,
                offset: 0,
            },
            // tintData
            {
                attributeName: 'aColor',
                size: 1,
                type: WebGLSettings.TYPES.UNSIGNED_BYTE,
                uploadFunction: this.uploadTint,
                offset: 0,
            } ];

            
        this.shader = Shader.from(ParticleRenderer.vertex$2, ParticleRenderer.fragment$1, {});
    }

    /**
     * Renders the particle container object.
     *
     * @param {PIXI.ParticleContainer} container - The container to render using this ParticleRenderer
     */
    render  (container)
    {
        var children = container.children;
        var maxSize = container._maxSize;
        var batchSize = container._batchSize;
        var renderer = this.renderer;
        var totalChildren = children.length;

        if (totalChildren === 0)
        {
            return;
        }
        else if (totalChildren > maxSize)
        {
            totalChildren = maxSize;
        }

        var buffers = container._buffers;

        if (!buffers)
        {
            buffers = container._buffers = this.generateBuffers(container);
        }

        var baseTexture = children[0]._texture.baseTexture;

        // if the uvs have not updated then no point rendering just yet!
        this.renderer.state.setBlendMode(BlendModesSettings.correctBlendMode(container.blendMode, baseTexture.premultiplyAlpha));

        var gl = renderer.gl;

        var m = container.worldTransform.copyTo(this.tempMatrix);

        m.prepend(renderer.globalUniforms.uniforms.projectionMatrix);

        this.shader.uniforms.translationMatrix = m.toArray(true);

        this.shader.uniforms.uColor = ColorSettings.premultiplyRgba(container.tintRgb,
            container.worldAlpha, this.shader.uniforms.uColor, baseTexture.premultiplyAlpha);

        this.shader.uniforms.uSampler = baseTexture;

        this.renderer.shader.bind(this.shader);

        var updateStatic = false;

        // now lets upload and render the buffers..
        for (var i = 0, j = 0; i < totalChildren; i += batchSize, j += 1)
        {
            var amount = (totalChildren - i);

            if (amount > batchSize)
            {
                amount = batchSize;
            }

            if (j >= buffers.length)
            {
                if (!container.autoResize)
                {
                    break;
                }
                buffers.push(this._generateOneMoreBuffer(container));
            }

            var buffer = buffers[j];

            // we always upload the dynamic
            buffer.uploadDynamic(children, i, amount);

            var bid = container._bufferUpdateIDs[j] || 0;

            updateStatic = updateStatic || (buffer._updateID < bid);
            // we only upload the static content when we have to!
            if (updateStatic)
            {
                buffer._updateID = container._updateID;
                buffer.uploadStatic(children, i, amount);
            }

            // bind the buffer
            renderer.geometry.bind(buffer.geometry);
            gl.drawElements(gl.TRIANGLES, amount * 6, gl.UNSIGNED_SHORT, 0);
        }
    };

    /**
     * Creates one particle buffer for each child in the container we want to render and updates internal properties
     *
     * @param {PIXI.ParticleContainer} container - The container to render using this ParticleRenderer
     * @return {PIXI.ParticleBuffer[]} The buffers
     * @private
     */
    generateBuffers  (container)
    {
        var buffers = [];
        var size = container._maxSize;
        var batchSize = container._batchSize;
        var dynamicPropertyFlags = container._properties;

        for (var i = 0; i < size; i += batchSize)
        {
            buffers.push(new ParticleBuffer(this.properties, dynamicPropertyFlags, batchSize));
        }

        return buffers;
    };

    /**
     * Creates one more particle buffer, because container has autoResize feature
     *
     * @param {PIXI.ParticleContainer} container - The container to render using this ParticleRenderer
     * @return {PIXI.ParticleBuffer} generated buffer
     * @private
     */
    _generateOneMoreBuffer  (container)
    {
        var batchSize = container._batchSize;
        var dynamicPropertyFlags = container._properties;

        return new ParticleBuffer(this.properties, dynamicPropertyFlags, batchSize);
    };

    /**
     * Uploads the vertices.
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their vertices uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */
    uploadVertices  (children, startIndex, amount, array, stride, offset)
    {
        var w0 = 0;
        var w1 = 0;
        var h0 = 0;
        var h1 = 0;

        for (var i = 0; i < amount; ++i)
        {
            var sprite = children[startIndex + i];
            var texture = sprite._texture;
            var sx = sprite.scale.x;
            var sy = sprite.scale.y;
            var trim = texture.trim;
            var orig = texture.orig;

            if (trim)
            {
                // if the sprite is trimmed and is not a tilingsprite then we need to add the
                // extra space before transforming the sprite coords..
                w1 = trim.x - (sprite.anchor.x * orig.width);
                w0 = w1 + trim.width;

                h1 = trim.y - (sprite.anchor.y * orig.height);
                h0 = h1 + trim.height;
            }
            else
            {
                w0 = (orig.width) * (1 - sprite.anchor.x);
                w1 = (orig.width) * -sprite.anchor.x;

                h0 = orig.height * (1 - sprite.anchor.y);
                h1 = orig.height * -sprite.anchor.y;
            }

            array[offset] = w1 * sx;
            array[offset + 1] = h1 * sy;

            array[offset + stride] = w0 * sx;
            array[offset + stride + 1] = h1 * sy;

            array[offset + (stride * 2)] = w0 * sx;
            array[offset + (stride * 2) + 1] = h0 * sy;

            array[offset + (stride * 3)] = w1 * sx;
            array[offset + (stride * 3) + 1] = h0 * sy;

            offset += stride * 4;
        }
    };

    /**
     * Uploads the position.
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their positions uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */
    uploadPosition  (children, startIndex, amount, array, stride, offset)
    {
        for (var i = 0; i < amount; i++)
        {
            var spritePosition = children[startIndex + i].position;

            array[offset] = spritePosition.x;
            array[offset + 1] = spritePosition.y;

            array[offset + stride] = spritePosition.x;
            array[offset + stride + 1] = spritePosition.y;

            array[offset + (stride * 2)] = spritePosition.x;
            array[offset + (stride * 2) + 1] = spritePosition.y;

            array[offset + (stride * 3)] = spritePosition.x;
            array[offset + (stride * 3) + 1] = spritePosition.y;

            offset += stride * 4;
        }
    };

    /**
     * Uploads the rotiation.
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their rotation uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */
    uploadRotation  (children, startIndex, amount, array, stride, offset)
    {
        for (var i = 0; i < amount; i++)
        {
            var spriteRotation = children[startIndex + i].rotation;

            array[offset] = spriteRotation;
            array[offset + stride] = spriteRotation;
            array[offset + (stride * 2)] = spriteRotation;
            array[offset + (stride * 3)] = spriteRotation;

            offset += stride * 4;
        }
    };

    /**
     * Uploads the Uvs
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their rotation uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */
    uploadUvs  (children, startIndex, amount, array, stride, offset)
    {
        for (var i = 0; i < amount; ++i)
        {
            var textureUvs = children[startIndex + i]._texture._uvs;

            if (textureUvs)
            {
                array[offset] = textureUvs.x0;
                array[offset + 1] = textureUvs.y0;

                array[offset + stride] = textureUvs.x1;
                array[offset + stride + 1] = textureUvs.y1;

                array[offset + (stride * 2)] = textureUvs.x2;
                array[offset + (stride * 2) + 1] = textureUvs.y2;

                array[offset + (stride * 3)] = textureUvs.x3;
                array[offset + (stride * 3) + 1] = textureUvs.y3;

                offset += stride * 4;
            }
            else
            {
                // TODO you know this can be easier!
                array[offset] = 0;
                array[offset + 1] = 0;

                array[offset + stride] = 0;
                array[offset + stride + 1] = 0;

                array[offset + (stride * 2)] = 0;
                array[offset + (stride * 2) + 1] = 0;

                array[offset + (stride * 3)] = 0;
                array[offset + (stride * 3) + 1] = 0;

                offset += stride * 4;
            }
        }
    };

    /**
     * Uploads the tint.
     *
     * @param {PIXI.DisplayObject[]} children - the array of display objects to render
     * @param {number} startIndex - the index to start from in the children array
     * @param {number} amount - the amount of children that will have their rotation uploaded
     * @param {number[]} array - The vertices to upload.
     * @param {number} stride - Stride to use for iteration.
     * @param {number} offset - Offset to start at.
     */
    uploadTint (children, startIndex, amount, array, stride, offset)
    {
        for (var i = 0; i < amount; ++i)
        {
            var sprite = children[startIndex + i];
            var premultiplied = sprite._texture.baseTexture.premultiplyAlpha;
            var alpha = sprite.alpha;
            // we dont call extra function if alpha is 1.0, that's faster
            var argb = alpha < 1.0 && premultiplied ? ColorSettings.premultiplyTint(sprite._tintRGB, alpha)
                : sprite._tintRGB + (alpha * 255 << 24);

            array[offset] = argb;
            array[offset + stride] = argb;
            array[offset + (stride * 2)] = argb;
            array[offset + (stride * 3)] = argb;

            offset += stride * 4;
        }
    };

    /**
     * Destroys the ParticleRenderer.
     */
    destroy ()
    {
        super.destroy();

        if (this.shader)
        {
            this.shader.destroy();
            this.shader = null;
        }

        this.tempMatrix = null;
    };
}
