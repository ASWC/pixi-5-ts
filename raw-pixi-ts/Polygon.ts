import { Point } from "../flash/geom/Point";

import { ShapeSettings } from './ShapeSettings';

export class Polygon
{
    points
    closeStroke
    type
    constructor(arg = null)
    {
        var arguments$1 = arguments;

	    var points = [], len = arguments.length;
	    while ( len-- ) { points[ len ] = arguments$1[ len ]; }

	    if (Array.isArray(points[0]))
	    {
	        points = points[0];
	    }

	    // if this is an array of points, convert it to a flat array of numbers
	    if (points[0] instanceof Point)
	    {
	        var p = [];

	        for (var i = 0, il = points.length; i < il; i++)
	        {
	            p.push(points[i].x, points[i].y);
	        }

	        points = p;
	    }

	    /**
	     * An array of the points of this polygon
	     *
	     * @member {number[]}
	     */
	    this.points = points;

	    /**
	     * The type of the object, mainly used to avoid `instanceof` checks
	     *
	     * @member {number}
	     * @readOnly
	     * @default PIXI.SHAPES.POLY
	     * @see PIXI.SHAPES
	     */
	    this.type = ShapeSettings.SHAPES.POLY;

	    /**
	     * `false` after moveTo, `true` after `closePath`. In all other cases it is `true`.
	     * @member {boolean}
	     * @default true
	     */
	    this.closeStroke = true;
    }

    /**
	 * Creates a clone of this polygon
	 *
	 * @return {PIXI.Polygon} a copy of the polygon
	 */
	clone  ()
	{
	    var polygon = new Polygon(this.points.slice());

	    polygon.closeStroke = this.closeStroke;

	    return polygon;
	};

	/**
	 * Checks whether the x and y coordinates passed to this function are contained within this polygon
	 *
	 * @param {number} x - The X coordinate of the point to test
	 * @param {number} y - The Y coordinate of the point to test
	 * @return {boolean} Whether the x/y coordinates are within this polygon
	 */
	contains (x, y)
	{
	    var inside = false;

	    // use some raycasting to test hits
	    // https://github.com/substack/point-in-polygon/blob/master/index.js
	    var length = this.points.length / 2;

	    for (var i = 0, j = length - 1; i < length; j = i++)
	    {
	        var xi = this.points[i * 2];
	        var yi = this.points[(i * 2) + 1];
	        var xj = this.points[j * 2];
	        var yj = this.points[(j * 2) + 1];
	        var intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * ((y - yi) / (yj - yi))) + xi);

	        if (intersect)
	        {
	            inside = !inside;
	        }
	    }

	    return inside;
	};
}

