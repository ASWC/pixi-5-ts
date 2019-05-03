import { ObjectRenderer } from "./ObjectRenderer";
import { BatchGeometry } from "./BatchGeometry";
import { BaseTexture } from "./BaseTexture";
import { BatchDrawCall } from "./BatchDrawCall";
import { State } from "./State";
import { BatchBuffer } from './BatchBuffer';
import { ColorSettings } from './ColorSettings';
import { WebGLSettings } from './WebGLSettings';
import { BlendModesSettings } from './BlendModesSettings';
import { MathSettings } from './MathSettings';
import { DisplaySettings } from './DisplaySettings';


export class BatchRenderer extends ObjectRenderer
{
    vertSize
    vertByteSize
    shader
    onlySprites
    currentIndexSize
    attributeBuffers
    vaoMax
    elements
    iBuffers
    aBuffers
    indexBuffer
    indices
    sprites
    vertexCount
    groups
    state
    public vaos:BatchGeometry[];
    currentIndex
    currentSize
    MAX_TEXTURES
    size
    constructor(renderer)
    {
        super(renderer);
        /**
         * Number of values sent in the vertex buffer.
         * aVertexPosition(2), aTextureCoord(1), aColor(1), aTextureId(1) = 5
         *
         * @member {number}
         */
        this.vertSize = 6;

        /**
         * The size of the vertex information in bytes.
         *
         * @member {number}
         */
        this.vertByteSize = this.vertSize * 4;

        /**
         * The number of images in the SpriteRenderer before it flushes.
         *
         * @member {number}
         */
        this.size = 2000 * 4;// settings.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop

        this.currentSize = 0;
        this.currentIndexSize = 0;

        // the total number of bytes in our batch
        // let numVerts = this.size * 4 * this.vertByteSize;

        this.attributeBuffers = {};
        this.aBuffers = {};
        this.iBuffers = {};

        //     this.defualtSpriteIndexBuffer = new Buffer(createIndicesForQuads(this.size), true, true);

        /**
         * Holds the defualt indices of the geometry (quads) to draw
         *
         * @member {Uint16Array}
         */
        // const indicies = createIndicesForQuads(this.size);

        //  this.defaultQuadIndexBuffer = new Buffer(indicies, true, true);

        this.onlySprites = false;

        /**
         * The default shaders that is used if a sprite doesn't have a more specific one.
         * there is a shader for each number of textures that can be rendered.
         * These shaders will also be generated on the fly as required.
         * @member {PIXI.Shader[]}
         */
        this.shader = null;

        this.currentIndex = 0;
        this.groups = [];

        for (var k = 0; k < this.size / 4; k++)
        {
            this.groups[k] = new BatchDrawCall();
        }

        this.elements = [];

        this.vaos = [];

        this.vaoMax = 2;
        this.vertexCount = 0;

        this.renderer.addEventListener("prerender", this.onPrerender)

        // this.renderer.on('prerender', this.onPrerender, this);
        this.state = State.for2d();
    }

    /**
     * Sets up the renderer context and necessary buffers.
     */
    contextChange ()
    {
        var gl = this.renderer.gl;

        if (DisplaySettings.PREFER_ENV === DisplaySettings.ENV.WEBGL_LEGACY)
        {
            this.MAX_TEXTURES = 1;
        }
        else
        {
            // step 1: first check max textures the GPU can handle.
            this.MAX_TEXTURES = Math.min(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), WebGLSettings.SPRITE_MAX_TEXTURES);

            // step 2: check the maximum number of if statements the shader can have too..
            this.MAX_TEXTURES = WebGLSettings.checkMaxIfStatementsInShader(this.MAX_TEXTURES, gl);
        }

        // generate generateMultiTextureProgram, may be a better move?
        this.shader = WebGLSettings.generateMultiTextureShader(gl, this.MAX_TEXTURES);

