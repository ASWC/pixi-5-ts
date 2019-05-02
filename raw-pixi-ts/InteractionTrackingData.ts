import { NumberDic } from "./Dictionary";


export class InteractionTrackingData
{
	public static FLAGS:NumberDic = 
	{
	    NONE: 0,
	    OVER: 1 << 0,
	    LEFT_DOWN: 1 << 1,
	    RIGHT_DOWN: 1 << 2,
	}

    protected _pointerId:number;
	protected _flags:number;
	
    constructor(pointerId:number)
    {
        this._pointerId = pointerId;
	    this._flags = InteractionTrackingData.FLAGS.NONE;
    }

	protected _doSet(flag:number, yn:boolean):void
	{
	    if (yn)
	    {
	        this._flags = this._flags | flag;
	    }
	    else
	    {
	        this._flags = this._flags & (~flag);
	    }
    };
    
	public get pointerId():number
	{
	    return this._pointerId;
    };
    
	public get flags():number
	{
	    return this._flags;
    };
    
    public set flags(flags) 
	{
	    this._flags = flags;
    };
    
	public get none():boolean
	{
	    return this._flags === InteractionTrackingData.FLAGS.NONE;
    };
    
	public get over():boolean
	{
	    return (this._flags & InteractionTrackingData.FLAGS.OVER) !== 0;
    };
    
    public set over(yn:boolean) 
	{
	    this._doSet(InteractionTrackingData.FLAGS.OVER, yn);
    };
    
	public get rightDown():boolean
	{
	    return (this._flags & InteractionTrackingData.FLAGS.RIGHT_DOWN) !== 0;
    };
    
    public set rightDown(yn:boolean) 
	{
	    this._doSet(InteractionTrackingData.FLAGS.RIGHT_DOWN, yn);
    };
    
	public get leftDown():boolean
	{
	    return (this._flags & InteractionTrackingData.FLAGS.LEFT_DOWN) !== 0;
    };
    
    public set leftDown(yn:boolean)
	{
	    this._doSet(InteractionTrackingData.FLAGS.LEFT_DOWN, yn);
	};
}


