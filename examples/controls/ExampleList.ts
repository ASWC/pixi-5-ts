import { Container } from "../../raw-pixi-ts/Container";
import { Button } from "../../fl-package/Button";
import { BaseExample } from "../BaseExample";
import { List } from "../../fl-package/list/List";
import { Graphics } from "../../raw-pixi-ts/Graphics";
import { MouseEvent } from '../../raw-pixi-ts/MouseEvent';
import { Event } from '../../raw-pixi-ts/Event';
import { InteractionData } from '../../raw-pixi-ts/InteractionData';

export class ExampleList extends Container
{
    protected list:List;
    protected buttons:Button[];
    protected classReference:any;
    protected listContainer:Container;
    protected itemGap:number;
    protected sideGap:number;
    protected buttonWidth:number;
    protected buttonheight:number;
    protected listmask:Graphics;
    protected _selectedClass:any;
    protected scroll:ScrollBar;

    constructor(displayWidth:number, displayheight:number)
    {
        super();
        this.buttons = [];
        this.classReference = {};
        this.itemGap = 2;
        this.sideGap = 2;
        this.listContainer = new Container();
        this.addChild(this.listContainer);
        this.listmask = new Graphics();
        this.listmask.beginFill(0);
        this.listmask.drawRect(0, 0, displayWidth, displayheight);
        this.listContainer.mask = this.listmask;
        this.addChild(this.listmask);
        let gr:Graphics = new Graphics();
        gr.beginFill(0xAAA0AA);
        gr.drawRect(0, 0, 25, displayheight)
        this.addChild(gr);
        gr.x = displayWidth - 25;
        this.buttonWidth = displayWidth - 25 - (this.sideGap * 2);
        this.buttonheight = 40;

        this.scroll = new ScrollBar();
        this.addChild(this.scroll);
        this.scroll.x = displayWidth - 25;
        this.scroll.scrollArea = displayheight;
        this.scroll.addEventListener(Event.CHANGE, this.handleScrollChange)
    }

    protected handleScrollChange = (event:Event)=>
    {
        this.listContainer.y = this.scroll.targetPosition;
    }

    public get selectedClass():any
    {
        return this._selectedClass;
    }

    protected handleButtonTap = (event:MouseEvent)=>
    {
        this._selectedClass = this.classReference[event.currentTarget.name];
        this.dispatchEvent(Event.getEvent(Event.CHANGE));
    }

    public addExample(keyname:string, keyclass: typeof BaseExample):void
    {
        let button:Button = new Button(keyname, this.buttonWidth, this.buttonheight);
        button.addEventListener(MouseEvent.POINTER_TAP, this.handleButtonTap)
        this.buttons.push(button);
        button.name = keyname;
        button.x = this.sideGap;
        this.listContainer.addChild(button);
        this.classReference[keyname] = keyclass;
        this.refreshList();
    }

    protected refreshList():void
    {
        let start:number = this.itemGap;
        for(let button of this.buttons)
        {
            button.y = start;
            start += button.height + this.itemGap;
        }
        this.scroll.scrollDistance = start;
    }
}


class ScrollBar extends Container
{
    public _scrollArea:number;
    public _scrollDistance:number;
    protected _handle:Graphics;
    protected dragging:boolean;
    protected eventData:InteractionData;
    protected areaPercent:number;
    protected _visibleArea:number;
    protected _targetPosition:number;

    constructor()
    {
        super();
        this._handle = new Graphics();
        this._handle.beginFill(0x636363)
        this._handle.drawRect(0, 0, 25, 25);
        this.addChild(this._handle);
        this._handle.buttonMode = this._handle.interactive = true;
        this._handle.addEventListener(MouseEvent.POINTER_DOWN, this.handleHandleDown)
        this._handle.addEventListener(MouseEvent.POINTER_UP, this.handleHandleUp)
        this._handle.addEventListener(MouseEvent.POINTER_UP_OUTSIDE, this.handleHandleUp)
        this._handle.addEventListener(MouseEvent.POINTER_MOVE, this.handleHandleMove)
    }

    public get targetPosition():number
    {
        return this._targetPosition;
    }

    public set scrollDistance(value:number)
    {
        this._scrollDistance = value;
    }

    public set scrollArea(value:number)
    {
        this._scrollArea = value - 25;
        this._visibleArea = value;
    }

    protected handleHandleUp = (event:MouseEvent)=>
    {
        this.dragging = false;
        this.eventData = null;
    }

    protected handleHandleMove = (event:MouseEvent)=>
    {
        if(this.eventData)
        {
            const newPosition = this.eventData.getLocalPosition(this._handle.parent);
            this._handle.y = newPosition.y - (this._handle.height / 2);
            if(this._handle.y > this._scrollArea)
            {
                this._handle.y = this._scrollArea;
            }
            else if(this._handle.y < 0)
            {
                this._handle.y = 0;
            }
            this.areaPercent = this._handle.y / this._scrollArea;
            this._targetPosition = (this._scrollDistance - this._visibleArea) * this.areaPercent * -1;
            this.dispatchEvent(Event.getEvent(Event.CHANGE))
        }
    }

    protected handleHandleDown = (event:MouseEvent)=>
    {
        this.dragging = true;
        this.eventData = event.data;
    }


}






