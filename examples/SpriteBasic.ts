import { BaseExample } from './BaseExample';
import { Application } from '../raw-pixi-ts/Application';
import { ResourceLoader } from '../raw-pixi-ts/ResourceLoader';
import { URLRequest } from '../raw-pixi-ts/URLRequest';
import { Event } from '../raw-pixi-ts/Event';
import { Texture } from '../raw-pixi-ts/Texture';
import { BaseTexture } from '../raw-pixi-ts/BaseTexture';
import { Sprite } from '../raw-pixi-ts/Sprite';


export class SpriteBasic extends BaseExample
{
    protected loader:ResourceLoader; 
    protected bunny:Sprite;    

    constructor(app:Application, width:number = 100, height:number = 100)
    {
        super(app, width, height);
        this.backColor = 0xFFF000;
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bunny.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        let texture = new Texture(new BaseTexture(this.loader.imageData)); 
        this.bunny = new Sprite(texture);
        this.bunny.anchor.set(0.5);
        this.bunny.x = this.sizew / 2;
        this.bunny.y = this.sizeh / 2;
        this.stage.addChild(this.bunny);
        this.app.ticker.add(this.runExample);
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        this.bunny.rotation += 0.1 * delta;
    }

    public destructor():void
    {
        super.destructor();
        this.app.ticker.remove(this.runExample, null);
        this.bunny.destroy(null);
    }
}