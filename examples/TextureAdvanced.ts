import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { RenderTexture } from "../raw-pixi-ts/RenderTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { Container } from "../raw-pixi-ts/Container";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";


export class TextureAdvanced extends BaseExample
{
    protected renderTexture:RenderTexture;
    protected renderTexture2:RenderTexture;
    protected loader:ResourceLoader;  
    protected fruitslinks:string[];
    protected fruits:Texture[];
    protected stuffContainer:Container;
    protected items:Sprite[];
    protected count:number;
    protected outputSprite:Sprite;

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.renderTexture = RenderTexture.create(
            app.screen.width,
            app.screen.height,
        );
        this.renderTexture2 = RenderTexture.create(
            app.screen.width,
            app.screen.height,
        );
        const currentTexture = this.renderTexture;
        this.outputSprite = new Sprite(currentTexture);
        this.outputSprite.x = 400;
        this.outputSprite.y = 300;
        this.outputSprite.anchor.set(0.5);
        app.stage.addChild(this.outputSprite);
        this.stuffContainer = new Container();
        this.stuffContainer.x = 400;
        this.stuffContainer.y = 300;
        app.stage.addChild(this.stuffContainer);
        this.fruitslinks = [
            'examples/assets/rt_object_01.png',
            'examples/assets/rt_object_02.png',
            'examples/assets/rt_object_03.png',
            'examples/assets/rt_object_04.png',
            'examples/assets/rt_object_05.png',
            'examples/assets/rt_object_06.png',
            'examples/assets/rt_object_07.png',
            'examples/assets/rt_object_08.png',
        ];
        this.fruits = [];
        this.loadAssets();
    }

    protected init():void
    {
        this.items = [];
        for (let i = 0; i < 20; i++) 
        {
            const item = new Sprite(this.fruits[i % this.fruits.length]);
            item.x = Math.random() * 400 - 200;
            item.y = Math.random() * 400 - 200;
            item.anchor.set(0.5);
            this.stuffContainer.addChild(item);
            this.items.push(item);
        }
        this.count = 0;
        this.app.ticker.add(this.runExample);
    }

    protected runExample = (delta:number)=>
    {
        
        for (let i = 0; i < this.items.length; i++) 
        {
            const item = this.items[i];
            item.rotation += 0.1;
        }
        this.count += 0.01;
        const temp = this.renderTexture;
        this.renderTexture = this.renderTexture2;
        this.renderTexture2 = temp;
        this.outputSprite.texture = this.renderTexture;
        this.stuffContainer.rotation -= 0.01;
        this.outputSprite.scale.set(1 + Math.sin(this.count) * 0.2);
        this.app.renderer.render(this.app.stage, this.renderTexture2, false);
    }

    protected loadAssets():void
    {
        if(!this.fruitslinks.length)
        {
            this.init();
            return;
        }
        this.loader = new ResourceLoader(new URLRequest(this.fruitslinks.pop()))
        this.loader.addEventListener(Event.COMPLETE, this.handleResourceLoaded);
        this.loader.load(); 
    }

    protected handleResourceLoaded = (event:Event)=>
    {
        let txt:Texture = new Texture(new BaseTexture(this.loader.imageData));   
        this.fruits.push(txt);    
        this.loadAssets();
    }
}