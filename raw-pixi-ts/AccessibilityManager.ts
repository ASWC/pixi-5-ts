// import { settings } from './settings';
import { UtilsSettings } from './UtilsSettings';


export class AccessibilityManager
{
    static DIV_HOOK_SIZE = 1;
	static DIV_HOOK_POS_X = -1000;
	static DIV_HOOK_POS_Y = -1000;
	static DIV_HOOK_ZINDEX = 2;
    static KEY_CODE_TAB = 9;
    static DIV_TOUCH_SIZE = 100;
    static DIV_TOUCH_POS_X = 0;
    static DIV_TOUCH_POS_Y = 0;
    static DIV_TOUCH_ZINDEX = 2;
    _hookDiv
    renderId
    debug
    isMobileAccessibility
    children
    isActive
    
    renderer
    
    pool
    div
    constructor(renderer)
    {
        
/**
	     * @type {?HTMLElement}
	     * @private
	     */
	    this._hookDiv = null;
	    // if (settings.isMobile_min.tablet || settings.isMobile_min.phone)
	    // {
	        this.createTouchHook();
	    // }

	    // first we create a div that will sit over the PixiJS element. This is where the div overlays will go.
	    var div = document.createElement('div');

	    div.style.width = AccessibilityManager.DIV_TOUCH_SIZE + "px";
	    div.style.height = AccessibilityManager.DIV_TOUCH_SIZE + "px";
	    div.style.position = 'absolute';
	    div.style.top = AccessibilityManager.DIV_TOUCH_POS_X + "px";
	    div.style.left = AccessibilityManager.DIV_TOUCH_POS_Y + "px";
	    div.style.zIndex = AccessibilityManager.DIV_TOUCH_ZINDEX.toString();

	    /**
	     * This is the dom element that will sit over the PixiJS element. This is where the div overlays will go.
	     *
	     * @type {HTMLElement}
	     * @private
	     */
	    this.div = div;

	    /**
	     * A simple pool for storing divs.
	     *
	     * @type {*}
	     * @private
	     */
	    this.pool = [];

	    /**
	     * This is a tick used to check if an object is no longer being rendered.
	     *
	     * @type {Number}
	     * @private
	     */
	    this.renderId = 0;

	    /**
	     * Setting this to true will visually show the divs.
	     *
	     * @type {boolean}
	     */
	    this.debug = false;

	    /**
	     * The renderer this accessibility manager works for.
	     *
	     * @member {PIXI.AbstractRenderer}
	     */
	    this.renderer = renderer;

	    /**
	     * The array of currently active accessible items.
	     *
	     * @member {Array<*>}
	     * @private
	     */
	    this.children = [];

	    /**
	     * pre-bind the functions
	     *
	     * @type {Function}
	     * @private
	     */
	    this._onKeyDown = this._onKeyDown.bind(this);

	    /**
	     * pre-bind the functions
	     *
	     * @type {Function}
	     * @private
	     */
	    this._onMouseMove = this._onMouseMove.bind(this);

	    /**
	     * A flag
	     * @type {boolean}
	     * @readonly
	     */
	    this.isActive = false;

	    /**
	     * A flag
	     * @type {boolean}
	     * @readonly
	     */
	    this.isMobileAccessibility = false;

	    // let listen for tab.. once pressed we can fire up and show the accessibility layer
	    window.addEventListener('keydown', this._onKeyDown, false);
    }

    /**
	 * Creates the touch hooks.
	 *
	 * @private
	 */
	createTouchHook ()
	{
	        var this$1 = this;

	    var hookDiv = document.createElement('button');

	    hookDiv.style.width = AccessibilityManager.DIV_HOOK_SIZE + "px";
	    hookDiv.style.height = AccessibilityManager.DIV_HOOK_SIZE + "px";
	    hookDiv.style.position = 'absolute';
	    hookDiv.style.top = AccessibilityManager.DIV_HOOK_POS_X + "px";
	    hookDiv.style.left = AccessibilityManager.DIV_HOOK_POS_Y + "px";
	    hookDiv.style.zIndex = AccessibilityManager.DIV_HOOK_ZINDEX.toString();
	    hookDiv.style.backgroundColor = '#FF0000';
	    hookDiv.title = 'HOOK DIV';

	    hookDiv.addEventListener('focus', function () {
	        this$1.isMobileAccessibility = true;
	        this$1.activate();
	        this$1.destroyTouchHook();
		});

	    document.body.appendChild(hookDiv);
	    this._hookDiv = hookDiv;
	};

	/**
	 * Destroys the touch hooks.
	 *
	 * @private
	 */
	destroyTouchHook  ()
	{
	    if (!this._hookDiv)
	    {
	        return;
	    }
	    document.body.removeChild(this._hookDiv);
	    this._hookDiv = null;
	};

