import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { URLLoader } from "../raw-pixi-ts/URLLoader";
import { Event } from "../raw-pixi-ts/Event";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Spritesheet } from "../raw-pixi-ts/Spritesheet";
import { AnimatedSprite } from "../raw-pixi-ts/AnimatedSprite";

export class SpriteExplosion extends BaseExample
{
    protected urlloader:URLLoader;
    protected jsondata:any;
    protected loader:ResourceLoader;  
    protected txt:Texture;

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.urlloader = new URLLoader();
        this.urlloader.addEventListener(Event.COMPLETE, this.handleJsonLoaded);
        this.urlloader.load(new URLRequest("examples/assets/spritesheet/mc.json"));
    }

    protected onAnimationParsed = (textures:Texture[])=>
    {
        const explosionTextures = [];
        let i;
        for (i = 0; i < 26; i++) 
        {
            const texture = textures[`Explosion_Sequence_A ${i + 1}.png`];
            explosionTextures.push(texture);
        }
        for (i = 0; i < 50; i++) 
        {
            const explosion = new AnimatedSprite(explosionTextures);
            explosion.x = Math.random() * this.app.screen.width;
            explosion.y = Math.random() * this.app.screen.height;
            explosion.anchor.set(0.5);
            explosion.rotation = Math.random() * Math.PI;
            explosion.scale.set(0.75 + Math.random() * 0.5);
            explosion.gotoAndPlay(Math.random() * 27);
            this.app.stage.addChild(explosion);
        }
    }

    protected handleJsonLoaded = (event:Event)=>
    {
        this.jsondata = JSON.parse(this.urlloader.data);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/spritesheet/mc.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.txt = new Texture(new BaseTexture(this.loader.imageData));  
        let spritesheet:Spritesheet = new Spritesheet(this.txt, this.jsondata);
        spritesheet.parse(this.onAnimationParsed)
    }
}