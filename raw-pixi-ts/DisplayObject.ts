import { EventDispatcher } from "./EventDispatcher";
import { Rectangle } from "../flash/geom/Rectangle";
import { Matrix } from "./Matrix";
import { RenderTexture } from "./RenderTexture";
import { BaseTexture } from "./BaseTexture";
import { Texture } from "./Texture";
import { Bounds } from "./Bounds";
import { Transform } from "./Transform";
import { Point } from "../flash/geom/Point";
import { MathSettings } from './MathSettings';
import { DisplaySettings } from './DisplaySettings';
import { trace } from "./Logger";
import { InstanceCounter } from "./InstanceCounter";
import { Filter } from "./Filter";


export class DisplayObject extends EventDispatcher
{
    static _tempMatrix = new Matrix();
    tempDisplayObjectParent
    public transform:Transform;
    visible
    _enabledFilters
    _localBoundsRect
    _mask
    worldAlpha
    isSprite
    _lastSortedIndex
    _currentBounds
    _destroyed
    _boundsRect
    parent
    filterArea
    _bounds
    _lastBoundsID
    _boundsID
    filters
    renderable
    _zIndex
    alpha
    displayObjectUpdateTransform

        	/*!
	 * @pixi/mixin-get-child-by-name - v5.0.0-rc.3
	 * Compiled Wed, 10 Apr 2019 01:21:15 UTC
	 *
	 * @pixi/mixin-get-child-by-name is licensed under the MIT License.
	 * http://www.opensource.org/licenses/mit-license
	 */

	/**
	 * The instance name of the object.
	 *
	 * @memberof PIXI.DisplayObject#
	 * @member {string} name
	 */
	name = null;
    /**
     *  Flag for if the object is accessible. If true AccessibilityManager will overlay a
     *   shadow div with attributes set
     *
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    accessible = false

    /**
     * Sets the title attribute of the shadow div
     * If accessibleTitle AND accessibleHint has not been this will default to 'displayObject [tabIndex]'
     *
     * @member {?string}
     * @memberof PIXI.DisplayObject#
     */
    accessibleTitle =  null

    /**
     * Sets the aria-label attribute of the shadow div
     *
     * @member {string}
     * @memberof PIXI.DisplayObject#
     */
    accessibleHint =  null

    /**
     * @member {number}
     * @memberof PIXI.DisplayObject#
     * @private
     * @todo Needs docs.
     */
    tabIndex =  0

    /**
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     * @todo Needs docs.
     */
    _accessibleActive = false

    /**
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     * @todo Needs docs.
     */
    _accessibleDiv = false


     /**
     * Enable interaction events for the DisplayObject. Touch, pointer and mouse
     * events will not be emitted unless `interactive` is set to `true`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.on('tap', (event) => {
     *    //handle event
     * });
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    interactive = false

    /**
     * Determines if the children to the displayObject can be clicked/touched
     * Setting this to false allows PixiJS to bypass a recursive `hitTest` function
     *
     * @member {boolean}
     * @memberof PIXI.Container#
     */
    interactiveChildren = true

    /**
     * Interaction shape. Children will be hit first, then this shape will be checked.
     * Setting this will cause this shape to be checked in hit tests rather than the displayObject's bounds.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.hitArea = new PIXI.Rectangle(0, 0, 100, 100);
     * @member {PIXI.Rectangle|PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.RoundedRectangle}
     * @memberof PIXI.DisplayObject#
     */
    hitArea = null



    /**
     * This defines what cursor mode is used when the mouse cursor
     * is hovered over the displayObject.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.cursor = 'wait';
     * @see https://developer.mozilla.org/en/docs/Web/CSS/cursor
     *
     * @member {string}
     * @memberof PIXI.DisplayObject#
     */
    cursor = null



    /**
     * Map of all tracked pointers, by identifier. Use trackedPointers to access.
     *
     * @private
     * @type {Map<number, InteractionTrackingData>}
     */
    _trackedPointers = undefined
    _cacheAsBitmap
    _cacheData

