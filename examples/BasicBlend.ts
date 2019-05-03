import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { Rectangle } from "../raw-pixi-ts/Rectangle";
import { BlendModesSettings } from "../raw-pixi-ts/BlendModesSettings";


export class BasicBlend extends BaseExample
{
    protected loader:ResourceLoader;  
    protected dudeArray:any[];
    protected dudeBounds:Rectangle;    
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.backColor = 0xFFFFFF;
        this.activateMask();
        this.loader = new ResourceLoader(new URLRequest("examples/assets/eggHead.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleResourceLoaded);
        this.loader.load(); 
    }

    protected handleResourceLoaded = (event:Event)=>
    {
        let txt:Texture = new Texture(new BaseTexture(this.loader.imageData));  
        const background = new Sprite(txt);
        background.width = this.sizew;
        background.height = this.sizeh;
        this.stage.addChild(background);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/flowerTop.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleFlowerLoaded);
        this.loader.load(); 
    }

    protected handleFlowerLoaded = (event:Event)=>
    {
        let txt:Texture = new Texture(new BaseTexture(this.loader.imageData));  
        this.dudeArray = [];
        const totaldudes = 20;
        for (let i = 0; i < totaldudes; i++) 
        {
            const dude = new ExtendedSprite(txt);
            dude.anchor.set(0.5);
            dude.scale.set(0.8 + Math.random() * 0.3);
            dude.x = Math.floor(Math.random() * this.sizew);
            dude.y = Math.floor(Math.random() * this.sizeh);
            dude.blendMode = BlendModesSettings.BLEND_MODES.ADD;
            dude.direction = Math.random() * Math.PI * 2;
            dude.turningSpeed = Math.random() - 0.8;
            dude.speed = 2 + Math.random() * 2;
            this.dudeArray.push(dude);
            this.stage.addChild(dude);
        }
        const dudeBoundsPadding = 100;
        this.dudeBounds = new Rectangle(
            -dudeBoundsPadding,
            -dudeBoundsPadding,
            this.sizew + dudeBoundsPadding * 2,
            this.sizeh + dudeBoundsPadding * 2,
        );
        this.app.ticker.add(this.runExample);
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        for (let i = 0; i < this.dudeArray.length; i++) 
        {
            const dude = this.dudeArray[i];
            dude.direction += dude.turningSpeed * 0.01;
            dude.x += Math.sin(dude.direction) * dude.speed;
            dude.y += Math.cos(dude.direction) * dude.speed;
            dude.rotation = -dude.direction - Math.PI / 2;
            if (dude.x < this.dudeBounds.x) {
                dude.x += this.dudeBounds.width;
            } else if (dude.x > this.dudeBounds.x + this.dudeBounds.width) {
                dude.x -= this.dudeBounds.width;
            }
            if (dude.y < this.dudeBounds.y) {
                dude.y += this.dudeBounds.height;
            } else if (dude.y > this.dudeBounds.y + this.dudeBounds.height) {
                dude.y -= this.dudeBounds.height;
            }
        }
    }

    public destructor():void
    {
        super.destructor();        
        this.app.ticker.remove(this.runExample, null)
        this.dudeArray = null
    }
}

class ExtendedSprite extends Sprite
{
    public direction:number;
    public turningSpeed:number;
    public speed:number;
}