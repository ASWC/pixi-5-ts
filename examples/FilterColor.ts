import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { ColorMatrixFilter } from "../raw-pixi-ts/ColorMatrixFilter";
import { Text } from "../raw-pixi-ts/Text";
import { Container } from "../raw-pixi-ts/Container";
import { MouseEvent } from "../raw-pixi-ts/MouseEvent";


export class FilterColor extends BaseExample
{
    protected loader:ResourceLoader;  
    protected rotateTxt:Texture;
    protected scenerotateTxt:Texture;
    protected lightrotate2Txt:Texture;
    protected lightrotate1Txt:Texture;
    protected pandaTxt:Texture;
    protected bg:Sprite;
    protected bgFront:Sprite;
    protected light2:Sprite;
    protected panda:Sprite;
    protected light1:Sprite;
    protected filter:ColorMatrixFilter;
    protected count:number;
    protected enabled:boolean;
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
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
        this.bg.x = this.app.screen.width / 2;
        this.bg.y = this.app.screen.height / 2;
        this.filter = new ColorMatrixFilter();
        const container = new Container();
        container.x = this.app.screen.width / 2;
        container.y = this.app.screen.height / 2;
        this.bgFront = new Sprite(this.scenerotateTxt);
        this.bgFront.anchor.set(0.5);
        container.addChild(this.bgFront);
        this.light2 = new Sprite(this.lightrotate2Txt);
        this.light2.anchor.set(0.5);
        container.addChild(this.light2);
        this.light1 = new Sprite(this.lightrotate1Txt);
        this.light1.anchor.set(0.5);
        container.addChild(this.light1);
        this.panda = new Sprite(this.pandaTxt);
        this.panda.anchor.set(0.5);
        container.addChild(this.panda);
        this.app.stage.addChild(container);
        this.app.stage.filters = [this.filter];
        this.count = 0;
        this.enabled = true;
        this.app.stage.addEventListener(MouseEvent.POINTER_TAP, this.handlePointer);
        const help = new Text('Click or tap to turn filters on / off.', {
            fontFamily: 'Arial',
            fontSize: 12,
            fontWeight: 'bold',
            fill: 'white',
        });
        help.y = this.app.screen.height - 25;
        help.x = 10;
        this.app.stage.addChild(help);
        this.app.ticker.add(this.runExample);
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
        const { matrix } = this.filter;
        matrix[1] = Math.sin(this.count) * 3;
        matrix[2] = Math.cos(this.count);
        matrix[3] = Math.cos(this.count) * 1.5;
        matrix[4] = Math.sin(this.count / 3) * 2;
        matrix[5] = Math.sin(this.count / 2);
        matrix[6] = Math.sin(this.count / 4);
    }

    protected handlePointer = (event:MouseEvent)=>
    {
        this.enabled = !this.enabled;
        this.app.stage.filters = this.enabled ? [this.filter] : null;
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
}