import { Event } from "./Event";
import { InteractionData } from "./InteractionData";

export class MouseEvent extends Event
{
    public static CLICK:string		= "click";
    public static MOUSE_DOWN:string	= "mouseDown";
    public static MOUSE_UP:string		= "mouseUp";
    public static MIDDLE_CLICK:string	= "middleClick";
    public static MIDDLE_MOUSE_DOWN:string	= "middleMouseDown";
    public static MIDDLE_MOUSE_UP:string		= "middleMouseUp";
    public static RIGHT_CLICK:string	= "rightClick";
    public static RIGHT_MOUSE_DOWN:string	= "rightMouseDown";
    public static RIGHT_MOUSE_UP:string	= "rightMouseUp";
    public static MOUSE_MOVE:string	= "mouseMove";
    public static MOUSE_OVER:string	= "mouseOver";
    public static MOUSE_OUT:string	= "mouseOut";
    public static RIGHT_MOUSE_UP_OUTSIDE:string	= "rightupoutside";
    public static MOUSE_UP_OUTSIDE:string = "mouseupoutside";
    
    

    public static POINTER_OVER:string	= "pointerover";
    public static POINTER_ENTER:string	= "pointerenter";
    public static POINTER_DOWN:string	= "pointerdown";
    public static POINTER_MOVE:string	= "pointermove";
    public static POINTER_UP:string	= "pointerup";
    public static POINTER_CANCEL:string	= "pointercancel";
    public static POINTER_OUT:string	= "pointerout";
    public static POINTER_LEAVE:string	= "pointerleave";
    public static POINTER_CAPTURE:string	= "gotpointercapture";
    public static POINTER_LOST:string	= "lostpointercapture";
    public static POINTER_UP_OUTSIDE:string	= "pointerupoutside";
    public static POINTER_TAP:string	= "pointertap";
    

    public static TOUCH_START:string	= "touchstart";
    public static TOUCH_END:string	= "touchend";
    public static TOUCH_END_OUTSIDE:string	= "touchendoutside";
    public static TOUCH_MOVE:string	= "touchmove";
    public static TOUCH_CANCEL:string	= "touchcancel";
    public static TOUCH_TAP:string	= "tap";

    
    
    




    public movementX:number;
    public movementY:number;
    public data:InteractionData;

    constructor(type:string, bubbles:boolean = false)
    {
        super(type, bubbles);        
        this.movementX = 0;
        this.movementY = 0;
    }

    
}