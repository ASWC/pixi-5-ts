import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { Resource } from "../raw-pixi-ts/Resource";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Texture } from "../raw-pixi-ts/Texture";
import { Sprite } from "../raw-pixi-ts/Sprite";


export class TextureGradientResource extends BaseExample
{
    constructor(app:Application)
    {
        super(app);        
        const gradBaseTexture = new BaseTexture(new GradientResource());
        gradBaseTexture.setSize(500, 50);        
        const gradTexture = new Texture(gradBaseTexture);        
        const sprite = new Sprite(gradTexture);
        sprite.position.set(100, 100);
        sprite.rotation = Math.PI / 8;
        app.stage.addChild(sprite);
    }
}

class GradientResource extends Resource 
{
    source
    public canUpload:boolean = true;
    
    constructor() 
    {
        super(256, 100);
        
    }
    
    upload(renderer, baseTexture, glTexture) 
    {
        const { width } = this; // default size or from baseTexture?
        const { height } = this; // your choice.
        const canvas = document.createElement('canvas');
        this.source = canvas;
        this.source.width = width;
        this.source.height = height;
        const ctx = this.source.getContext('2d');
        const grd = ctx.createLinearGradient(0, 0, width, 0);
        grd.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        grd.addColorStop(0.3, 'cyan');
        grd.addColorStop(0.7, 'red');
        grd.addColorStop(1, 'green');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        glTexture.width = width;
        glTexture.height = height;
        const { gl } = renderer;
        
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.premultiplyAlpha);
        gl.texImage2D(baseTexture.target, 0, baseTexture.format, baseTexture.format, baseTexture.type, this.source);
        return true;
    }
}