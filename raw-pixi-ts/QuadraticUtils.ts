import { settings } from "./settings";


export class QuadraticUtils
{
    static curveLength(fromX, fromY, cpX, cpY, toX, toY)
	{
	    var ax = fromX - (2.0 * cpX) + toX;
	    var ay = fromY - (2.0 * cpY) + toY;
	    var bx = (2.0 * cpX) - (2.0 * fromX);
	    var by = (2.0 * cpY) - (2.0 * fromY);
	    var a = 4.0 * ((ax * ax) + (ay * ay));
	    var b = 4.0 * ((ax * bx) + (ay * by));
	    var c = (bx * bx) + (by * by);

	    var s = 2.0 * Math.sqrt(a + b + c);
	    var a2 = Math.sqrt(a);
	    var a32 = 2.0 * a * a2;
	    var c2 = 2.0 * Math.sqrt(c);
	    var ba = b / a2;

	    return (
	        (a32 * s)
	            + (a2 * b * (s - c2))
	            + (
	                ((4.0 * c * a) - (b * b))
	               * Math.log(((2.0 * a2) + ba + s) / (ba + c2))
	            )
	    ) / (4.0 * a32);
	};

	/**
	 * Calculate the points for a quadratic bezier curve and then draws it.
	 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
	 *
	 * @private
	 * @param {number} cpX - Control point x
	 * @param {number} cpY - Control point y
	 * @param {number} toX - Destination point x
	 * @param {number} toY - Destination point y
	 * @param {number[]} points - Points to add segments to.
	 */
	static curveTo  (cpX, cpY, toX, toY, points)
	{
	    var fromX = points[points.length - 2];
	    var fromY = points[points.length - 1];

	    var n = settings.GRAPHICS_CURVES._segmentsCount(
	        QuadraticUtils.curveLength(fromX, fromY, cpX, cpY, toX, toY)
	    );

	    var xa = 0;
	    var ya = 0;

	    for (var i = 1; i <= n; ++i)
	    {
	        var j = i / n;

	        xa = fromX + ((cpX - fromX) * j);
	        ya = fromY + ((cpY - fromY) * j);

	        points.push(xa + (((cpX + ((toX - cpX) * j)) - xa) * j),
	            ya + (((cpY + ((toY - cpY) * j)) - ya) * j));
	    }
	};
}