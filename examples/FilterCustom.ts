import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { URLLoader } from "../raw-pixi-ts/URLLoader";
import { Filter } from "../raw-pixi-ts/Filter";
import { trace } from "../raw-pixi-ts/Logger";


export class FilterCustom extends BaseExample
{
    protected loader:ResourceLoader;  
    protected grasstxt:Texture;
    protected background:Sprite;
    protected urlloader:URLLoader;
    protected filter:Filter;
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_grass.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleGrassLoaded);
        this.loader.load(); 
    }

    protected handleGrassLoaded = (event:Event)=>
    {
        this.grasstxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.background = new Sprite(this.grasstxt);
        this.background.width = this.app.screen.width;
        this.background.height = this.app.screen.height;
        this.app.stage.addChild(this.background); 
        this.urlloader = new URLLoader();
        this.urlloader.addEventListener(Event.COMPLETE, this.handleFragLoaded);
        this.urlloader.load(new URLRequest("examples/assets/pixi-filters/shader.frag"));
    }

    protected handleFragLoaded = (event:Event)=>
    {
        let fragdata:string = this.urlloader.data;
        trace(fragdata)
        this.filter = new Filter(null, fragdata, {
            customUniform: 0.0
        });
        this.background.filters = [this.filter];
        this.app.ticker.add(this.runExample)
    }

    protected runExample = (delta:number)=>
    {
        this.filter.uniforms.customUniform += 0.04 * delta;
    }
}