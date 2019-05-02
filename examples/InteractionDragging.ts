import { BaseExample } from './BaseExample';
import { Application } from '../raw-pixi-ts/Application';
import { ResourceLoader } from '../raw-pixi-ts/ResourceLoader';
import { URLRequest } from '../raw-pixi-ts/URLRequest';
import { Event } from '../raw-pixi-ts/Event';
import { Texture } from '../raw-pixi-ts/Texture';
import { BaseTexture } from '../raw-pixi-ts/BaseTexture';
import { WebGLSettings } from '../raw-pixi-ts/WebGLSettings';
import { Sprite } from '../raw-pixi-ts/Sprite';
import { MouseEvent } from '../raw-pixi-ts/MouseEvent';
import { InteractionData } from '../raw-pixi-ts/InteractionData';


export class InteractionDragging extends BaseExample
{
    protected loader:ResourceLoader;

    constructor(app:Application)
    {
        super(app);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bunny.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        let texture = new Texture(new BaseTexture(this.loader.imageData)); 
        texture.baseTexture.scaleMode = WebGLSettings.SCALE_MODES.NEAREST;
        for (let i = 0; i < 10; i++) 
        {
            this.createBunny(Math.floor(Math.random() * this.app.screen.width), Math.floor(Math.random() * this.app.screen.height), texture);
        }
    }

    protected onDragStart = (event:MouseEvent)=> 
    {
        let button:ExtendedSprite = <ExtendedSprite>event.currentTarget;
        button.data = event.data;
        button.alpha = 0.5;
        button.dragging = true;
    }

    protected onDragEnd = (event:MouseEvent)=>
    {
        let button:ExtendedSprite = <ExtendedSprite>event.currentTarget;
        button.alpha = 1;
        button.dragging = false;
        button.data = null;
    }

    protected onDragMove = (event:MouseEvent)=>
    {
        let button:ExtendedSprite = <ExtendedSprite>event.currentTarget;
        if (button.dragging) 
        {
            const newPosition = button.data.getLocalPosition(button.parent);
            button.x = newPosition.x;
            button.y = newPosition.y;
        }
    }

    protected createBunny(x, y, texture) 
    {
        const bunny = new ExtendedSprite(texture);
        bunny.interactive = true;
        bunny.buttonMode = true;
        bunny.anchor.set(0.5);
        bunny.scale.set(3);
        bunny.addEventListener(MouseEvent.POINTER_DOWN, this.onDragStart)
        bunny.addEventListener(MouseEvent.POINTER_UP, this.onDragEnd)
        bunny.addEventListener(MouseEvent.POINTER_UP_OUTSIDE, this.onDragEnd)
        bunny.addEventListener(MouseEvent.POINTER_MOVE, this.onDragMove);
        // For mouse-only events
        // .on('mousedown', onDragStart)
        // .on('mouseup', onDragEnd)
        // .on('mouseupoutside', onDragEnd)
        // .on('mousemove', onDragMove);
        // For touch-only events
        // .on('touchstart', onDragStart)
        // .on('touchend', onDragEnd)
        // .on('touchendoutside', onDragEnd)
        // .on('touchmove', onDragMove);
        bunny.x = x;
        bunny.y = y;
        this.app.stage.addChild(bunny);
    }
}

class ExtendedSprite extends Sprite
{
    public dragging:boolean;
    public data:InteractionData;    
}