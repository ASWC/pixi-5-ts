import { System } from "./System";
import { GLBuffer } from './GLBuffer';
import { DisplaySettings } from './DisplaySettings';


export class GeometrySystem extends System
{
    static byteSizeMap$1 = { 5126: 4, 5123: 2, 5121: 1 };
    _activeGeometry
    hasVao
    managedGeometries
    gl
    hasInstance
    CONTEXT_UID
    boundBuffers
    _activeVao
    _boundBuffer
    managedBuffers
    constructor(renderer)
    {
        super(renderer);
        this._activeGeometry = null;
        this._activeVao = null;

        /**
         * `true` if we has `*_vertex_array_object` extension
         * @member {boolean}
         * @readonly
         */
        this.hasVao = true;

        /**
         * `true` if has `ANGLE_instanced_arrays` extension
         * @member {boolean}
         * @readonly
         */
        this.hasInstance = true;

        /**
         * A cache of currently bound buffer,
         * contains only two members with keys ARRAY_BUFFER and ELEMENT_ARRAY_BUFFER
         * @member {Object.<number, PIXI.Buffer>}
         * @readonly
         */
        this.boundBuffers = {};

        /**
         * Cache for all geometries by id, used in case renderer gets destroyed or for profiling
         * @member {object}
         * @readonly
         */
        this.managedGeometries = {};

        /**
         * Cache for all buffers by id, used in case renderer gets destroyed or for profiling
         * @member {object}
         * @readonly
         */
        this.managedBuffers = {};
    }

    /**
     * Sets up the renderer context and necessary buffers.
     */
    contextChange  ()
    {
        this.disposeAll(true);

        var gl = this.gl = this.renderer.gl;

        this.CONTEXT_UID = this.renderer.CONTEXT_UID;

        // webgl2
        if (!gl.createVertexArray)
        {
            // webgl 1!
            var nativeVaoExtension = this.renderer.context.extensions.vertexArrayObject;

            if (DisplaySettings.PREFER_ENV === DisplaySettings.ENV.WEBGL_LEGACY)
            {
                nativeVaoExtension = null;
            }

            if (nativeVaoExtension)
            {
                gl.createVertexArray = function () { return nativeVaoExtension.createVertexArrayOES(); };

                gl.bindVertexArray = function (vao) { return nativeVaoExtension.bindVertexArrayOES(vao); };

                gl.deleteVertexArray = function (vao) { return nativeVaoExtension.deleteVertexArrayOES(vao); };
            }
            else
            {
                this.hasVao = false;
                gl.createVertexArray = function () {
                    // empty
                };

                gl.bindVertexArray = function () {
                    // empty
                };

                gl.deleteVertexArray = function () {
                    // empty
                };
            }
        }

        if (!gl.vertexAttribDivisor)
        {
            var instanceExt = gl.getExtension('ANGLE_instanced_arrays');

            if (instanceExt)
            {
                gl.vertexAttribDivisor = function (a, b) { return instanceExt.vertexAttribDivisorANGLE(a, b); };

                gl.drawElementsInstanced = function (a, b, c, d, e) { return instanceExt.drawElementsInstancedANGLE(a, b, c, d, e); };

                gl.drawArraysInstanced = function (a, b, c, d) { return instanceExt.drawArraysInstancedANGLE(a, b, c, d); };
            }
            else
            {
                this.hasInstance = false;
            }
        }
    };

    /**
     * Binds geometry so that is can be drawn. Creating a Vao if required
     * @protected
     * @param {PIXI.Geometry} geometry instance of geometry to bind
     * @param {PIXI.Shader} shader instance of shader to bind
     */
    bind (geometry, shader = null)
    {
        shader = shader || this.renderer.shader.shader;

        var ref = this;
        var gl = ref.gl;

        // not sure the best way to address this..
        // currently different shaders require different VAOs for the same geometry
        // Still mulling over the best way to solve this one..
        // will likely need to modify the shader attribute locations at run time!
        var vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];

