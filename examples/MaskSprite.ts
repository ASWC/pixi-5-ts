import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { Point } from "../raw-pixi-ts/Point";


export class MaskSprite extends BaseExample
{
    protected loader:ResourceLoader;  
    protected planeTxt:Texture;
    protected cellTxt:Texture;
    protected flowerTxt:Texture;
    protected target:Point;
    protected mask:Sprite;

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_plane.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handlePlaneLoaded);
        this.loader.load(); 
    }

    protected handleFlowerLoaded = (event:Event)=>
    {
        this.flowerTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.app.stage.interactive = true;
        const bg = new Sprite(this.planeTxt);
        this.app.stage.addChild(bg);
        const cells = new Sprite(this.cellTxt);
        cells.scale.set(1.5);
        this.mask = new Sprite(this.flowerTxt);
        this.mask.anchor.set(0.5);
        this.mask.x = 310;
        this.mask.y = 190;
        cells.mask = this.mask;
        this.app.stage.addChild(this.mask);
        this.app.stage.addChild(cells);
        this.target = new Point();
        this.reset();
        this.app.ticker.add(this.runExample);
    }

    protected runExample = (delta:number)=>
    {
        this.mask.x += (this.target.x - this.mask.x) * 0.1;
        this.mask.y += (this.target.y - this.mask.y) * 0.1;
        if (Math.abs(this.mask.x - this.target.x) < 1) 
        {
            this.reset();
        }
    }

    protected reset() 
    {
        this.target.x = Math.floor(Math.random() * 550);
        this.target.y = Math.floor(Math.random() * 300);
    }
    
    protected handleCellLoaded = (event:Event)=>
    {
        this.cellTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/flowerTop.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleFlowerLoaded);
        this.loader.load();  
    }

    protected handlePlaneLoaded = (event:Event)=>
    {
        this.planeTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/cells.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleCellLoaded);
        this.loader.load();  
    }
}