    public destructor():void
    {
        super.destructor();
        this._cacheAsBitmap = null;
	    this._cacheData = null;
        this.displayObjectUpdateTransform = null;
        this.tempDisplayObjectParent = null;
        if(this.transform)
        {
            this.transform.recycle()
        }
        this.transform = null;
        this.alpha = null;
        this.visible = null;
        this.renderable = null;
        this.parent = null;
        this.worldAlpha = null;
        this._lastSortedIndex = null;
        this._zIndex = null;
        if(this.filterArea)
        {
            this.filterArea.recycle()
        }
        this.filterArea = null;
        if(this.filters && this.filters.length)
        {
            while(this.filters.length)
            {
                let filter:Filter = this.filters.shift();
                filter.destructor();
            }
        }
        this.filters = null;
        this._enabledFilters = null;
        if(this._bounds)
        {
            this._bounds.recycle()
        }
        this._bounds = null;
        this._boundsID = null;
        this._lastBoundsID = null;
        this._boundsRect = null;
        this._localBoundsRect = null;
        if(this._mask)
        {
            this._mask.destructor()
        }
        this._mask = null;
        this._destroyed = true;
        this.isSprite = null;
        this._trackedPointers = null;
        
        this.tempDisplayObjectParent = null;
        if(this._localBoundsRect)
        {
            this._localBoundsRect.recycle()
        }
        this._localBoundsRect = null;
    }
        
    constructor()
    {
        super();

        this._cacheAsBitmap = false;
	    this._cacheData = false;
        // performance increase to avoid using call.. (10x faster)
        this.displayObjectUpdateTransform = this.updateTransform;
        this.tempDisplayObjectParent = null;
        // TODO: need to create Transform from factory
        /**
         * World transform and local transform of this object.
         * This will become read-only later, please do not assign anything there unless you know what are you doing.
         *
         * @member {PIXI.Transform}
         */
        this.transform = new Transform();
        /**
         * The opacity of the object.
         *
         * @member {number}
         */
        this.alpha = 1;
        /**
         * The visibility of the object. If false the object will not be drawn, and
         * the updateTransform function will not be called.
         *
         * Only affects recursive calls from parent. You can ask for bounds or call updateTransform manually.
         *
         * @member {boolean}
         */
        this.visible = true;
        /**
         * Can this object be rendered, if false the object will not be drawn but the updateTransform
         * methods will still be called.
         *
         * Only affects recursive calls from parent. You can ask for bounds manually.
         *
         * @member {boolean}
         */
        this.renderable = true;
        /**
         * The display object container that contains this display object.
         *
         * @member {PIXI.Container}
         * @readonly
         */
        this.parent = null;
        /**
         * The multiplied alpha of the displayObject.
         *
         * @member {number}
         * @readonly
         */
        this.worldAlpha = 1;
        /**
         * Which index in the children array the display component was before the previous zIndex sort.
         * Used by containers to help sort objects with the same zIndex, by using previous array index as the decider.
         *
         * @member {number}
         * @protected
         */
        this._lastSortedIndex = 0;
        /**
         * The zIndex of the displayObject.
         * A higher value will mean it will be rendered on top of other displayObjects within the same container.
         *
         * @member {number}
         * @protected
         */
        this._zIndex = 0;
        /**
         * The area the filter is applied to. This is used as more of an optimization
         * rather than figuring out the dimensions of the displayObject each frame you can set this rectangle.
         *
         * Also works as an interaction mask.
         *
         * @member {?PIXI.Rectangle}
         */
        this.filterArea = null;
        /**
         * Sets the filters for the displayObject.
         * * IMPORTANT: This is a WebGL only feature and will be ignored by the canvas renderer.
         * To remove filters simply set this property to `'null'`.
         *
         * @member {?PIXI.Filter[]}
         */
        this.filters = null;
        this._enabledFilters = null;
        /**
         * The bounds object, this is used to calculate and store the bounds of the displayObject.
         *
         * @member {PIXI.Bounds}
         * @protected
         */
        this._bounds = new Bounds();
        this._boundsID = 0;
        this._lastBoundsID = -1;
        this._boundsRect = null;
        this._localBoundsRect = null;
        /**
         * The original, cached mask of the object.
         *
         * @member {PIXI.Graphics|PIXI.Sprite}
         * @protected
         */
        this._mask = null;
        /**
         * Fired when this DisplayObject is added to a Container.
         *
         * @event PIXI.DisplayObject#added
         * @param {PIXI.Container} container - The container added to.
         */
        /**
         * Fired when this DisplayObject is removed from a Container.
         *
         * @event PIXI.DisplayObject#removed
         * @param {PIXI.Container} container - The container removed from.
         */
        /**
         * If the object has been destroyed via destroy(). If true, it should not be used.
         *
         * @member {boolean}
         * @protected
         */
        this._destroyed = false;
        /**
         * used to fast check if a sprite is.. a sprite!
         * @member {boolean}
         */
        this.isSprite = false;
    }

