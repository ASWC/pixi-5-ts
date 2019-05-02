import { FlashBaseObject } from "./FlashBaseObject";

export class Event extends FlashBaseObject
{   
    public static ADDED_TO_STAGE:string = "addedToStage";
    public static ADDED:string = "added";
    public static ENTER_FRAME:string = "enterFrame";
    public static EXIT_FRAME:string = "exitFrame";
    public static FRAME_CONSTRUCTED:string = "frameConstructed";
    public static REMOVED:string = "removed";
    public static REMOVED_FROM_STAGE:string = "removedFromStage";
    public static RENDER:string = "render";
    public static COMPLETE:string = "complete";
    public static INIT:string = "init";
    public static OPEN:string = "open";
    public static UNLOAD:string = "unload";
    public static CLEAR:string = "clear";
    

    public static SOUND_COMPLETE:string = "soundComplete";
    public static SOUND_STARTED:string = "soundStarted";
    
    
    
    
    public static ACTIVATE:string = "activate";
    public static DEACTIVATE:string = "desactivate";
    public static RESIZE:string = "resize";
    public static CHANGE:string = "change";   
    
    private static EventCache:Event[] = [];   

    public _eventPhase:number;
    public _bubbles:boolean;
    public _cancelable:boolean;
    public _type:string;
    public _currentTarget:FlashBaseObject;

    protected constructor(type:string, bubble:boolean = true, cancelable:boolean = true)
    {
        super();
        this.reset(type, bubble, cancelable);
    }

    public get currentTarget():FlashBaseObject
    {
        return this._currentTarget;
    }

    public setCurrentTarget(value:FlashBaseObject):void
    {
        this._currentTarget = value;
    }

    public get type():string
    {
        return this._type;
    }

    public get cancelable():boolean
    {
        return this._cancelable;
    }

    public get bubbles():boolean
    {
        return this._bubbles;
    }

    public get eventPhase():number
    {
        return this._eventPhase;
    }

    public clone():Event
    {
        return Event.getEvent(this._type, this._bubbles, this._cancelable);
    }

    protected reset(type:string, bubble:boolean = true, cancelable:boolean = true):void
    {
        this._type = type;
        this._bubbles = bubble;
        this._cancelable = cancelable;
    }

   public static getEvent(type:string, bubble:boolean = true, cancelable:boolean = true):Event
    {
        if(Event.EventCache.length)
        {
            let te:Event = Event.EventCache[Event.EventCache.length - 1];
            Event.EventCache.length -= 1;
            te.reset(type, bubble, cancelable);
            return te;
        }
        return new Event(type, bubble, cancelable);
    }

	public destructor():void
    {
        this._currentTarget = null;
        let index:number = Event.EventCache.indexOf(this);
        if(index < 0)
        {
            Event.EventCache.push(this);
        }
    }

	public get isDisposable():boolean
    {
        return true;
    }

    public stopPropagation()
    {

    }

    public stopImmediatePropagation()
    {

    }

    public preventDefault()
    {

    }
}