        // we use the second shader as the first one depending on your browser may omit aTextureId
        // as it is not used by the shader so is optimized out.
        for (var i = 0; i < this.vaoMax; i++)
        {
            /* eslint-disable max-len */
            this.vaos[i] = new BatchGeometry();
        }
    };

    /**
     * Called before the renderer starts rendering.
     *
     */
    public onPrerender = (event:Event)=>
    {
        this.vertexCount = 0;
    };

    /**
     * Renders the sprite object.
     *
     * @param {PIXI.Sprite} sprite - the sprite to render when using this spritebatch
     */
    render  (element)
    {
        if (!element._texture.valid)
        {
            return;
        }

        


        if (this.currentSize + (element.vertexData.length / 2) > this.size)
        {
            this.flush();
        }

        this.elements[this.currentIndex++] = element;


        this.currentSize += element.vertexData.length / 2;

        this.currentIndexSize += element.indices.length;

    };

    getIndexBuffer(size)
    {
        // 12 indices is enough for 2 quads
        var roundedP2 = MathSettings.nextPow2(Math.ceil(size / 12));
        var roundedSizeIndex = MathSettings.log2(roundedP2);
        var roundedSize = roundedP2 * 12;

        if (this.iBuffers.length <= roundedSizeIndex)
        {
            this.iBuffers.length = roundedSizeIndex + 1;
        }

        var buffer = this.iBuffers[roundedSizeIndex];

        if (!buffer)
        {
            this.iBuffers[roundedSizeIndex] = buffer = new Uint16Array(roundedSize);
        }

        return buffer;
    };

    getAttributeBuffer (size)
    {
        // 8 vertices is enough for 2 quads
        var roundedP2 = MathSettings.nextPow2(Math.ceil(size / 8));
        var roundedSizeIndex = MathSettings.log2(roundedP2);
        var roundedSize = roundedP2 * 8;

        if (this.aBuffers.length <= roundedSizeIndex)
        {
            this.iBuffers.length = roundedSizeIndex + 1;
        }

        var buffer = this.aBuffers[roundedSize];

        if (!buffer)
        {
            this.aBuffers[roundedSize] = buffer = new BatchBuffer(roundedSize * this.vertByteSize);
        }

        return buffer;
    };

    /**
     * Renders the content and empties the current batch.
     *
     */
    flush  ()
    {
        if (this.currentSize === 0)
        {
            return;
        }

        

        var gl = this.renderer.gl;
       



        var MAX_TEXTURES = this.MAX_TEXTURES;
  

        var buffer = this.getAttributeBuffer(this.currentSize);
        


        var indexBuffer = this.getIndexBuffer(this.currentIndexSize);

        var elements = this.elements;
        
        var groups = this.groups;
        

        var float32View = buffer.float32View;
      
        var uint32View = buffer.uint32View;
       

        var touch = this.renderer.textureGC.count;
        

        var index = 0;
        var indexCount = 0;
        var nextTexture;
        var currentTexture;
        var groupCount = 0;

        var textureCount = 0;
        var currentGroup = groups[0];
        

        var blendMode = -1;// premultiplyBlendMode[elements[0]._texture.baseTexture.premultiplyAlpha ? 0 : ][elements[0].blendMode];

        currentGroup.textureCount = 0;
        currentGroup.start = 0;
        currentGroup.blend = blendMode;

        var TICK = ++BaseTexture._globalBatch;

       

        var i;

        

        for (i = 0; i < this.currentIndex; ++i)
        {
            // upload the sprite elements...
            // they have all ready been calculated so we just need to push them into the buffer.

            var sprite = elements[i];
            

            elements[i] = null;

            nextTexture = sprite._texture.baseTexture;
            

            var spriteBlendMode = BlendModesSettings.premultiplyBlendMode[nextTexture.premultiplyAlpha ? 1 : 0][sprite.blendMode];

           

            if (blendMode !== spriteBlendMode)
            {
                blendMode = spriteBlendMode;

                // force the batch to break!
                currentTexture = null;
                textureCount = MAX_TEXTURES;
                TICK++;
            }

            if (currentTexture !== nextTexture)
            {
               
                currentTexture = nextTexture;

                if (nextTexture._batchEnabled !== TICK)
                {
                    
                    if (textureCount === MAX_TEXTURES)
                    {
                       
                        TICK++;

                        textureCount = 0;

                        currentGroup.size = indexCount - currentGroup.start;

                        currentGroup = groups[groupCount++];
                        currentGroup.textureCount = 0;
                        currentGroup.blend = blendMode;
                        currentGroup.start = indexCount;
                        
                    }

                    nextTexture.touched = touch;
                    nextTexture._batchEnabled = TICK;
                    nextTexture._id = textureCount;

                    currentGroup.textures[currentGroup.textureCount++] = nextTexture;
                    
                    textureCount++;
                }
            }


            this.packGeometry(sprite, float32View, uint32View, indexBuffer, index, indexCount);// argb, nextTexture._id, float32View, uint32View, indexBuffer, index, indexCount);

            // HERE 


            // push a graphics..
            index += (sprite.vertexData.length / 2) * this.vertSize;
            indexCount += sprite.indices.length;
        }

        BaseTexture._globalBatch = TICK;

        currentGroup.size = indexCount - currentGroup.start;

     

        //        this.indexBuffer.update();

        if (!WebGLSettings.CAN_UPLOAD_SAME_BUFFER)
        {
            // this is still needed for IOS performance..
            // it really does not like uploading to the same buffer in a single frame!
            if (this.vaoMax <= this.vertexCount)
            {
                this.vaoMax++;
                /* eslint-disable max-len */
                this.vaos[this.vertexCount] = new BatchGeometry();
            }

            this.vaos[this.vertexCount]._buffer.update(buffer.vertices, 0);
            this.vaos[this.vertexCount]._indexBuffer.update(indexBuffer, 0);

            //   this.vertexBuffers[this.vertexCount].update(buffer.vertices, 0);
            this.renderer.geometry.bind(this.vaos[this.vertexCount]);

            this.renderer.geometry.updateBuffers();

            this.vertexCount++;
        }
        else
        {
            // lets use the faster option, always use buffer number 0
            this.vaos[this.vertexCount]._buffer.update(buffer.vertices, 0);
            this.vaos[this.vertexCount]._indexBuffer.update(indexBuffer, 0);

            //   if (true)// this.spriteOnly)
            // {
            // this.vaos[this.vertexCount].indexBuffer = this.defualtSpriteIndexBuffer;
            // this.vaos[this.vertexCount].buffers[1] = this.defualtSpriteIndexBuffer;
            // }
 

            // this.vaos[0].attributes.aColor.stride = 24
            // this.vaos[0].attributes.aColor.start = 16
            // NOT SET
  
            // this.vaos[0].attributes.aTextureCoord.stride = 24
            // this.vaos[0].attributes.aTextureCoord.start = 8
            // NOT SET

            // this.vaos[0].attributes.aVertexPosition.stride = 24
            // NOT SET

            this.renderer.geometry.updateBuffers();   
            

            //    
        }

        //   this.renderer.state.set(this.state);

        var textureSystem = this.renderer.texture;
       
        var stateSystem = this.renderer.state;
        
        // e.log(groupCount);
        // / render the groups..



        for (i = 0; i < groupCount; i++)
        {
            var group = groups[i];
            
            var groupTextureCount = group.textureCount;

            for (var j = 0; j < groupTextureCount; j++)
            {
                textureSystem.bind(group.textures[j], j);

               

                group.textures[j] = null;
            }

            // this.state.blendMode = group.blend;
            // this.state.blend = true;

            // this.renderer.state.setState(this.state);
            // set the blend mode..
            stateSystem.setBlendMode(group.blend);
            gl.drawElements(group.type, group.size, gl.UNSIGNED_SHORT, group.start * 2);
        }

        // reset elements for the next flush
        this.currentIndex = 0;
        this.currentSize = 0;
        this.currentIndexSize = 0;
    };

    packGeometry  (element, float32View, uint32View, indexBuffer, index, indexCount)
    {

        var p = index / this.vertSize;// float32View.length / 6 / 2;
        var uvs = element.uvs;
        var indicies = element.indices;// geometry.getIndex().data;// indicies;
        var vertexData = element.vertexData;
        var textureId = element._texture.baseTexture._id;

        var alpha = Math.min(element.worldAlpha, 1.0);

        var argb = alpha < 1.0 && element._texture.baseTexture.premultiplyAlpha ? ColorSettings.premultiplyTint(element._tintRGB, alpha)
            : element._tintRGB + (alpha * 255 << 24);

        // lets not worry about tint! for now..
        for (var i = 0; i < vertexData.length; i += 2)
        {
            float32View[index++] = vertexData[i];
            float32View[index++] = vertexData[i + 1];
            float32View[index++] = uvs[i];
            float32View[index++] = uvs[i + 1];
            uint32View[index++] = argb;
            float32View[index++] = textureId;
        }

        for (var i$1 = 0; i$1 < indicies.length; i$1++)
        {
            indexBuffer[indexCount++] = p + indicies[i$1];
        }

        
    };
 
    /**
     * Starts a new sprite batch.
     */
    start  ()
    {
        this.renderer.state.setState(this.state);

        this.renderer.shader.bind(this.shader);

        if (WebGLSettings.CAN_UPLOAD_SAME_BUFFER)
        {
            // bind buffer #0, we don't need others
            this.renderer.geometry.bind(this.vaos[this.vertexCount]);
        }
    };

    /**
     * Stops and flushes the current batch.
     *
     */
    stop  ()
    {
        this.flush();
    };

    /**
     * Destroys the SpriteRenderer.
     *
     */
    destroy  ()
    {
        for (var i = 0; i < this.vaoMax; i++)
        {
            // if (this.vertexBuffers[i])
            // {
            //     this.vertexBuffers[i].destroy();
            // }
            if (this.vaos[i])
            {
                this.vaos[i].destroy(null);
            }
        }

        if (this.indexBuffer)
        {
            this.indexBuffer.destroy();
        }

        this.renderer.removeEventListener('prerender', this.onPrerender);

        if (this.shader)
        {
            this.shader.destroy();
            this.shader = null;
        }

        // this.vertexBuffers = null;
        this.vaos = null;
        this.indexBuffer = null;
        this.indices = null;
        this.sprites = null;

        // for (let i = 0; i < this.buffers.length; ++i)
        // {
        //     this.buffers[i].destroy();
        // }

        super.destroy();
    };
}

