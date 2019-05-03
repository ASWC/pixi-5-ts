import { Rectangle } from './Rectangle';
import { trace } from './Logger';
import { InstanceCounter } from './InstanceCounter';

export class FilterState
{
    renderTexture
    target
    resolution
    sourceFrame
    filters
    legacy
    destinationFrame

    constructor()
    {
        this.renderTexture = null;

	    /**
	     * Target of the filters
	     * We store for case when custom filter wants to know the element it was applied on
	     * @member {PIXI.DisplayObject}
	     * @private
	     */
	    this.target = null;

	    /**
	     * Compatibility with PixiJS v4 filters
	     * @member {boolean}
	     * @default false
	     * @private
	     */
	    this.legacy = false;

	    /**
	     * Resolution of filters
	     * @member {number}
	     * @default 1
	     * @private
	     */
	    this.resolution = 1;

	    // next three fields are created only for root
	    // re-assigned for everything else

	    /**
	     * Source frame
	     * @member {PIXI.Rectangle}
	     * @private
	     */
		InstanceCounter.addCall("Rectangle.getRectangle", "FilterState")
	    this.sourceFrame = Rectangle.getRectangle();

	    /**
	     * Destination frame
	     * @member {PIXI.Rectangle}
	     * @private
	     */
		InstanceCounter.addCall("Rectangle.getRectangle", "FilterState")
	    this.destinationFrame = Rectangle.getRectangle();

	    /**
	     * Collection of filters
	     * @member {PIXI.Filter[]}
	     * @private
	     */
	    this.filters = [];
    }

    /**
	 * clears the state
	 * @private
	 */
	clear  ()
	{
	    this.target = null;
	    this.filters = null;
	    this.renderTexture = null;
	};
}


	