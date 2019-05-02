import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";


export class BasicBackground extends BaseExample
{
    protected loader:ResourceLoader;  
    protected bunny:Sprite;

    
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bunny.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleResourceLoaded);
        this.loader.load();  
    }

    protected handleResourceLoaded = (event:Event)=>
    {
        let txt:Texture = new Texture(new BaseTexture(this.loader.imageData));  
        this.bunny = new Sprite(txt);
        this.bunny.anchor.set(0.5);
        this.bunny.x = this.app.screen.width / 2;
        this.bunny.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.bunny);
        this.app.ticker.add(this.runExample);
    }

    protected runExample = (delta:number)=>
    {
        this.bunny.rotation += 0.1;
    }

    public destructor():void
    {
        super.destructor();
        this.app.ticker.remove(this.runExample, null)
        this.bunny.destroy(null);
    }
}