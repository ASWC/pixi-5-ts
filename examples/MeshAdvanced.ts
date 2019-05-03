import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Event } from "../raw-pixi-ts/Event";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Point } from "../raw-pixi-ts/Point";
import { SimpleRope } from "../raw-pixi-ts/SimpleRope";
import { Graphics } from "../raw-pixi-ts/Graphics";


export class MeshAdvanced extends BaseExample
{
    protected loader:ResourceLoader;  
    protected planeTxt:Texture;
    protected g:Graphics;
    protected count:number;
    protected points:any[];
    protected ropeLength:number;    

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/snake.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handlePlaneLoaded);
        this.loader.load(); 
    }

    protected runExample = (delta:number)=>
    {
        this.count += 0.1;
        for (let i = 0; i < this.points.length; i++) 
        {
            this.points[i].y = Math.sin((i * 0.5) + this.count) * 30;
            this.points[i].x = i * this.ropeLength + Math.cos((i * 0.3) + this.count) * 20;
        }
        this.renderPoints();
    }

    protected renderPoints() 
    {
        this.g.clear();    
        this.g.lineStyle(2, 0xffc2c2);
        this.g.moveTo(this.points[0].x, this.points[0].y);    
        for (let i = 1; i < this.points.length; i++) 
        {
            this.g.lineTo(this.points[i].x, this.points[i].y);
        }    
        for (let i = 1; i < this.points.length; i++) 
        {
            this.g.beginFill(0xff0022);
            this.g.drawCircle(this.points[i].x, this.points[i].y, 10);
            this.g.endFill();
        }
    }

    protected handlePlaneLoaded = (event:Event)=>
    {
        this.planeTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.count = 0;
        this.ropeLength = 30;
        this.points = [];
        for (let i = 0; i < 25; i++) 
        {
            this.points.push(new Point(i * this.ropeLength, 0));
        }
        const strip = new SimpleRope(this.planeTxt, this.points);
        strip.x = 20;
        strip.y = 300;
        this.stage.addChild(strip);
        this.g = new Graphics();
        this.g.x = strip.x;
        this.g.y = strip.y;
        this.stage.addChild(this.g);
        this.app.ticker.add(this.runExample);
        this.exampleReady();
    }

    public destructor():void
    {
        super.destructor();        
        this.app.ticker.remove(this.runExample, null)
        this.planeTxt.destroy(null);
        this.planeTxt = null
        this.g.destroy(null);
        this.g = null
        this.points = null;
    }
}