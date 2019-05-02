import { Geometry } from "./Geometry";
import { Buffer } from "./Buffer";
import { WebGLSettings } from './WebGLSettings';


export class ParticleBuffer
{
    geometry
    size
    dynamicProperties
    staticProperties
    indexBuffer
    staticStride;
    staticBuffer;
    staticData;
    staticDataUint32;

    dynamicStride;
    dynamicBuffer;
    dynamicData;
    dynamicDataUint32;

    _updateID;
    constructor(properties, dynamicPropertyFlags, size)
    {
        this.geometry = new Geometry();

	    this.indexBuffer = null;

	    /**
	     * The number of particles the buffer can hold
	     *
	     * @private
	     * @member {number}
	     */
	    this.size = size;

	    /**
	     * A list of the properties that are dynamic.
	     *
	     * @private
	     * @member {object[]}
	     */
	    this.dynamicProperties = [];

	    /**
	     * A list of the properties that are static.
	     *
	     * @private
	     * @member {object[]}
	     */
	    this.staticProperties = [];

	    for (var i = 0; i < properties.length; ++i)
	    {
	        var property = properties[i];

	        // Make copy of properties object so that when we edit the offset it doesn't
	        // change all other instances of the object literal
	        property = {
	            attributeName: property.attributeName,
	            size: property.size,
	            uploadFunction: property.uploadFunction,
	            type: property.type || WebGLSettings.TYPES.FLOAT,
	            offset: property.offset,
	        };

	        if (dynamicPropertyFlags[i])
	        {
	            this.dynamicProperties.push(property);
	        }
	        else
	        {
	            this.staticProperties.push(property);
	        }
	    }

	    this.staticStride = 0;
	    this.staticBuffer = null;
	    this.staticData = null;
	    this.staticDataUint32 = null;

	    this.dynamicStride = 0;
	    this.dynamicBuffer = null;
	    this.dynamicData = null;
	    this.dynamicDataUint32 = null;

	    this._updateID = 0;

	    this.initBuffers();
    }

    /**
	 * Sets up the renderer context and necessary buffers.
	 *
	 * @private
	 */
	initBuffers  ()
	{
	    var geometry = this.geometry;

	    var dynamicOffset = 0;

	    /**
	     * Holds the indices of the geometry (quads) to draw
	     *
	     * @member {Uint16Array}
	     * @private
	     */
	    this.indexBuffer = new Buffer(WebGLSettings.createIndicesForQuads(this.size), true, true);
	    geometry.addIndex(this.indexBuffer);

	    this.dynamicStride = 0;

	    for (var i = 0; i < this.dynamicProperties.length; ++i)
	    {
	        var property = this.dynamicProperties[i];

	        property.offset = dynamicOffset;
	        dynamicOffset += property.size;
	        this.dynamicStride += property.size;
	    }

	    var dynBuffer = new ArrayBuffer(this.size * this.dynamicStride * 4 * 4);

	    this.dynamicData = new Float32Array(dynBuffer);
	    this.dynamicDataUint32 = new Uint32Array(dynBuffer);
	    this.dynamicBuffer = new Buffer(this.dynamicData, false, false);

	    // static //
	    var staticOffset = 0;

	    this.staticStride = 0;

	    for (var i$1 = 0; i$1 < this.staticProperties.length; ++i$1)
	    {
	        var property$1 = this.staticProperties[i$1];

	        property$1.offset = staticOffset;
	        staticOffset += property$1.size;
	        this.staticStride += property$1.size;
	    }

	    var statBuffer = new ArrayBuffer(this.size * this.staticStride * 4 * 4);

	    this.staticData = new Float32Array(statBuffer);
	    this.staticDataUint32 = new Uint32Array(statBuffer);
	    this.staticBuffer = new Buffer(this.staticData, true, false);

	    for (var i$2 = 0; i$2 < this.dynamicProperties.length; ++i$2)
	    {
	        var property$2 = this.dynamicProperties[i$2];

	        geometry.addAttribute(
	            property$2.attributeName,
	            this.dynamicBuffer,
	            0,
	            property$2.type === WebGLSettings.TYPES.UNSIGNED_BYTE,
	            property$2.type,
	            this.dynamicStride * 4,
	            property$2.offset * 4
	        );
	    }

	    for (var i$3 = 0; i$3 < this.staticProperties.length; ++i$3)
	    {
	        var property$3 = this.staticProperties[i$3];

	        geometry.addAttribute(
	            property$3.attributeName,
	            this.staticBuffer,
	            0,
	            property$3.type === WebGLSettings.TYPES.UNSIGNED_BYTE,
	            property$3.type,
	            this.staticStride * 4,
	            property$3.offset * 4
	        );
	    }
	};

	/**
	 * Uploads the dynamic properties.
	 *
	 * @private
	 * @param {PIXI.DisplayObject[]} children - The children to upload.
	 * @param {number} startIndex - The index to start at.
	 * @param {number} amount - The number to upload.
	 */
	uploadDynamic  (children, startIndex, amount)
	{
	    for (var i = 0; i < this.dynamicProperties.length; i++)
	    {
	        var property = this.dynamicProperties[i];

	        property.uploadFunction(children, startIndex, amount,
	            property.type === WebGLSettings.TYPES.UNSIGNED_BYTE ? this.dynamicDataUint32 : this.dynamicData,
	            this.dynamicStride, property.offset);
	    }

	    this.dynamicBuffer._updateID++;
	};

	/**
	 * Uploads the static properties.
	 *
	 * @private
	 * @param {PIXI.DisplayObject[]} children - The children to upload.
	 * @param {number} startIndex - The index to start at.
	 * @param {number} amount - The number to upload.
	 */
	uploadStatic  (children, startIndex, amount)
	{
	    for (var i = 0; i < this.staticProperties.length; i++)
	    {
	        var property = this.staticProperties[i];

	        property.uploadFunction(children, startIndex, amount,
	            property.type === WebGLSettings.TYPES.UNSIGNED_BYTE ? this.staticDataUint32 : this.staticData,
	            this.staticStride, property.offset);
	    }

	    this.staticBuffer._updateID++;
	};

	/**
	 * Destroys the ParticleBuffer.
	 *
	 * @private
	 */
	destroy  ()
	{
	    this.indexBuffer = null;

	    this.dynamicProperties = null;
	    // this.dynamicBuffer.destroy();
	    this.dynamicBuffer = null;
	    this.dynamicData = null;
	    this.dynamicDataUint32 = null;

	    this.staticProperties = null;
	    // this.staticBuffer.destroy();
	    this.staticBuffer = null;
	    this.staticData = null;
	    this.staticDataUint32 = null;
	    // all buffers are destroyed inside geometry
	    this.geometry.destroy();
	};
}

