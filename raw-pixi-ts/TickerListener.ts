

export class TickerListener
{
    fn
    context
    priority
    once
    next
    previous
    _destroyed
    constructor(fn, context, priority, once = false)
    {
        if ( context === void 0 ) { context = null; }
	    if ( priority === void 0 ) { priority = 0; }
        if ( once === void 0 ) { once = false; }
        /**
	     * The handler function to execute.
	     * @private
	     * @member {Function}
	     */
        this.fn = fn;
        /**
	     * The calling to execute.
	     * @private
	     * @member {*}
	     */
	    this.context = context;
	    /**
	     * The current priority.
	     * @private
	     * @member {number}
	     */
        this.priority = priority;
        /**
	     * If this should only execute once.
	     * @private
	     * @member {boolean}
	     */
	    this.once = once;
	    /**
	     * The next item in chain.
	     * @private
	     * @member {TickerListener}
	     */
        this.next = null;
        /**
	     * The previous item in chain.
	     * @private
	     * @member {TickerListener}
	     */
	    this.previous = null;
	    /**
	     * `true` if this listener has been destroyed already.
	     * @member {boolean}
	     * @private
	     */
	    this._destroyed = false;
    }

    /**
	 * Emit by calling the current function.
	 * @private
	 * @param {number} deltaTime - time since the last emit.
	 * @return {TickerListener} Next ticker
	 */
	emit(deltaTime)
	{
	    if (this.fn)
	    {
	        if (this.context)
	        {
	            this.fn.call(this.context, deltaTime);
	        }
	        else
	        {
	            this.fn(deltaTime);
	        }
	    }

	    var redirect = this.next;

	    if (this.once)
	    {
	        this.destroy(true);
	    }

	    // Soft-destroying should remove
	    // the next reference
	    if (this._destroyed)
	    {
	        this.next = null;
	    }

	    return redirect;
    };

    /**
	 * Destroy and don't use after this.
	 * @private
	 * @param {boolean} [hard = false] `true` to remove the `next` reference, this
	 *    is considered a hard destroy. Soft destroy maintains the next reference.
	 * @return {TickerListener} The listener to redirect while emitting or removing.
	 */
	destroy(hard)
	{
	        if ( hard === void 0 ) { hard = false; }

	    this._destroyed = true;
	    this.fn = null;
	    this.context = null;

	    // Disconnect, hook up next and previous
	    if (this.previous)
	    {
	        this.previous.next = this.next;
	    }

	    if (this.next)
	    {
	        this.next.previous = this.previous;
	    }

	    // Redirect to the next item
	    var redirect = this.next;

	    // Remove references
	    this.next = hard ? null : redirect;
	    this.previous = null;

	    return redirect;
	};
    
    /**
	 * Connect to the list.
	 * @private
	 * @param {TickerListener} previous - Input node, previous listener
	 */
	connect(previous)
	{
	    this.previous = previous;
	    if (previous.next)
	    {
	        previous.next.previous = this;
	    }
	    this.next = previous.next;
	    previous.next = this;
	};

    /**
	 * Simple compare function to figure out if a function and context match.
	 * @private
	 * @param {Function} fn - The listener function to be added for one update
	 * @param {Function} context - The listener context
	 * @return {boolean} `true` if the listener match the arguments
	 */
	match(fn, context)
	{
	    context = context || null;

	    return this.fn === fn && this.context === context;
	};
}


	