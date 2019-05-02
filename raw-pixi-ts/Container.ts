import { DisplayObject } from "./DisplayObject";
import { Event } from './Event';
import { UtilsSettings } from './UtilsSettings';
import { DisplaySettings } from './DisplaySettings';


export class Container extends DisplayObject
{
    
    sortDirty
    _width
    children
    sortableChildren
    _height
    containerUpdateTransform
    constructor()
    {
        super();
        this.containerUpdateTransform = this.updateTransform;
        /**
         * The array of children of this container.
         *
         * @member {PIXI.DisplayObject[]}
         * @readonly
         */
        this.children = [];

        /**
         * If set to true, the container will sort its children by zIndex value
         * when updateTransform() is called, or manually if sortChildren() is called.
         *
         * This actually changes the order of elements in the array, so should be treated
         * as a basic solution that is not performant compared to other solutions,
         * such as @link https://github.com/pixijs/pixi-display
         *
         * Also be aware of that this may not work nicely with the addChildAt() function,
         * as the zIndex sorting may cause the child to automatically sorted to another position.
         *
         * @see PIXI.settings.SORTABLE_CHILDREN
         *
         * @member {boolean}
         */
        this.sortableChildren = DisplaySettings.SORTABLE_CHILDREN;

        /**
         * Should children be sorted by zIndex at the next updateTransform call.
         * Will get automatically set to true if a new child is added, or if a child's zIndex changes.
         *
         * @member {boolean}
         */
        this.sortDirty = false;

        /**
         * Fired when a DisplayObject is added to this Container.
         *
         * @event PIXI.Container#childAdded
         * @param {PIXI.DisplayObject} child - The child added to the Container.
         * @param {PIXI.Container} container - The container that added the child.
         * @param {number} index - The children's index of the added child.
         */

        /**
         * Fired when a DisplayObject is removed from this Container.
         *
         * @event PIXI.DisplayObject#removedFrom
         * @param {PIXI.DisplayObject} child - The child removed from the Container.
         * @param {PIXI.Container} container - The container that removed removed the child.
         * @param {number} index - The former children's index of the removed child
         */
    }

    	/**
	 * Returns the display object in the container.
	 *
	 * @method getChildByName
	 * @memberof PIXI.Container#
	 * @param {string} name - Instance name.
	 * @return {PIXI.DisplayObject} The child with the specified name.
	 */
	getChildByName (name)
	{
	    for (var i = 0; i < this.children.length; i++)
	    {
	        if (this.children[i].name === name)
	        {
	            return this.children[i];
	        }
	    }

	    return null;
	};

    /**
     * Overridable method that can be used by Container subclasses whenever the children array is modified
     *
     * @protected
     */
    onChildrenChange  (options)
    {
        /* empty */
    };

    /**
     * Adds one or more children to the container.
     *
     * Multiple items can be added like so: `myContainer.addChild(thingOne, thingTwo, thingThree)`
     *
     * @param {...PIXI.DisplayObject} child - The DisplayObject(s) to add to the container
     * @return {PIXI.DisplayObject} The first child that was added.
     */
    addChild  (child:DisplayObject)
    {
        var arguments$1 = arguments;

        var argumentsLength = arguments.length;

        // if there is only one argument we can bypass looping through the them
        if (argumentsLength > 1)
        {
            // loop through the arguments property and add all children
            // use it the right way (.length and [i]) so that this function can still be optimized by JS runtimes
            for (var i = 0; i < argumentsLength; i++)
            {
                this.addChild(arguments$1[i]);
            }
        }
        else
        {
            // if the child has a parent then lets remove it as PixiJS objects can only exist in one place
            if (child.parent)
            {
                child.parent.removeChild(child);
            }

            child.parent = this;
            this.sortDirty = true;

            // ensure child transform will be recalculated
            child.transform._parentID = -1;

            this.children.push(child);

            // ensure bounds will be recalculated
            this._boundsID++;

            // TODO - lets either do all callbacks or all events.. not both!
            this.onChildrenChange(this.children.length - 1);
            this.dispatchEvent(Event.getEvent("childAdded"));
            // this.emit('childAdded', child, this, this.children.length - 1);
            child.dispatchEvent(Event.getEvent("added"))
            // child.emit('added', this);
        }

        return child;
    };

