
export class GLBuffer
{
    updateID
    byteLength
    refCount
    buffer
    constructor(buffer)
    {
	    this.buffer = buffer;
	    this.updateID = -1;
	    this.byteLength = -1;
	    this.refCount = 0;
    }
}

