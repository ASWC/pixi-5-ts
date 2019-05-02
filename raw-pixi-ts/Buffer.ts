import { Runner } from './Runner';


export class Buffer
{
	static UID = 0;
    _glBuffers
    _updateID
    index
    static;
    id
	data
	disposeRunner
    constructor(data = null, _static = false, index = null)
    {
        if ( _static === void 0 ) { _static = true; }
	    if ( index === void 0 ) { index = false; }

	    /**
	     * The data in the buffer, as a typed array
	     *
	     * @member {ArrayBuffer| SharedArrayBuffer|ArrayBufferView}
	     */
	    this.data = data || new Float32Array(1);

	    /**
	     * A map of renderer IDs to webgl buffer
	     *
	     * @private
	     * @member {object<number, GLBuffer>}
	     */
	    this._glBuffers = {};

	    this._updateID = 0;

	    this.index = index;

	    this.static = _static;

		this.id = Buffer.UID++;
		this.disposeRunner = new Runner('disposeBuffer', 2);

	    // this.disposeRunner = new Runner('disposeBuffer', 2);
    }

    // TODO could explore flagging only a partial upload?
	/**
	 * flags this buffer as requiring an upload to the GPU
	 */
	update  (data)
	{
	    this.data = data || this.data;
	    this._updateID++;
	};

	/**
	 * disposes WebGL resources that are connected to this geometry
	 */
	dispose  ()
	{
		this.disposeRunner.run(this, false);
	    // this.disposeRunner.run(this, false);
	};

	/**
	 * Destroys the buffer
	 */
	destroy ()
	{
	    this.dispose();

	    this.data = null;
	};

	/**
	 * Helper function that creates a buffer based on an array or TypedArray
	 *
	 * @static
	 * @param {ArrayBufferView | number[]} data the TypedArray that the buffer will store. If this is a regular Array it will be converted to a Float32Array.
	 * @return {PIXI.Buffer} A new Buffer based on the data provided.
	 */
	static from  (data)
	{
	    if (data instanceof Array)
	    {
	        data = new Float32Array(data);
	    }

	    return new Buffer(data);
	};
}

