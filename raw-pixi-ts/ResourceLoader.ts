
import { EventDispatcher } from "./EventDispatcher";
import { Event } from "./Event";
import { ProgressEvent } from "./ProgressEvent";
import { NumberDic, StringDic } from "./Dictionary";
import { URLRequest, RequestMetaData } from "./URLRequest";
import { trace, reveal } from "./Logger";

export class ResourceLoader extends EventDispatcher
{
    public static STATUS_NONE:number = 0;
	public static STATUS_OK:number = 200;
	public static STATUS_EMPTY:number = 204;
	public static STATUS_IE_BUG_EMPTY:number = 1223;
	public static STATUS_TYPE_OK:number = 2;
    public static useXdr:boolean = !!(window['XDomainRequest'] && !('withCredentials' in new XMLHttpRequest()));
    public static tempAnchor:HTMLAnchorElement;
    public static EMPTY_GIF:string = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    public static LOAD_TYPE:NumberDic = 
    {
	    XHR: 1,
	    IMAGE: 2,
	    AUDIO: 3,
	    VIDEO: 4
	};
    public static XHR_RESPONSE_TYPE:StringDic = 
    {
	    DEFAULT: 'text',
	    BUFFER: 'arraybuffer',
	    BLOB: 'blob',
	    DOCUMENT: 'document',
	    JSON: 'json',
	    TEXT: 'text'
	};
    public static _xhrTypeMap:StringDic = 
    {
	    xhtml: ResourceLoader.XHR_RESPONSE_TYPE.DOCUMENT,
	    html: ResourceLoader.XHR_RESPONSE_TYPE.DOCUMENT,
	    htm: ResourceLoader.XHR_RESPONSE_TYPE.DOCUMENT,
	    xml: ResourceLoader.XHR_RESPONSE_TYPE.DOCUMENT,
	    tmx: ResourceLoader.XHR_RESPONSE_TYPE.DOCUMENT,
	    svg: ResourceLoader.XHR_RESPONSE_TYPE.DOCUMENT,
	    tsx: ResourceLoader.XHR_RESPONSE_TYPE.DOCUMENT,
	    gif: ResourceLoader.XHR_RESPONSE_TYPE.BLOB,
	    png: ResourceLoader.XHR_RESPONSE_TYPE.BLOB,
	    bmp: ResourceLoader.XHR_RESPONSE_TYPE.BLOB,
	    jpg: ResourceLoader.XHR_RESPONSE_TYPE.BLOB,
	    jpeg: ResourceLoader.XHR_RESPONSE_TYPE.BLOB,
	    tif: ResourceLoader.XHR_RESPONSE_TYPE.BLOB,
	    tiff: ResourceLoader.XHR_RESPONSE_TYPE.BLOB,
	    webp: ResourceLoader.XHR_RESPONSE_TYPE.BLOB,
	    tga: ResourceLoader.XHR_RESPONSE_TYPE.BLOB,
	    json: ResourceLoader.XHR_RESPONSE_TYPE.JSON,
	    text: ResourceLoader.XHR_RESPONSE_TYPE.TEXT,
	    txt: ResourceLoader.XHR_RESPONSE_TYPE.TEXT,
	    ttf: ResourceLoader.XHR_RESPONSE_TYPE.BUFFER,
	    otf: ResourceLoader.XHR_RESPONSE_TYPE.BUFFER
	};
    public static _loadTypeMap:NumberDic = 
    {
	    gif: ResourceLoader.LOAD_TYPE.IMAGE,
	    png: ResourceLoader.LOAD_TYPE.IMAGE,
	    bmp: ResourceLoader.LOAD_TYPE.IMAGE,
	    jpg: ResourceLoader.LOAD_TYPE.IMAGE,
	    jpeg: ResourceLoader.LOAD_TYPE.IMAGE,
	    tif: ResourceLoader.LOAD_TYPE.IMAGE,
	    tiff: ResourceLoader.LOAD_TYPE.IMAGE,
	    webp: ResourceLoader.LOAD_TYPE.IMAGE,
	    tga: ResourceLoader.LOAD_TYPE.IMAGE,
	    svg: ResourceLoader.LOAD_TYPE.IMAGE,
	    'svg+xml': ResourceLoader.LOAD_TYPE.IMAGE, 
	    mp3: ResourceLoader.LOAD_TYPE.AUDIO,
	    ogg: ResourceLoader.LOAD_TYPE.AUDIO,
	    wav: ResourceLoader.LOAD_TYPE.AUDIO,
	    mp4: ResourceLoader.LOAD_TYPE.VIDEO,
	    webm: ResourceLoader.LOAD_TYPE.VIDEO
	};
    public static TYPE:NumberDic = 
    {
	    UNKNOWN: 0,
	    JSON: 1,
	    XML: 2,
	    IMAGE: 3,
	    AUDIO: 4,
	    VIDEO: 5,
	    TEXT: 6
	};
    public static STATUS_FLAGS:NumberDic = 
    {
	    NONE: 0,
	    DATA_URL: 1 << 0,
	    COMPLETE: 1 << 1,
	    LOADING: 1 << 2
    };
    

    
    
