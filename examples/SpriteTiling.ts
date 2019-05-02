import { BaseExample } from './BaseExample';
import { ResourceLoader } from '../raw-pixi-ts/ResourceLoader';
import { Application } from '../raw-pixi-ts/Application';
import { URLRequest } from '../raw-pixi-ts/URLRequest';
import { Event } from '../raw-pixi-ts/Event';
import { Texture } from '../raw-pixi-ts/Texture';
import { BaseTexture } from '../raw-pixi-ts/BaseTexture';
import { TilingSprite } from '../raw-pixi-ts/TilingSprite';

export class SpriteTiling extends BaseExample
{
    protected loader:ResourceLoader; 
    protected txt1:Texture;
    protected tilingSprite:TilingSprite;
    protected count:number;

    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/p2.jpeg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.txt1 = new Texture(new BaseTexture(this.loader.imageData)); 
        this.tilingSprite = new TilingSprite(
            this.txt1,
            this.app.screen.width,
            this.app.screen.height,
        );
        this.app.stage.addChild(this.tilingSprite);        
        this.count = 0;
        this.app.ticker.add(this.runExample)
    }

    protected runExample = (delta:number)=>
    {
        this.count += 0.005;
        this.tilingSprite.tileScale.x = 2 + Math.sin(this.count);
        this.tilingSprite.tileScale.y = 2 + Math.cos(this.count);
        this.tilingSprite.tilePosition.x += 1;
        this.tilingSprite.tilePosition.y += 1;
    }
}