        /**
     * Internal set of all active pointers, by identifier
     *
     * @member {Map<number, InteractionTrackingData>}
     * @memberof PIXI.DisplayObject#
     * @private
     */
    get trackedPointers()
    {
        if (this._trackedPointers === undefined) { this._trackedPointers = {}; }

        return this._trackedPointers;
    }

    	/*!
	 * @pixi/mixin-get-global-position - v5.0.0-rc.3
	 * Compiled Wed, 10 Apr 2019 01:21:15 UTC
	 *
	 * @pixi/mixin-get-global-position is licensed under the MIT License.
	 * http://www.opensource.org/licenses/mit-license
	 */

	/**
	 * Returns the global position of the displayObject. Does not depend on object scale, rotation and pivot.
	 *
	 * @method getGlobalPosition
	 * @memberof PIXI.DisplayObject#
	 * @param {Point} point - The point to write the global value to. If null a new point will be returned
	 * @param {boolean} skipUpdate - Setting to true will stop the transforms of the scene graph from
	 *  being updated. This means the calculation returned MAY be out of date BUT will give you a
	 *  nice performance boost.
	 * @return {Point} The updated point.
	 */
	getGlobalPosition (point = null, skipUpdate = false)
	{
        if(!point)
        {
            point = Point.getPoint();
        }

	    if (this.parent)
	    {
	        this.parent.toGlobal(this.position, point, skipUpdate);
	    }
	    else
	    {
	        point.x = this.position.x;
	        point.y = this.position.y;
	    }

	    return point;
	};

        /**
     * If enabled, the mouse cursor use the pointer behavior when hovered over the displayObject if it is interactive
     * Setting this changes the 'cursor' property to `'pointer'`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.buttonMode = true;
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    get buttonMode()
    {
        return this.cursor === 'pointer';
    }
    set buttonMode(value)
    {
        if (value)
        {
            this.cursor = 'pointer';
        }
        else if (this.cursor === 'pointer')
        {
            this.cursor = null;
        }
    }

    /**
     * @protected
     * @member {PIXI.DisplayObject}
     */
    static mixin  (source)
    {
        // in ES8/ES2017, this would be really easy:
        // Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));

        // get all the enumerable property keys
        var keys = Object.keys(source);

        // loop through properties
        for (var i = 0; i < keys.length; ++i)
        {
            var propertyName = keys[i];

            // Set the property using the property descriptor - this works for accessors and normal value properties
            Object.defineProperty(
                DisplayObject.prototype,
                propertyName,
                Object.getOwnPropertyDescriptor(source, propertyName)
            );
        }
    };

    get _tempDisplayObjectParent ()
    {
        if (this.tempDisplayObjectParent === null)
        {
            this.tempDisplayObjectParent = new DisplayObject();
        }

        return this.tempDisplayObjectParent;
    };

    /**
     * Updates the object transform for rendering.
     *
     * TODO - Optimization pass!
     */
    updateTransform ()
    {
        this.transform.updateTransform(this.parent.transform);
        // multiply the alphas..
        this.worldAlpha = this.alpha * this.parent.worldAlpha;

        this._bounds.updateID++;
    };

    /**
     * Recursively updates transform of all objects from the root to this one
     * internal function for toLocal()
     */
    _recursivePostUpdateTransform ()
    {
        if (this.parent)
        {
            this.parent._recursivePostUpdateTransform();
            this.transform.updateTransform(this.parent.transform);
        }
        else
        {
            this.transform.updateTransform(this._tempDisplayObjectParent.transform);
        }
    };

    /**
     * Retrieves the bounds of the displayObject as a rectangle object.
     *
     * @param {boolean} [skipUpdate] - Setting to `true` will stop the transforms of the scene graph from
     *  being updated. This means the calculation returned MAY be out of date BUT will give you a
     *  nice performance boost.
     * @param {PIXI.Rectangle} [rect] - Optional rectangle to store the result of the bounds calculation.
     * @return {PIXI.Rectangle} The rectangular bounding area.
     */
    getBounds  (skipUpdate = true, rect = null)
    {
        if (!skipUpdate)
        {
            if (!this.parent)
            {
                this.parent = this._tempDisplayObjectParent;
                this.updateTransform();
                this.parent = null;
            }
            else
            {
                this._recursivePostUpdateTransform();
                this.updateTransform();
            }
        }

        if (this._boundsID !== this._lastBoundsID)
        {
            this.calculateBounds();
        }

        if (!rect)
        {
            if (!this._boundsRect)
            {
                InstanceCounter.addCall("Rectangle.getRectangle", "DisplayObject getBounds")
                this._boundsRect = Rectangle.getRectangle();
            }

            rect = this._boundsRect;
        }
        return this._bounds.getRectangle(rect);
    };

