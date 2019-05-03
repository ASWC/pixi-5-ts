import { BaseExample } from "./BaseExample";
import { URLLoader } from "../raw-pixi-ts/URLLoader";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { AnimatedSprite } from "../raw-pixi-ts/AnimatedSprite";
import { Application } from "../raw-pixi-ts/Application";
import { Event } from "../raw-pixi-ts/Event";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Spritesheet } from "../raw-pixi-ts/Spritesheet";

export class SpriteSpeed extends BaseExample
{
    protected urlloader:URLLoader;
    protected jsondata:any;
    protected loader:ResourceLoader;  
    protected txt:Texture;
    protected anim:AnimatedSprite;
    protected spritesheet:Spritesheet;    

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.backColor = 0x57AACC;
        this.urlloader = new URLLoader();
        this.urlloader.addEventListener(Event.COMPLETE, this.handleJsonLoaded);
        this.urlloader.load(new URLRequest("examples/assets/spritesheet/0123456789.json"));
    }

    protected onAnimationParsed = (loadedtextures:Texture[])=>
    {        
        const textures = [];
        let i;
        for (i = 0; i < 10; i++) 
        {
            const framekey = `0123456789 ${i}.ase`;
            const texture = loadedtextures[framekey];
            const time = this.spritesheet.data.frames[framekey].duration;
            textures.push({ texture, time });
        }
        const scaling = 4;
        const slow = new AnimatedSprite(textures);
        slow.anchor.set(0.5);
        slow.scale.set(scaling);
        slow.animationSpeed = 0.5;
        slow.x = (this.sizew - slow.width) / 2;
        slow.y = this.sizeh / 2;
        slow.play();
        this.app.stage.addChild(slow);
        const fast = new AnimatedSprite(textures);
        fast.anchor.set(0.5);
        fast.scale.set(scaling);
        fast.x = (this.sizew + fast.width) / 2;
        fast.y = this.sizeh / 2;
        fast.play();
        this.stage.addChild(fast);
        // this.app.ticker.add(this.runExample)
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        
    }

    protected handleJsonLoaded = (event:Event)=>
    {
        this.jsondata = JSON.parse(this.urlloader.data);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/spritesheet/0123456789.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.txt = new Texture(new BaseTexture(this.loader.imageData));  
        this.spritesheet = new Spritesheet(this.txt, this.jsondata);
        this.spritesheet.parse(this.onAnimationParsed)        
    }

    public destructor():void
    {
        super.destructor();        
        this.app.ticker.remove(this.runExample, null)
        this.spritesheet.destroy(null);
        this.spritesheet = null;
        this.txt.destroy(null);
        this.txt = null;
        this.anim.destroy(null);
        this.anim = null;
    }
}