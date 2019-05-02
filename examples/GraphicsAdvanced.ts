import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { Graphics } from "../raw-pixi-ts/Graphics";

export class GraphicsAdvanced extends BaseExample
{
    protected loader:ResourceLoader;  
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_rotate.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleResourceLoaded);
        this.loader.load();  
    }

    protected handleResourceLoaded = (event:Event)=>
    {
        let txt:Texture = new Texture(new BaseTexture(this.loader.imageData)); 
        const sprite = new Sprite(txt);
        const realPath = new Graphics();
        realPath.lineStyle(2, 0xFFFFFF, 1);
        realPath.moveTo(0, 0);
        realPath.lineTo(100, 200);
        realPath.lineTo(200, 200);
        realPath.lineTo(240, 100);
        realPath.position.x = 50;
        realPath.position.y = 50;
        this.app.stage.addChild(realPath);
        const bezier = new Graphics();
        bezier.lineStyle(5, 0xAA0000, 1);
        bezier.bezierCurveTo(100, 200, 200, 200, 240, 100);
        bezier.position.x = 50;
        bezier.position.y = 50;
        this.app.stage.addChild(bezier);
        const realPath2 = new Graphics();
        realPath2.lineStyle(2, 0xFFFFFF, 1);
        realPath2.moveTo(0, 0);
        realPath2.lineTo(0, -100);
        realPath2.lineTo(150, 150);
        realPath2.lineTo(240, 100);
        realPath2.position.x = 320;
        realPath2.position.y = 150;
        this.app.stage.addChild(realPath2);
        const bezier2 = new Graphics();
        bezier2.lineTextureStyle(10, sprite.texture);
        bezier2.bezierCurveTo(0, -100, 150, 150, 240, 100);
        bezier2.position.x = 320;
        bezier2.position.y = 150;
        this.app.stage.addChild(bezier2);
        const arc = new Graphics();
        arc.lineStyle(5, 0xAA00BB, 1);
        arc.arc(600, 100, 50, Math.PI, 2 * Math.PI);
        this.app.stage.addChild(arc);
        const arc2 = new Graphics();
        arc2.lineStyle(6, 0x3333DD, 1);
        arc2.arc(650, 270, 60, 2 * Math.PI, 3 * Math.PI / 2);
        this.app.stage.addChild(arc2);
        const arc3 = new Graphics();
        arc3.lineTextureStyle(20, sprite.texture);
        arc3.arc(650, 420, 60, 2 * Math.PI, 2.5 * Math.PI / 2);
        this.app.stage.addChild(arc3);
        const rectAndHole = new Graphics();
        rectAndHole.beginFill(0x00FF00);
        rectAndHole.drawRect(350, 350, 150, 150);
        rectAndHole.beginHole();
        rectAndHole.drawCircle(375, 375, 25);
        rectAndHole.drawCircle(425, 425, 25);
        rectAndHole.drawCircle(475, 475, 25);
        rectAndHole.endHole();
        rectAndHole.endFill();
        this.app.stage.addChild(rectAndHole);
        const beatifulRect = new Graphics();
        beatifulRect.lineTextureStyle(20, sprite.texture);
        beatifulRect.beginFill(0xFF0000);
        beatifulRect.drawRect(80, 350, 150, 150);
        beatifulRect.endFill();
        this.app.stage.addChild(beatifulRect);
    }
}