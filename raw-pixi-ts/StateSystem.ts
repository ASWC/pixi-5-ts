import { System } from "./System";
import { State } from "./State";
import { BlendModesSettings } from './BlendModesSettings';


export class StateSystem extends System
{
    static UID$4 = 0;
	static BLEND$1 = 0;
	static OFFSET$1 = 1;
	static CULLING$1 = 2;
	static DEPTH_TEST$1 = 3;
	static WINDING$1 = 4;
    gl
    polygonOffset
    map
    _blendEq
    defaultState
    blendMode
    checks
    blendModes
    stateId
    constructor(renderer)
    {
        super(renderer);
        /**
         * GL context
         * @member {WebGLRenderingContext}
         * @readonly
         */
        this.gl = null;

        /**
         * State ID
         * @member {number}
         * @readonly
         */
        this.stateId = 0;

        /**
         * Polygon offset
         * @member {number}
         * @readonly
         */
        this.polygonOffset = 0;

        /**
         * Blend mode
         * @member {number}
         * @default PIXI.BLEND_MODES.NONE
         * @readonly
         */
        this.blendMode = BlendModesSettings.BLEND_MODES.NONE;

        /**
         * Whether current blend equation is different
         * @member {boolean}
         * @protected
         */
        this._blendEq = false;

        /**
         * Collection of calls
         * @member {function[]}
         * @readonly
         */
        this.map = [];

        // map functions for when we set state..
        this.map[StateSystem.BLEND$1] = this.setBlend;
        this.map[StateSystem.OFFSET$1] = this.setOffset;
        this.map[StateSystem.CULLING$1] = this.setCullFace;
        this.map[StateSystem.DEPTH_TEST$1] = this.setDepthTest;
        this.map[StateSystem.WINDING$1] = this.setFrontFace;

        /**
         * Collection of check calls
         * @member {function[]}
         * @readonly
         */
        this.checks = [];

        /**
         * Default WebGL State
         * @member {PIXI.State}
         * @readonly
         */
        this.defaultState = new State();
        this.defaultState.blend = true;
        this.defaultState.depth = true;
    }

    contextChange  (gl)
    {
        this.gl = gl;

        this.blendModes = BlendModesSettings.mapWebGLBlendModesToPixi(gl);

        this.setState(this.defaultState);

        this.reset();
    };

    /**
     * Sets the current state
     *
     * @param {*} state - The state to set.
     */
    setState  (state)
    {
        state = state || this.defaultState;

        // TODO maybe to an object check? ( this.state === state )?
        if (this.stateId !== state.data)
        {
            var diff = this.stateId ^ state.data;
            var i = 0;

            // order from least to most common
            while (diff)
            {
                if (diff & 1)
                {
                    // state change!
                    this.map[i].call(this, !!(state.data & (1 << i)));
                }

                diff = diff >> 1;
                i++;
            }

            this.stateId = state.data;
        }

        // based on the above settings we check for specific modes..
        // for example if blend is active we check and set the blend modes
        // or of polygon offset is active we check the poly depth.
        for (var i$1 = 0; i$1 < this.checks.length; i$1++)
        {
            this.checks[i$1](this, state);
        }
    };

    /**
     * Sets the state, when previous state is unknown
     *
     * @param {*} state - The state to set
     */
    forceState  (state)
    {
        state = state || this.defaultState;
        for (var i = 0; i < this.map.length; i++)
        {
            this.map[i].call(this, !!(state.data & (1 << i)));
        }
        for (var i$1 = 0; i$1 < this.checks.length; i$1++)
        {
            this.checks[i$1](this, state);
        }

        this.stateId = state.data;
    };

    /**
     * Enables or disabled blending.
     *
     * @param {boolean} value - Turn on or off webgl blending.
     */
    setBlend  (value)
    {
        this.updateCheck(StateSystem.checkBlendMode, value);

        this.gl[value ? 'enable' : 'disable'](this.gl.BLEND);
    };

    /**
     * Enables or disable polygon offset fill
     *
     * @param {boolean} value - Turn on or off webgl polygon offset testing.
     */
    setOffset  (value)
    {
        this.gl[value ? 'enable' : 'disable'](this.gl.POLYGON_OFFSET_FILL);
    };

    /**
     * Sets whether to enable or disable depth test.
     *
     * @param {boolean} value - Turn on or off webgl depth testing.
     */
    setDepthTest (value)
    {
        this.gl[value ? 'enable' : 'disable'](this.gl.DEPTH_TEST);
    };

    /**
     * Sets whether to enable or disable cull face.
     *
     * @param {boolean} value - Turn on or off webgl cull face.
     */
    setCullFace  (value)
    {
        this.gl[value ? 'enable' : 'disable'](this.gl.CULL_FACE);
    };

    /**
     * Sets the gl front face.
     *
     * @param {boolean} value - true is clockwise and false is counter-clockwise
     */
    setFrontFace (value)
    {
        this.gl.frontFace(this.gl[value ? 'CW' : 'CCW']);
    };

    /**
     * Sets the blend mode.
     *
     * @param {number} value - The blend mode to set to.
     */
    setBlendMode (value)
    {
        if (value === this.blendMode)
        {
            return;
        }

        this.blendMode = value;

        var mode = this.blendModes[value];
        var gl = this.gl;

        if (mode.length === 2)
        {
            gl.blendFunc(mode[0], mode[1]);
        }
        else
        {
            gl.blendFuncSeparate(mode[0], mode[1], mode[2], mode[3]);
        }
        if (mode.length === 6)
        {
            this._blendEq = true;
            gl.blendEquationSeparate(mode[4], mode[5]);
        }
        else if (this._blendEq)
        {
            this._blendEq = false;
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
        }
    };

    /**
     * Sets the polygon offset.
     *
     * @param {number} value - the polygon offset
     * @param {number} scale - the polygon offset scale
     */
    setPolygonOffset  (value, scale)
    {
        this.gl.polygonOffset(value, scale);
    };

    // used
    /**
     * Resets all the logic and disables the vaos
     */
    reset  ()
    {
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);

        this.forceState(0);

        this._blendEq = true;
        this.blendMode = -1;
        this.setBlendMode(0);
    };

    /**
     * checks to see which updates should be checked based on which settings have been activated.
     * For example, if blend is enabled then we should check the blend modes each time the state is changed
     * or if polygon fill is activated then we need to check if the polygon offset changes.
     * The idea is that we only check what we have too.
     *
     * @param {Function} func  the checking function to add or remove
     * @param {boolean} value  should the check function be added or removed.
     */
    updateCheck  (func, value)
    {
        var index = this.checks.indexOf(func);

        if (value && index === -1)
        {
            this.checks.push(func);
        }
        else if (!value && index !== -1)
        {
            this.checks.splice(index, 1);
        }
    };

    /**
     * A private little wrapper function that we call to check the blend mode.
     *
     * @static
     * @private
     * @param {PIXI.StateSystem} System  the System to perform the state check on
     * @param {PIXI.State} state  the state that the blendMode will pulled from
     */
    static checkBlendMode (system, state)
    {
        system.setBlendMode(state.blendMode);
    };
}


