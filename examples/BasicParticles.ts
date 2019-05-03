import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { ParticleContainer } from "../raw-pixi-ts/ParticleContainer";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { Rectangle } from "../raw-pixi-ts/Rectangle";


export class BasicParticles extends BaseExample
{
    protected loader:ResourceLoader;  
    protected tick:number;
    protected maggots:any[];
    protected dudeBounds:Rectangle;    
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.activateMask();
        this.loader = new ResourceLoader(new URLRequest("examples/assets/maggot_tiny.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleResourceLoaded);
        this.loader.load(); 
    }

    protected handleResourceLoaded = (event:Event)=>
    {
        let txt:Texture = new Texture(new BaseTexture(this.loader.imageData));         
        const sprites = new ParticleContainer(10000, {scale: true, position: true, rotation: true, uvs: true, alpha: true,});
        this.stage.addChild(sprites);
        this.maggots = [];        
        const totalSprites = 10000;        
        for (let i = 0; i < totalSprites; i++) 
        {
            const dude = new ExtendedSprite(txt);        
            dude.tint = Math.random() * 0xE8D4CD;
            dude.anchor.set(0.5);
            dude.scale.set(0.8 + Math.random() * 0.3);
            dude.x = Math.random() * this.sizew;
            dude.y = Math.random() * this.sizeh;        
            dude.tint = Math.random() * 0x808080;
            dude.direction = Math.random() * Math.PI * 2;
            dude.turningSpeed = Math.random() - 0.8;
            dude.speed = (2 + Math.random() * 2) * 0.2;        
            dude.offset = Math.random() * 100;
            this.maggots.push(dude);        
            sprites.addChild(dude);
        }
        const dudeBoundsPadding = 100;
        this.dudeBounds = new Rectangle(
            -dudeBoundsPadding,
            -dudeBoundsPadding,
            this.sizew + dudeBoundsPadding * 2,
            this.sizeh + dudeBoundsPadding * 2,
        );        
        this.tick = 0;    
        this.app.ticker.add(this.runExample);
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        for (let i = 0; i < this.maggots.length; i++) 
        {
            const dude = this.maggots[i];
            dude.scale.y = 0.95 + Math.sin(this.tick + dude.offset) * 0.05;
            dude.direction += dude.turningSpeed * 0.01;
            dude.x += Math.sin(dude.direction) * (dude.speed * dude.scale.y);
            dude.y += Math.cos(dude.direction) * (dude.speed * dude.scale.y);
            dude.rotation = -dude.direction + Math.PI;
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
        this.tick += 0.1;
    }

    public destructor():void
    {
        super.destructor();        
        this.app.ticker.remove(this.runExample, null)
        this.maggots = null
    }
}

class ExtendedSprite extends Sprite
{
    public direction:number;
    public turningSpeed:number;
    public offset:number;
    public speed:number;    
}