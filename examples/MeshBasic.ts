import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Point } from "../raw-pixi-ts/Point";
import { SimpleRope } from "../raw-pixi-ts/SimpleRope";
import { Container } from "../raw-pixi-ts/Container";


export class MeshBasic extends BaseExample
{
    protected loader:ResourceLoader;  
    protected planeTxt:Texture;
    protected count:number;
    protected ropeLength:number;
    protected points:any[];
    
    constructor(app:Application)
    {
        super(app);
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
    }

    protected handlePlaneLoaded = (event:Event)=>
    {
        this.planeTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.count = 0;
        this.ropeLength = 918 / 20;
        this.points = [];
        for (let i = 0; i < 20; i++) 
        {
            this.points.push(new Point(i * this.ropeLength, 0));
        }
        const strip = new SimpleRope(this.planeTxt, this.points);
        strip.x = -459;
        const snakeContainer = new Container();
        snakeContainer.x = 400;
        snakeContainer.y = 300;
        snakeContainer.scale.set(800 / 1100);
        this.app.stage.addChild(snakeContainer);
        snakeContainer.addChild(strip);
        this.app.ticker.add(this.runExample);
    }
}