        if (!vaos)
        {
            this.managedGeometries[geometry.id] = geometry;
            // geometry.disposeRunner.add(this);
            geometry.glVertexArrayObjects[this.CONTEXT_UID] = vaos = {};
        }

        var vao = vaos[shader.program.id] || this.initGeometryVao(geometry, shader.program);

        this._activeGeometry = geometry;

        if (this._activeVao !== vao)
        {
            this._activeVao = vao;

            if (this.hasVao)
            {
                gl.bindVertexArray(vao);
            }
            else
            {
                this.activateVao(geometry, shader.program);
            }
        }

        // TODO - optimise later!
        // don't need to loop through if nothing changed!
        // maybe look to add an 'autoupdate' to geometry?
        this.updateBuffers();
    };

    /**
     * Reset and unbind any active VAO and geometry
     */
    reset ()
    {
        this.unbind();
    };

    /**
     * Update buffers
     * @protected
     */
    updateBuffers()
    {
        var geometry = this._activeGeometry;
        
        var ref = this;
        var gl = ref.gl;
       
        for (var i = 0; i < geometry.buffers.length; i++)
        {
            var buffer = geometry.buffers[i];

            var glBuffer = buffer._glBuffers[this.CONTEXT_UID];

            if (buffer._updateID !== glBuffer.updateID)
            {
                glBuffer.updateID = buffer._updateID;

                // TODO can cache this on buffer! maybe added a getter / setter?
                var type = buffer.index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;

                // TODO this could change if the VAO changes...
                // need to come up with a better way to cache..
                // if (this.boundBuffers[type] !== glBuffer)
                // {
                // this.boundBuffers[type] = glBuffer;
                gl.bindBuffer(type, glBuffer.buffer);
                // }

                this._boundBuffer = glBuffer;

                if (glBuffer.byteLength >= buffer.data.byteLength)
                {
                    // offset is always zero for now!
                    gl.bufferSubData(type, 0, buffer.data);
                }
                else
                {
                    var drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;
                    
                    glBuffer.byteLength = buffer.data.byteLength;
                    gl.bufferData(type, buffer.data, drawType);
                }
            }
        }
    };

    /**
     * Check compability between a geometry and a program
     * @protected
     * @param {PIXI.Geometry} geometry - Geometry instance
     * @param {PIXI.Program} program - Program instance
     */
    checkCompatibility (geometry, program)
    {
        // geometry must have at least all the attributes that the shader requires.
        var geometryAttributes = geometry.attributes;
        var shaderAttributes = program.attributeData;

        for (var j in shaderAttributes)
        {
            if (!geometryAttributes[j])
            {
                throw new Error(("shader and geometry incompatible, geometry missing the \"" + j + "\" attribute"));
            }
        }
    };

    /**
     * Takes a geometry and program and generates a unique signature for them.
     *
     * @param {PIXI.Geometry} geometry to get signature from
     * @param {PIXI.Program} program to test geometry against
     * @returns {String} Unique signature of the geometry and program
     * @protected
     */
    getSignature(geometry, program)
    {
        var attribs = geometry.attributes;
        var shaderAttributes = program.attributeData;

        var strings = ['g', geometry.id];

        for (var i in attribs)
        {
            if (shaderAttributes[i])
            {
                strings.push(i);
            }
        }

        return strings.join('-');
    };

    /**
     * Creates or gets Vao with the same structure as the geometry and stores it on the geometry.
     * If vao is created, it is bound automatically.
     *
     * @protected
     * @param {PIXI.Geometry} geometry - Instance of geometry to to generate Vao for
     * @param {PIXI.Program} program - Instance of program
     */
    initGeometryVao (geometry, program)
    {
        this.checkCompatibility(geometry, program);

        var gl = this.gl;
        var CONTEXT_UID = this.CONTEXT_UID;

        var signature = this.getSignature(geometry, program);

        var vaoObjectHash = geometry.glVertexArrayObjects[this.CONTEXT_UID];

        var vao = vaoObjectHash[signature];

        if (vao)
        {
            // this will give us easy access to the vao
            vaoObjectHash[program.id] = vao;

            return vao;
        }

        var buffers = geometry.buffers;
        var attributes = geometry.attributes;
        var tempStride = {};
        var tempStart = {};

        for (var j in buffers)
        {
            tempStride[j] = 0;
            tempStart[j] = 0;
        }

        for (var j$1 in attributes)
        {
            if (!attributes[j$1].size && program.attributeData[j$1])
            {
                attributes[j$1].size = program.attributeData[j$1].size;
            }
            else if (!attributes[j$1].size)
            {
                console.warn(("PIXI Geometry attribute '" + j$1 + "' size cannot be determined (likely the bound shader does not have the attribute)"));  // eslint-disable-line
            }

            tempStride[attributes[j$1].buffer] += attributes[j$1].size * GeometrySystem.byteSizeMap$1[attributes[j$1].type];
        }

        for (var j$2 in attributes)
        {
            var attribute = attributes[j$2];
            var attribSize = attribute.size;

            if (attribute.stride === undefined)
            {
                if (tempStride[attribute.buffer] === attribSize * GeometrySystem.byteSizeMap$1[attribute.type])
                {
                    attribute.stride = 0;
                }
                else
                {
                    attribute.stride = tempStride[attribute.buffer];
                }
            }

            if (attribute.start === undefined)
            {
                attribute.start = tempStart[attribute.buffer];

                tempStart[attribute.buffer] += attribSize * GeometrySystem.byteSizeMap$1[attribute.type];
            }
        }

        vao = gl.createVertexArray();

        gl.bindVertexArray(vao);

        // first update - and create the buffers!
        // only create a gl buffer if it actually gets
        for (var i = 0; i < buffers.length; i++)
        {
            var buffer = buffers[i];

            if (!buffer._glBuffers[CONTEXT_UID])
            {
                buffer._glBuffers[CONTEXT_UID] = new GLBuffer(gl.createBuffer());
                this.managedBuffers[buffer.id] = buffer;
                // buffer.disposeRunner.add(this);
            }

            buffer._glBuffers[CONTEXT_UID].refCount++;
        }

        // TODO - maybe make this a data object?
        // lets wait to see if we need to first!

        this.activateVao(geometry, program);

        this._activeVao = vao;

        // add it to the cache!
        vaoObjectHash[program.id] = vao;
        vaoObjectHash[signature] = vao;

        return vao;
    };

    /**
     * Disposes buffer
     * @param {PIXI.Buffer} buffer buffer with data
     * @param {boolean} [contextLost=false] If context was lost, we suppress deleteVertexArray
     */
    disposeBuffer (buffer, contextLost)
    {
        if (!this.managedBuffers[buffer.id])
        {
            return;
        }

        delete this.managedBuffers[buffer.id];

        var glBuffer = buffer._glBuffers[this.CONTEXT_UID];
        var gl = this.gl;

        // buffer.disposeRunner.remove(this);

        if (!glBuffer)
        {
            return;
        }

        if (!contextLost)
        {
            gl.deleteBuffer(glBuffer.buffer);
        }

        delete buffer._glBuffers[this.CONTEXT_UID];
    };

    /**
     * Disposes geometry
     * @param {PIXI.Geometry} geometry Geometry with buffers. Only VAO will be disposed
     * @param {boolean} [contextLost=false] If context was lost, we suppress deleteVertexArray
     */
    disposeGeometry (geometry, contextLost)
    {
        if (!this.managedGeometries[geometry.id])
        {
            return;
        }

        delete this.managedGeometries[geometry.id];

        var vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];
        var gl = this.gl;
        var buffers = geometry.buffers;

        geometry.disposeRunner.remove(this);

        if (!vaos)
        {
            return;
        }

        for (var i = 0; i < buffers.length; i++)
        {
            var buf = buffers[i]._glBuffers[this.CONTEXT_UID];

            buf.refCount--;
            if (buf.refCount === 0 && !contextLost)
            {
                this.disposeBuffer(buffers[i], contextLost);
            }
        }

        if (!contextLost)
        {
            for (var vaoId in vaos)
            {
                // delete only signatures, everything else are copies
                if (vaoId[0] === 'g')
                {
                    var vao = vaos[vaoId];

                    if (this._activeVao === vao)
                    {
                        this.unbind();
                    }
                    gl.deleteVertexArray(vao);
                }
            }
        }

        delete geometry.glVertexArrayObjects[this.CONTEXT_UID];
    };

    /**
     * dispose all WebGL resources of all managed geometries and buffers
     * @param {boolean} [contextLost=false] If context was lost, we suppress `gl.delete` calls
     */
    disposeAll (contextLost)
    {
        var all = Object.keys(this.managedGeometries);

        for (var i = 0; i < all.length; i++)
        {
            this.disposeGeometry(this.managedGeometries[all[i]], contextLost);
        }
        all = Object.keys(this.managedBuffers);
        for (var i$1 = 0; i$1 < all.length; i$1++)
        {
            this.disposeBuffer(this.managedBuffers[all[i$1]], contextLost);
        }
    };

    /**
     * Activate vertex array object
     *
     * @protected
     * @param {PIXI.Geometry} geometry - Geometry instance
     * @param {PIXI.Program} program - Shader program instance
     */
    activateVao  (geometry, program)
    {
        var gl = this.gl;
        var CONTEXT_UID = this.CONTEXT_UID;
        var buffers = geometry.buffers;
        var attributes = geometry.attributes;

        if (geometry.indexBuffer)
        {
            // first update the index buffer if we have one..
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer._glBuffers[CONTEXT_UID].buffer);
        }

        var lastBuffer = null;

        // add a new one!
        for (var j in attributes)
        {
            var attribute = attributes[j];
            var buffer = buffers[attribute.buffer];
            var glBuffer = buffer._glBuffers[CONTEXT_UID];

            if (program.attributeData[j])
            {
                if (lastBuffer !== glBuffer)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer.buffer);

                    lastBuffer = glBuffer;
                }

                var location = program.attributeData[j].location;

                // TODO introduce state again
                // we can optimise this for older devices that have no VAOs
                gl.enableVertexAttribArray(location);

                gl.vertexAttribPointer(location,
                    attribute.size,
                    attribute.type || gl.FLOAT,
                    attribute.normalized,
                    attribute.stride,
                    attribute.start);

                if (attribute.instance)
                {
                    // TODO calculate instance count based of this...
                    if (this.hasInstance)
                    {
                        gl.vertexAttribDivisor(location, 1);
                    }
                    else
                    {
                        throw new Error('geometry error, GPU Instancing is not supported on this device');
                    }
                }
            }
        }
    };

    /**
     * Draw the geometry
     *
     * @param {Number} type - the type primitive to render
     * @param {Number} [size] - the number of elements to be rendered
     * @param {Number} [start] - Starting index
     * @param {Number} [instanceCount] - the number of instances of the set of elements to execute
     */
    draw  (type, size = -1, start = 0, instanceCount = 1)
    {
        var ref = this;
        var gl = ref.gl;
        var geometry = this._activeGeometry;

        // TODO.. this should not change so maybe cache the function?
        if(size < 0)
        {
            size = geometry.indexBuffer.data.length
        }
        if (geometry.indexBuffer)
        {
            if (geometry.instanced)
            {
                
                /* eslint-disable max-len */
                gl.drawElementsInstanced(type, size || geometry.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2, instanceCount || 1);
                /* eslint-enable max-len */
            }
            else
            {
                gl.drawElements(type, size || geometry.indexBuffer.data.length, gl.UNSIGNED_SHORT, (start || 0) * 2);
            }
        }
        else if (geometry.instanced)
        {
            // TODO need a better way to calculate size..
            gl.drawArraysInstanced(type, start, size || geometry.getSize(), instanceCount || 1);
        }
        else
        {
            gl.drawArrays(type, start, size || geometry.getSize());
        }

        return this;
    };

    /**
     * Unbind/reset everything
     * @protected
     */
    unbind ()
    {
        this.gl.bindVertexArray(null);
        this._activeVao = null;
        this._activeGeometry = null;
    };
}


