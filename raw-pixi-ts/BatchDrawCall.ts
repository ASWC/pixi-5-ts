

export class BatchDrawCall
{
    	/**
	 * Used by the batcher to draw batches.
	 * Each one of these contains all information required to draw a bound geometry.
	 *
	 * @class
	 * @memberof PIXI
	 */
    textures
    textureCount
    start
    blend
    size
    type
    ids
	constructor()
	{
	    this.textures = [];
	    this.ids = [];
	    this.blend = 0;
	    this.textureCount = 0;
	    this.start = 0;
	    this.size = 0;
	    this.type = 4;
	};
}