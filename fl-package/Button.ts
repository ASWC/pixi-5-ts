import { Container } from "../raw-pixi-ts/Container";
import { Graphics } from "../raw-pixi-ts/Graphics";
import { MouseEvent } from "../raw-pixi-ts/MouseEvent";
import { Text } from "../raw-pixi-ts/Text";
import { TextStyle } from "../raw-pixi-ts/TextStyle";

export class Button extends Container
{
    protected buttongraphic:Graphics;
    protected buttonovergraphic:Graphics;
    protected buttondowngraphic:Graphics;
    protected label:Text;

    constructor(caption:string, buttonWidth:number = 150, buttonheight:number = 40)
    {
        super();
        this.interactive = true;
        this.buttongraphic = new Graphics();
        this.buttongraphic.beginFill(0x969696);
        this.buttongraphic.drawRoundedRect(0, 0, buttonWidth, buttonheight, 10);
        this.addChild(this.buttongraphic);
        this.buttonovergraphic = new Graphics();
        this.buttonovergraphic.beginFill(0xB9B9B9);
        this.buttonovergraphic.drawRoundedRect(0, 0, buttonWidth, buttonheight, 10);
        this.addChild(this.buttonovergraphic);
        this.buttonovergraphic.visible = false;
        this.buttondowngraphic = new Graphics();
        this.buttondowngraphic.beginFill(0x636363);
        this.buttondowngraphic.drawRoundedRect(0, 0, buttonWidth, buttonheight, 10);
        this.addChild(this.buttondowngraphic);
        this.buttondowngraphic.visible = false;
        let style:TextStyle = new TextStyle({});
        style.fontSize = 16;
        style.align = "center";
        style.fontFamily = "Arial";
        this.label = new Text(caption, style)
        this.label.interactive = false;
        this.label.y = (buttonheight - (this.label.height)) / 2;
        this.label.x = (buttonWidth / 2 - this.label.width / 2);
        this.addChild(this.label);
        this.addEventListener(MouseEvent.POINTER_DOWN, this.handleDown)
        this.addEventListener(MouseEvent.POINTER_OVER, this.handleOver)
        this.addEventListener(MouseEvent.POINTER_UP, this.handleUp)
        this.addEventListener(MouseEvent.POINTER_OUT, this.handleOut)
        this.addEventListener(MouseEvent.POINTER_UP_OUTSIDE, this.handleOut)
    }

    protected handleOut = (event:MouseEvent)=>
    {
        this.buttongraphic.visible = true;
        this.buttonovergraphic.visible = false;
        this.buttondowngraphic.visible = false;
    }

    protected handleOver = (event:MouseEvent)=>
    {
        this.buttongraphic.visible = false;
        this.buttonovergraphic.visible = true;
        this.buttondowngraphic.visible = false;
    }

    protected handleUp = (event:MouseEvent)=>
    {
        this.buttongraphic.visible = true;
        this.buttonovergraphic.visible = false;
        this.buttondowngraphic.visible = false;
    }

    protected handleDown = (event:MouseEvent)=>
    {
        this.buttongraphic.visible = false;
        this.buttonovergraphic.visible = false;
        this.buttondowngraphic.visible = true;
    }
}