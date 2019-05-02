

export class ShapeSettings
{
        /**
	 * Constants that identify shapes, mainly to prevent `instanceof` calls.
	 *
	 * @static
	 * @constant
	 * @name SHAPES
	 * @memberof PIXI
	 * @type {object}
	 * @property {number} POLY Polygon
	 * @property {number} RECT Rectangle
	 * @property {number} CIRC Circle
	 * @property {number} ELIP Ellipse
	 * @property {number} RREC Rounded Rectangle
	 */
	static SHAPES = {
	    POLY: 0,
	    RECT: 1,
	    CIRC: 2,
	    ELIP: 3,
	    RREC: 4,
	};
}