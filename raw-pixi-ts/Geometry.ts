import { Attribute } from './Attribute';
import { Buffer } from "./Buffer";
import { Runner } from './Runner';
import { AttributesDic } from './Dictionaries';
import { DestroyOptions } from './DestroyOptions';


export class Geometry
{
		/* eslint-disable object-shorthand */
	static map = {
	    Float32Array: Float32Array,
	    Uint32Array: Uint32Array,
	    Int32Array: Int32Array,
	    Uint8Array: Uint8Array,
	};
	static UID$1 = 0;
		/* eslint-disable object-shorthand */
	static map$1 = {
	    Float32Array: Float32Array,
	    Uint32Array: Uint32Array,
	    Int32Array: Int32Array,
	    Uint8Array: Uint8Array,
	    Uint16Array: Uint16Array,
	};
	static byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };
    // Buffer
    buffers
    id
    indexBuffer
    instanceCount
    _size
    instanced
    glVertexArrayObjects
    public attributes:AttributesDic;
    refCount
    disposeRunner
    constructor(buffers = [], attributes:AttributesDic = {})
    {

	    this.buffers = buffers;

	    this.indexBuffer = null;

		this.attributes = attributes;
	

	    /**
	     * A map of renderer IDs to webgl VAOs
	     *
	     * @protected
	     * @type {object}
	     */
	    this.glVertexArrayObjects = {};

	    this.id = Geometry.UID$1++;

	    this.instanced = false;

	    this.instanceCount = 1;

		this._size = null;
		this.disposeRunner = new Runner('disposeGeometry', 2);

	    // this.disposeRunner = new Runner('disposeGeometry', 2);

	    /**
	     * Count of existing (not destroyed) meshes that reference this geometry
	     * @member {boolean}
	     */
	    this.refCount = 0;
    }

    /**
	*
	* Adds an attribute to the geometry
	*
	* @param {String} id - the name of the attribute (matching up to a shader)
	* @param {PIXI.Buffer} [buffer] the buffer that holds the data of the attribute . You can also provide an Array and a buffer will be created from it.
	* @param {Number} [size=0] the size of the attribute. If you have 2 floats per vertex (eg position x and y) this would be 2
	* @param {Boolean} [normalized=false] should the data be normalized.
	* @param {Number} [type=PIXI.TYPES.FLOAT] what type of number is the attribute. Check {PIXI.TYPES} to see the ones available
	* @param {Number} [stride=0] How far apart (in floats) the start of each value is. (used for interleaving data)
	* @param {Number} [start=0] How far into the array to start reading values (used for interleaving data)
	*
	* @return {PIXI.Geometry} returns self, useful for chaining.
	*/
	addAttribute  (id, buffer, size = null, normalized = false, type = null, stride = undefined, start = undefined, instance = undefined)
	{

	    if (!buffer)
	    {
	        throw new Error('You must pass a buffer when creating an attribute');
	    }

	    // check if this is a buffer!
	    if (!buffer.data)
	    {
	        // its an array!
	        if (buffer instanceof Array)
	        {
	            buffer = new Float32Array(buffer);
	        }

	        buffer = new Buffer(buffer);
	    }

	    var ids = id.split('|');

	    if (ids.length > 1)
	    {
	        for (var i = 0; i < ids.length; i++)
	        {
	            this.addAttribute(ids[i], buffer, size, normalized, type);
	        }

	        return this;
	    }

	    var bufferIndex = this.buffers.indexOf(buffer);

	    if (bufferIndex === -1)
	    {
	        this.buffers.push(buffer);
	        bufferIndex = this.buffers.length - 1;
	    }

		this.attributes[id] = new Attribute(bufferIndex, size, normalized, type, stride, start, instance);
		

	    // assuming that if there is instanced data then this will be drawn with instancing!
	    this.instanced = this.instanced || instance;

	    return this;
	};

	/**
	 * returns the requested attribute
	 *
	 * @param {String} id  the name of the attribute required
	 * @return {PIXI.Attribute} the attribute requested.
	 */
	getAttribute  (id)
	{
	    return this.buffers[this.attributes[id].buffer];
	};

	/**
	*
	* Adds an index buffer to the geometry
	* The index buffer contains integers, three for each triangle in the geometry, which reference the various attribute buffers (position, colour, UV coordinates, other UV coordinates, normal, …). There is only ONE index buffer.
	*
	* @param {PIXI.Buffer} [buffer] the buffer that holds the data of the index buffer. You can also provide an Array and a buffer will be created from it.
	* @return {PIXI.Geometry} returns self, useful for chaining.
	*/
	addIndex  (buffer)
	{
	    if (!buffer.data)
	    {
	        // its an array!
	        if (buffer instanceof Array)
	        {
	            buffer = new Uint16Array(buffer);
	        }

	        buffer = new Buffer(buffer);
	    }

	    buffer.index = true;
	    this.indexBuffer = buffer;

	    if (this.buffers.indexOf(buffer) === -1)
	    {
	        this.buffers.push(buffer);
	    }

	    return this;
	};

	/**
	 * returns the index buffer
	 *
	 * @return {PIXI.Buffer} the index buffer.
	 */
	getIndex  ()
	{
	    return this.indexBuffer;
	};

	/**
	 * this function modifies the structure so that all current attributes become interleaved into a single buffer
	 * This can be useful if your model remains static as it offers a little performance boost
	 *
	 * @return {PIXI.Geometry} returns self, useful for chaining.
	 */
	interleave  ()
	{
	    // a simple check to see if buffers are already interleaved..
	    if (this.buffers.length === 1 || (this.buffers.length === 2 && this.indexBuffer)) { return this; }

	    // assume already that no buffers are interleaved
	    var arrays = [];
	    var sizes = [];
	    var interleavedBuffer = new Buffer();
	    var i;

	    for (i in this.attributes)
	    {
	        var attribute = this.attributes[i];

	        var buffer = this.buffers[attribute.buffer];

	        arrays.push(buffer.data);

	        sizes.push((attribute.size * Geometry.byteSizeMap[attribute.type]) / 4);

	        attribute.buffer = 0;
	    }

	    interleavedBuffer.data = Geometry.interleaveTypedArrays(arrays, sizes);

	    for (i = 0; i < this.buffers.length; i++)
	    {
	        if (this.buffers[i] !== this.indexBuffer)
	        {
	            this.buffers[i].destroy();
	        }
	    }

	    this.buffers = [interleavedBuffer];

	    if (this.indexBuffer)
	    {
	        this.buffers.push(this.indexBuffer);
	    }

	    return this;
	};

	getSize  ()
	{
	    for (var i in this.attributes)
	    {
	        var attribute = this.attributes[i];
	        var buffer = this.buffers[attribute.buffer];

	        return buffer.data.length / ((attribute.stride / 4) || attribute.size);
	    }

	    return 0;
	};

	/**
	 * disposes WebGL resources that are connected to this geometry
	 */
	dispose  ()
	{
		// this.disposeRunner.run(this, false);
		this.disposeRunner.run(this, false);
	};

	/**
	 * Destroys the geometry.
	 */
	destroy (options:DestroyOptions = null)
	{
	    this.dispose();

	    this.buffers = null;
	    this.indexBuffer.destroy();

	    this.attributes = null;
	};

	/**
	 * returns a clone of the geometry
	 *
	 * @returns {PIXI.Geometry} a new clone of this geometry
	 */
	clone  ()
	{
	    var geometry = new Geometry();

	    for (var i = 0; i < this.buffers.length; i++)
	    {
	        geometry.buffers[i] = new Buffer(this.buffers[i].data.slice());
	    }

	    for (var i$1 in this.attributes)
	    {
	        var attrib = this.attributes[i$1];

	        geometry.attributes[i$1] = new Attribute(
	            attrib.buffer,
	            attrib.size,
	            attrib.normalized,
	            attrib.type,
	            attrib.stride,
	            attrib.start,
	            attrib.instance
	        );
	    }

	    if (this.indexBuffer)
	    {
	        geometry.indexBuffer = geometry.buffers[this.buffers.indexOf(this.indexBuffer)];
	        geometry.indexBuffer.index = true;
	    }

	    return geometry;
	};

	/**
	 * merges an array of geometries into a new single one
	 * geometry attribute styles must match for this operation to work
	 *
	 * @param {PIXI.Geometry[]} geometries array of geometries to merge
	 * @returns {PIXI.Geometry} shiny new geometry!
	 */
	static merge  (geometries)
	{
	    // todo add a geometry check!
	    // also a size check.. cant be too big!]

	    var geometryOut = new Geometry();

	    var arrays = [];
	    var sizes = [];
	    var offsets = [];

	    var geometry;

	    // pass one.. get sizes..
	    for (var i = 0; i < geometries.length; i++)
	    {
	        geometry = geometries[i];

	        for (var j = 0; j < geometry.buffers.length; j++)
	        {
	            sizes[j] = sizes[j] || 0;
	            sizes[j] += geometry.buffers[j].data.length;
	            offsets[j] = 0;
	        }
	    }

	    // build the correct size arrays..
	    for (var i$1 = 0; i$1 < geometry.buffers.length; i$1++)
	    {
	        // TODO types!
	        arrays[i$1] = new Geometry.map$1[Geometry.getBufferType(geometry.buffers[i$1].data)](sizes[i$1]);
	        geometryOut.buffers[i$1] = new Buffer(arrays[i$1]);
	    }

	    // pass to set data..
	    for (var i$2 = 0; i$2 < geometries.length; i$2++)
	    {
	        geometry = geometries[i$2];

	        for (var j$1 = 0; j$1 < geometry.buffers.length; j$1++)
	        {
	            arrays[j$1].set(geometry.buffers[j$1].data, offsets[j$1]);
	            offsets[j$1] += geometry.buffers[j$1].data.length;
	        }
	    }

	    geometryOut.attributes = geometry.attributes;

	    if (geometry.indexBuffer)
	    {
	        geometryOut.indexBuffer = geometryOut.buffers[geometry.buffers.indexOf(geometry.indexBuffer)];
	        geometryOut.indexBuffer.index = true;

	        var offset = 0;
	        var stride = 0;
	        var offset2 = 0;
	        var bufferIndexToCount = 0;

	        // get a buffer
	        for (var i$3 = 0; i$3 < geometry.buffers.length; i$3++)
	        {
	            if (geometry.buffers[i$3] !== geometry.indexBuffer)
	            {
	                bufferIndexToCount = i$3;
	                break;
	            }
	        }

	        // figure out the stride of one buffer..
	        for (var i$4 in geometry.attributes)
	        {
	            var attribute = geometry.attributes[i$4];

	            if ((attribute.buffer | 0) === bufferIndexToCount)
	            {
	                stride += ((attribute.size * Geometry.byteSizeMap[attribute.type]) / 4);
	            }
	        }

	        // time to off set all indexes..
	        for (var i$5 = 0; i$5 < geometries.length; i$5++)
	        {
	            var indexBufferData = geometries[i$5].indexBuffer.data;

	            for (var j$2 = 0; j$2 < indexBufferData.length; j$2++)
	            {
	                geometryOut.indexBuffer.data[j$2 + offset2] += offset;
	            }

	            offset += geometry.buffers[bufferIndexToCount].data.length / (stride);
	            offset2 += indexBufferData.length;
	        }
	    }

	    return geometryOut;
	};

	static getBufferType(array)
	{
	    if (array.BYTES_PER_ELEMENT === 4)
	    {
	        if (array instanceof Float32Array)
	        {
	            return 'Float32Array';
	        }
	        else if (array instanceof Uint32Array)
	        {
	            return 'Uint32Array';
	        }

	        return 'Int32Array';
	    }
	    else if (array.BYTES_PER_ELEMENT === 2)
	    {
	        if (array instanceof Uint16Array)
	        {
	            return 'Uint16Array';
	        }
	    }
	    else if (array.BYTES_PER_ELEMENT === 1)
	    {
	        if (array instanceof Uint8Array)
	        {
	            return 'Uint8Array';
	        }
	    }

	    // TODO map out the rest of the array elements!
	    return null;
	}

	static interleaveTypedArrays(arrays, sizes)
	{
	    var outSize = 0;
	    var stride = 0;
	    var views = {};

	    for (var i = 0; i < arrays.length; i++)
	    {
	        stride += sizes[i];
	        outSize += arrays[i].length;
	    }

	    var buffer = new ArrayBuffer(outSize * 4);

	    var out = null;
	    var littleOffset = 0;

	    for (var i$1 = 0; i$1 < arrays.length; i$1++)
	    {
	        var size = sizes[i$1];
	        var array = arrays[i$1];

	        var type = Geometry.getBufferType(array);

	        if (!views[type])
	        {
	            views[type] = new Geometry.map[type](buffer);
	        }

	        out = views[type];

	        for (var j = 0; j < array.length; j++)
	        {
	            var indexStart = ((j / size | 0) * stride) + littleOffset;
	            var index = j % size;

	            out[indexStart + index] = array[j];
	        }

	        littleOffset += size;
	    }

	    return new Float32Array(buffer);
	}
}

