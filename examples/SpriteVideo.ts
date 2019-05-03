import { BaseExample } from './BaseExample';
import { Application } from '../raw-pixi-ts/Application';
import { Graphics } from '../raw-pixi-ts/Graphics';
import { MouseEvent } from '../raw-pixi-ts/MouseEvent';
import { Texture } from '../raw-pixi-ts/Texture';
import { Sprite } from '../raw-pixi-ts/Sprite';
import { BaseTexture } from '../raw-pixi-ts/BaseTexture';


export class SpriteVideo extends BaseExample
{
    protected button:Graphics;
    protected video:HTMLVideoElement;

    public destructor():void
    {
        super.destructor();        
        this.video = null
    }

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.button = new Graphics()
        .beginFill(0x0, 0.5)
        .drawRoundedRect(0, 0, 100, 100, 10)
        .endFill()
        .beginFill(0xffffff)
        .moveTo(36, 30)
        .lineTo(36, 70)
        .lineTo(70, 50);
        this.button.x = (this.sizew - this.button.width) / 2;
        this.button.y = (this.sizeh - this.button.height) / 2;
        this.button.interactive = true;
        this.button.buttonMode = true;
        this.stage.addChild(this.button);
        this.video = document.createElement("video");
        this.video['type'] = "video/mp4";
        this.video.src = "examples/assets/video.mp4";
        this.video.addEventListener('canplay', ()=>{
            this.button.addEventListener(MouseEvent.POINTER_TAP, this.onPlayVideo);
            this.exampleReady();
        });       
    }

    protected onPlayVideo = (event:MouseEvent)=>
    {
        this.button.destroy(null);
        this.video.play();
        const texture = new Texture(new BaseTexture(this.video))
        const videoSprite = new Sprite(texture);
        videoSprite.width = this.sizew;
        videoSprite.height = this.sizeh;    
        this.stage.addChild(videoSprite);
    }
}