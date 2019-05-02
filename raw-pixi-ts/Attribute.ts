import { DestroyOptions } from "./DestroyOptions";
import { trace } from ".//Logger";


export class Attribute
{
    /**
	 * Holds the information for a single attribute structure required to render geometry.
	 *
	 * This does not contain the actual data, but instead has a buffer id that maps to a {@link PIXI.Buffer}
	 * This can include anything from positions, uvs, normals, colors etc.
	 *
	 * @class
	 * @memberof PIXI
	 */
    public buffer:number
    normalized
    protected _stride:number;
    public type:number
    start
    instance
	public size:number;
	
	constructor(buffer:number, size:number, normalized = false, type:number = 5126, stride = undefined, start = undefined, instance = undefined)
	{
	    this.buffer = buffer;
	    this.size = size;
	    this.normalized = normalized;
	    this.type = type;
	    this._stride = stride;
	    this.start = start;
		this.instance = instance;
	};

	public set stride(value:number)
	{
		trace("set to " + value)
		this._stride = value;
	}
	
	public get stride():number
	{
		return this._stride;
	}
  
	public destroy(options:DestroyOptions = null):void
	{
	    this.buffer = null;
	};
}

	