import { Event } from "./Event";
import { FlashBaseObject } from "./FlashBaseObject";

export interface IEventDispatcher
{
    addEventListener(type:string, listener:Function, useCapture:boolean, priority:number, useWeakReference:boolean, scope:FlashBaseObject):void;
    dispatchEvent(event:Event):boolean;
    hasEventListener(type:string):boolean;
    removeEventListener(type:string, listener:Function, useCapture:boolean):void;
    willTrigger(type:string):boolean;
}