import { BaseExample } from './BaseExample';
import { Application } from '../raw-pixi-ts/Application';
import { ResourceLoader } from '../raw-pixi-ts/ResourceLoader';
import { Texture } from '../raw-pixi-ts/Texture';
import { URLRequest } from '../raw-pixi-ts/URLRequest';
import { Event } from '../raw-pixi-ts/Event';
import { BaseTexture } from '../raw-pixi-ts/BaseTexture';
import { Graphics } from '../raw-pixi-ts/Graphics';
import { BlurFilter } from '../raw-pixi-ts/BlurFilter';
import { Rectangle } from '../flash/geom/Rectangle';
import { WebGLSettings } from '../raw-pixi-ts/WebGLSettings';
import { Sprite } from '../raw-pixi-ts/Sprite';
import { MouseEvent } from '../raw-pixi-ts/MouseEvent';


export class MaskFilter extends BaseExample
{
    protected loader:ResourceLoader;  
    protected flagTxt:Texture;
    protected focus:Sprite;

    public destructor():void
    {
        super.destructor();    
        this.flagTxt.destroy(null)
        this.flagTxt = null
        this.focus.destroy(null)
        this.focus = null
    }

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.backColor = 0;
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_grass.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.flagTxt = new Texture(new BaseTexture(this.loader.imageData));  
        const radius = 100;
        const blurSize = 32;
        const background = new Sprite(this.flagTxt);
        this.stage.addChild(background);
        background.width = this.sizew;
        background.height = this.sizeh;
        const circle = new Graphics()
            .beginFill(0xFF0000)
            .drawCircle(radius + blurSize, radius + blurSize, radius)
            .endFill();
        circle.filters = [new BlurFilter(blurSize)];
        const bounds = Rectangle.getRectangle(0, 0, (radius + blurSize) * 2, (radius + blurSize) * 2);
        const texture = this.app.renderer.generateTexture(circle, WebGLSettings.SCALE_MODES.NEAREST, 1, bounds);
        this.focus = new Sprite(texture);
        this.stage.addChild(this.focus);
        background.mask = this.focus;
        this.stage.interactive = true;
        this.stage.addEventListener(MouseEvent.MOUSE_MOVE, this.pointerMove);
        this.exampleReady();
    }

    protected pointerMove = (event:MouseEvent)=> 
    {
        this.focus.position.x = event.data.global.x - this.focus.width / 2;
        this.focus.position.y = event.data.global.y - this.focus.height / 2;
    }
}