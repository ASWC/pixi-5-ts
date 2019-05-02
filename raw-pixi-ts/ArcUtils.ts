import { settings } from "./settings";
import { MathSettings } from './MathSettings';

export class ArcUtils
{
    constructor()
    {

    }

    static curveTo  (x1, y1, x2, y2, radius, points)
	{
	    var fromX = points[points.length - 2];
	    var fromY = points[points.length - 1];

	    var a1 = fromY - y1;
	    var b1 = fromX - x1;
	    var a2 = y2 - y1;
	    var b2 = x2 - x1;
	    var mm = Math.abs((a1 * b2) - (b1 * a2));

	    if (mm < 1.0e-8 || radius === 0)
	    {
	        if (points[points.length - 2] !== x1 || points[points.length - 1] !== y1)
	        {
	            points.push(x1, y1);
	        }

	        return null;
	    }

	    var dd = (a1 * a1) + (b1 * b1);
	    var cc = (a2 * a2) + (b2 * b2);
	    var tt = (a1 * a2) + (b1 * b2);
	    var k1 = radius * Math.sqrt(dd) / mm;
	    var k2 = radius * Math.sqrt(cc) / mm;
	    var j1 = k1 * tt / dd;
	    var j2 = k2 * tt / cc;
	    var cx = (k1 * b2) + (k2 * b1);
	    var cy = (k1 * a2) + (k2 * a1);
	    var px = b1 * (k2 + j1);
	    var py = a1 * (k2 + j1);
	    var qx = b2 * (k1 + j2);
	    var qy = a2 * (k1 + j2);
	    var startAngle = Math.atan2(py - cy, px - cx);
	    var endAngle = Math.atan2(qy - cy, qx - cx);

	    return {
	        cx: (cx + x1),
	        cy: (cy + y1),
	        radius: radius,
	        startAngle: startAngle,
	        endAngle: endAngle,
	        anticlockwise: (b1 * a2 > b2 * a1),
	    };
	};

	/**
	 * The arc method creates an arc/curve (used to create circles, or parts of circles).
	 *
	 * @private
	 * @param {number} startX - Start x location of arc
	 * @param {number} startY - Start y location of arc
	 * @param {number} cx - The x-coordinate of the center of the circle
	 * @param {number} cy - The y-coordinate of the center of the circle
	 * @param {number} radius - The radius of the circle
	 * @param {number} startAngle - The starting angle, in radians (0 is at the 3 o'clock position
	 *  of the arc's circle)
	 * @param {number} endAngle - The ending angle, in radians
	 * @param {boolean} anticlockwise - Specifies whether the drawing should be
	 *  counter-clockwise or clockwise. False is default, and indicates clockwise, while true
	 *  indicates counter-clockwise.
	 * @param {number} n - Number of segments
	 * @param {number[]} points - Collection of points to add to
	 */
	static arc  (startX, startY, cx, cy, radius, startAngle, endAngle, anticlockwise, points)
	{
	    var sweep = endAngle - startAngle;
	    var n = settings.GRAPHICS_CURVES._segmentsCount(
	        Math.abs(sweep) * radius,
	        Math.ceil(Math.abs(sweep) / MathSettings.PI_2) * 40
	    );

	    var theta = (sweep) / (n * 2);
	    var theta2 = theta * 2;
	    var cTheta = Math.cos(theta);
	    var sTheta = Math.sin(theta);
	    var segMinus = n - 1;
	    var remainder = (segMinus % 1) / segMinus;

	    for (var i = 0; i <= segMinus; ++i)
	    {
	        var real = i + (remainder * i);
	        var angle = ((theta) + startAngle + (theta2 * real));
	        var c = Math.cos(angle);
	        var s = -Math.sin(angle);

	        points.push(
	            (((cTheta * c) + (sTheta * s)) * radius) + cx,
	            (((cTheta * -s) + (sTheta * c)) * radius) + cy
	        );
	    }
	};
}