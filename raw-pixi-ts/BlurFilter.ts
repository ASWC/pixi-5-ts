import { Filter } from "./Filter";
import { BlurFilterPass } from './BlurFilterPass';
import { DisplaySettings } from './DisplaySettings';

export class BlurFilter extends Filter
{
    blurXFilter
    blurYFilter
    
    
    _repeatEdgePixels
    constructor(strength = 1, quality = 1, resolution = 1, kernelSize = 5)
    {
        super();
        this.blurXFilter = new BlurFilterPass(true, strength, quality, resolution, kernelSize);
        this.blurYFilter = new BlurFilterPass(false, strength, quality, resolution, kernelSize);

        this.resolution = resolution || DisplaySettings.RESOLUTION;
        this.quality = quality || 4;
        this.blur = strength || 8;

        this.repeatEdgePixels = false;
    }

    /**
     * Applies the filter.
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The manager.
     * @param {PIXI.RenderTexture} input - The input target.
     * @param {PIXI.RenderTexture} output - The output target.
     */
    apply  (filterManager, input, output, clear)
    {
        var xStrength = Math.abs(this.blurXFilter.strength);
        var yStrength = Math.abs(this.blurYFilter.strength);

        if (xStrength && yStrength)
        {
            var renderTarget = filterManager.getFilterTexture();

            this.blurXFilter.apply(filterManager, input, renderTarget, true);
            this.blurYFilter.apply(filterManager, renderTarget, output, clear);

            filterManager.returnFilterTexture(renderTarget);
        }
        else if (yStrength)
        {
            this.blurYFilter.apply(filterManager, input, output, clear);
        }
        else
        {
            this.blurXFilter.apply(filterManager, input, output, clear);
        }
    };

    updatePadding  ()
    {
        if (this._repeatEdgePixels)
        {
            this.padding = 0;
        }
        else
        {
            this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
        }
    };

    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @default 2
     */
    get blur ()
    {
        return this.blurXFilter.blur;
    };

    set blur (value) // eslint-disable-line require-jsdoc
    {
        this.blurXFilter.blur = this.blurYFilter.blur = value;
        this.updatePadding();
    };

    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @default 1
     */
    get quality ()
    {
        return this.blurXFilter.quality;
    };

    set quality (value) // eslint-disable-line require-jsdoc
    {
        this.blurXFilter.quality = this.blurYFilter.quality = value;
    };

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @default 2
     */
    get blurX ()
    {
        return this.blurXFilter.blur;
    };

    set blurX (value) // eslint-disable-line require-jsdoc
    {
        this.blurXFilter.blur = value;
        this.updatePadding();
    };

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @default 2
     */
    get blurY ()
    {
        return this.blurYFilter.blur;
    };

    set blurY(value) // eslint-disable-line require-jsdoc
    {
        this.blurYFilter.blur = value;
        this.updatePadding();
    };

    /**
     * Sets the blendmode of the filter
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode ()
    {
        return this.blurYFilter.blendMode;
    };

    set blendMode(value) // eslint-disable-line require-jsdoc
    {
        this.blurYFilter.blendMode = value;
    };

    /**
     * If set to true the edge of the target will be clamped
     *
     * @member {bool}
     * @default false
     */
    get repeatEdgePixels ()
    {
        return this._repeatEdgePixels;
    };

    set repeatEdgePixels (value)
    {
        this._repeatEdgePixels = value;
        this.updatePadding();
    };
}


