import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { Container } from "../raw-pixi-ts/Container";
import { Rectangle } from "../raw-pixi-ts/Rectangle";
import { MouseEvent } from "../raw-pixi-ts/MouseEvent";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Point } from "../raw-pixi-ts/Point";
import { DisplacementFilter } from "../raw-pixi-ts/DisplacementFilter";


export class FilterCrawlies extends BaseExample
{
    protected loader:ResourceLoader;  
    protected maggotTxt:Texture;
    protected displacementTxt:Texture;
    protected ringTxt:Texture;
    protected grassTxt:Texture;    
    protected count:number;
    protected maggots:any[];
    protected bounds:Rectangle;
    protected ring:Sprite;
    protected displacementSprite:Sprite;
    protected container:Container;
    
    constructor(app:Application)
    {
        super(app);
        this.count = 0;
        this.maggots = [];
        app.stage.interactive = true;
        
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_rotate.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleGrassLoaded = (event:Event)=>
    {
        this.grassTxt = new Texture(new BaseTexture(this.loader.imageData));
        this.container = new Container();
        this.app.stage.addChild(this.container);
        const padding = 100;
        this.bounds = new Rectangle(
            -padding,
            -padding,
            this.app.screen.width + padding * 2,
            this.app.screen.height + padding * 2,
        ); 
        for (let i = 0; i < 20; i++) 
        {
            const maggot = new ExtendedSprite(this.maggotTxt);
            maggot.anchor.set(0.5);
            this.container.addChild(maggot);
            maggot.direction = Math.random() * Math.PI * 2;
            maggot.speed = 1;
            maggot.turnSpeed = Math.random() - 0.8;
            maggot.x = Math.random() * this.bounds.width;
            maggot.y = Math.random() * this.bounds.height;
            maggot.scale.set(1 + Math.random() * 0.3);
            maggot.original = new Point();
            maggot.original.copyFrom(maggot.scale);
            this.maggots.push(maggot);
        }        
        this.displacementSprite = new Sprite(this.displacementTxt);
        const displacementFilter = new DisplacementFilter(this.displacementSprite);
        this.app.stage.addChild(this.displacementSprite);
        this.container.filters = [displacementFilter];
        displacementFilter.scale.x = 110;
        displacementFilter.scale.y = 110;
        this.displacementSprite.anchor.set(0.5);
        this.ring = new Sprite(this.ringTxt);
        this.ring.anchor.set(0.5);
        this.ring.visible = false;
        this.app.stage.addChild(this.ring);
        const bg = new Sprite(this.grassTxt);
        bg.width = this.app.screen.width;
        bg.height = this.app.screen.height;
        bg.alpha = 0.4;
        this.container.addChild(bg);        
        this.app.stage.addEventListener(MouseEvent.MOUSE_MOVE, this.onPointerMove)
        this.app.stage.addEventListener(MouseEvent.TOUCH_MOVE, this.onPointerMove)
        this.app.ticker.add(this.runExample)
    }

    protected handleMaggotLoaded = (event:Event)=>
    {
        this.maggotTxt = new Texture(new BaseTexture(this.loader.imageData));         
        this.loader = new ResourceLoader(new URLRequest('examples/assets/bg_grass.jpg'))
        this.loader.addEventListener(Event.COMPLETE, this.handleGrassLoaded);
        this.loader.load();   
    }

    protected handleRingLoaded = (event:Event)=>
    {
        this.ringTxt = new Texture(new BaseTexture(this.loader.imageData));    
        this.loader = new ResourceLoader(new URLRequest('examples/assets/maggot.png'))
        this.loader.addEventListener(Event.COMPLETE, this.handleMaggotLoaded);
        this.loader.load();    
    }

    protected handleDisplacementLoaded = (event:Event)=>
    {
        this.displacementTxt = new Texture(new BaseTexture(this.loader.imageData));         
        this.loader = new ResourceLoader(new URLRequest('examples/assets/pixi-filters/ring.png'))
        this.loader.addEventListener(Event.COMPLETE, this.handleRingLoaded);
        this.loader.load();    
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.maggotTxt = new Texture(new BaseTexture(this.loader.imageData));         
        this.loader = new ResourceLoader(new URLRequest('examples/assets/pixi-filters/displace.png'))
        this.loader.addEventListener(Event.COMPLETE, this.handleDisplacementLoaded);
        this.loader.load();    
    }

    protected onPointerMove = (event:MouseEvent)=>
    {
        this.ring.visible = true;
        this.displacementSprite.position.set(event.data.global.x - 25, event.data.global.y);
        this.ring.position.copyFrom(this.displacementSprite.position);
    }

    protected runExample = (delta:number)=>
    {
        this.count += 0.05;
        for (let i = 0; i < this.maggots.length; i++) 
        {
            const maggot = this.maggots[i];
            maggot.direction += maggot.turnSpeed * 0.01;
            maggot.x += Math.sin(maggot.direction) * maggot.speed;
            maggot.y += Math.cos(maggot.direction) * maggot.speed;
            maggot.rotation = -maggot.direction - Math.PI / 2;
            maggot.scale.x = maggot.original.x + Math.sin(this.count) * 0.2;
            if (maggot.x < this.bounds.x) 
            {
                maggot.x += this.bounds.width;
            } 
            else if (maggot.x > this.bounds.x + this.bounds.width) 
            {
                maggot.x -= this.bounds.width;
            }
            if (maggot.y < this.bounds.y) 
            {
                maggot.y += this.bounds.height;
            } 
            else if (maggot.y > this.bounds.y + this.bounds.height) 
            {
                maggot.y -= this.bounds.height;
            }
        }
    }
}

class ExtendedSprite extends Sprite
{
    public direction:number;
    public speed:number;
    public turnSpeed:number;
    public original:Point;
}