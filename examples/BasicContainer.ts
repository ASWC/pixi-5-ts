import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { Container } from "../raw-pixi-ts/Container";
import { Texture } from "../raw-pixi-ts/Texture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";

export class BasicContainer extends BaseExample
{
    protected container:Container;
    protected loader:ResourceLoader; 
    
    public destructor():void
    {
        super.destructor();        
        this.app.ticker.remove(this.runExample, null)
        if(this.container)
        {
            this.container.destructor()
        }    
        this.container = null
    }

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.container = new Container();
        this.stage.addChild(this.container);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bunny.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleResourceLoaded);
        this.loader.load();        
    }

    protected handleResourceLoaded = (event:Event)=>
    {
        let txt:Texture = new Texture(new BaseTexture(this.loader.imageData));       
        for (let i = 0; i < 25; i++) {
            const bunny = new Sprite(txt);
            bunny.anchor.set(0.5);
            bunny.x = (i % 5) * 40;
            bunny.y = Math.floor(i / 5) * 40;
            this.container.addChild(bunny);
        }
        this.container.x = this.sizew / 2;
        this.container.y = this.sizeh / 2;
        this.container.pivot.x = this.container.width / 2;
        this.container.pivot.y = this.container.height / 2;
        this.app.ticker.add(this.runExample);
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        this.container.rotation -= 0.01 * delta;
    }
}