    calculateBounds()
    {

    }

    /**
     * Retrieves the local bounds of the displayObject as a rectangle object.
     *
     * @param {PIXI.Rectangle} [rect] - Optional rectangle to store the result of the bounds calculation.
     * @return {PIXI.Rectangle} The rectangular bounding area.
     */
    getLocalBounds  (rect = null)
    {
        var transformRef = this.transform;
        var parentRef = this.parent;

        this.parent = null;
        this.transform = this._tempDisplayObjectParent.transform;

        if (!rect)
        {
            if (!this._localBoundsRect)
            {
                InstanceCounter.addCall("Rectangle.getRectangle", "DisplayObject getlocalBounds")
                this._localBoundsRect = Rectangle.getRectangle();
            }

            rect = this._localBoundsRect;
        }

        var bounds = this.getBounds(false, rect);

        this.parent = parentRef;
        this.transform = transformRef;

        return bounds;
    };

    /**
     * Calculates the global position of the display object.
     *
     * @param {PIXI.IPoint} position - The world origin to calculate from.
     * @param {PIXI.IPoint} [point] - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param {boolean} [skipUpdate=false] - Should we skip the update transform.
     * @return {PIXI.IPoint} A point object representing the position of this object.
     */
    toGlobal  (position, point, skipUpdate)
    {
        if ( skipUpdate === void 0 ) { skipUpdate = false; }

        if (!skipUpdate)
        {
            this._recursivePostUpdateTransform();

            // this parent check is for just in case the item is a root object.
            // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
            // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
            if (!this.parent)
            {
                this.parent = this._tempDisplayObjectParent;
                this.displayObjectUpdateTransform();
                this.parent = null;
            }
            else
            {
                this.displayObjectUpdateTransform();
            }
        }

        // don't need to update the lot
        return this.worldTransform.apply(position, point);
    };

    /**
     * Calculates the local position of the display object relative to another point.
     *
     * @param {PIXI.IPoint} position - The world origin to calculate from.
     * @param {PIXI.DisplayObject} [from] - The DisplayObject to calculate the global position from.
     * @param {PIXI.IPoint} [point] - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param {boolean} [skipUpdate=false] - Should we skip the update transform
     * @return {PIXI.IPoint} A point object representing the position of this object
     */
    toLocal  (position, from, point, skipUpdate)
    {
        if (from)
        {
            position = from.toGlobal(position, point, skipUpdate);
        }

        if (!skipUpdate)
        {
            this._recursivePostUpdateTransform();

            // this parent check is for just in case the item is a root object.
            // If it is we need to give it a temporary parent so that displayObjectUpdateTransform works correctly
            // this is mainly to avoid a parent check in the main loop. Every little helps for performance :)
            if (!this.parent)
            {
                this.parent = this._tempDisplayObjectParent;
                this.displayObjectUpdateTransform();
                this.parent = null;
            }
            else
            {
                this.displayObjectUpdateTransform();
            }
        }

        // simply apply the matrix..
        return this.worldTransform.applyInverse(position, point);
    };

    /**
     * Renders the object using the WebGL renderer.
     *
     * @param {PIXI.Renderer} renderer - The renderer.
     */
    render  (renderer) // eslint-disable-line no-unused-vars
    {
        // OVERWRITE;
    };

    /**
     * Set the parent Container of this DisplayObject.
     *
     * @param {PIXI.Container} container - The Container to add this DisplayObject to.
     * @return {PIXI.Container} The Container that this DisplayObject was added to.
     */
    setParent  (container)
    {
        if (!container || !container.addChild)
        {
            throw new Error('setParent: Argument must be a Container');
        }

        container.addChild(this);

        return container;
    };

