import { Event } from "./Event";
import { InteractionData } from "./InteractionData";
import { DisplayObject } from "./DisplayObject";    
    
export class InteractionEvent extends Event
{    
    public stopped:boolean;
    public target:DisplayObject;
    public data:InteractionData;

    constructor(type:string, bubble:boolean = true, cancelable:boolean = true)
    {
        super(type, bubble, cancelable)
	    this.target = null;
        this.stopped = false;
		this._currentTarget = null;
        this._type = null;
	    this.data = null;
    }

	public reset():void
	{
	    this.stopped = false;
	    this._currentTarget = null;
	    this.target = null;
    };
    
	public stopPropagation():void
	{
	    this.stopped = true;
	};
}
	