	/**
	 * Activating will cause the Accessibility layer to be shown.
	 * This is called when a user presses the tab key.
	 *
	 * @private
	 */
	activate  ()
	{
	    if (this.isActive)
	    {
	        return;
	    }

	    this.isActive = true;

	    window.document.addEventListener('mousemove', this._onMouseMove, true);
	    window.removeEventListener('keydown', this._onKeyDown, false);

	    this.renderer.on('postrender', this.update, this);

	    if (this.renderer.view.parentNode)
	    {
	        this.renderer.view.parentNode.appendChild(this.div);
	    }
	};

	/**
	 * Deactivating will cause the Accessibility layer to be hidden.
	 * This is called when a user moves the mouse.
	 *
	 * @private
	 */
	deactivate ()
	{
	    if (!this.isActive || this.isMobileAccessibility)
	    {
	        return;
	    }

	    this.isActive = false;

	    window.document.removeEventListener('mousemove', this._onMouseMove, true);
	    window.addEventListener('keydown', this._onKeyDown, false);

	    this.renderer.off('postrender', this.update);

	    if (this.div.parentNode)
	    {
	        this.div.parentNode.removeChild(this.div);
	    }
	};

	/**
	 * This recursive function will run through the scene graph and add any new accessible objects to the DOM layer.
	 *
	 * @private
	 * @param {PIXI.Container} displayObject - The DisplayObject to check.
	 */
	updateAccessibleObjects  (displayObject)
	{
	    if (!displayObject.visible)
	    {
	        return;
	    }

	    if (displayObject.accessible && displayObject.interactive)
	    {
	        if (!displayObject._accessibleActive)
	        {
	            this.addChild(displayObject);
	        }

	        displayObject.renderId = this.renderId;
	    }

	    var children = displayObject.children;

	    for (var i = 0; i < children.length; i++)
	    {
	        this.updateAccessibleObjects(children[i]);
	    }
	};

	/**
	 * Before each render this function will ensure that all divs are mapped correctly to their DisplayObjects.
	 *
	 * @private
	 */
	update  ()
	{
	    if (!this.renderer.renderingToScreen)
	    {
	        return;
	    }

	    // update children...
	    this.updateAccessibleObjects(this.renderer._lastObjectRendered);

	    var rect = this.renderer.view.getBoundingClientRect();
	    var sx = rect.width / this.renderer.width;
	    var sy = rect.height / this.renderer.height;

	    var div = this.div;

	    div.style.left = (rect.left) + "px";
	    div.style.top = (rect.top) + "px";
	    div.style.width = (this.renderer.width) + "px";
	    div.style.height = (this.renderer.height) + "px";

	    for (var i = 0; i < this.children.length; i++)
	    {
	        var child = this.children[i];

	        if (child.renderId !== this.renderId)
	        {
	            child._accessibleActive = false;

	            UtilsSettings.removeItems(this.children, i, 1);
	            this.div.removeChild(child._accessibleDiv);
	            this.pool.push(child._accessibleDiv);
	            child._accessibleDiv = null;

	            i--;

	            if (this.children.length === 0)
	            {
	                this.deactivate();
	            }
	        }
	        else
	        {
	            // map div to display..
	            div = child._accessibleDiv;
	            var hitArea = child.hitArea;
	            var wt = child.worldTransform;

	            if (child.hitArea)
	            {
	                div.style.left = ((wt.tx + (hitArea.x * wt.a)) * sx) + "px";
	                div.style.top = ((wt.ty + (hitArea.y * wt.d)) * sy) + "px";

	                div.style.width = (hitArea.width * wt.a * sx) + "px";
	                div.style.height = (hitArea.height * wt.d * sy) + "px";
	            }
	            else
	            {
	                hitArea = child.getBounds();

	                this.capHitArea(hitArea);

	                div.style.left = (hitArea.x * sx) + "px";
	                div.style.top = (hitArea.y * sy) + "px";

	                div.style.width = (hitArea.width * sx) + "px";
	                div.style.height = (hitArea.height * sy) + "px";

	                // update button titles and hints if they exist and they've changed
	                if (div.title !== child.accessibleTitle && child.accessibleTitle !== null)
	                {
	                    div.title = child.accessibleTitle;
	                }
	                if (div.getAttribute('aria-label') !== child.accessibleHint
	                    && child.accessibleHint !== null)
	                {
	                    div.setAttribute('aria-label', child.accessibleHint);
	                }
	            }
	        }
	    }

	    // increment the render id..
	    this.renderId++;
	};

	/**
	 * Adjust the hit area based on the bounds of a display object
	 *
	 * @param {Rectangle} hitArea - Bounds of the child
	 */
	capHitArea  (hitArea)
	{
	    if (hitArea.x < 0)
	    {
	        hitArea.width += hitArea.x;
	        hitArea.x = 0;
	    }

	    if (hitArea.y < 0)
	    {
	        hitArea.height += hitArea.y;
	        hitArea.y = 0;
	    }

	    if (hitArea.x + hitArea.width > this.renderer.width)
	    {
	        hitArea.width = this.renderer.width - hitArea.x;
	    }

	    if (hitArea.y + hitArea.height > this.renderer.height)
	    {
	        hitArea.height = this.renderer.height - hitArea.y;
	    }
	};

