import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Point } from "../flash/geom/Point";
import { SimpleRope } from "../raw-pixi-ts/SimpleRope";
import { BlendModesSettings } from "../raw-pixi-ts/BlendModesSettings";


export class AdvancedTrail extends BaseExample
{
    protected loader:ResourceLoader;
    protected trailTexture:Texture;
    protected historyX:any[];
    protected historyY:any[];
    protected ropeSize:number;
    protected historySize:number;
    protected points:any[];

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.backColor = 0x000378
        this.loader = new ResourceLoader(new URLRequest("examples/assets/trail.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleGrassLoaded);
        this.loader.load(); 
    }

    protected handleGrassLoaded = (event:Event)=>
    {
        this.trailTexture = new Texture(new BaseTexture(this.loader.imageData)); 
        this.historyX = [];
        this.historyY = [];
        this.historySize = 20;
        this.ropeSize = 100;
        this.points = [];
        for (let i = 0; i < this.historySize; i++) 
        {
            this.historyX.push(0);
            this.historyY.push(0);
        }
        for (let i = 0; i < this.ropeSize; i++) 
        {
            this.points.push(Point.getPoint(0, 0));
        }
        const rope = new SimpleRope(this.trailTexture, this.points);
        rope.blendMode = BlendModesSettings.BLEND_MODES.ADD;
        this.stage.addChild(rope);
        this.app.ticker.add(this.runExample)
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        const mouseposition = this.app.renderer.plugins.interaction.mouse.global;
        this.historyX.pop();
        this.historyX.unshift(mouseposition.x);
        this.historyY.pop();
        this.historyY.unshift(mouseposition.y);
        for (let i = 0; i < this.ropeSize; i++) 
        {
            const p = this.points[i];
            const ix = this.cubicInterpolation(this.historyX, i / this.ropeSize * this.historySize);
            const iy = this.cubicInterpolation(this.historyY, i / this.ropeSize * this.historySize);
            p.x = ix;
            p.y = iy;
        }
    }

    protected clipInput(k, arr) 
    {
        if (k < 0) k = 0;
        if (k > arr.length - 1) k = arr.length - 1;
        return arr[k];
    }
    
    protected getTangent(k, factor, array) 
    {
        return factor * (this.clipInput(k + 1, array) - this.clipInput(k - 1, array)) / 2;
    }
    
    protected cubicInterpolation(array, t, tangentFactor = 1) 
    {    
        const k = Math.floor(t);
        const m = [this.getTangent(k, tangentFactor, array), this.getTangent(k + 1, tangentFactor, array)];
        const p = [this.clipInput(k, array), this.clipInput(k + 1, array)];
        t -= k;
        const t2 = t * t;
        const t3 = t * t2;
        return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
    }

    public destructor():void
    {
        super.destructor();
        if(this.points && this.points.length)
        {
            while(this.points.length)
            {
                let point:Point = this.points.shift();
                point.recycle();
            }
        }
        this.points = null;
        this.historyY = null;
        this.historyX = null
        this.app.ticker.remove(this.runExample, null)
        this.trailTexture.destroy(null);
    }
}