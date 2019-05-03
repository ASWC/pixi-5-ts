import { BaseExample } from './BaseExample';
import { Application } from '../raw-pixi-ts/Application';
import { Container } from '../raw-pixi-ts/Container';
import { ResourceLoader } from '../raw-pixi-ts/ResourceLoader';
import { Texture } from '../raw-pixi-ts/Texture';
import { URLRequest } from '../raw-pixi-ts/URLRequest';
import { Event } from '../raw-pixi-ts/Event';
import { BaseTexture } from '../raw-pixi-ts/BaseTexture';
import { Sprite } from '../raw-pixi-ts/Sprite';
import { WebGLSettings } from '../raw-pixi-ts/WebGLSettings';
import { DisplacementFilter } from '../raw-pixi-ts/DisplacementFilter';


export class FilterFlag extends BaseExample
{
    protected loader:ResourceLoader;  
    protected flagTxt:Texture;
    protected repeatTxt:Texture;
    protected displacementSprite:Sprite;

    public destructor():void
    {
        super.destructor();    
        this.flagTxt.destroy(null)
        this.flagTxt = null
        this.repeatTxt.destroy(null)
        this.repeatTxt = null
        this.displacementSprite.destroy(null)
        this.displacementSprite = null 
        this.app.ticker.remove(this.runExample, null)
    }

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.stage.interactive = true;
        this.loader = new ResourceLoader(new URLRequest("examples/assets/pixi-filters/flag.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleDisplacementLoaded = (event:Event)=>
    {
        this.repeatTxt = new Texture(new BaseTexture(this.loader.imageData));  
        const container = new Container();
        this.stage.addChild(container);
        const flag = new Sprite(this.flagTxt);
        container.addChild(flag);
        flag.x = 100;
        flag.y = 100;
        this.displacementSprite = new Sprite(this.repeatTxt);
        this.displacementSprite.texture.baseTexture.wrapMode = WebGLSettings.WRAP_MODES.REPEAT;
        const displacementFilter = new DisplacementFilter(this.displacementSprite);
        displacementFilter.padding = 10;
        this.displacementSprite.position = flag.position;
        this.stage.addChild(this.displacementSprite);
        flag.filters = [displacementFilter];
        displacementFilter.scale.x = 30;
        displacementFilter.scale.y = 60;
        this.app.ticker.add(this.runExample)
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        this.displacementSprite.x++;
        if (this.displacementSprite.x > this.displacementSprite.width) { this.displacementSprite.x = 0; }
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.flagTxt = new Texture(new BaseTexture(this.loader.imageData));         
        this.loader = new ResourceLoader(new URLRequest('examples/assets/pixi-filters/displacement_map_repeat.jpg'))
        this.loader.addEventListener(Event.COMPLETE, this.handleDisplacementLoaded);
        this.loader.load();    
    }
}