import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { URLLoader } from "../raw-pixi-ts/URLLoader";
import { Event } from "../raw-pixi-ts/Event";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Spritesheet } from "../raw-pixi-ts/Spritesheet";
import { AnimatedSprite } from "../raw-pixi-ts/AnimatedSprite";
import { Filter } from "../raw-pixi-ts/Filter";


export class FilterShadow extends BaseExample
{
    protected urlloader:URLLoader;
    protected jsondata:any;
    protected loader:ResourceLoader;  
    protected txt:Texture;
    protected anim:AnimatedSprite;
    protected filter:Filter;
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.urlloader = new URLLoader();
        this.urlloader.addEventListener(Event.COMPLETE, this.handleJsonLoaded);
        this.urlloader.load(new URLRequest("examples/assets/spritesheet/fighter.json"));
    }

    protected onAnimationParsed = (textures:Texture[])=>
    {
        this.app.stage.interactive = true;

        
        const frames = [];
        for (let i = 0; i < 30; i++) 
        {
            const val = i < 10 ? `0${i}` : i;    
            frames.push(textures[`rollSequence00${val}.png`]);
        }
        this.anim = new AnimatedSprite(frames);
        this.anim.x = this.app.screen.width / 2;
        this.anim.y = this.app.screen.height / 2;
        this.anim.anchor.set(0.5);
        this.anim.animationSpeed = 0.5;
        this.anim.play();    
        this.app.stage.addChild(this.anim);
        this.filter = new Filter(FilterShadow.myVertex, FilterShadow.myFragment);
        this.filter.uniforms.shadowDirection = [0.1, 0.5];
        this.filter.uniforms.floorY = this.anim.height * 2;
        this.filter.padding = 200;
        this.anim.filters = [this.filter];
        this.app.ticker.add(this.runExample)
    }

    protected runExample = (delta:number)=>
    {        
        this.filter.uniforms.floorY = this.app.renderer.plugins.interaction.mouse.global.y;
    }

    protected handleJsonLoaded = (event:Event)=>
    {
        this.jsondata = JSON.parse(this.urlloader.data);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/spritesheet/fighter.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleRotateLoaded);
        this.loader.load(); 
    }

    protected handleRotateLoaded = (event:Event)=>
    {
        this.txt = new Texture(new BaseTexture(this.loader.imageData));  
        let spritesheet:Spritesheet = new Spritesheet(this.txt, this.jsondata);
        spritesheet.parse(this.onAnimationParsed)
    }

    private static myVertex:string = `
        attribute vec2 aVertexPosition;
        attribute vec2 aTextureCoord;
        uniform mat3 projectionMatrix;
        varying vec2 vTextureCoord;
        void main(void) {
            gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            vTextureCoord = aTextureCoord;
        }
    `;

    private static  myFragment:string = `
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform vec4 inputSize;
        uniform vec4 outputFrame;
        uniform vec2 shadowDirection;
        uniform float floorY;
        void main(void) {
            //1. get the screen coordinate
            vec2 screenCoord = vTextureCoord * inputSize.xy + outputFrame.xy;
            //2. calculate Y shift of our dimension vector
            vec2 shadow;
            //shadow coordinate system is a bit skewed, but it has to be the same for screenCoord.y = floorY
            float paramY = (screenCoord.y - floorY) / shadowDirection.y;
            shadow.y = paramY + floorY;
            shadow.x = screenCoord.x + paramY * shadowDirection.x;
            vec2 bodyFilterCoord = (shadow - outputFrame.xy) * inputSize.zw; // same as / inputSize.xy
            vec4 originalColor = texture2D(uSampler, vTextureCoord);
            vec4 shadowColor = texture2D(uSampler, bodyFilterCoord);
            shadowColor.rgb = vec3(0.0);
            shadowColor.a *= 0.5;
            // normal blend mode coefficients (1, 1-src_alpha)
            // shadow is destination (backdrop), original is source
            gl_FragColor = originalColor + shadowColor * (1.0 - originalColor.a);
        }
    `;


}