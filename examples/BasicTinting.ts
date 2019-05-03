import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Event } from "../raw-pixi-ts/Event";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { Rectangle } from "../raw-pixi-ts/Rectangle";

export class BasicTinting extends BaseExample
{
    protected loader:ResourceLoader;  
    protected dudeBounds:Rectangle;
    protected aliens:ExtendedSprite[];    
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.backColor = 0xFFF000;
        this.activateMask();
        this.loader = new ResourceLoader(new URLRequest("examples/assets/eggHead.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleResourceLoaded);
        this.loader.load(); 
    }

    protected handleResourceLoaded = (event:Event)=>
    {
        let txt:Texture = new Texture(new BaseTexture(this.loader.imageData));  
        this.aliens = [];
        const totalDudes = 20;
        for (let i = 0; i < totalDudes; i++) 
        {
            const dude = new ExtendedSprite(txt);
            dude.anchor.set(0.5);
            dude.scale.set(0.8 + Math.random() * 0.3);
            dude.x = Math.random() * this.sizew;
            dude.y = Math.random() * this.sizeh;
            dude.tint = Math.random() * 0xFFFFFF;
            dude.direction = Math.random() * Math.PI * 2;
            dude.turningSpeed = Math.random() - 0.8;
            dude.speed = 2 + Math.random() * 2;
            this.aliens.push(dude);
            this.stage.addChild(dude);
        }
        const dudeBoundsPadding = 100;
        this.dudeBounds = Rectangle.getRectangle(-dudeBoundsPadding, -dudeBoundsPadding, this.sizew + dudeBoundsPadding * 2, this.sizeh + dudeBoundsPadding * 2);
        this.app.ticker.add(this.runExample);
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        for (let i = 0; i < this.aliens.length; i++) 
        {
            const dude = this.aliens[i];
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
        this.aliens = null
    }
}

class ExtendedSprite extends Sprite
{
    public direction:number;
    public turningSpeed:number;
    public speed:number;
}