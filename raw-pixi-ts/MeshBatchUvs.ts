
export class MeshBatchUvs
{
    uvBuffer
    uvMatrix
    data
    _bufferUpdateId
    _textureUpdateId
    _updateID
    constructor(uvBuffer, uvMatrix)
    {
/**
	     * Buffer with normalized UV's
	     * @member {PIXI.Buffer}
	     */
	    this.uvBuffer = uvBuffer;

	    /**
	     * Material UV matrix
	     * @member {PIXI.TextureMatrix}
	     */
	    this.uvMatrix = uvMatrix;

	    /**
	     * UV Buffer data
	     * @member {Float32Array}
	     * @readonly
	     */
	    this.data = null;

	    this._bufferUpdateId = -1;

	    this._textureUpdateId = -1;

	    this._updateID = 0;
    }

    /**
	 * updates
	 *
	 * @param {boolean} forceUpdate - force the update
	 */
	update (forceUpdate)
	{
	    if (!forceUpdate
	        && this._bufferUpdateId === this.uvBuffer._updateID
	        && this._textureUpdateId === this.uvMatrix._updateID)
	    {
	        return;
	    }

	    this._bufferUpdateId = this.uvBuffer._updateID;
	    this._textureUpdateId = this.uvMatrix._updateID;

	    var data = this.uvBuffer.data;

	    if (!this.data || this.data.length !== data.length)
	    {
	        this.data = new Float32Array(data.length);
	    }

	    this.uvMatrix.multiplyUvs(data, this.data);

	    this._updateID++;
	};
}

