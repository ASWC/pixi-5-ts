import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Container } from "../raw-pixi-ts/Container";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { WebGLSettings } from "../raw-pixi-ts/WebGLSettings";
import { BaseRenderTexture } from "../raw-pixi-ts/BaseRenderTexture";
import { RenderTexture } from "../raw-pixi-ts/RenderTexture";

export class TextureRender extends BaseExample
{
    protected loader:ResourceLoader; 
    protected container:Container;
    protected rt:RenderTexture;

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
        this.container = new Container();
        this.app.stage.addChild(this.container);
        for (let i = 0; i < 25; i++) 
        {
            const bunny = new Sprite(txt);
            bunny.x = (i % 5) * 30;
            bunny.y = Math.floor(i / 5) * 30;
            bunny.rotation = Math.random() * (Math.PI * 2);
            this.container.addChild(bunny);
        }
        const brt = new BaseRenderTexture(300, 300, WebGLSettings.SCALE_MODES.LINEAR, 1);
        this.rt = new RenderTexture(brt);
        const sprite = new Sprite(this.rt);
        sprite.x = 450;
        sprite.y = 60;
        this.app.stage.addChild(sprite);
        this.container.x = 100;
        this.container.y = 60;
        this.app.ticker.add(this.runExample);
    }

    protected runExample = (delta:number)=>
    {
        this.app.renderer.render(this.container, this.rt);
    }
}