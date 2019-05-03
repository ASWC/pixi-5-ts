import { BaseExample } from './BaseExample';
import { Application } from '../raw-pixi-ts/Application';
import { ResourceLoader } from '../raw-pixi-ts/ResourceLoader';
import { URLRequest } from '../raw-pixi-ts/URLRequest';
import { Event } from '../raw-pixi-ts/Event';
import { Texture } from '../raw-pixi-ts/Texture';
import { BaseTexture } from '../raw-pixi-ts/BaseTexture';
import { DisplaySettings } from '../raw-pixi-ts/DisplaySettings';
import { WebGLSettings } from '../raw-pixi-ts/WebGLSettings';
import { Sprite } from '../raw-pixi-ts/Sprite';
import { MouseEvent } from '../raw-pixi-ts/MouseEvent';


export class InteractionClick extends BaseExample
{
    protected loader:ResourceLoader; 
    protected sprite:Sprite;

    public destructor():void
    {
        super.destructor();  
        this.sprite.destroy(null);      
        this.sprite = null
    }

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bunny.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        let txt:Texture = new Texture(new BaseTexture(this.loader.imageData)); 
        DisplaySettings.SCALE_MODE = WebGLSettings.SCALE_MODES.NEAREST;
        this.sprite = new Sprite(txt);
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.sizew / 2;
        this.sprite.y = this.sizeh / 2;
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.addEventListener(MouseEvent.POINTER_DOWN, this.onClick);
        this.stage.addChild(this.sprite);
        this.exampleReady();
    }

    protected onClick = (event:MouseEvent)=> 
    {
        this.sprite.scale.x *= 1.25;
        this.sprite.scale.y *= 1.25;
    }
}