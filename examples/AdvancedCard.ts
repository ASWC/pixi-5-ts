import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Graphics } from "../raw-pixi-ts/Graphics";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { RenderTexture } from "../raw-pixi-ts/RenderTexture";
import { MouseEvent } from "../raw-pixi-ts/MouseEvent";


export class AdvancedCard extends BaseExample
{
    protected loader:ResourceLoader;  
    protected grasstxt:Texture;
    protected rotatetxt:Texture;
    protected dragging:boolean;
    protected brush:Graphics;
    protected renderTexture:RenderTexture;

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_grass.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleGrassLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.rotatetxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.brush = new Graphics();
        this.brush.beginFill(0xffffff);
        this.brush.drawCircle(0, 0, 50);
        this.brush.endFill();
        const background = new Sprite(this.grasstxt);
        this.stage.addChild(background);
        background.width = this.sizew;
        background.height = this.sizeh;
        const imageToReveal = new Sprite(this.rotatetxt);
        this.stage.addChild(imageToReveal);
        imageToReveal.width = this.sizew;
        imageToReveal.height = this.sizeh;
        this.renderTexture = RenderTexture.create(this.sizew, this.sizeh);
        const renderTextureSprite = new Sprite(this.renderTexture);
        this.stage.addChild(renderTextureSprite);
        imageToReveal.mask = renderTextureSprite;
        this.stage.interactive = true;
        this.dragging = false;
        this.stage.addEventListener(MouseEvent.POINTER_DOWN, this.pointerDown);
        this.stage.addEventListener(MouseEvent.POINTER_UP, this.pointerUp);
        this.stage.addEventListener(MouseEvent.POINTER_MOVE, this.pointerMove);
        this.exampleReady();
    }

    protected pointerMove = (event:MouseEvent)=> 
    {
        if (this.dragging) 
        {
            this.brush.position.copyFrom(event.data.global);
            this.app.renderer.render(this.brush, this.renderTexture, false, null, false);
        }
    }

    protected pointerDown = (event:MouseEvent)=> 
    {
        this.dragging = true;
        this.pointerMove(event);
    }

    protected pointerUp = (event:MouseEvent)=> 
    {
        this.dragging = false;
    }

    public destructor():void
    {
        super.destructor();
        this.stage.removeEventListener(MouseEvent.POINTER_DOWN, this.pointerDown);
        this.stage.removeEventListener(MouseEvent.POINTER_UP, this.pointerUp);
        this.stage.removeEventListener(MouseEvent.POINTER_MOVE, this.pointerMove);
        this.brush.destroy(null);
        this.grasstxt.destroy(null);
    }

    protected handleGrassLoaded = (event:Event)=>
    {
        this.grasstxt = new Texture(new BaseTexture(this.loader.imageData));  
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_rotate.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }
}