    xdr
    // _dequeue
    
    
    
    
 
    // children
    
    // _boundXhrOnError
    // _boundXhrOnLoad
    
    data
    
    
    protected metadata:RequestMetaData;
    protected _elementTimer:number;
    protected progressChunk:number;
    protected type:number;
    protected xhr:XMLHttpRequest;
    protected error:Error;
    protected xhrType:number;
    protected loadType:number;
    protected timeout:number;
    protected crossOrigin:string;
    protected extension:string;
    protected _flags:number;
    protected _request:URLRequest;
    protected _imageElement:HTMLImageElement;
    protected _imageData:ImageBitmap;

    constructor(request:URLRequest)
    {
        super();
        this._request = request;
        this._flags = 0;
        this._setFlag(ResourceLoader.STATUS_FLAGS.DATA_URL, this._request.url.indexOf('data:') === 0);
        this.extension = this._getExtension();
        this.data = null;
        this.crossOrigin = request.crossOrigin === true ? 'anonymous' : "";
        this.timeout = request.timeout || 0;
        this.loadType = this._determineLoadType();
        this.error = null;
        this.xhr = null;
        this.type = ResourceLoader.TYPE.UNKNOWN;
        this.progressChunk = 0;
        this._elementTimer = 0;
        this.metadata = request.requestMetaData;


        this.xhrType = null;        
        // this.children = [];
        // this._dequeue = ResourceLoader._noop;
        // this._onLoadBinding = null;
    }

    public load():void 
    {        
        if (this.isLoading) 
        {
            return;
        }
        if (this.isComplete) 
        {
            this.dispatchEvent(Event.getEvent(Event.COMPLETE));
            return;
        } 
        this._setFlag(ResourceLoader.STATUS_FLAGS.LOADING, true);
        if (!this.crossOrigin) 
        {
            this.crossOrigin = this._determineCrossOrigin(this._request.url);
        }
        switch (this.loadType) 
        {
            case ResourceLoader.LOAD_TYPE.IMAGE:
                this.type = ResourceLoader.TYPE.IMAGE;               
                this._loadElement('image');
                break;
            case ResourceLoader.LOAD_TYPE.AUDIO:
                this.type = ResourceLoader.TYPE.AUDIO;
                // this._loadSourceElement('audio');
                break;

            case ResourceLoader.LOAD_TYPE.VIDEO:
                this.type = ResourceLoader.TYPE.VIDEO;
                // this._loadSourceElement('video');
                break;
            case ResourceLoader.LOAD_TYPE.XHR:           
            default:
                if (ResourceLoader.useXdr && this.crossOrigin) 
                {
                    this._loadXdr();
                } 
                else {
                    this._loadXhr();
                }
                break;
        }

        // _loadSourceElement
        // _loadXdr
        // _loadXhr
    };

