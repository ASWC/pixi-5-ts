import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { Graphics } from "../raw-pixi-ts/Graphics";
import { MouseEvent } from "../raw-pixi-ts/MouseEvent";


export class GraphicsDynamic extends BaseExample
{
    protected graphics:Graphics;
    protected count:number;
    protected thing:Graphics;

    constructor(app:Application)
    {
        super(app);
        app.stage.interactive = true;
        this.graphics = new Graphics();
        this.graphics.beginFill(0xFF3300);
        this.graphics.lineStyle(10, 0xffd900, 1);
        this.graphics.moveTo(50, 50);
        this.graphics.lineTo(250, 50);
        this.graphics.lineTo(100, 100);
        this.graphics.lineTo(250, 220);
        this.graphics.lineTo(50, 220);
        this.graphics.lineTo(50, 50);
        this.graphics.endFill();
        this.graphics.lineStyle(10, 0xFF0000, 0.8);
        this.graphics.beginFill(0xFF700B, 1);
        this.graphics.moveTo(210, 300);
        this.graphics.lineTo(450, 320);
        this.graphics.lineTo(570, 350);
        this.graphics.quadraticCurveTo(600, 0, 480, 100);
        this.graphics.lineTo(330, 120);
        this.graphics.lineTo(410, 200);
        this.graphics.lineTo(210, 300);
        this.graphics.endFill();
        this.graphics.lineStyle(2, 0x0000FF, 1);
        this.graphics.drawRect(50, 250, 100, 100);
        this.graphics.lineStyle(0);
        this.graphics.beginFill(0xFFFF0B, 0.5);
        this.graphics.drawCircle(470, 200, 100);
        this.graphics.endFill();
        this.graphics.lineStyle(20, 0x33FF00);
        this.graphics.moveTo(30, 30);
        this.graphics.lineTo(600, 300);
        app.stage.addChild(this.graphics);
        this.thing = new Graphics();
        app.stage.addChild(this.thing);
        this.thing.x = 800 / 2;
        this.thing.y = 600 / 2;
        this.count = 0;
        app.ticker.add(this.runExample);
        app.stage.addEventListener(MouseEvent.POINTER_DOWN, this.onPointerDown);
    }

    protected runExample = (delta:number)=>
    {
        this.count += 0.1;
        this.thing.clear();
        this.thing.lineStyle(10, 0xff0000, 1);
        this.thing.beginFill(0xffFF00, 0.5);
        this.thing.moveTo(-120 + Math.sin(this.count) * 20, -100 + Math.cos(this.count) * 20);
        this.thing.lineTo(120 + Math.cos(this.count) * 20, -100 + Math.sin(this.count) * 20);
        this.thing.lineTo(120 + Math.sin(this.count) * 20, 100 + Math.cos(this.count) * 20);
        this.thing.lineTo(-120 + Math.cos(this.count) * 20, 100 + Math.sin(this.count) * 20);
        this.thing.lineTo(-120 + Math.sin(this.count) * 20, -100 + Math.cos(this.count) * 20);
        this.thing.rotation = this.count * 0.1;
    }

    protected onPointerDown = ()=>
    {
        this.graphics.lineStyle(Math.random() * 30, Math.random() * 0xFFFFFF, 1);
        this.graphics.moveTo(Math.random() * 800, Math.random() * 600);
        this.graphics.bezierCurveTo(
        Math.random() * 800, Math.random() * 600,
        Math.random() * 800, Math.random() * 600,
        Math.random() * 800, Math.random() * 600,
    );
}
}