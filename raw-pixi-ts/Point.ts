




export class Point
{
    x
    y
    constructor(x = 0, y = 0)
    {
        if ( x === void 0 ) { x = 0; }
	    if ( y === void 0 ) { y = 0; }

	    /**
	     * @member {number}
	     * @default 0
	     */
	    this.x = x;

	    /**
	     * @member {number}
	     * @default 0
	     */
	    this.y = y;
    }

    /**
	 * Sets the point to a new x and y position.
	 * If y is omitted, both x and y will be set to x.
	 *
	 * @param {number} [x=0] - position of the point on the x axis
	 * @param {number} [y=0] - position of the point on the y axis
	 */
	set(x = 0, y = 0)
	{
	    this.x = x || 0;
	    this.y = y || ((y !== 0) ? this.x : 0);
	};

    /**
	 * Returns true if the given point is equal to this point
	 *
	 * @param {PIXI.IPoint} p - The point to check
	 * @returns {boolean} Whether the given point equal to this point
	 */
	equals(p)
	{
	    return (p.x === this.x) && (p.y === this.y);
    };
    
    /**
	 * Copies x and y into the given point
	 *
	 * @param {PIXI.IPoint} p - The point to copy.
	 * @returns {PIXI.IPoint} Given point with values updated
	 */
	copyTo(p)
	{
	    p.set(this.x, this.y);

	    return p;
	};

    /**
	 * Copies x and y from the given point
	 *
	 * @param {PIXI.IPoint} p - The point to copy from
	 * @returns {PIXI.IPoint} Returns itself.
	 */
	copyFrom(p)
	{
	    this.set(p.x, p.y);

	    return this;
	};

    /**
	 * Creates a clone of this point
	 *
	 * @return {PIXI.Point} a copy of the point
	 */
	clone()
	{
	    return new Point(this.x, this.y);
	};
}