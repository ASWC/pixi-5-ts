import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { Texture } from "../raw-pixi-ts/Texture";
import { Sprite } from "../raw-pixi-ts/Sprite";


export class TextureGradientBasic extends BaseExample
{
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);        
        const gradTexture = this.createGradTexture();        
        const sprite = new Sprite(gradTexture);
        sprite.position.set(100, 100);
        sprite.rotation = Math.PI / 8;
        sprite.width = 500;
        sprite.height = 50;
        this.stage.addChild(sprite);
        setTimeout(() => {
            this.exampleReady();
        }, 1000);
    }

    protected createGradTexture() 
    {
        const quality = 256;
        const canvas = document.createElement('canvas');
        canvas.width = quality;
        canvas.height = 1;    
        const ctx = canvas.getContext('2d');
        const grd = ctx.createLinearGradient(0, 0, quality, 0);
        grd.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        grd.addColorStop(0.3, 'cyan');
        grd.addColorStop(0.7, 'red');
        grd.addColorStop(1, 'green');    
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, quality, 1);    
        return Texture.from(canvas);
    }
}