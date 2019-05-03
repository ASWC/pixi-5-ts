import { System } from "./System";
import { BaseTexture } from "./BaseTexture";
import { GLTexture } from "./GLTexture";
import { UtilsSettings } from './UtilsSettings';
import { WebGLSettings } from './WebGLSettings';


export class TextureSystem extends System
{
    gl
    boundTextures
    CONTEXT_UID
    currentLocation
    _unknownBoundTextures
    unknownTexture
    emptyTextures
    webGLVersion
    managedTextures
    constructor(renderer)
    {
        
        super(renderer);
        // TODO set to max textures...
        /**
         * Bound textures
         * @member {PIXI.BaseTexture[]}
         * @readonly
         */
        this.boundTextures = [];
        /**
         * Current location
         * @member {number}
         * @readonly
         */
        this.currentLocation = -1;

        /**
         * List of managed textures
         * @member {PIXI.BaseTexture[]}
         * @readonly
         */
        this.managedTextures = [];

        /**
         * Did someone temper with textures state? We'll overwrite them when we need to unbind something.
         * @member {boolean}
         * @private
         */
        this._unknownBoundTextures = false;

        /**
         * BaseTexture value that shows that we don't know what is bound
         * @member {PIXI.BaseTexture}
         * @readonly
         */
        this.unknownTexture = new BaseTexture();
    }

    /**
     * Sets up the renderer context and necessary buffers.
     */
    contextChange ()
    {
        var gl = this.gl = this.renderer.gl;

        this.CONTEXT_UID = this.renderer.CONTEXT_UID;

        this.webGLVersion = this.renderer.context.webGLVersion;

        var maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

        this.boundTextures.length = maxTextures;

        for (var i = 0; i < maxTextures; i++)
        {
            this.boundTextures[i] = null;
        }

        // TODO move this.. to a nice make empty textures class..
        this.emptyTextures = {};

        var emptyTexture2D = new GLTexture(gl.createTexture());

        gl.bindTexture(gl.TEXTURE_2D, emptyTexture2D.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));