    /**
     * Convenience function to set the position, scale, skew and pivot at once.
     *
     * @param {number} [x=0] - The X position
     * @param {number} [y=0] - The Y position
     * @param {number} [scaleX=1] - The X scale value
     * @param {number} [scaleY=1] - The Y scale value
     * @param {number} [rotation=0] - The rotation
     * @param {number} [skewX=0] - The X skew value
     * @param {number} [skewY=0] - The Y skew value
     * @param {number} [pivotX=0] - The X pivot value
     * @param {number} [pivotY=0] - The Y pivot value
     * @return {PIXI.DisplayObject} The DisplayObject instance
     */
    setTransform  (x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY)
    {
        if ( x === void 0 ) { x = 0; }
        if ( y === void 0 ) { y = 0; }
        if ( scaleX === void 0 ) { scaleX = 1; }
        if ( scaleY === void 0 ) { scaleY = 1; }
        if ( rotation === void 0 ) { rotation = 0; }
        if ( skewX === void 0 ) { skewX = 0; }
        if ( skewY === void 0 ) { skewY = 0; }
        if ( pivotX === void 0 ) { pivotX = 0; }
        if ( pivotY === void 0 ) { pivotY = 0; }

        this.position.x = x;
        this.position.y = y;
        this.scale.x = !scaleX ? 1 : scaleX;
        this.scale.y = !scaleY ? 1 : scaleY;
        this.rotation = rotation;
        this.skew.x = skewX;
        this.skew.y = skewY;
        this.pivot.x = pivotX;
        this.pivot.y = pivotY;

        return this;
    };

    /**
     * Base destroy method for generic display objects. This will automatically
     * remove the display object from its parent Container as well as remove
     * all current event listeners and internal references. Do not use a DisplayObject
     * after calling `destroy()`.
     *
     */
    destroy  (options = null)
    {
        // this.removeAllListeners();
        if (this.parent)
        {
            this.parent.removeChild(this);
        }
        this.transform = null;

        this.parent = null;

        this._bounds = null;
        this._currentBounds = null;
        this._mask = null;

        this.filterArea = null;

        this.interactive = false;
        this.interactiveChildren = false;

        this._destroyed = true;
    };

    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     * An alias to position.x
     *
     * @member {number}
     */
    get x ()
    {
        return this.position.x;
    };

    set x (value) // eslint-disable-line require-jsdoc
    {
        this.transform.position.x = value;
    };

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     * An alias to position.y
     *
     * @member {number}
     */
    get y ()
    {
        return this.position.y;
    };

    set y (value) // eslint-disable-line require-jsdoc
    {
        this.transform.position.y = value;
    };

    /**
     * Current transform of the object based on world (parent) factors.
     *
     * @member {PIXI.Matrix}
     * @readonly
     */
    get worldTransform ()
    {
        return this.transform.worldTransform;
    };

    /**
     * Current transform of the object based on local factors: position, scale, other stuff.
     *
     * @member {PIXI.Matrix}
     * @readonly
     */
    get localTransform ()
    {
        return this.transform.localTransform;
    };

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.IPoint}
     */
    get position ()
    {
        return this.transform.position;
    };

    set position (value) // eslint-disable-line require-jsdoc
    {
        this.transform.position.copyFrom(value);
    };

    /**
     * The scale factor of the object.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.IPoint}
     */
    get scale ()
    {
        return this.transform.scale;
    };

    set scale (value) // eslint-disable-line require-jsdoc
    {
        this.transform.scale.copyFrom(value);
    };

    /**
     * The pivot point of the displayObject that it rotates around.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.IPoint}
     */
    get pivot()
    {
        return this.transform.pivot;
    };

    set pivot (value) // eslint-disable-line require-jsdoc
    {
        this.transform.pivot.copyFrom(value);
    };

    /**
     * The skew factor for the object in radians.
     * Assignment by value since pixi-v4.
     *
     * @member {PIXI.ObservablePoint}
     */
    get skew()
    {
        return this.transform.skew;
    };

    set skew (value) // eslint-disable-line require-jsdoc
    {
        this.transform.skew.copyFrom(value);
    };

    /**
     * The rotation of the object in radians.
     * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
     *
     * @member {number}
     */
    get rotation ()
    {
        return this.transform.rotation;
    };

    set rotation (value) // eslint-disable-line require-jsdoc
    {
        this.transform.rotation = value;
    };

    /**
     * The angle of the object in degrees.
     * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
     *
     * @member {number}
     */
    get angle ()
    {
        return this.transform.rotation * MathSettings.RAD_TO_DEG;
    };

    set angle (value) // eslint-disable-line require-jsdoc
    {
        this.transform.rotation = value * MathSettings.DEG_TO_RAD;
    };

    /**
     * The zIndex of the displayObject.
     * If a container has the sortableChildren property set to true, children will be automatically
     * sorted by zIndex value; a higher value will mean it will be moved towards the end of the array,
     * and thus rendered on top of other displayObjects within the same container.
     *
     * @member {number}
     */
    get zIndex ()
    {
        return this._zIndex;
    };

    set zIndex (value) // eslint-disable-line require-jsdoc
    {
        this._zIndex = value;
        if (this.parent)
        {
            this.parent.sortDirty = true;
        }
    };

    /**
     * Indicates if the object is globally visible.
     *
     * @member {boolean}
     * @readonly
     */
    get worldVisible ()
    {
        var item = this;

        do
        {
            if (!item.visible)
            {
                return false;
            }

            item = item.parent;
        } while (item);

        return true;
    };

    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an
     * object to the shape of the mask applied to it. In PixiJS a regular mask must be a
     * {@link PIXI.Graphics} or a {@link PIXI.Sprite} object. This allows for much faster masking in canvas as it
     * utilities shape clipping. To remove a mask, set this property to `null`.
     *
     * For sprite mask both alpha and red channel are used. Black mask is the same as transparent mask.
     * @example
     * const graphics = new PIXI.Graphics();
     * graphics.beginFill(0xFF3300);
     * graphics.drawRect(50, 250, 100, 100);
     * graphics.endFill();
     *
     * const sprite = new PIXI.Sprite(texture);
     * sprite.mask = graphics;
     * @todo At the moment, PIXI.CanvasRenderer doesn't support PIXI.Sprite as mask.
     *
     * @member {PIXI.Graphics|PIXI.Sprite}
     */
    get mask ()
    {
        return this._mask;
    };

    set mask(value) // eslint-disable-line require-jsdoc
    {
        if (this._mask)
        {
            this._mask.renderable = true;
            this._mask.isMask = false;
        }

        this._mask = value;

        if (this._mask)
        {
            this._mask.renderable = false;
            this._mask.isMask = true;
        }
    };
