import { Resource } from "./Resource";

export class Loader
{
    // static async$1 = unwrapExports(async);
    static MAX_PROGRESS = 100;
	static rgxExtractUrlHash = /(#[\w-]+)?$/;
    baseUrl
    loading
    _afterMiddleware
    _beforeMiddleware
    defaultQueryString
    _queue
    resources
    _boundLoadResource
    _resourcesParsing
    progress
    constructor(baseUrl = '', concurrency = 0)
    {        
        var _this = this;
        baseUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        concurrency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;


        /**
         * The base url for all resources loaded by this loader.
         *
         * @member {string}
         */
        this.baseUrl = baseUrl;

        /**
         * The progress percent of the loader going through the queue.
         *
         * @member {number}
         */
        this.progress = 0;

        /**
         * Loading state of the loader, true if it is currently loading resources.
         *
         * @member {boolean}
         */
        this.loading = false;

        /**
         * A querystring to append to every URL added to the loader.
         *
         * This should be a valid query string *without* the question-mark (`?`). The loader will
         * also *not* escape values for you. Make sure to escape your parameters with
         * [`encodeURIComponent`](https://mdn.io/encodeURIComponent) before assigning this property.
         *
         * @example
         * const loader = new Loader();
         *
         * loader.defaultQueryString = 'user=me&password=secret';
         *
         * // This will request 'image.png?user=me&password=secret'
         * loader.add('image.png').load();
         *
         * loader.reset();
         *
         * // This will request 'image.png?v=1&user=me&password=secret'
         * loader.add('iamge.png?v=1').load();
         *
         * @member {string}
         */
        this.defaultQueryString = '';

        /**
         * The middleware to run before loading each resource.
         *
         * @private
         * @member {function[]}
         */
        this._beforeMiddleware = [];

        /**
         * The middleware to run after loading each resource.
         *
         * @private
         * @member {function[]}
         */
        this._afterMiddleware = [];

        /**
         * The tracks the resources we are currently completing parsing for.
         *
         * @private
         * @member {Resource[]}
         */
        this._resourcesParsing = [];

        /**
         * The `_loadResource` function bound with this object context.
         *
         * @private
         * @member {function}
         * @param {Resource} r - The resource to load
         * @param {Function} d - The dequeue function
         * @return {undefined}
         */
        this._boundLoadResource = function (r, d) {
            return _this._loadResource(r, d);
        };

        /**
         * The resources waiting to be loaded.
         *
         * @private
         * @member {Resource[]}
         */
        // this._queue = async$1.queue(this._boundLoadResource, concurrency);

        // this._queue.pause();

        /**
         * All the resources for this loader keyed by name.
         *
         * @member {object<string, Resource>}
         */
        this.resources = {};

        /**
         * Dispatched once per loaded or errored resource.
         *
         * The callback looks like {@link Loader.OnProgressSignal}.
         *
         * @member {Signal<Loader.OnProgressSignal>}
         */
        // this.onProgress = new _miniSignals2.default();

        /**
         * Dispatched once per errored resource.
         *
         * The callback looks like {@link Loader.OnErrorSignal}.
         *
         * @member {Signal<Loader.OnErrorSignal>}
         */
        // this.onError = new _miniSignals2.default();

        /**
         * Dispatched once per loaded resource.
         *
         * The callback looks like {@link Loader.OnLoadSignal}.
         *
         * @member {Signal<Loader.OnLoadSignal>}
         */
        // this.onLoad = new _miniSignals2.default();

        /**
         * Dispatched when the loader begins to process the queue.
         *
         * The callback looks like {@link Loader.OnStartSignal}.
         *
         * @member {Signal<Loader.OnStartSignal>}
         */
        // this.onStart = new _miniSignals2.default();

        /**
         * Dispatched when the queued resources all load.
         *
         * The callback looks like {@link Loader.OnCompleteSignal}.
         *
         * @member {Signal<Loader.OnCompleteSignal>}
         */
        // this.onComplete = new _miniSignals2.default();

        // Add default before middleware
        for (var i = 0; i < Loader._defaultBeforeMiddleware.length; ++i) {
            this.pre(Loader._defaultBeforeMiddleware[i]);
        }

        // Add default after middleware
        for (var _i = 0; _i < Loader._defaultAfterMiddleware.length; ++_i) {
            this.use(Loader._defaultAfterMiddleware[_i]);
        }
    }

    add (name, url = null, options = null, cb = null) {
        // special case of an array of objects or urls
        if (Array.isArray(name)) {
            for (var i = 0; i < name.length; ++i) {
                this.add(name[i]);
            }

            return this;
        }

        // if an object is passed instead of params
        if ((typeof name === 'undefined' ? 'undefined' : typeof(name)) === 'object') {
            cb = url || name.callback || name.onComplete;
            options = name;
            url = name.url;
            name = name.name || name.key || name.url;
        }

        // case where no name is passed shift all args over by one.
        if (typeof url !== 'string') {
            cb = options;
            options = url;
            url = name;
        }

        // now that we shifted make sure we have a proper url.
        if (typeof url !== 'string') {
            throw new Error('No url passed to add resource to loader.');
        }

        // options are optional so people might pass a function and no options
        if (typeof options === 'function') {
            cb = options;
            options = null;
        }

        // if loading already you can only add resources that have a parent.
        if (this.loading && (!options || !options.parentResource)) {
            throw new Error('Cannot add resources while the loader is running.');
        }

        // check if resource already exists.
        if (this.resources[name]) {
            throw new Error('Resource named "' + name + '" already exists.');
        }

        // add base url if this isn't an absolute url
        url = this._prepareUrl(url);

        // create the store the resource
        // this.resources[name] = new Resource(name, url, options);

        if (typeof cb === 'function') {
            this.resources[name].onAfterMiddleware.once(cb);
        }

        // if actively loading, make sure to adjust progress chunks for that parent and its children
        if (this.loading) {
            var parent = options.parentResource;
            var incompleteChildren = [];

            for (var _i2 = 0; _i2 < parent.children.length; ++_i2) {
                if (!parent.children[_i2].isComplete) {
                    incompleteChildren.push(parent.children[_i2]);
                }
            }

            var fullChunk = parent.progressChunk * (incompleteChildren.length + 1); // +1 for parent
            var eachChunk = fullChunk / (incompleteChildren.length + 2); // +2 for parent & new child

            parent.children.push(this.resources[name]);
            parent.progressChunk = eachChunk;

            for (var _i3 = 0; _i3 < incompleteChildren.length; ++_i3) {
                incompleteChildren[_i3].progressChunk = eachChunk;
            }

            this.resources[name].progressChunk = eachChunk;
        }

        // add the resource to the queue
        this._queue.push(this.resources[name]);

        return this;
    };
    /* eslint-enable require-jsdoc,valid-jsdoc */

    /**
     * Sets up a middleware function that will run *before* the
     * resource is loaded.
     *
     * @param {function} fn - The middleware function to register.
     * @return {this} Returns itself.
     */


    pre (fn) {
        this._beforeMiddleware.push(fn);

        return this;
    };

    /**
     * Sets up a middleware function that will run *after* the
     * resource is loaded.
     *
     * @param {function} fn - The middleware function to register.
     * @return {this} Returns itself.
     */


    use (fn) {
        this._afterMiddleware.push(fn);

        return this;
    };

    /**
     * Resets the queue of the loader to prepare for a new load.
     *
     * @return {this} Returns itself.
     */


    reset () {
        this.progress = 0;
        this.loading = false;

        this._queue.kill();
        this._queue.pause();

        // abort all resource loads
        for (var k in this.resources) {
            var res = this.resources[k];

            if (res._onLoadBinding) {
                res._onLoadBinding.detach();
            }

            if (res.isLoading) {
                res.abort();
            }
        }

        this.resources = {};

        return this;
    };

    /**
     * Starts loading the queued resources.
     *
     * @param {function} [cb] - Optional callback that will be bound to the `complete` event.
     * @return {this} Returns itself.
     */


   load (cb) {
        // register complete callback if they pass one
        if (typeof cb === 'function') {
            // this.onComplete.once(cb);
        }

        // if the queue has already started we are done here
        if (this.loading) {
            return this;
        }

        if (this._queue.idle()) {
            this._onStart();
            this._onComplete();
        } else {
            // distribute progress chunks
            var numTasks = this._queue._tasks.length;
            var chunk = Loader.MAX_PROGRESS / numTasks;

            for (var i = 0; i < this._queue._tasks.length; ++i) {
                this._queue._tasks[i].data.progressChunk = chunk;
            }

            // notify we are starting
            this._onStart();

            // start loading
            this._queue.resume();
        }

        return this;
    };

    /**
     * The number of resources to load concurrently.
     *
     * @member {number}
     * @default 10
     */

    // parseURI (str, opts) {
    //     opts = opts || {};
  
    //     var o = {
    //       key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'],
    //       q: {
    //         name: 'queryKey',
    //         parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    //       },
    //       parser: {
    //         strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    //         loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    //       }
    //     };
    /**
     * Prepares a url for usage based on the configuration of this object
     *
     * @private
     * @param {string} url - The url to prepare.
     * @return {string} The prepared url.
     */
    _prepareUrl (url) {
        var parsedUrl// =// (0, this.parseURI)(url, { strictMode: true });
        var result = void 0;

        // absolute url, just use it as is.
        if (parsedUrl.protocol || !parsedUrl.path || url.indexOf('//') === 0) {
            result = url;
        }
        // if baseUrl doesn't end in slash and url doesn't start with slash, then add a slash inbetween
        else if (this.baseUrl.length && this.baseUrl.lastIndexOf('/') !== this.baseUrl.length - 1 && url.charAt(0) !== '/') {
                result = this.baseUrl + '/' + url;
            } else {
                result = this.baseUrl + url;
            }

        // if we need to add a default querystring, there is a bit more work
        if (this.defaultQueryString) {
            var hash = Loader.rgxExtractUrlHash.exec(result)[0];

            result = result.substr(0, result.length - hash.length);

            if (result.indexOf('?') !== -1) {
                result += '&' + this.defaultQueryString;
            } else {
                result += '?' + this.defaultQueryString;
            }

            result += hash;
        }

        return result;
    };

    /**
     * Loads a single resource.
     *
     * @private
     * @param {Resource} resource - The resource to load.
     * @param {function} dequeue - The function to call when we need to dequeue this item.
     */


    _loadResource(resource, dequeue) {
        // var _this2 = this;

        // resource._dequeue = dequeue;

        // // run before middleware
        // async$1.eachSeries(this._beforeMiddleware, function (fn, next) {
        //     fn.call(_this2, resource, function () {
        //         // if the before middleware marks the resource as complete,
        //         // break and don't process any more before middleware
        //         next(resource.isComplete ? {} : null);
        //     });
        // }, function () {
        //     if (resource.isComplete) {
        //         _this2._onLoad(resource);
        //     } else {
        //         resource._onLoadBinding = resource.onComplete.once(_this2._onLoad, _this2);
        //         resource.load();
        //     }
        // }, true);
    };

    /**
     * Called once loading has started.
     *
     * @private
     */


    _onStart() {
        this.progress = 0;
        this.loading = true;
        // this.onStart.dispatch(this);
    };

    /**
     * Called once each resource has loaded.
     *
     * @private
     */


    _onComplete () {
        this.progress = Loader.MAX_PROGRESS;
        this.loading = false;
        // this.onComplete.dispatch(this, this.resources);
    };

    /**
     * Called each time a resources is loaded.
     *
     * @private
     * @param {Resource} resource - The resource that was loaded
     */


   _onLoad (resource) {
        // var _this3 = this;

        // resource._onLoadBinding = null;

        // // remove this resource from the async queue, and add it to our list of resources that are being parsed
        // this._resourcesParsing.push(resource);
        // resource._dequeue();

        // // run all the after middleware for this resource
        // async$1.eachSeries(this._afterMiddleware, function (fn, next) {
        //     fn.call(_this3, resource, next);
        // }, function () {
        //     resource.onAfterMiddleware.dispatch(resource);

        //     _this3.progress = Math.min(Loader.MAX_PROGRESS, _this3.progress + resource.progressChunk);
        //     // _this3.onProgress.dispatch(_this3, resource);

        //     if (resource.error) {
        //         // _this3.onError.dispatch(resource.error, _this3, resource);
        //     } else {
        //         // _this3.onLoad.dispatch(_this3, resource);
        //     }

        //     _this3._resourcesParsing.splice(_this3._resourcesParsing.indexOf(resource), 1);

        //     // do completion check
        //     if (_this3._queue.idle() && _this3._resourcesParsing.length === 0) {
        //         _this3._onComplete();
        //     }
        // }, true);
    };

    static _defaultBeforeMiddleware = [];

	/**
	 * A default array of middleware to run after loading each resource.
	 * Each of these middlewares are added to any new Loader instances when they are created.
	 *
	 * @private
	 * @member {function[]}
	 */
	static _defaultAfterMiddleware = [];

	/**
	 * Sets up a middleware function that will run *before* the
	 * resource is loaded.
	 *
	 * @static
	 * @param {function} fn - The middleware function to register.
	 * @return {Loader} Returns itself.
	 */
	static pre (fn) {
	    Loader._defaultBeforeMiddleware.push(fn);

	    return Loader;
	};

	/**
	 * Sets up a middleware function that will run *after* the
	 * resource is loaded.
	 *
	 * @static
	 * @param {function} fn - The middleware function to register.
	 * @return {Loader} Returns itself.
	 */
	static use (fn) {
	    Loader._defaultAfterMiddleware.push(fn);

	    return Loader;
	};
}

