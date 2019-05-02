

export class ObservablePoint
{
    _x
    cb
    scope
    _y
    constructor(cb, scope, x = 0, y = 0)
    {
        if ( x === void 0 ) { x = 0; }
	    if ( y === void 0 ) { y = 0; }

	    this._x = x;
	    this._y = y;

	    this.cb = cb;
	    this.scope = scope;
    }

    /**
	 * Creates a clone of this point.
	 * The callback and scope params can be overidden otherwise they will default
	 * to the clone object's values.
	 *
	 * @override
	 * @param {Function} [cb=null] - callback when changed
	 * @param {object} [scope=null] - owner of callback
	 * @return {PIXI.ObservablePoint} a copy of the point
	 */
	clone  (cb, scope)
	{
	        if ( cb === void 0 ) { cb = null; }
	        if ( scope === void 0 ) { scope = null; }

	    var _cb = cb || this.cb;
	    var _scope = scope || this.scope;

	    return new ObservablePoint(_cb, _scope, this._x, this._y);
	};

	/**
	 * Sets the point to a new x and y position.
	 * If y is omitted, both x and y will be set to x.
	 *
	 * @param {number} [x=0] - position of the point on the x axis
	 * @param {number} [y=0] - position of the point on the y axis
	 */
	set  (x, y)
	{
	    var _x = x || 0;
	    var _y = y || ((y !== 0) ? _x : 0);

	    if (this._x !== _x || this._y !== _y)
	    {
	        this._x = _x;
	        this._y = _y;
	        this.cb.call(this.scope);
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
	        this.cb.call(this.scope);
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
	        this.cb.call(this.scope);
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
	        this.cb.call(this.scope);
	    }
	};
}


	