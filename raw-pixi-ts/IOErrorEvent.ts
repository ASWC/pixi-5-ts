import { Event } from './Event';

export class IOErrorEvent extends Event
{
    public static IO_ERROR:string = "ioError";

    public text:string;
    public errorId:number = 0;

    constructor(type:string, bubble:boolean = true, cancelable:boolean = true)
    {
        super(type, bubble, cancelable);
    }

    public clone():Event
	{
		var event:IOErrorEvent = new IOErrorEvent(this.type, this.bubbles, this.cancelable);
		event.text = this.text;	
		event.errorId = this.errorId;	
		return event;
	}

    public get isDisposable():boolean
    {
        return false;
    }
}