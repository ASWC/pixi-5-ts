import { Point } from "../flash/geom/Point";
import { FlashBaseObject } from "./FlashBaseObject";


export class ObservablePoint extends Point
{    
    public callback:Function;
    public scope:FlashBaseObject;
    
    constructor(x = 0, y = 0)
    {
		super(x, y);	    
    }

	/**
	 * Sets the point to a new x and y position.
	 * If y is omitted, both x and y will be set to x.
	 *
	 * @param {number} [x=0] - position of the point on the x axis
	 * @param {number} [y=0] - position of the point on the y axis
	 */
	set  (x:number = 0, y:number = NaN)
	{
	    var _x = x;
		var _y = y;
		if(isNaN(_y))
		{
			_y = _x;
		}

	    if (this._x !== _x || this._y !== _y)
	    {
	        this._x = _x;
	        this._y = _y;
	        this.callback.call(this.scope);
	    }
	};

	/**
	 * Copies x and y from the given point
	 *
	 * @param {PIXI.IPoint} p - The point to copy from.
	 * @returns {PIXI.IPoint} Returns itself.
	 */
	copyFrom  (p)
	{
	    if (this._x !== p.x || this._y !== p.y)
	    {
	        this._x = p.x;
	        this._y = p.y;
	        this.callback.call(this.scope);
	    }

	    return this;
	};

	/**
	 * Copies x and y into the given point
	 *
	 * @param {PIXI.IPoint} p - The point to copy.
	 * @returns {PIXI.IPoint} Given point with values updated
	 */
	copyTo  (p)
	{
	    p.set(this._x, this._y);

	    return p;
	};

	/**
	 * Returns true if the given point is equal to this point
	 *
	 * @param {PIXI.IPoint} p - The point to check
	 * @returns {boolean} Whether the given point equal to this point
	 */
	equals (p)
	{
	    return (p.x === this._x) && (p.y === this._y);
	};

	/**
	 * The position of the displayObject on the x axis relative to the local coordinates of the parent.
	 *
	 * @member {number}
	 */
	get x ()
	{
	    return this._x;
	};

	set x (value) // eslint-disable-line require-jsdoc
	{
	    if (this._x !== value)
	    {
	        this._x = value;
	        this.callback.call(this.scope);
	    }
	};

	/**
	 * The position of the displayObject on the x axis relative to the local coordinates of the parent.
	 *
	 * @member {number}
	 */
	get y ()
	{
	    return this._y;
	};

	set y (value) // eslint-disable-line require-jsdoc
	{
	    if (this._y !== value)
	    {
	        this._y = value;
	        this.callback.call(this.scope);
	    }
	};
}


	