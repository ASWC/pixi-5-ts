

export class BlendModesSettings
{
    		/**
	 * Various blend modes supported by PIXI.
	 *
	 * IMPORTANT - The WebGL renderer only supports the NORMAL, ADD, MULTIPLY and SCREEN blend modes.
	 * Anything else will silently act like NORMAL.
	 *
	 * @memberof PIXI
	 * @name BLEND_MODES
	 * @enum {number}
	 * @property {number} NORMAL
	 * @property {number} ADD
	 * @property {number} MULTIPLY
	 * @property {number} SCREEN
	 * @property {number} OVERLAY
	 * @property {number} DARKEN
	 * @property {number} LIGHTEN
	 * @property {number} COLOR_DODGE
	 * @property {number} COLOR_BURN
	 * @property {number} HARD_LIGHT
	 * @property {number} SOFT_LIGHT
	 * @property {number} DIFFERENCE
	 * @property {number} EXCLUSION
	 * @property {number} HUE
	 * @property {number} SATURATION
	 * @property {number} COLOR
	 * @property {number} LUMINOSITY
	 * @property {number} NORMAL_NPM
	 * @property {number} ADD_NPM
	 * @property {number} SCREEN_NPM
	 * @property {number} NONE
	 * @property {number} SRC_IN
	 * @property {number} SRC_OUT
	 * @property {number} SRC_ATOP
	 * @property {number} DST_OVER
	 * @property {number} DST_IN
	 * @property {number} DST_OUT
	 * @property {number} DST_ATOP
	 * @property {number} SUBTRACT
	 * @property {number} SRC_OVER
	 * @property {number} ERASE
	 */
	static BLEND_MODES = {
	    NORMAL:         0,
	    ADD:            1,
	    MULTIPLY:       2,
	    SCREEN:         3,
	    OVERLAY:        4,
	    DARKEN:         5,
	    LIGHTEN:        6,
	    COLOR_DODGE:    7,
	    COLOR_BURN:     8,
	    HARD_LIGHT:     9,
	    SOFT_LIGHT:     10,
	    DIFFERENCE:     11,
	    EXCLUSION:      12,
	    HUE:            13,
	    SATURATION:     14,
	    COLOR:          15,
	    LUMINOSITY:     16,
	    NORMAL_NPM:     17,
	    ADD_NPM:        18,
	    SCREEN_NPM:     19,
	    NONE:           20,

	    SRC_OVER:       0,
	    SRC_IN:         21,
	    SRC_OUT:        22,
	    SRC_ATOP:       23,
	    DST_OVER:       24,
	    DST_IN:         25,
	    DST_OUT:        26,
	    DST_ATOP:       27,
	    ERASE:          26,
	    SUBTRACT:       28,
	};
    		/**
	 * Corrects PixiJS blend, takes premultiplied alpha into account
	 *
	 * @memberof PIXI.utils
	 * @function mapPremultipliedBlendModes
	 * @private
	 * @param {Array<number[]>} [array] - The array to output into.
	 * @return {Array<number[]>} Mapped modes.
	 */
	static mapPremultipliedBlendModes()
	{
	    var pm = [];
	    var npm = [];

	    for (var i = 0; i < 32; i++)
	    {
	        pm[i] = i;
	        npm[i] = i;
	    }

	    pm[BlendModesSettings.BLEND_MODES.NORMAL_NPM] = BlendModesSettings.BLEND_MODES.NORMAL;
	    pm[BlendModesSettings.BLEND_MODES.ADD_NPM] = BlendModesSettings.BLEND_MODES.ADD;
	    pm[BlendModesSettings.BLEND_MODES.SCREEN_NPM] = BlendModesSettings.BLEND_MODES.SCREEN;

	    npm[BlendModesSettings.BLEND_MODES.NORMAL] = BlendModesSettings.BLEND_MODES.NORMAL_NPM;
	    npm[BlendModesSettings.BLEND_MODES.ADD] = BlendModesSettings.BLEND_MODES.ADD_NPM;
	    npm[BlendModesSettings.BLEND_MODES.SCREEN] = BlendModesSettings.BLEND_MODES.SCREEN_NPM;

	    var array = [];

	    array.push(npm);
	    array.push(pm);

	    return array;
	}
    		/**
	 * maps premultiply flag and blendMode to adjusted blendMode
	 * @memberof PIXI.utils
	 * @const premultiplyBlendMode
	 * @type {Array<number[]>}
	 */
	static premultiplyBlendMode = BlendModesSettings.mapPremultipliedBlendModes();
    		/**
	 * changes blendMode according to texture format
	 *
	 * @memberof PIXI.utils
	 * @function correctBlendMode
	 * @param {number} blendMode supposed blend mode
	 * @param {boolean} premultiplied  whether source is premultiplied
	 * @returns {number} true blend mode for this texture
	 */
	static correctBlendMode(blendMode, premultiplied)
	{
	    return BlendModesSettings.premultiplyBlendMode[premultiplied ? 1 : 0][blendMode];
	}
			/**
	 * Maps gl blend combinations to WebGL.
	 *
	 * @memberof PIXI
	 * @function mapWebGLBlendModesToPixi
	 * @private
	 * @param {WebGLRenderingContext} gl - The rendering context.
	 * @param {number[][]} [array=[]] - The array to output into.
	 * @return {number[][]} Mapped modes.
	 */
	static mapWebGLBlendModesToPixi(gl, array = [])
	{

	    // TODO - premultiply alpha would be different.
	    // add a boolean for that!
	    array[BlendModesSettings.BLEND_MODES.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.ADD] = [gl.ONE, gl.DST_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.SCREEN] = [gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.NONE] = [0, 0];

	    // not-premultiplied blend modes
	    array[BlendModesSettings.BLEND_MODES.NORMAL_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.ADD_NPM] = [gl.SRC_ALPHA, gl.DST_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.SCREEN_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];

	    // composite operations
	    array[BlendModesSettings.BLEND_MODES.SRC_IN] = [gl.DST_ALPHA, gl.ZERO];
	    array[BlendModesSettings.BLEND_MODES.SRC_OUT] = [gl.ONE_MINUS_DST_ALPHA, gl.ZERO];
	    array[BlendModesSettings.BLEND_MODES.SRC_ATOP] = [gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.DST_OVER] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE];
	    array[BlendModesSettings.BLEND_MODES.DST_IN] = [gl.ZERO, gl.SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.DST_OUT] = [gl.ZERO, gl.ONE_MINUS_SRC_ALPHA];
	    array[BlendModesSettings.BLEND_MODES.DST_ATOP] = [gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA];

	    // SUBTRACT from flash
	    array[BlendModesSettings.BLEND_MODES.SUBTRACT] = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_ADD];

	    return array;
	}
}