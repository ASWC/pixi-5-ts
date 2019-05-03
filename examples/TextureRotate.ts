import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { GroupD8 } from "../raw-pixi-ts/GroupD8";
import { Rectangle } from "../raw-pixi-ts/Rectangle";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { Text } from "../raw-pixi-ts/Text";


export class TextureRotate extends BaseExample
{
    protected loader:ResourceLoader; 
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/flowerTop.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleResourceLoaded);
        this.loader.load();
    }

    protected handleResourceLoaded = (event:Event)=>
    {
        let txt:Texture = new Texture(new BaseTexture(this.loader.imageData)); 
        const textures = [txt];
        const D8 = GroupD8;
        for (let rotate = 1; rotate < 16; rotate++) 
        {
            const h = D8.isVertical(rotate) ? txt.frame.width : txt.frame.height;
            const w = D8.isVertical(rotate) ? txt.frame.height : txt.frame.width;    
            const { frame } = txt;
            const crop = Rectangle.getRectangle(txt.frame.x, txt.frame.y, w, h);
            const trim = crop;
            let rotatedTexture;
            if (rotate % 2 === 0) 
            {
                rotatedTexture = new Texture(txt.baseTexture, frame, crop, trim, rotate);
            } 
            else 
            {
                rotatedTexture = new Texture(txt.baseTexture, frame, crop, trim, rotate - 1);
                rotatedTexture.rotate++;
            }
            textures.push(rotatedTexture);
        }    
        const offsetX = this.sizew / 16 | 0;
        const offsetY = this.sizeh / 8 | 0;
        const gridW = this.sizew / 4 | 0;
        const gridH = this.sizeh / 5 | 0;
        for (let i = 0; i < 16; i++) 
        {
            const dude = new Sprite(textures[i < 8 ? i * 2 : (i - 8) * 2 + 1]);
            dude.scale.x = 0.5;
            dude.scale.y = 0.5;
            dude.x = offsetX + gridW * (i % 4);
            dude.y = offsetY + gridH * (i / 4 | 0);
            this.stage.addChild(dude);
            const text = new Text(`rotate = ${dude.texture.rotate}`, {
                fontFamily: 'Courier New', fontSize: '12px', fill: 'white', align: 'left',
            });
            text.x = dude.x;
            text.y = dude.y - 20;
            this.stage.addChild(text);
        }
        this.exampleReady();
    }
}