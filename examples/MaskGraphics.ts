import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { Container } from "../raw-pixi-ts/Container";
import { Graphics } from "../raw-pixi-ts/Graphics";
import { MouseEvent } from "../raw-pixi-ts/MouseEvent";
import { Text } from "../raw-pixi-ts/Text";

export class MaskGraphics extends BaseExample
{
    protected loader:ResourceLoader;  
    protected rotateTxt:Texture;
    protected scenerotateTxt:Texture;
    protected lightrotate2Txt:Texture;
    protected lightrotate1Txt:Texture;
    protected pandaTxt:Texture;
    protected container:Container;
    protected thing:Graphics;
    protected count:number;
    protected bg:Sprite;
    protected bgFront:Sprite;
    protected light2:Sprite;
    protected light1:Sprite;
    protected panda:Sprite;    
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.backColor = 0
        this.activateMask();
        app.stage.interactive = true;
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_rotate.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load();   
    }

    protected handlePandaLoaded = (event:Event)=>
    {
        this.pandaTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.bg = new Sprite(this.rotateTxt);
        this.bg.anchor.set(0.5);
        this.bg.x = this.sizew / 2;
        this.bg.y = this.sizeh / 2;
        this.stage.addChild(this.bg);
        this.container = new Container();
        this.container.x = this.sizew / 2;
        this.container.y = this.sizeh / 2;
        this.bgFront = new Sprite(this.scenerotateTxt);
        this.bgFront.anchor.set(0.5);
        this.light2 = new Sprite(this.lightrotate2Txt);
        this.light2.anchor.set(0.5);
        this.light1 = new Sprite(this.lightrotate1Txt);
        this.light1.anchor.set(0.5);
        this.panda = new Sprite(this.pandaTxt);
        this.panda.anchor.set(0.5);
        this.container.addChild(this.bgFront);
        this.container.addChild(this.light2);
        this.container.addChild(this.light1);
        this.container.addChild(this.panda);
        this.stage.addChild(this.container);
        this.thing = new Graphics();
        this.stage.addChild(this.thing);
        this.thing.x = this.sizew / 2;
        this.thing.y = this.sizeh / 2;
        this.thing.lineStyle(0);
        this.container.mask = this.thing;
        this.count = 0;
        this.stage.addEventListener(MouseEvent.POINTER_TAP, this.handleStageTap)
        const help = new Text('Click or tap to turn masking on / off.', {
            fontFamily: 'Arial',
            fontSize: 12,
            fontWeight: 'bold',
            fill: 'white',
        });
        help.y = this.app.screen.height - 35;
        help.x = 15;
        this.stage.addChild(help);
        this.app.ticker.add(this.runExample);
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        this.bg.rotation += 0.01;
        this.bgFront.rotation -= 0.01;
        this.light1.rotation += 0.02;
        this.light2.rotation += 0.01;
        this.panda.scale.x = 1 + Math.sin(this.count) * 0.04;
        this.panda.scale.y = 1 + Math.cos(this.count) * 0.04;
        this.count += 0.1;
        this.thing.clear();
        this.thing.beginFill(0x8bc5ff, 0.4);
        this.thing.moveTo(-120 + Math.sin(this.count) * 20, -100 + Math.cos(this.count) * 20);
        this.thing.lineTo(120 + Math.cos(this.count) * 20, -100 + Math.sin(this.count) * 20);
        this.thing.lineTo(120 + Math.sin(this.count) * 20, 100 + Math.cos(this.count) * 20);
        this.thing.lineTo(-120 + Math.cos(this.count) * 20, 100 + Math.sin(this.count) * 20);
        this.thing.rotation = this.count * 0.1;
    }

    protected handleStageTap = (event:MouseEvent)=>
    {
        if (!this.container.mask) 
        {
            this.container.mask = this.thing;
        } 
        else 
        {
            this.container.mask = null;
        }
    }

    protected handleLightRotate1Loaded = (event:Event)=>
    {
        this.lightrotate1Txt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/light_rotate_1.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleLightRotate1Loaded);
        this.loader.load();  
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.rotateTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_scene_rotate.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleSceneRotateLoaded);
        this.loader.load();    
    }

    protected handleSceneRotateLoaded = (event:Event)=>
    {
        this.scenerotateTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/light_rotate_2.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleLightRotate2Loaded);
        this.loader.load();  
    }

    protected handleLightRotate2Loaded = (event:Event)=>
    {
        this.lightrotate2Txt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/panda.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handlePandaLoaded);
        this.loader.load();  
    }

    public destructor():void
    {
        super.destructor();        
        this.app.ticker.remove(this.runExample, null)
        this.panda.destroy(null)
        this.panda = null
        this.rotateTxt.destroy(null)
        this.rotateTxt = null
        this.scenerotateTxt.destroy(null)
        this.scenerotateTxt = null
        this.lightrotate2Txt.destroy(null)
        this.lightrotate2Txt = null
        this.lightrotate1Txt.destroy(null)
        this.lightrotate1Txt = null
        this.pandaTxt.destroy(null)
        this.pandaTxt = null
        this.container.destroy(null)
        this.container = null
        this.thing.destroy(null)
        this.thing = null
        this.bg.destroy(null)
        this.bg = null
        this.bgFront.destroy(null)
        this.bgFront = null
        this.light2.destroy(null)
        this.light2 = null
        this.light1.destroy(null)
        this.light1 = null
    }
}