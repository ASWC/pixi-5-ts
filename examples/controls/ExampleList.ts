import { Container } from "../../raw-pixi-ts/Container";
import { Button } from "../../fl-package/Button";
import { BaseExample } from "../BaseExample";
import { List } from "../../fl-package/list/List";
import { Graphics } from "../../raw-pixi-ts/Graphics";
import { MouseEvent } from "../../raw-pixi-ts/MouseEvent";
import { trace } from "../../raw-pixi-ts/Logger";
import { Event } from "../../raw-pixi-ts/Event";

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
        gr.beginFill(0xFFF0FF);
        gr.drawRect(0, 0, 25, displayheight)
        this.addChild(gr);
        gr.x = displayWidth - 25;
        this.buttonWidth = displayWidth - 25 - (this.sideGap * 2);
        this.buttonheight = 40;
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
    }
}