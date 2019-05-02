import { BaseExample } from './BaseExample';
import { Application } from '../raw-pixi-ts/Application';
import { ResourceLoader } from '../raw-pixi-ts/ResourceLoader';
import { URLRequest } from '../raw-pixi-ts/URLRequest';
import { Event } from '../raw-pixi-ts/Event';
import { Texture } from '../raw-pixi-ts/Texture';
import { BaseTexture } from '../raw-pixi-ts/BaseTexture';
import { Sprite } from '../raw-pixi-ts/Sprite';
import { MouseEvent } from '../raw-pixi-ts/MouseEvent';


export class InteractionInteractivity extends BaseExample
{
    protected loader:ResourceLoader;
    protected textureButton:Texture;
    protected textureButtonOver:Texture;
    protected textureButtonDown:Texture;    

    constructor(app:Application)
    {
        super(app);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_button.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleButtonOverLoaded = (event:Event)=>
    {
        this.textureButtonOver = new Texture(new BaseTexture(this.loader.imageData));  
        const buttons = [];
        const buttonPositions = [
            175, 75,
            655, 75,
            410, 325,
            150, 465,
            685, 445,
        ];
        for (let i = 0; i < 5; i++) 
        {
            const button = new ExtendedSprite(this.textureButton);
            button.buttonMode = true;
            button.anchor.set(0.5);
            button.x = buttonPositions[i * 2];
            button.y = buttonPositions[i * 2 + 1];
            button.interactive = true;
            button.buttonMode = true;
            button.addEventListener(MouseEvent.POINTER_DOWN, this.onButtonDown)
            button.addEventListener(MouseEvent.POINTER_UP, this.onButtonUp)
            button.addEventListener(MouseEvent.POINTER_UP_OUTSIDE, this.onButtonUp)
            button.addEventListener(MouseEvent.POINTER_OVER, this.onButtonOver)
            button.addEventListener(MouseEvent.POINTER_OUT, this.onButtonOut);
            // button.on('mousedown', onButtonDown)
            // button.on('mouseup', onButtonUp)
            // button.on('mouseupoutside', onButtonUp)
            // button.on('mouseover', onButtonOver)
            // button.on('mouseout', onButtonOut)
            // Use touch-only events
            // .on('touchstart', onButtonDown)
            // .on('touchend', onButtonUp)
            // .on('touchendoutside', onButtonUp)
            this.app.stage.addChild(button);
            buttons.push(button);
        }
        buttons[0].scale.set(1.2);
        buttons[2].rotation = Math.PI / 10;
        buttons[3].scale.set(0.8);
        buttons[4].scale.set(0.8, 1.2);
        buttons[4].rotation = Math.PI;
    }

    protected onButtonDown = (event:MouseEvent)=> 
    {        
        let button:ExtendedSprite = <ExtendedSprite>event.currentTarget;
        button.isdown = true;
        button.texture = this.textureButtonDown;
        button.alpha = 1;
    }

    protected onButtonUp = (event:MouseEvent)=> 
    {
        let button:ExtendedSprite = <ExtendedSprite>event.currentTarget;
        button.isdown = false;
        if (button.isOver) 
        {
            button.texture = this.textureButtonOver;
        } 
        else 
        {
            button.texture = this.textureButton;
        }
    }

    protected onButtonOver = (event:MouseEvent)=> 
    {
        let button:ExtendedSprite = <ExtendedSprite>event.currentTarget;
        button.isOver = true;
        if (button.isdown) 
        {
            return;
        }
        button.texture = this.textureButtonOver;
    }

    protected onButtonOut = (event:MouseEvent)=> 
    {
        let button:ExtendedSprite = <ExtendedSprite>event.currentTarget;
        button.isOver = false;
        if (button.isdown) 
        {
            return;
        }
        button.texture = this.textureButton;
    }

    protected handleButtonDownLoaded = (event:Event)=>
    {
        this.textureButtonDown = new Texture(new BaseTexture(this.loader.imageData));  
        this.loader = new ResourceLoader(new URLRequest("examples/assets/button_over.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleButtonOverLoaded);
        this.loader.load(); 
    }

    protected handleButtonLoaded = (event:Event)=>
    {
        this.textureButton = new Texture(new BaseTexture(this.loader.imageData));  
        this.loader = new ResourceLoader(new URLRequest("examples/assets/button_down.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleButtonDownLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        let txt = new Texture(new BaseTexture(this.loader.imageData));  
        const background = new Sprite(txt);
        background.width = this.app.screen.width;
        background.height = this.app.screen.height;
        this.app.stage.addChild(background);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/button.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleButtonLoaded);
        this.loader.load(); 
    }
}

class ExtendedSprite extends Sprite
{
    public isdown:boolean;
    public isOver:boolean;    
}


