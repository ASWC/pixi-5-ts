
export class BatchBuffer
{
    vertices
    uint32View
    float32View
    constructor(size)
    {
        this.vertices = new ArrayBuffer(size);

        /**
         * View on the vertices as a Float32Array for positions
         *
         * @member {Float32Array}
         */
        this.float32View = new Float32Array(this.vertices);

        /**
         * View on the vertices as a Uint32Array for uvs
         *
         * @member {Float32Array}
         */
        this.uint32View = new Uint32Array(this.vertices);
    }

    destroy ()
	{
	    this.vertices = null;
	    this.float32View = null;
	    this.uint32View = null;
	};
}