	/**
	 * Adds a DisplayObject to the accessibility manager
	 *
	 * @private
	 * @param {DisplayObject} displayObject - The child to make accessible.
	 */
	addChild  (displayObject)
	{
	    //this.activate();

	    var div = this.pool.pop();

	    if (!div)
	    {
	        div = document.createElement('button');

	        div.style.width = AccessibilityManager.DIV_TOUCH_SIZE + "px";
	        div.style.height = AccessibilityManager.DIV_TOUCH_SIZE + "px";
	        div.style.backgroundColor = this.debug ? 'rgba(255,0,0,0.5)' : 'transparent';
	        div.style.position = 'absolute';
	        div.style.zIndex = AccessibilityManager.DIV_TOUCH_ZINDEX;
	        div.style.borderStyle = 'none';

	        // ARIA attributes ensure that button title and hint updates are announced properly
	        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
	        {
	            // Chrome doesn't need aria-live to work as intended; in fact it just gets more confused.
	            div.setAttribute('aria-live', 'off');
	        }
	        else
	        {
	            div.setAttribute('aria-live', 'polite');
	        }

	        if (navigator.userAgent.match(/rv:.*Gecko\//))
	        {
	            // FireFox needs this to announce only the new button name
	            div.setAttribute('aria-relevant', 'additions');
	        }
	        else
	        {
	            // required by IE, other browsers don't much care
	            div.setAttribute('aria-relevant', 'text');
	        }

	        div.addEventListener('click', this._onClick.bind(this));
	        div.addEventListener('focus', this._onFocus.bind(this));
	        div.addEventListener('focusout', this._onFocusOut.bind(this));
	    }

	    if (displayObject.accessibleTitle && displayObject.accessibleTitle !== null)
	    {
	        div.title = displayObject.accessibleTitle;
	    }
	    else if (!displayObject.accessibleHint
	             || displayObject.accessibleHint === null)
	    {
	        div.title = "displayObject " + (displayObject.tabIndex);
	    }

	    if (displayObject.accessibleHint
	        && displayObject.accessibleHint !== null)
	    {
	        div.setAttribute('aria-label', displayObject.accessibleHint);
	    }

	    //

	    displayObject._accessibleActive = true;
	    displayObject._accessibleDiv = div;
	    div.displayObject = displayObject;

	    this.children.push(displayObject);
	    this.div.appendChild(displayObject._accessibleDiv);
	    displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;
	};

	/**
	 * Maps the div button press to pixi's  (click)
	 *
	 * @private
	 * @param {MouseEvent} e - The click event.
	 */
	_onClick (e)
	{
	    var interactionManager = this.renderer.plugins.interaction;

	    interactionManager.dispatchEvent(e.target.displayObject, 'click', interactionManager.eventData);
	};

	/**
	 * Maps the div focus events to pixi's  (mouseover)
	 *
	 * @private
	 * @param {FocusEvent} e - The focus event.
	 */
	_onFocus  (e)
	{
	    if (!e.target.getAttribute('aria-live', 'off'))
	    {
	        e.target.setAttribute('aria-live', 'assertive');
	    }
	    var interactionManager = this.renderer.plugins.interaction;

	    interactionManager.dispatchEvent(e.target.displayObject, 'mouseover', interactionManager.eventData);
	};

	/**
	 * Maps the div focus events to pixi's  (mouseout)
	 *
	 * @private
	 * @param {FocusEvent} e - The focusout event.
	 */
	_onFocusOut  (e)
	{
	    if (!e.target.getAttribute('aria-live', 'off'))
	    {
	        e.target.setAttribute('aria-live', 'polite');
	    }
	    var interactionManager = this.renderer.plugins.interaction;

	    interactionManager.dispatchEvent(e.target.displayObject, 'mouseout', interactionManager.eventData);
	};

	/**
	 * Is called when a key is pressed
	 *
	 * @private
	 * @param {KeyboardEvent} e - The keydown event.
	 */
	_onKeyDown  (e)
	{
	    if (e.keyCode !== AccessibilityManager.KEY_CODE_TAB)
	    {
	        return;
	    }

	    this.activate();
	};

	/**
	 * Is called when the mouse moves across the renderer element
	 *
	 * @private
	 * @param {MouseEvent} e - The mouse event.
	 */
	_onMouseMove  (e)
	{
	    if (e.movementX === 0 && e.movementY === 0)
	    {
	        return;
	    }

	    this.deactivate();
	};

	/**
	 * Destroys the accessibility manager
	 *
	 */
	destroy ()
	{
	    this.destroyTouchHook();
	    this.div = null;

	    for (var i = 0; i < this.children.length; i++)
	    {
	        this.children[i].div = null;
	    }

	    window.document.removeEventListener('mousemove', this._onMouseMove, true);
	    window.removeEventListener('keydown', this._onKeyDown);

	    this.pool = null;
	    this.children = null;
	    this.renderer = null;
	};
}



	

