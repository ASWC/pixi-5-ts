import { URLRequestHeader } from './URLRequestHeader';
import { URLRequestMethod } from './URLRequestMethod';
import { URLVariables } from './URLVariables';
import { FlashBaseObject } from './FlashBaseObject';

export class URLRequest extends FlashBaseObject
{
    private static URLRequestCache:URLRequest[] = [];
    protected _contentType:string;
    protected _url:string;
    protected _method:string;
    protected _envelop:string;
    protected _data:URLVariables;
    protected _crossOrigin:boolean;
    protected _timeout:number;
    protected _requestMetaData:RequestMetaData;

    constructor(path:string = null)
    {
        super();
        this._requestMetaData = new RequestMetaData();
        this._timeout = 0;
        this._crossOrigin = true;
        this.reset(path);   
    }

    public destructor():void
    {
        this._url = null;
        this._method = URLRequestMethod.POST; 
        let index:number = URLRequest.URLRequestCache.indexOf(this);
        if(index < 0)
        {
            URLRequest.URLRequestCache.push(this);
        }
    }

    public reset(path:string = null):void
    {
        this._url = path;
        this._method = URLRequestMethod.POST;   
        this._contentType = null;
        this._envelop = null;
        this._data = null;
    }

    public static getURLRequest(path:string = null):URLRequest
    {
        if(URLRequest.URLRequestCache.length)
        {
            let ur:URLRequest = URLRequest.URLRequestCache[URLRequest.URLRequestCache.length - 1];
            URLRequest.URLRequestCache.length -= 1;
            ur.reset(path);
            return ur;
        }
        return new URLRequest(path);
    }

    public set requestMetaData(value:RequestMetaData)
    {
        this._requestMetaData = value;        
    }

    public get requestMetaData():RequestMetaData
    {
        return this._requestMetaData;
    }
    
    public set timeout(value:number)
    {
        this._timeout = value;        
    }

    public get timeout():number
    {
        return this._timeout;
    }

    public set crossOrigin(value:boolean)
    {
        this._crossOrigin = value;        
    }

    public get crossOrigin():boolean
    {
        return this._crossOrigin;
    }

    public set envelop(value:string)
    {
        this._envelop = value;        
    }

    public get envelop():string
    {
        return this._envelop;
    }

    public get requestHeaders():URLRequestHeader[]
    {
        return null;
    }

    public set requestHeaders(value:URLRequestHeader[])
    {

    }

    public get contentType():string
    {
        return this._contentType;
    }

    public set contentType(value:string)
    {
        this._contentType = value;
    }

    public get url():string
    {
        return this._url;
    }

    public set url(value:string)
    {
        this._url = value;
    }

    public set data(value:URLVariables)
    {        
        this._data = value;
    }

    public get data():URLVariables
    {
        return this._data;
    }

    public get method():string
    {
        return this._method;
    }

    public set method(value:string)
    {
        this._method = value;
    }
}

export class RequestMetaData
{
    public mimeType:string = '';
    public skipSource:boolean = false;
}