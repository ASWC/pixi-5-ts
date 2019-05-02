
export class DrawModeSettings
{
    		/**
	 * Various webgl draw modes. These can be used to specify which GL drawMode to use
	 * under certain situations and renderers.
	 *
	 * @memberof PIXI
	 * @static
	 * @name DRAW_MODES
	 * @enum {number}
	 * @property {number} POINTS
	 * @property {number} LINES
	 * @property {number} LINE_LOOP
	 * @property {number} LINE_STRIP
	 * @property {number} TRIANGLES
	 * @property {number} TRIANGLE_STRIP
	 * @property {number} TRIANGLE_FAN
	 */
	static DRAW_MODES = {
	    POINTS:         0,
	    LINES:          1,
	    LINE_LOOP:      2,
	    LINE_STRIP:     3,
	    TRIANGLES:      4,
	    TRIANGLE_STRIP: 5,
	    TRIANGLE_FAN:   6,
	};
}