
import { Rectangle } from "./Rectangle";
import { ShapeSettings } from './ShapeSettings';
import { trace } from "./Logger";
import { InstanceCounter } from "./InstanceCounter";


export class Ellipse
{
    type
    x
    height
    width
    y
    constructor(x = 0, y = 0, halfWidth = 0, halfHeight = 0)
    {
        if ( x === void 0 ) { x = 0; }
	    if ( y === void 0 ) { y = 0; }
	    if ( halfWidth === void 0 ) { halfWidth = 0; }
	    if ( halfHeight === void 0 ) { halfHeight = 0; }

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
	    this.width = halfWidth;

	    /**
	     * @member {number}
	     * @default 0
	     */
	    this.height = halfHeight;

	    /**
	     * The type of the object, mainly used to avoid `instanceof` checks
	     *
	     * @member {number}
	     * @readOnly
	     * @default PIXI.SHAPES.ELIP
	     * @see PIXI.SHAPES
	     */
	    this.type = ShapeSettings.SHAPES.ELIP;
    }

    /**
	 * Creates a clone of this Ellipse instance
	 *
	 * @return {PIXI.Ellipse} a copy of the ellipse
	 */
	clone  ()
	{
	    return new Ellipse(this.x, this.y, this.width, this.height);
	};

	/**
	 * Checks whether the x and y coordinates given are contained within this ellipse
	 *
	 * @param {number} x - The X coordinate of the point to test
	 * @param {number} y - The Y coordinate of the point to test
	 * @return {boolean} Whether the x/y coords are within this ellipse
	 */
	contains  (x, y)
	{
	    if (this.width <= 0 || this.height <= 0)
	    {
	        return false;
	    }

	    // normalize the coords to an ellipse with center 0,0
	    var normx = ((x - this.x) / this.width);
	    var normy = ((y - this.y) / this.height);

	    normx *= normx;
	    normy *= normy;

	    return (normx + normy <= 1);
	};

	/**
	 * Returns the framing rectangle of the ellipse as a Rectangle object
	 *
	 * @return {PIXI.Rectangle} the framing rectangle
	 */
	getBounds  ()
	{
		InstanceCounter.addCall("Rectangle.getRectangle", "Ellipse getBounds")
	    return Rectangle.getRectangle(this.x - this.width, this.y - this.height, this.width, this.height);
	};
}