    /**
     * Loads this resources using an element that has multiple sources,
     * like an HTMLAudioElement or HTMLVideoElement.
     *
     * @private
     * @param {string} type - The type of element to use.
     */


    // protected _loadSourceElement(type):void
    // {


    //     if (this.metadata.loadElement) 
    //     {
    //         this.data = this.metadata.loadElement;
    //     } else if (type === 'audio' && typeof window['Audio'] !== 'undefined') {
    //         this.data = new Audio();
    //     } else {
    //         this.data = document.createElement(type);
    //     }

    //     if (this.data === null) {
    //         this.abort('Unsupported element: ' + type);

    //         return;
    //     }

    //     if (this.crossOrigin) {
    //         this.data.crossOrigin = this.crossOrigin;
    //     }

    //     if (!this.metadata.skipSource) {
    //         // support for CocoonJS Canvas+ runtime, lacks document.createElement('source')
    //         if (navigator['isCocoonJS']) {
    //             this.data.src = Array.isArray(this._request.url) ? this._request.url[0] : this._request.url;
    //         } else if (Array.isArray(this._request.url)) {
    //             var mimeTypes = this.metadata.mimeType;

    //             for (var i = 0; i < this._request.url.length; ++i) {
    //                 this.data.appendChild(this._createSource(type, this._request.url[i], Array.isArray(mimeTypes) ? mimeTypes[i] : mimeTypes));
    //             }
    //         } else {
    //             var _mimeTypes = this.metadata.mimeType;

    //             this.data.appendChild(this._createSource(type, this._request.url, Array.isArray(_mimeTypes) ? _mimeTypes[0] : _mimeTypes));
    //         }
    //     }

    //     this.data.addEventListener('error', this._boundOnError, false);
    //     this.data.addEventListener('load', this._boundComplete, false);
    //     this.data.addEventListener('progress', this._boundOnProgress, false);
    //     this.data.addEventListener('canplaythrough', this._boundComplete, false);

    //     this.data.load();

    //     if (this.timeout) {
    //         this._elementTimer = setTimeout(this._boundOnTimeout, this.timeout);
    //     }
    // };


    protected _clearEvents():void 
    {
        clearTimeout(this._elementTimer);
        if (this._imageElement && this._imageElement.removeEventListener) 
        {
            this._imageElement.removeEventListener('error', this._onError);
            this._imageElement.removeEventListener('load', this.complete);
            this._imageElement.removeEventListener('progress', this._onProgress);
            this._imageElement.removeEventListener('canplaythrough', this.complete);
        }

        if (this.xhr) 
        {
            // if (this.xhr.removeEventListener) {
            //     this.xhr.removeEventListener('error', this._boundXhrOnError, false);
            //     this.xhr.removeEventListener('timeout', this._boundXhrOnTimeout, false);
            //     this.xhr.removeEventListener('abort', this._boundXhrOnAbort, false);
            //     this.xhr.removeEventListener('progress', this._boundOnProgress, false);
            //     this.xhr.removeEventListener('load', this._boundXhrOnLoad, false);
            // } else {
            //     this.xhr.onerror = null;
            //     this.xhr.ontimeout = null;
            //     this.xhr.onprogress = null;
            //     this.xhr.onload = null;
            // }
        }
    };

    protected _loadElement (type:string):void 
    {
        trace("_loadElement " + type)
        this._imageElement = <HTMLImageElement>document.createElement("img");
        if (this.crossOrigin) 
        {
            this._imageElement.crossOrigin = this.crossOrigin;
        }      
        this._imageElement.src = this._request.url;


       
        
        this._imageElement.addEventListener('error', this._onError);
        this._imageElement.addEventListener('load', this.complete);
        this._imageElement.addEventListener('progress', this._onProgress);
        



        
        // if (this.timeout > 0) 
        // {
        //     this._elementTimer = setTimeout(this._onTimeout, this.timeout);
        // }
    };

