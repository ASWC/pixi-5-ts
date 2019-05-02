import { BaseExample } from './BaseExample';
import { Application } from '../raw-pixi-ts/Application';
import { ResourceLoader } from '../raw-pixi-ts/ResourceLoader';
import { URLRequest } from '../raw-pixi-ts/URLRequest';
import { Event } from '../raw-pixi-ts/Event';
import { Texture } from '../raw-pixi-ts/Texture';
import { BaseTexture } from '../raw-pixi-ts/BaseTexture';
import { Sprite } from '../raw-pixi-ts/Sprite';
import { MouseEvent } from '../raw-pixi-ts/MouseEvent';


export class SpriteSwap extends BaseExample
{
    protected loader:ResourceLoader; 
    protected txt1:Texture;
    protected txt2:Texture;
    protected dude:Sprite;
    protected bol:boolean;

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/flowerTop.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.txt1 = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/eggHead.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotate2Loaded);
        this.loader.load();         
    }

    protected handleRotate2Loaded = (event:Event)=>
    {
        this.txt2 = new Texture(new BaseTexture(this.loader.imageData)); 
        this.dude = new Sprite(this.txt1);
        this.dude.anchor.set(0.5);
        this.dude.x = this.app.screen.width / 2;
        this.dude.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.dude);
        this.dude.interactive = true;
        this.dude.buttonMode = true;
        this.dude.addEventListener(MouseEvent.POINTER_DOWN, this.handleDown)
        this.app.ticker.add(this.runExample)
    }

    protected handleDown = (event:MouseEvent)=>
    {
        this.bol = !this.bol;
        if (this.bol) 
        {
            this.dude.texture = this.txt2;
        } 
        else 
        {
            this.dude.texture = this.txt1;
        }
    }

    protected runExample = (delta:number)=>
    {
        this.dude.rotation += 0.1;
    }
}