        this.emptyTextures[gl.TEXTURE_2D] = emptyTexture2D;
        this.emptyTextures[gl.TEXTURE_CUBE_MAP] = new GLTexture(gl.createTexture());

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyTextures[gl.TEXTURE_CUBE_MAP].texture);

        for (var i$1 = 0; i$1 < 6; i$1++)
        {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i$1, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        for (var i$2 = 0; i$2 < this.boundTextures.length; i$2++)
        {
            this.bind(null, i$2);
        }
    };

    /**
     * Bind a texture to a specific location
     *
     * If you want to unbind something, please use `unbind(texture)` instead of `bind(null, textureLocation)`
     *
     * @param {PIXI.Texture|PIXI.BaseTexture} texture - Texture to bind
     * @param {number} [location=0] - Location to bind at
     */
    bind  (texture, location = 0)
    {
        var ref = this;
        var gl = ref.gl;

        if (texture)
        {
            texture = texture.baseTexture || texture;

            if (texture.valid)
            {
                texture.touched = this.renderer.textureGC.count;

                var glTexture = texture._glTextures[this.CONTEXT_UID] || this.initTexture(texture);

                if (this.currentLocation !== location)
                {
                    this.currentLocation = location;
                    gl.activeTexture(gl.TEXTURE0 + location);
                }

                if (this.boundTextures[location] !== texture)
                {
                    gl.bindTexture(texture.target, glTexture.texture);
                }

                if (glTexture.dirtyId !== texture.dirtyId)
                {
                    this.updateTexture(texture);
                }

                this.boundTextures[location] = texture;
            }
        }
        else
        {
            if (this.currentLocation !== location)
            {
                this.currentLocation = location;
                gl.activeTexture(gl.TEXTURE0 + location);
            }

            gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[gl.TEXTURE_2D].texture);
            this.boundTextures[location] = null;
        }
    };

    /**
     * Resets texture location and bound textures
     *
     * Actual `bind(null, i)` calls will be performed at next `unbind()` call
     */
    reset  ()
    {
        this._unknownBoundTextures = true;
        this.currentLocation = -1;

        for (var i = 0; i < this.boundTextures.length; i++)
        {
            this.boundTextures[i] = this.unknownTexture;
        }
    };

    /**
     * Unbind a texture
     * @param {PIXI.Texture|PIXI.BaseTexture} texture - Texture to bind
     */
    unbind  (texture)
    {
        var ref = this;
        var gl = ref.gl;
        var boundTextures = ref.boundTextures;

        if (this._unknownBoundTextures)
        {
            this._unknownBoundTextures = false;
            // someone changed webGL state,
            // we have to be sure that our texture does not appear in multi-texture renderer samplers
            for (var i = 0; i < boundTextures.length; i++)
            {
                if (boundTextures[i] === this.unknownTexture)
                {
                    this.bind(null, i);
                }
            }
        }

        for (var i$1 = 0; i$1 < boundTextures.length; i$1++)
        {
            if (boundTextures[i$1] === texture)
            {
                if (this.currentLocation !== i$1)
                {
                    gl.activeTexture(gl.TEXTURE0 + i$1);
                    this.currentLocation = i$1;
                }

                gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[texture.target].texture);
                boundTextures[i$1] = null;
            }
        }
    };

    /**
     * Initialize a texture
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to initialize
     */
    initTexture(texture)
    {
        var glTexture = new GLTexture(this.gl.createTexture());

        // guarantee an update..
        glTexture.dirtyId = -1;

        texture._glTextures[this.CONTEXT_UID] = glTexture;

        this.managedTextures.push(texture);
        // texture.on('dispose', this.destroyTexture, this);

        return glTexture;
    };

    /**
     * Update a texture
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to initialize
     */
    updateTexture (texture)
    {
        var glTexture = texture._glTextures[this.CONTEXT_UID];
        var renderer = this.renderer;

        
        if(texture.resource && texture.resource.canUpload)
        {
            texture.resource.upload(renderer, texture, glTexture) 
        }
        // if (texture.resource && texture.resource.upload(renderer, texture, glTexture))
        else if (texture.resource && this.uploadTexture(renderer, texture, glTexture, texture.resource))
        {         
           
        }
        else
        {
            // default, renderTexture-like logic
            var width = texture.realWidth;
            var height = texture.realHeight;
            var gl = renderer.gl;

            if (glTexture.width !== width
                || glTexture.height !== height
                || glTexture.dirtyId < 0)
            {
                glTexture.width = width;
                glTexture.height = height;

                gl.texImage2D(texture.target, 0,
                    texture.format,
                    width,
                    height,
                    0,
                    texture.format,
                    texture.type,
                    null);
            }
        }

        
        // lets only update what changes..
        if (texture.dirtyStyleId !== glTexture.dirtyStyleId)
        {
            this.updateTextureStyle(texture);
        }
        glTexture.dirtyId = texture.dirtyId;
    };

    uploadTexture (renderer, baseTexture, glTexture, source)
    {
        var gl = renderer.gl;
        var width = baseTexture.realWidth;
        var height = baseTexture.realHeight;

        // source = source || this.source;

        if(source.constructor['name'] == "CanvasResource")
        {
            source = source.source
        }
        else if(source.constructor['name'] == "ImageResource")
        {
            source = source.source
        }
        else if(source.constructor['name'] == "VideoResource")
        {
            source = source.source
        }
        // else if(source.constructor['name'] == "GradientResource")
        // {
        //     if(!source.source)
        //     {
        //         return
        //     }

        //     source = source.source
      
        // }
        else
        {
            
        }
        

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.premultiplyAlpha);

        if (baseTexture.target === gl.TEXTURE_2D && glTexture.width === width && glTexture.height === height)
        {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, baseTexture.format, baseTexture.type, source);
        }
        else
        {
            glTexture.width = width;
            glTexture.height = height;

            gl.texImage2D(baseTexture.target, 0, baseTexture.format, baseTexture.format, baseTexture.type, source);
        }
        return true;
    };

    /**
     * Deletes the texture from WebGL
     *
     * @private
     * @param {PIXI.BaseTexture|PIXI.Texture} texture - the texture to destroy
     * @param {boolean} [skipRemove=false] - Whether to skip removing the texture from the TextureManager.
     */
    destroyTexture  (texture, skipRemove = false)
    {
        var ref = this;
        var gl = ref.gl;

        texture = texture.baseTexture || texture;

        if (texture._glTextures[this.renderer.CONTEXT_UID])
        {
            this.unbind(texture);

            gl.deleteTexture(texture._glTextures[this.renderer.CONTEXT_UID].texture);
            // texture.off('dispose', this.destroyTexture, this);

            delete texture._glTextures[this.renderer.CONTEXT_UID];

            if (!skipRemove)
            {
                var i = this.managedTextures.indexOf(texture);

                if (i !== -1)
                {
                    UtilsSettings.removeItems(this.managedTextures, i, 1);
                }
            }
        }
    };

    /**
     * Update texture style such as mipmap flag
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to update
     */
    updateTextureStyle (texture)
    {
        var glTexture = texture._glTextures[this.CONTEXT_UID];

        if (!glTexture)
        {
            return;
        }

        if ((texture.mipmap === WebGLSettings.MIPMAP_MODES.POW2 || this.webGLVersion !== 2) && !texture.isPowerOfTwo)
        {
            glTexture.mipmap = 0;
            glTexture.wrapMode = WebGLSettings.WRAP_MODES.CLAMP;
        }
        else
        {
            glTexture.mipmap = texture.mipmap >= 1;
            glTexture.wrapMode = texture.wrapMode;
        }

        // if (texture.resource && texture.resource.style(this.renderer, texture, glTexture))
        // { ; }
        // else
        // {
            this.setStyle(texture, glTexture);
        // }

        glTexture.dirtyStyleId = texture.dirtyStyleId;
    };

    /**
     * Set style for texture
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to update
     * @param {glTexture} glTexture
     */
    setStyle  (texture, glTexture)
    {
        var gl = this.gl;

        if (glTexture.mipmap)
        {
            gl.generateMipmap(texture.target);
        }

        gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, glTexture.wrapMode);
        gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, glTexture.wrapMode);

        if (glTexture.mipmap)
        {
            /* eslint-disable max-len */
            gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
            /* eslint-disable max-len */
        }
        else
        {
            gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode ? gl.LINEAR : gl.NEAREST);
        }

        gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, texture.scaleMode ? gl.LINEAR : gl.NEAREST);
    };
}