    /**
     * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
     *
     * @param {PIXI.DisplayObject} child - The child to add
     * @param {number} index - The index to place the child in
     * @return {PIXI.DisplayObject} The child that was added.
     */
    addChildAt  (child, index)
    {
        if (index < 0 || index > this.children.length)
        {
            throw new Error((child + "addChildAt: The index " + index + " supplied is out of bounds " + (this.children.length)));
        }

        if (child.parent)
        {
            child.parent.removeChild(child);
        }

        child.parent = this;
        this.sortDirty = true;

        // ensure child transform will be recalculated
        child.transform._parentID = -1;

        this.children.splice(index, 0, child);

        // ensure bounds will be recalculated
        this._boundsID++;

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index);
        // child.emit('added', this);
        this.dispatchEvent(Event.getEvent("childAdded"));
        // this.emit('childAdded', child, this, index);

        return child;
    };

    /**
     * Swaps the position of 2 Display Objects within this container.
     *
     * @param {PIXI.DisplayObject} child - First display object to swap
     * @param {PIXI.DisplayObject} child2 - Second display object to swap
     */
    swapChildren  (child, child2)
    {
        if (child === child2)
        {
            return;
        }

        var index1 = this.getChildIndex(child);
        var index2 = this.getChildIndex(child2);

        this.children[index1] = child2;
        this.children[index2] = child;
        this.onChildrenChange(index1 < index2 ? index1 : index2);
    };

    /**
     * Returns the index position of a child DisplayObject instance
     *
     * @param {PIXI.DisplayObject} child - The DisplayObject instance to identify
     * @return {number} The index position of the child display object to identify
     */
    getChildIndex  (child)
    {
        var index = this.children.indexOf(child);

        if (index === -1)
        {
            throw new Error('The supplied DisplayObject must be a child of the caller');
        }

        return index;
    };

    /**
     * Changes the position of an existing child in the display object container
     *
     * @param {PIXI.DisplayObject} child - The child DisplayObject instance for which you want to change the index number
     * @param {number} index - The resulting index number for the child display object
     */
    setChildIndex  (child, index)
    {
        if (index < 0 || index >= this.children.length)
        {
            throw new Error(("The index " + index + " supplied is out of bounds " + (this.children.length)));
        }

        var currentIndex = this.getChildIndex(child);

        UtilsSettings.removeItems(this.children, currentIndex, 1); // remove from old position
        this.children.splice(index, 0, child); // add at new position

        this.onChildrenChange(index);
    };

    /**
     * Returns the child at the specified index
     *
     * @param {number} index - The index to get the child at
     * @return {PIXI.DisplayObject} The child at the given index, if any.
     */
    getChildAt  (index)
    {
        if (index < 0 || index >= this.children.length)
        {
            throw new Error(("getChildAt: Index (" + index + ") does not exist."));
        }

        return this.children[index];
    };

    /**
     * Removes one or more children from the container.
     *
     * @param {...PIXI.DisplayObject} child - The DisplayObject(s) to remove
     * @return {PIXI.DisplayObject} The first child that was removed.
     */
   removeChild  (child)
    {
        var arguments$1 = arguments;

        var argumentsLength = arguments.length;

        // if there is only one argument we can bypass looping through the them
        if (argumentsLength > 1)
        {
            // loop through the arguments property and add all children
            // use it the right way (.length and [i]) so that this function can still be optimized by JS runtimes
            for (var i = 0; i < argumentsLength; i++)
            {
                this.removeChild(arguments$1[i]);
            }
        }
        else
        {
            var index = this.children.indexOf(child);

            if (index === -1) { return null; }

            child.parent = null;
            // ensure child transform will be recalculated
            child.transform._parentID = -1;
            UtilsSettings.removeItems(this.children, index, 1);

            // ensure bounds will be recalculated
            this._boundsID++;

            // TODO - lets either do all callbacks or all events.. not both!
            this.onChildrenChange(index);
            // child.emit('removed', this);
            this.dispatchEvent(Event.getEvent("childRemoved"));
            // this.emit('childRemoved', child, this, index);
        }

        return child;
    };

    /**
     * Removes a child from the specified index position.
     *
     * @param {number} index - The index to get the child from
     * @return {PIXI.DisplayObject} The child that was removed.
     */
    removeChildAt (index)
    {
        var child = this.getChildAt(index);

        // ensure child transform will be recalculated..
        child.parent = null;
        child.transform._parentID = -1;
        UtilsSettings.removeItems(this.children, index, 1);

        // ensure bounds will be recalculated
        this._boundsID++;

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(index);
        // child.emit('removed', this);
        this.dispatchEvent(Event.getEvent("childRemoved"));
        // this.emit('childRemoved', child, this, index);

        return child;
    };

    /**
     * Removes all children from this container that are within the begin and end indexes.
     *
     * @param {number} [beginIndex=0] - The beginning position.
     * @param {number} [endIndex=this.children.length] - The ending position. Default value is size of the container.
     * @returns {DisplayObject[]} List of removed children
     */
    removeChildren  (beginIndex, endIndex)
    {
        if ( beginIndex === void 0 ) { beginIndex = 0; }

        var begin = beginIndex;
        var end = typeof endIndex === 'number' ? endIndex : this.children.length;
        var range = end - begin;
        var removed;

        if (range > 0 && range <= end)
        {
            removed = this.children.splice(begin, range);

            for (var i = 0; i < removed.length; ++i)
            {
                removed[i].parent = null;
                if (removed[i].transform)
                {
                    removed[i].transform._parentID = -1;
                }
            }

            this._boundsID++;

            this.onChildrenChange(beginIndex);

            for (var i$1 = 0; i$1 < removed.length; ++i$1)
            {
                // removed[i$1].emit('removed', this);
                this.dispatchEvent(Event.getEvent("childRemoved"));
                // this.emit('childRemoved', removed[i$1], this, i$1);
            }

            return removed;
        }
        else if (range === 0 && this.children.length === 0)
        {
            return [];
        }

        throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
    };

    /**
     * Sorts children by zIndex. Previous order is mantained for 2 children with the same zIndex.
     */
    sortChildren  ()
    {
        var sortRequired = false;

        for (var i = 0, j = this.children.length; i < j; ++i)
        {
            var child = this.children[i];

            child._lastSortedIndex = i;

            if (!sortRequired && child.zIndex !== 0)
            {
                sortRequired = true;
            }
        }

        if (sortRequired && this.children.length > 1)
        {
            this.children.sort(Container.sortChildren);
        }

        this.sortDirty = false;
    };

    /**
     * Updates the transform on all children of this container for rendering
     */
    updateTransform ()
    {
        if (this.sortableChildren && this.sortDirty)
        {
            this.sortChildren();
        }

        this._boundsID++;

        this.transform.updateTransform(this.parent.transform);

        // TODO: check render flags, how to process stuff here
        this.worldAlpha = this.alpha * this.parent.worldAlpha;

        for (var i = 0, j = this.children.length; i < j; ++i)
        {
            var child = this.children[i];

            if (child.visible)
            {
                child.updateTransform();
            }
        }
    };

    /**
     * Recalculates the bounds of the container.
     *
     */
    calculateBounds  ()
    {
        this._bounds.clear();

        this._calculateBounds();

        for (var i = 0; i < this.children.length; i++)
        {
            var child = this.children[i];

            if (!child.visible || !child.renderable)
            {
                continue;
            }

            child.calculateBounds();

            // TODO: filter+mask, need to mask both somehow
            if (child._mask)
            {
                child._mask.calculateBounds();
                this._bounds.addBoundsMask(child._bounds, child._mask._bounds);
            }
            else if (child.filterArea)
            {
                this._bounds.addBoundsArea(child._bounds, child.filterArea);
            }
            else
            {
                this._bounds.addBounds(child._bounds);
            }
        }

        this._lastBoundsID = this._boundsID;
    };

    /**
     * Recalculates the bounds of the object. Override this to
     * calculate the bounds of the specific object (not including children).
     *
     * @protected
     */
    _calculateBounds ()
    {
        // FILL IN//
    };

    /**
     * Renders the object using the WebGL renderer
     *
     * @param {PIXI.Renderer} renderer - The renderer
     */
    render (renderer)
    {
        // if the object is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
        {
            return;
        }

        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || this.filters)
        {
            this.renderAdvanced(renderer);
        }
        else
        {
            this._render(renderer);

            // simple render children!
            for (var i = 0, j = this.children.length; i < j; ++i)
            {
                this.children[i].render(renderer);
            }
        }
    };

    /**
     * Render the object using the WebGL renderer and advanced features.
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    renderAdvanced  (renderer)
    {
        renderer.batch.flush();

        var filters = this.filters;
        var mask = this._mask;

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (filters)
        {
            if (!this._enabledFilters)
            {
                this._enabledFilters = [];
            }

            this._enabledFilters.length = 0;

            for (var i = 0; i < filters.length; i++)
            {
                if (filters[i].enabled)
                {
                    this._enabledFilters.push(filters[i]);
                }
            }

            if (this._enabledFilters.length)
            {
                renderer.filter.push(this, this._enabledFilters);
            }
        }

        if (mask)
        {
            renderer.mask.push(this, this._mask);
        }

        // add this object to the batch, only rendered if it has a texture.
        this._render(renderer);

        // now loop through the children and make sure they get rendered
        for (var i$1 = 0, j = this.children.length; i$1 < j; i$1++)
        {
            this.children[i$1].render(renderer);
        }

        renderer.batch.flush();

        if (mask)
        {
            renderer.mask.pop(this, this._mask);
        }

        if (filters && this._enabledFilters && this._enabledFilters.length)
        {
            renderer.filter.pop();
        }
    };

    /**
     * To be overridden by the subclasses.
     *
     * @protected
     * @param {PIXI.Renderer} renderer - The renderer
     */
    _render  (renderer) // eslint-disable-line no-unused-vars
    {
        // this is where content itself gets rendered...
    };

    /**
     * Removes all internal references and listeners as well as removes children from the display list.
     * Do not use a Container after calling `destroy`.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *  method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the texture of the child sprite
     * @param {boolean} [options.baseTexture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the base texture of the child sprite
     */
    destroy (options)
    {
        super.destroy(options);

        this.sortDirty = false;

        var destroyChildren = typeof options === 'boolean' ? options : options && options.children;

        var oldChildren = this.removeChildren(0, this.children.length);

        if (destroyChildren)
        {
            for (var i = 0; i < oldChildren.length; ++i)
            {
                oldChildren[i].destroy(options);
            }
        }
    };

    /**
     * The width of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width ()
    {
        return this.scale.x * this.getLocalBounds().width;
    };

    set width (value) // eslint-disable-line require-jsdoc
    {
        var width = this.getLocalBounds().width;

        if (width !== 0)
        {
            this.scale.x = value / width;
        }
        else
        {
            this.scale.x = 1;
        }

        this._width = value;
    };

    /**
     * The height of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height ()
    {
        return this.scale.y * this.getLocalBounds().height;
    };

    set height (value) // eslint-disable-line require-jsdoc
    {
        var height = this.getLocalBounds().height;

        if (height !== 0)
        {
            this.scale.y = value / height;
        }
        else
        {
            this.scale.y = 1;
        }

        this._height = value;
    };

    static sortChildren(a, b)
	{
	    if (a.zIndex === b.zIndex)
	    {
	        return a._lastSortedIndex - b._lastSortedIndex;
	    }

	    return a.zIndex - b.zIndex;
	}
}

