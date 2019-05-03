import { FlashBaseObject } from "../raw-pixi-ts/FlashBaseObject";
import { Application } from "../raw-pixi-ts/Application";
import { Graphics } from '../raw-pixi-ts/Graphics';
import { Container } from "../raw-pixi-ts/Container";
import { EventDispatcher } from "../raw-pixi-ts/EventDispatcher";
import { Event } from "../raw-pixi-ts/Event";


export class BaseExample extends EventDispatcher
{
    protected app:Application;
    protected sizew:number;
    protected sizeh:number;
    public stage:Container;
    public backColor:number;
    protected stageMask:Graphics;

    constructor(app:Application, width:number = 100, height:number = 100)
    {
        super();
        this.backColor = 0x969696;
        this.sizew = width;
        this.sizeh = height;
        this.app = app;
        this.stage = new Container();
    }

    protected activateMask():void
    {
        this.stageMask = new Graphics();
        this.stageMask.beginFill(0);
        this.stageMask.drawRect(0, 0, this.sizew, this.sizeh);
        this.stage.mask = this.stageMask;
    }

    public destructor():void
    {
        this.stage.removeChildren();
        if(this.stageMask)
        {
            this.stageMask.destroy(null);
        }
    }

    protected exampleReady():void
    {
        this.dispatchEvent(Event.getEvent(Event.COMPLETE));
    }
}