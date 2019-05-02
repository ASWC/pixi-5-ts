
import { BlendModesSettings } from './BlendModesSettings';


export class State 
{
	static BLEND = 0;
	static OFFSET = 1;
	static CULLING = 2;
	static DEPTH_TEST = 3;
	static WINDING = 4;
    data
    _blendMode
    _polygonOffset
    
    constructor()
    {
        this.data = 0;

	    this.blendMode = BlendModesSettings.BLEND_MODES.NORMAL;
	    this.polygonOffset = 0;

	    this.blend = true;
	    //  this.depthTest = true;
    }

    /**
	 * Activates blending of the computed fragment color values
	 *
	 * @member {boolean}
	 */
	get blend ()
	{
	    return !!(this.data & (1 << State.BLEND));
	};

	set blend(value) // eslint-disable-line require-jsdoc
	{
	    if (!!(this.data & (1 << State.BLEND)) !== value)
	    {
	        this.data ^= (1 << State.BLEND);
	    }
	};

	/**
	 * Activates adding an offset to depth values of polygon's fragments
	 *
	 * @member {boolean}
	 * @default false
	 */
	get offsets ()
	{
	    return !!(this.data & (1 << State.OFFSET));
	};

	set offsets (value) // eslint-disable-line require-jsdoc
	{
	    if (!!(this.data & (1 << State.OFFSET)) !== value)
	    {
	        this.data ^= (1 << State.OFFSET);
	    }
	};

	/**
	 * Activates culling of polygons.
	 *
	 * @member {boolean}
	 * @default false
	 */
	get culling ()
	{
	    return !!(this.data & (1 << State.CULLING));
	};

	set culling (value) // eslint-disable-line require-jsdoc
	{
	    if (!!(this.data & (1 << State.CULLING)) !== value)
	    {
	        this.data ^= (1 << State.CULLING);
	    }
	};

	/**
	 * Activates depth comparisons and updates to the depth buffer.
	 *
	 * @member {boolean}
	 * @default false
	 */
	get depthTest ()
	{
	    return !!(this.data & (1 << State.DEPTH_TEST));
	};

	set depthTest (value) // eslint-disable-line require-jsdoc
	{
	    if (!!(this.data & (1 << State.DEPTH_TEST)) !== value)
	    {
	        this.data ^= (1 << State.DEPTH_TEST);
	    }
	};

	/**
	 * Specifies whether or not front or back-facing polygons can be culled.
	 * @member {boolean}
	 * @default false
	 */
	get clockwiseFrontFace ()
	{
	    return !!(this.data & (1 << State.WINDING));
	};

	set clockwiseFrontFace (value) // eslint-disable-line require-jsdoc
	{
	    if (!!(this.data & (1 << State.WINDING)) !== value)
	    {
	        this.data ^= (1 << State.WINDING);
	    }
	};

	/**
	 * The blend mode to be applied when this state is set. Apply a value of `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
	 * Setting this mode to anything other than NO_BLEND will automatically switch blending on.
	 *
	 * @member {boolean}
	 * @default PIXI.BLEND_MODES.NORMAL
	 * @see PIXI.BLEND_MODES
	 */
	get blendMode ()
	{
	    return this._blendMode;
	};

	set blendMode (value) // eslint-disable-line require-jsdoc
	{
	    this.blend = (value !== BlendModesSettings.BLEND_MODES.NONE);
	    this._blendMode = value;
	};

	/**
	 * The polygon offset. Setting this property to anything other than 0 will automatically enable polygon offset fill.
	 *
	 * @member {number}
	 * @default 0
	 */
	get polygonOffset ()
	{
	    return this._polygonOffset;
	};

	set polygonOffset (value) // eslint-disable-line require-jsdoc
	{
	    this.offsets = !!value;
	    this._polygonOffset = value;
	};

	static for2d ()
	{
	    var state = new State();

	    state.depthTest = false;
	    state.blend = true;

	    return state;
	};

}
