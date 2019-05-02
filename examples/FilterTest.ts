
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { Application } from "../raw-pixi-ts/Application";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { BaseExample } from "./BaseExample";
import { AdvancedBloomFilter } from "../raw-pixi-ts/AdvancedBloomFilter";


export class FilterTest extends BaseExample
{
    protected loader:ResourceLoader;  
    protected depthTxt:Texture;
    protected dudesTxt:Texture;
    protected mobyTxt:Texture;    
    protected count:number;

    protected filter:AdvancedBloomFilter;
    // protected blurFilter2:BlurFilter;
    
    constructor(app:Application)
    {
        super(app);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/pixi-filters/bg_depth_blur.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleDepthLoaded);
        this.loader.load();
    }

    protected handleMobyLoaded = (event:Event)=>
    {
        this.mobyTxt = new Texture(new BaseTexture(this.loader.imageData));  
        const bg = new Sprite(this.depthTxt);
        bg.width = this.app.screen.width;
        bg.height = this.app.screen.height;
        this.app.stage.addChild(bg);
        const littleDudes = new Sprite(this.dudesTxt);
        littleDudes.x = (this.app.screen.width / 2) - 315;
        littleDudes.y = 200;
        this.app.stage.addChild(littleDudes);
        const littleRobot = new Sprite(this.mobyTxt);
        littleRobot.x = (this.app.screen.width / 2) - 200;
        littleRobot.y = 100;
        this.app.stage.addChild(littleRobot);

        // this.blurFilter1 = new BlurFilter();
        // this.blurFilter2 = new BlurFilter();
        this.filter = new AdvancedBloomFilter()     
        
        this.filter.blur = 1;
        
        
        littleDudes.filters = [this.filter];
        // littleRobot.filters = [this.blurFilter2];


        this.count = 0;
        this.app.ticker.add(this.runExample);      
    }

    protected runExample = (delta:number)=>
    {
        this.count += 0.005;
        const blurAmount = Math.cos(this.count);
        const blurAmount2 = Math.sin(this.count);
        this.filter.bloomScale = blurAmount


        // this.blurFilter1.blur = 20 * (blurAmount);
        // this.blurFilter2.blur = 20 * (blurAmount2);
    }

    protected handleDudesLoaded = (event:Event)=>
    {
        this.dudesTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/pixi-filters/depth_blur_moby.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleMobyLoaded);
        this.loader.load();  
    }

    protected handleDepthLoaded = (event:Event)=>
    {
        this.depthTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/pixi-filters/depth_blur_dudes.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleDudesLoaded);
        this.loader.load();  
    }
}