/**
	     * Set this to true if you want this display object to be cached as a bitmap.
	     * This basically takes a snap shot of the display object as it is at that moment. It can
	     * provide a performance benefit for complex static displayObjects.
	     * To remove simply set this property to `false`
	     *
	     * IMPORTANT GOTCHA - Make sure that all your textures are preloaded BEFORE setting this property to true
	     * as it will take a snapshot of what is currently there. If the textures have not loaded then they will not appear.
	     *
	     * @member {boolean}
	     * @memberof PIXI.DisplayObject#
	     */
    get cacheAsBitmap()
    {
        return this._cacheAsBitmap;
    }

    set cacheAsBitmap(value)
    {
        if (this._cacheAsBitmap === value)
        {
            return;
        }
        this._cacheAsBitmap = value;
        var data;
        if (value)
        {
            if (!this._cacheData)
            {
                this._cacheData = new CacheData();
            }
            data = this._cacheData;
            data.originalRender = this.render;
            data.originalRenderCanvas = this.renderCanvas;
            data.originalUpdateTransform = this.updateTransform;
            data.originalCalculateBounds = this.calculateBounds;
            data.originalGetLocalBounds = this.getLocalBounds;
            data.originalDestroy = this.destroy;
            data.originalContainsPoint = this.containsPoint;
            data.originalMask = this._mask;
            data.originalFilterArea = this.filterArea;
            this.render = this._renderCached;
            this.renderCanvas = this._renderCachedCanvas;
            this.destroy = this._cacheAsBitmapDestroy;
        }
        else
        {
            data = this._cacheData;
            if (data.sprite)
            {
                this._destroyCachedDisplayObject();
            }
            this.render = data.originalRender;
            this.renderCanvas = data.originalRenderCanvas;
            this.calculateBounds = data.originalCalculateBounds;
            this.getLocalBounds = data.originalGetLocalBounds;
            this.destroy = data.originalDestroy;
            this.updateTransform = data.originalUpdateTransform;
            this.containsPoint = data.originalContainsPoint;
            this._mask = data.originalMask;
            this.filterArea = data.originalFilterArea;
        }
    }

    containsPoint(point)
    {
        return false;
    }
	/**
	 * Renders a cached version of the sprite with WebGL
	 *
	 * @private
	 * @function _renderCached
	 * @memberof PIXI.DisplayObject#
	 * @param {PIXI.Renderer} renderer - the WebGL renderer
	 */
	_renderCached (renderer)
	{
	    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
	    {
	        return;
	    }
	    this._initCachedDisplayObject(renderer);
	    this._cacheData.sprite.transform._worldID = this.transform._worldID;
	    this._cacheData.sprite.worldAlpha = this.worldAlpha;
	    this._cacheData.sprite._render(renderer);
    }
	/**
	 * Prepares the WebGL renderer to cache the sprite
	 *
	 * @private
	 * @function _initCachedDisplayObject
	 * @memberof PIXI.DisplayObject#
	 * @param {PIXI.Renderer} renderer - the WebGL renderer
	 */
	_initCachedDisplayObject (renderer)
	{
	    if (this._cacheData && this._cacheData.sprite)
	    {
	        return;
	    }

	    // make sure alpha is set to 1 otherwise it will get rendered as invisible!
	    var cacheAlpha = this.alpha;

	    this.alpha = 1;

	    // first we flush anything left in the renderer (otherwise it would get rendered to the cached texture)
	    renderer.batch.flush();
	    // this.filters= [];

	    // next we find the dimensions of the untransformed object
	    // this function also calls updatetransform on all its children as part of the measuring.
	    // This means we don't need to update the transform again in this function
	    // TODO pass an object to clone too? saves having to create a new one each time!
	    var bounds = this.getLocalBounds().clone();

	    // add some padding!
	    if (this.filters)
	    {
	        var padding = this.filters[0].padding;

	        bounds.pad(padding);
	    }

	    bounds.ceil(DisplaySettings.RESOLUTION);

	    // for now we cache the current renderTarget that the WebGL renderer is currently using.
	    // this could be more elegant..
	    var cachedRenderTarget = renderer._activeRenderTarget;
	    // We also store the filter stack - I will definitely look to change how this works a little later down the line.
	    // const stack = renderer.filterManager.filterStack;

	    // this renderTexture will be used to store the cached DisplayObject
	    var renderTexture = RenderTexture.create(bounds.width, bounds.height);

	    var textureCacheId = "cacheAsBitmap_" + (MathSettings.uid());

	    this._cacheData.textureCacheId = textureCacheId;

	    BaseTexture.addToCache(renderTexture.baseTexture, textureCacheId);
	    Texture.addToCache(renderTexture, textureCacheId);

	    // need to set //
	    var m = DisplayObject._tempMatrix;

	    m.tx = -bounds.x;
	    m.ty = -bounds.y;

	    // reset
	    this.transform.worldTransform.identity();

	    // set all properties to there original so we can render to a texture
	    this.render = this._cacheData.originalRender;

	    renderer.render(this, renderTexture, true, m, true);
	    // now restore the state be setting the new properties

	    renderer.renderTexture.bind(cachedRenderTarget);

	    // renderer.filterManager.filterStack = stack;

	    this.render = this._renderCached;
	    // the rest is the same as for Canvas
	    this.updateTransform = this.displayObjectUpdateTransform;
	    this.calculateBounds = this._calculateCachedBounds;
	    this.getLocalBounds = this._getCachedLocalBounds;

	    this._mask = null;
	    this.filterArea = null;

        // create our cached sprite
        

	    var cachedSprite// = new Sprite(renderTexture);

	    cachedSprite.transform.worldTransform = this.transform.worldTransform;
	    cachedSprite.anchor.x = -(bounds.x / bounds.width);
	    cachedSprite.anchor.y = -(bounds.y / bounds.height);
	    cachedSprite.alpha = cacheAlpha;
	    cachedSprite._bounds = this._bounds;

	    this._cacheData.sprite = cachedSprite;

	    this.transform._parentID = -1;
	    // restore the transform of the cached sprite to avoid the nasty flicker..
	    if (!this.parent)
	    {
	        this.parent = renderer._tempDisplayObjectParent;
	        this.updateTransform();
	        this.parent = null;
	    }
	    else
	    {
	        this.updateTransform();
	    }

	    // map the hit test..
	    this.containsPoint = cachedSprite.containsPoint.bind(cachedSprite);
    };
    
    	/**
	 * Renders a cached version of the sprite with canvas
	 *
	 * @private
	 * @function _renderCachedCanvas
	 * @memberof PIXI.DisplayObject#
	 * @param {PIXI.Renderer} renderer - the WebGL renderer
	 */
	_renderCachedCanvas (renderer)
	{
	    if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
	    {
	        return;
	    }

	    this._initCachedDisplayObjectCanvas(renderer);

	    this._cacheData.sprite.worldAlpha = this.worldAlpha;
	    this._cacheData.sprite._renderCanvas(renderer);
    };
    
	// TODO this can be the same as the WebGL version.. will need to do a little tweaking first though..
	/**
	 * Prepares the Canvas renderer to cache the sprite
	 *
	 * @private
	 * @function _initCachedDisplayObjectCanvas
	 * @memberof PIXI.DisplayObject#
	 * @param {PIXI.Renderer} renderer - the WebGL renderer
	 */
	_initCachedDisplayObjectCanvas (renderer)
	{
	    if (this._cacheData && this._cacheData.sprite)
	    {
	        return;
	    }

	    // get bounds actually transforms the object for us already!
	    var bounds = this.getLocalBounds();

	    var cacheAlpha = this.alpha;

	    this.alpha = 1;

	    var cachedRenderTarget = renderer.context;

	    bounds.ceil(DisplaySettings.RESOLUTION);

	    var renderTexture = RenderTexture.create(bounds.width, bounds.height);

	    var textureCacheId = "cacheAsBitmap_" + (MathSettings.uid());

	    this._cacheData.textureCacheId = textureCacheId;

	    BaseTexture.addToCache(renderTexture.baseTexture, textureCacheId);
	    Texture.addToCache(renderTexture, textureCacheId);

	    // need to set //
	    var m = DisplayObject._tempMatrix;

	    this.transform.localTransform.copyTo(m);
	    m.invert();

	    m.tx -= bounds.x;
	    m.ty -= bounds.y;

	    // m.append(this.transform.worldTransform.)
	    // set all properties to there original so we can render to a texture
	    this.renderCanvas = this._cacheData.originalRenderCanvas;

	    // renderTexture.render(this, m, true);
	    renderer.render(this, renderTexture, true, m, false);

	    // now restore the state be setting the new properties
	    renderer.context = cachedRenderTarget;

	    this.renderCanvas = this._renderCachedCanvas;
	    // the rest is the same as for WebGL
	    this.updateTransform = this.displayObjectUpdateTransform;
	    this.calculateBounds = this._calculateCachedBounds;
	    this.getLocalBounds = this._getCachedLocalBounds;

	    this._mask = null;
	    this.filterArea = null;

        // create our cached sprite
        
        
	    var cachedSprite //= new Sprite(renderTexture);

	    cachedSprite.transform.worldTransform = this.transform.worldTransform;
	    cachedSprite.anchor.x = -(bounds.x / bounds.width);
	    cachedSprite.anchor.y = -(bounds.y / bounds.height);
	    cachedSprite.alpha = cacheAlpha;
	    cachedSprite._bounds = this._bounds;

	    this._cacheData.sprite = cachedSprite;

	    this.transform._parentID = -1;
	    // restore the transform of the cached sprite to avoid the nasty flicker..
	    if (!this.parent)
	    {
	        this.parent = renderer._tempDisplayObjectParent;
	        this.updateTransform();
	        this.parent = null;
	    }
	    else
	    {
	        this.updateTransform();
	    }

	    // map the hit test..
	    this.containsPoint = cachedSprite.containsPoint.bind(cachedSprite);
    };
    renderCanvas(renderer)
    {

    }
	/**
	 * Calculates the bounds of the cached sprite
	 *
	 * @private
	 */
	_calculateCachedBounds ()
	{
	    this._bounds.clear();
	    this._cacheData.sprite.transform._worldID = this.transform._worldID;
	    this._cacheData.sprite._calculateBounds();
	    this._lastBoundsID = this._boundsID;
    };
    
	/**
	 * Gets the bounds of the cached sprite.
	 *
	 * @private
	 * @return {Rectangle} The local bounds.
	 */
	_getCachedLocalBounds()
	{
	    return this._cacheData.sprite.getLocalBounds();
    };
    
	/**
	 * Destroys the cached sprite.
	 *
	 * @private
	 */
	_destroyCachedDisplayObject ()
	{
	    this._cacheData.sprite._texture.destroy(true);
	    this._cacheData.sprite = null;

	    BaseTexture.removeFromCache(this._cacheData.textureCacheId);
	    Texture.removeFromCache(this._cacheData.textureCacheId);

	    this._cacheData.textureCacheId = null;
    };
    
    	/**
	 * Destroys the cached object.
	 *
	 * @private
	 * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
	 *  have been set to that value.
	 *  Used when destroying containers, see the Container.destroy method.
	 */
	_cacheAsBitmapDestroy (options)
	{
	    this.cacheAsBitmap = false;
	    this.destroy(options);
    };
    

   
}


    // figured theres no point adding ALL the extra variables to prototype.
	// this model can hold the information needed. This can also be generated on demand as
	// most objects are not cached as bitmaps.
	/**
	 * @class
	 * @ignore
	 */
	class CacheData
	{
	    public textureCacheId = null;

	    public originalRender = null;
	    public originalRenderCanvas = null;
	    public originalCalculateBounds = null;
	    public originalGetLocalBounds = null;

	    public originalUpdateTransform = null;
	    public originalHitTest = null;
	    public originalDestroy = null;
	    public originalMask = null;
	    public originalFilterArea = null;
	    public sprite = null;
	};