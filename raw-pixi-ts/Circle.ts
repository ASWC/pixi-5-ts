
import { Rectangle } from "../flash/geom/Rectangle";
import { ShapeSettings } from './ShapeSettings';
import { trace } from "./Logger";
import { InstanceCounter } from "./InstanceCounter";


export class Circle
{
    x
    radius
    type
    y
    constructor(x = 0, y = 0, radius = 0)
    {
        if ( x === void 0 ) { x = 0; }
	    if ( y === void 0 ) { y = 0; }
	    if ( radius === void 0 ) { radius = 0; }

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

	    /**
	     * @member {number}
	     * @default 0
	     */
	    this.radius = radius;

	    /**
	     * The type of the object, mainly used to avoid `instanceof` checks
	     *
	     * @member {number}
	     * @readOnly
	     * @default PIXI.SHAPES.CIRC
	     * @see PIXI.SHAPES
	     */
	    this.type = ShapeSettings.SHAPES.CIRC;
    }

    /**
	 * Creates a clone of this Circle instance
	 *
	 * @return {PIXI.Circle} a copy of the Circle
	 */
	clone  ()
	{
	    return new Circle(this.x, this.y, this.radius);
	};

	/**
	 * Checks whether the x and y coordinates given are contained within this circle
	 *
	 * @param {number} x - The X coordinate of the point to test
	 * @param {number} y - The Y coordinate of the point to test
	 * @return {boolean} Whether the x/y coordinates are within this Circle
	 */
	contains  (x, y)
	{
	    if (this.radius <= 0)
	    {
	        return false;
	    }

	    var r2 = this.radius * this.radius;
	    var dx = (this.x - x);
	    var dy = (this.y - y);

	    dx *= dx;
	    dy *= dy;

	    return (dx + dy <= r2);
	};

	/**
	* Returns the framing rectangle of the circle as a Rectangle object
	*
	* @return {PIXI.Rectangle} the framing rectangle
	*/
	getBounds  ()
	{
		InstanceCounter.addCall("Rectangle.getRectangle", "Circle getBounds")
	    return Rectangle.getRectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
	};
}