    protected complete = (event)=>
    {
        trace("complete")
        let promise:Promise<ImageBitmap> = window.createImageBitmap(this._imageElement, 0, 0, this._imageElement.width, this._imageElement.height);
        promise.then(this.onImageBitmapCreated).catch();


        
    };

    public get imageData():ImageBitmap
    {
        return this._imageData;
    }

    protected onImageBitmapCreated = (image:ImageBitmap)=>
    {
        trace("onImageBitmapCreated")
        this._imageData = image;
        this._clearEvents();
        this._finish();
    }

    protected _onTimeout = ()=>
    {
        this.abort('Load timed out.');
    };

    protected _onProgress = (event)=>
    {
        if (event && event.lengthComputable) {
            let pe:ProgressEvent = ProgressEvent.getProgressEvent(ProgressEvent.PROGRESS);
            pe.bytesLoaded = event.loaded;
            pe.bytesTotal = event.total;
            pe.percent = event.loaded / event.total;
            this.dispatchEvent(pe);
        }
    };

    protected _onError = (event)=>
    {
        this.abort('Failed to load element using: ' + event.target.nodeName);
    };

    protected abort (message:string):void 
    {
        if (this.error) 
        {
            return;
        }
        this.error = new Error(message);
        this._clearEvents();
        if (this.xhr) 
        {
            this.xhr.abort();
        } 
        else if (this.xdr) 
        {
            this.xdr.abort();
        } 
        else if (this.data) 
        {
            if (this.data.src) 
            {
                this.data.src = ResourceLoader.EMPTY_GIF;
            }
            else 
            {
                while (this.data.firstChild)                 
                {
                    this.data.removeChild(this.data.firstChild);
                }
            }
        }
        this._finish();
    };


    protected _finish ():void 
    {
        if (this.isComplete) 
        {
            return;
        }
        this._setFlag(ResourceLoader.STATUS_FLAGS.COMPLETE, true);
        this._setFlag(ResourceLoader.STATUS_FLAGS.LOADING, false);
        this.dispatchEvent(Event.getEvent(Event.COMPLETE));       
    };

    protected _determineCrossOrigin(url:string, loc:Location = null):string 
    {
        if (url.indexOf('data:') === 0) 
        {
            return '';
        }
        if (window['origin'] !== window.location.origin) 
        {
            return 'anonymous';
        }
        loc = loc || window.location;
        if (!ResourceLoader.tempAnchor) 
        {
            ResourceLoader.tempAnchor = document.createElement('a');
        }
        ResourceLoader.tempAnchor.href = url;
        let uri:URIData = ResourceLoader.parseUri(ResourceLoader.tempAnchor.href, true);
        let samePort:boolean = !uri.port && loc.port === '' || uri.port === loc.port;
        let protocol:string = uri.protocol ? uri.protocol + ':' : '';
        if (uri.host !== loc.hostname || !samePort || protocol !== loc.protocol) 
        {
            return 'anonymous';
        }
        return '';
    };

