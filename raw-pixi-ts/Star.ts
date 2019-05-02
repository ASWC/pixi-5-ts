import { Polygon } from "./Polygon";
import { MathSettings } from './MathSettings';


export class Star extends Polygon
{
    constructor(x, y, points, radius, innerRadius, rotation)
    {
        

        innerRadius = innerRadius || radius / 2;

	        var startAngle = (-1 * Math.PI / 2) + rotation;
	        var len = points * 2;
	        var delta = MathSettings.PI_2 / len;
	        var polygon = [];

	        for (var i = 0; i < len; i++)
	        {
	            var r = i % 2 ? innerRadius : radius;
	            var angle = (i * delta) + startAngle;

	            polygon.push(
	                x + (r * Math.cos(angle)),
	                y + (r * Math.sin(angle))
	            );
            }
            super(polygon);
    }
}

