import { Point } from "../flash/geom/Point";
import { Sprite } from "./Sprite";
import { DisplayObject } from "./DisplayObject";
import { NativeEvent } from "./NativeEvent";
import { FlashBaseObject } from "./FlashBaseObject";

export class InteractionData extends FlashBaseObject
{
    public global:Point;
    public buttons:number;
    public target:Sprite;
    public originalEvent:NativeEvent;
    public identifier:number;
    public button:number;
    public isPrimary:boolean;
    public tiltY:number;
    public rotationAngle:number;
    public height:number;
    public tiltX:number;
    public pointerType:string;
    public width:number;
    public twist:number;
    public pressure:number;
	public tangentialPressure:number;	
    public which:number;
    
    public destructor():void
    {
        if(this.global)
        {
            this.global.recycle();
        }
        this.global = null;
    }

    constructor()
    {
        super();
        this.global = Point.getPoint();
        this.target = null;
        this.originalEvent = null;
        this.identifier = null;
        this.isPrimary = false;
        this.button = 0;
        this.buttons = 0;
        this.width = 0;
        this.height = 0;
        this.tiltX = 0;
        this.tiltY = 0;
        this.pointerType = null;
        this.pressure = 0;
	    this.rotationAngle = 0;
	    this.twist = 0;
		this.tangentialPressure = 0;
		this.which = 0;	
    }

	public getLocalPosition(displayObject:DisplayObject, point:Point = null, globalPos:Point = null):Point
	{
	    return displayObject.worldTransform.applyInverse(globalPos || this.global, point);
    };
    
	public copyEvent(event:NativeEvent)
	{
	    if (event.isPrimary)
	    {
	        this.isPrimary = true;
	    }
	    this.button = event.button;
	    this.buttons = Number.isInteger(event.buttons) ? event.buttons : event.which;
	    this.width = event.width;
	    this.height = event.height;
	    this.tiltX = event.tiltX;
	    this.tiltY = event.tiltY;
	    this.pointerType = event.pointerType;
	    this.pressure = event.pressure;
	    this.rotationAngle = event.rotationAngle;
	    this.twist = event.twist || 0;
	    this.tangentialPressure = event.tangentialPressure || 0;
    };

    public get pointerId():number
	{
	    return this.identifier;
	};
    
	public reset():void
	{
	    this.isPrimary = false;
	};
}
	

	