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

    constructor(app:Application)
    {
        super(app);
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
        this.app.stage.addChild(background);
        background.width = this.app.screen.width;
        background.height = this.app.screen.height;
        const imageToReveal = new Sprite(this.rotatetxt);
        this.app.stage.addChild(imageToReveal);
        imageToReveal.width = this.app.screen.width;
        imageToReveal.height = this.app.screen.height;
        this.renderTexture = RenderTexture.create(this.app.screen.width, this.app.screen.height);
        const renderTextureSprite = new Sprite(this.renderTexture);
        this.app.stage.addChild(renderTextureSprite);
        imageToReveal.mask = renderTextureSprite;
        this.app.stage.interactive = true;
        this.dragging = false;
        this.app.stage.addEventListener(MouseEvent.POINTER_DOWN, this.pointerDown);
        this.app.stage.addEventListener(MouseEvent.POINTER_UP, this.pointerUp);
        this.app.stage.addEventListener(MouseEvent.POINTER_MOVE, this.pointerMove);
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

    protected handleGrassLoaded = (event:Event)=>
    {
        this.grasstxt = new Texture(new BaseTexture(this.loader.imageData));  
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_rotate.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }
}