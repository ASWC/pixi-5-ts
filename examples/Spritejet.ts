import { BaseExample } from "./BaseExample";
import { URLLoader } from "../raw-pixi-ts/URLLoader";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { Application } from "../raw-pixi-ts/Application";
import { Event } from "../raw-pixi-ts/Event";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Spritesheet } from "../raw-pixi-ts/Spritesheet";
import { AnimatedSprite } from "../raw-pixi-ts/AnimatedSprite";


export class Spritejet extends BaseExample
{
    protected urlloader:URLLoader;
    protected jsondata:any;
    protected loader:ResourceLoader;  
    protected txt:Texture;
    protected anim:AnimatedSprite;    
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.backColor = 0x969696;
        this.urlloader = new URLLoader();
        this.urlloader.addEventListener(Event.COMPLETE, this.handleJsonLoaded);
        this.urlloader.load(new URLRequest("examples/assets/spritesheet/fighter.json"));
    }

    protected onAnimationParsed = (textures:Texture[])=>
    {
        const frames = [];
        for (let i = 0; i < 30; i++) 
        {
            const val = i < 10 ? `0${i}` : i;    
            frames.push(textures[`rollSequence00${val}.png`]);
        }
        this.anim = new AnimatedSprite(frames);
        this.anim.x = this.sizew / 2;
        this.anim.y = this.sizeh / 2;
        this.anim.anchor.set(0.5);
        this.anim.animationSpeed = 0.5;
        this.anim.play();    
        this.stage.addChild(this.anim);
        this.app.ticker.add(this.runExample)
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        this.anim.rotation += 0.01;
    }

    protected handleJsonLoaded = (event:Event)=>
    {
        this.jsondata = JSON.parse(this.urlloader.data);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/spritesheet/fighter.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.txt = new Texture(new BaseTexture(this.loader.imageData));  
        let spritesheet:Spritesheet = new Spritesheet(this.txt, this.jsondata);
        spritesheet.parse(this.onAnimationParsed)
    }

    public destructor():void
    {
        super.destructor();        
        this.app.ticker.remove(this.runExample, null)
        if(this.anim)
        {
            this.anim.destructor()
        }        
        this.anim = null;
        if(this.txt)
        {
            this.txt.destructor()
        }  
        this.txt = null;
        this.jsondata = null;
    }
}