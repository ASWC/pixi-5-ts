import { Event } from './Event';

export class ProgressEvent extends Event
{
    private static ProgressEventCache:ProgressEvent[] = [];

    public static PROGRESS:string = "progress";

    public bytesLoaded:number;
    public bytesTotal:number;
    public percent:number;

    constructor(type:string, bubbles:boolean = false, cancelable:boolean = false)
	{
        super(type, bubbles, cancelable);
    }

    public clone():Event
	{
		var event:ProgressEvent = ProgressEvent.getProgressEvent(this.type, this.bubbles, this.cancelable);
		event.bytesLoaded = this.bytesLoaded;	
		event.bytesTotal = this.bytesTotal;
		event.percent = this.percent;	
		return event;
	}

    public get isDisposable():boolean
    {
        return true;
    }

	public static getProgressEvent(type:string, bubble:boolean = true, cancelable:boolean = true):ProgressEvent
    {
        if(ProgressEvent.ProgressEventCache.length)
        {
            let te:ProgressEvent = ProgressEvent.ProgressEventCache[ProgressEvent.ProgressEventCache.length - 1];
            ProgressEvent.ProgressEventCache.length -= 1;
            te.reset(type, bubble, cancelable);
            return te;
        }
        return new ProgressEvent(type, bubble, cancelable);
    }

	public destructor():void
    {
        this._currentTarget = null;
        // this._legacyTarget = null;
        let index:number = ProgressEvent.ProgressEventCache.indexOf(this);
        if(index < 0)
        {
            ProgressEvent.ProgressEventCache.push(this);
        }
    }
}