    private static parseUri(str:string, strict:boolean = true):URIData
    {  
        let o:any = 
        {
          key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'],
          q: {
            name: 'queryKey',
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
          },
          parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
          }
        };  
        let m:RegExpMatchArray = o.parser[strict ? 'strict' : 'loose'].exec(str);
        let uri:URIData = new URIData();       
        uri.source = m["source"] || ''; 
        uri.protocol = m["protocol"] || ''; 
        uri.authority = m["authority"] || ''; 
        uri.userInfo = m["userInfo"] || ''; 
        uri.user = m["user"] || ''; 
        uri.password = m["password"] || ''; 
        uri.host = m["host"] || ''; 
        uri.port = m["port"] || ''; 
        uri.relative = m["relative"] || ''; 
        uri.path = m["path"] || ''; 
        uri.directory = m["directory"] || ''; 
        uri.file = m["file"] || ''; 
        uri.query = m["query"] || ''; 
        uri.anchor = m["anchor"] || '';   
        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
          if ($1) { uri[o.q.name][$1] = $2; }
        });  
        return uri
      };

    protected _determineLoadType():number
    {
        return ResourceLoader._loadTypeMap[this.extension] || ResourceLoader.LOAD_TYPE.XHR;
    };

   protected _getExtension():string 
   {
        let url:string = this._request.url;
        let ext:string = '';
        if (this.isDataUrl) 
        {
            let slashIndex:number = url.indexOf('/');
            ext = url.substring(slashIndex + 1, url.indexOf(';', slashIndex));
        } 
        else 
        {
            let queryStart:number = url.indexOf('?');
            let hashStart:number = url.indexOf('#');
            let index:number = Math.min(queryStart > -1 ? queryStart : url.length, hashStart > -1 ? hashStart : url.length);
            url = url.substring(0, index);
            ext = url.substring(url.lastIndexOf('.') + 1);
        }
        return ext.toLowerCase();
    };

    protected _hasFlag (flag:number):boolean 
    {
        return (this._flags & flag) !== 0;
    };

    protected _setFlag(flag:number, value:boolean):void
    {
        this._flags = value ? this._flags | flag : this._flags & ~flag;
    };



    




    private static setExtMap(map:any, extname:string, val:number):void 
    {
        if (extname && extname.indexOf('.') === 0) 
        {
	        extname = extname.substring(1);
	    }
	    if (!extname) {
	        return;
	    }
	    map[extname] = val;
	}

    static setExtensionLoadType(extname, loadType) {

        ResourceLoader.setExtMap(ResourceLoader._loadTypeMap, extname, loadType);

    };

    static setExtensionXhrType(extname, xhrType) {
        ResourceLoader.setExtMap(ResourceLoader._xhrTypeMap, extname, xhrType);
    };


	/**
	 * Quick helper to get string xhr type.
	 *
	 * @ignore
	 * @param {XMLHttpRequest|XDomainRequest} xhr - The request to check.
	 * @return {string} The type.
	 */
	static reqType(xhr) {
	    return xhr.toString().replace('object ', '');
    }
    













    /**
     * Loads this resources using an XMLHttpRequest.
     *
     * @private
     */


    _loadXhr () {
        // // if unset, determine the value
        // if (typeof this.xhrType !== 'string') {
        //     this.xhrType = this._determineXhrType();
        // }

        // var xhr = this.xhr = new XMLHttpRequest();

        // // set the request type and url
        // xhr.open('GET', this._request.url, true);

        // xhr.timeout = this.timeout;

        // // load json as text and parse it ourselves. We do this because some browsers
        // // *cough* safari *cough* can't deal with it.
        // if (this.xhrType === ResourceLoader.XHR_RESPONSE_TYPE.JSON || this.xhrType === ResourceLoader.XHR_RESPONSE_TYPE.DOCUMENT) {
        //     xhr.responseType = <any>ResourceLoader.XHR_RESPONSE_TYPE.TEXT;
        // } else {
        //     xhr.responseType = this.xhrType;
        // }

        // xhr.addEventListener('error', this._boundXhrOnError, false);
        // xhr.addEventListener('timeout', this._boundXhrOnTimeout, false);
        // xhr.addEventListener('abort', this._boundXhrOnAbort, false);
        // xhr.addEventListener('progress', this._boundOnProgress, false);
        // xhr.addEventListener('load', this._boundXhrOnLoad, false);

        // xhr.send();
    };

    /**
     * Loads this resources using an XDomainRequest. This is here because we need to support IE9 (gross).
     *
     * @private
     */


    _loadXdr () {
        // // if unset, determine the value
        // if (typeof this.xhrType !== 'string') {
        //     this.xhrType = this._determineXhrType();
        // }

        // var xdr = this.xhr = new window['XDomainRequest'](); // eslint-disable-line no-undef

        // // XDomainRequest has a few quirks. Occasionally it will abort requests
        // // A way to avoid this is to make sure ALL callbacks are set even if not used
        // // More info here: http://stackoverflow.com/questions/15786966/xdomainrequest-aborts-post-on-ie-9
        // xdr.timeout = this.timeout || 5000; // XDR needs a timeout value or it breaks in IE9

        // xdr.onerror = this._boundXhrOnError;
        // xdr.ontimeout = this._boundXhrOnTimeout;
        // xdr.onprogress = this._boundOnProgress;
        // xdr.onload = this._boundXhrOnLoad;

        // xdr.open('GET', this._request.url, true);

        // // Note: The xdr.send() call is wrapped in a timeout to prevent an
        // // issue with the interface where some requests are lost if multiple
        // // XDomainRequests are being sent at the same time.
        // // Some info here: https://github.com/photonstorm/phaser/issues/1248
        // setTimeout(function () {
        //     return xdr.send();
        // }, 1);
    };

    /**
     * Creates a source used in loading via an element.
     *
     * @private
     * @param {string} type - The element type (video or audio).
     * @param {string} url - The source URL to load from.
     * @param {string} [mime] - The mime type of the video
     * @return {HTMLSourceElement} The source element.
     */


    _createSource(type, url, mime) {
        // if (!mime) {
        //     mime = type + '/' + this._getExtension(url);
        // }

        // var source = document.createElement('source');

        // source.src = url;
        // source.type = mime;

        // return source;
    };







    /**
     * Called if an error event fires for xhr/xdr.
     *
     * @private
     */


    _xhrOnError () {
        var xhr = this.xhr;

        this.abort(ResourceLoader.reqType(xhr) + ' Request failed. Status: ' + xhr.status + ', text: "' + xhr.statusText + '"');
    };

    /**
     * Called if an error event fires for xhr/xdr.
     *
     * @private
     */


    _xhrOnTimeout () {
        var xhr = this.xhr;

        this.abort(ResourceLoader.reqType(xhr) + ' Request timed out.');
    };

    /**
     * Called if an abort event fires for xhr/xdr.
     *
     * @private
     */


    _xhrOnAbort() {
        var xhr = this.xhr;

        this.abort(ResourceLoader.reqType(xhr) + ' Request was aborted by the user.');
    };

    /**
     * Called when data successfully loads from an xhr/xdr request.
     *
     * @private
     * @param {XMLHttpRequestLoadEvent|Event} event - Load event
     */


    _xhrOnLoad () {
        // var xhr = this.xhr;
        // var text = '';
        // var status = typeof xhr.status === 'undefined' ? ResourceLoader.STATUS_OK : xhr.status; // XDR has no `.status`, assume 200.

        // // responseText is accessible only if responseType is '' or 'text' and on older browsers
        // if (xhr.responseType === '' || xhr.responseType === 'text' || typeof xhr.responseType === 'undefined') {
        //     text = xhr.responseText;
        // }

        // // status can be 0 when using the `file://` protocol so we also check if a response is set.
        // // If it has a response, we assume 200; otherwise a 0 status code with no contents is an aborted request.
        // if (status === ResourceLoader.STATUS_NONE && (text.length > 0 || xhr.responseType === ResourceLoader.XHR_RESPONSE_TYPE.BUFFER)) {
        //     status = ResourceLoader.STATUS_OK;
        // }
        // // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
        // else if (status === ResourceLoader.STATUS_IE_BUG_EMPTY) {
        //         status = ResourceLoader.STATUS_EMPTY;
        //     }

        // var statusType = status / 100 | 0;

        // if (statusType === ResourceLoader.STATUS_TYPE_OK) {
        //     // if text, just return it
        //     if (this.xhrType === ResourceLoader.XHR_RESPONSE_TYPE.TEXT) {
        //         this.data = text;
        //         this.type = ResourceLoader.TYPE.TEXT;
        //     }
        //     // if json, parse into json object
        //     else if (this.xhrType === ResourceLoader.XHR_RESPONSE_TYPE.JSON) {
        //             try {
        //                 this.data = JSON.parse(text);
        //                 this.type = ResourceLoader.TYPE.JSON;
        //             } catch (e) {
        //                 this.abort('Error trying to parse loaded json: ' + e);

        //                 return;
        //             }
        //         }
        //         // if xml, parse into an xml document or div element
        //         else if (this.xhrType === ResourceLoader.XHR_RESPONSE_TYPE.DOCUMENT) {
        //                 try {
        //                     if (window['DOMParser']) {
        //                         var domparser = new DOMParser();

        //                         this.data = domparser.parseFromString(text, 'text/xml');
        //                     } else {
        //                         var div = document.createElement('div');

        //                         div.innerHTML = text;

        //                         this.data = div;
        //                     }

        //                     this.type = ResourceLoader.TYPE.XML;
        //                 } catch (e) {
        //                     this.abort('Error trying to parse loaded xml: ' + e);

        //                     return;
        //                 }
        //             }
        //             // other types just return the response
        //             else {
        //                     this.data = xhr.response || text;
        //                 }
        // } else {
        //     this.abort('[' + xhr.status + '] ' + xhr.statusText + ': ' + xhr.responseURL);

        //     return;
        // }

        // this.complete();
    };





    /**
     * Determines the responseType of an XHR request based on the extension of the
     * resource being loaded.
     *
     * @private
     * @return {Resource.XHR_RESPONSE_TYPE} The responseType to use.
     */


    _determineXhrType() {
        return ResourceLoader._xhrTypeMap[this.extension] || ResourceLoader.XHR_RESPONSE_TYPE.TEXT;
    };

    /**
     * Determines the loadType of a resource based on the extension of the
     * resource being loaded.
     *
     * @private
     * @return {Resource.LOAD_TYPE} The loadType to use.
     */






    /**
     * Determines the mime type of an XHR request based on the responseType of
     * resource being loaded.
     *
     * @private
     * @param {Resource.XHR_RESPONSE_TYPE} type - The type to get a mime type for.
     * @return {string} The mime type to use.
     */


    _getMimeFromXhrType (type) {
        switch (type) {
            case ResourceLoader.XHR_RESPONSE_TYPE.BUFFER:
                return 'application/octet-binary';

            case ResourceLoader.XHR_RESPONSE_TYPE.BLOB:
                return 'application/blob';

            case ResourceLoader.XHR_RESPONSE_TYPE.DOCUMENT:
                return 'application/xml';

            case ResourceLoader.XHR_RESPONSE_TYPE.JSON:
                return 'application/json';

            case ResourceLoader.XHR_RESPONSE_TYPE.DEFAULT:
            case ResourceLoader.XHR_RESPONSE_TYPE.TEXT:
            /* falls through */
            default:
                return 'text/plain';
        }
    };




    public get isDataUrl():boolean
    {
        return this._hasFlag(ResourceLoader.STATUS_FLAGS.DATA_URL);
    }

    public get isComplete():boolean
    {
        return this._hasFlag(ResourceLoader.STATUS_FLAGS.COMPLETE);
    }

    public get isLoading():boolean
    {
        return this._hasFlag(ResourceLoader.STATUS_FLAGS.LOADING);
    }
}


class URIData
{
    public source:string;
    public protocol:string;
    public authority:string;
    public userInfo:string;
    public user:string;
    public password:string;
    public host:string;
    public v:string;
    public relative:string;
    public path:string;
    public directory:string;
    public file:string;
    public query:string;
    public anchor:string;
    public port:string;
}
