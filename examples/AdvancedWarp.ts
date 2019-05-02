import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { Event } from "../raw-pixi-ts/Event";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";


export class AdvancedWarp extends BaseExample
{
    protected loader:ResourceLoader;
    protected starTexture:Texture;
    protected cameraZ:number;
    protected speed:number;
    protected warpSpeed:number;
    protected baseSpeed:number;
    protected starAmount:number;
    protected stars:any[];
    protected fov:number;
    protected starBaseSize:number;
    protected starStretch:number;

    constructor(app:Application)
    {
        super(app);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/star.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleGrassLoaded);
        this.loader.load(); 
    }

    protected handleGrassLoaded = (event:Event)=>
    {
        this.starTexture = new Texture(new BaseTexture(this.loader.imageData)); 
        this.starAmount = 1000;
        this.cameraZ = 0;
        this.fov = 20;
        this.baseSpeed = 0.025;
        this.speed = 0;
        this.warpSpeed = 0;
        this.starStretch = 5;
        this.starBaseSize = 0.05;
        this.stars = [];
        for (let i = 0; i < this.starAmount; i++) 
        {
            const star = {
                sprite: new Sprite(this.starTexture),
                z: 0,
                x: 0,
                y: 0,
            };
            star.sprite.anchor.x = 0.5;
            star.sprite.anchor.y = 0.7;
            this.randomizeStar(star, true);
            this.app.stage.addChild(star.sprite);
            this.stars.push(star);
        }
        setInterval(() => {
            this.warpSpeed = this.warpSpeed > 0 ? 0 : 1;
        }, 5000);
        this.app.ticker.add(this.runExample)
    }

    protected runExample = (delta:number)=>
    {
        this.speed += (this.warpSpeed - this.speed) / 20;
        this.cameraZ += delta * 10 * (this.speed + this.baseSpeed);
        for (let i = 0; i < this.starAmount; i++) 
        {
            const star = this.stars[i];
            if (star.z < this.cameraZ) this.randomizeStar(star);
            const z = star.z - this.cameraZ;
            star.sprite.x = star.x * (this.fov / z) * this.app.renderer.screen.width + this.app.renderer.screen.width / 2;
            star.sprite.y = star.y * (this.fov / z) * this.app.renderer.screen.width + this.app.renderer.screen.height / 2;
            const dxCenter = star.sprite.x - this.app.renderer.screen.width / 2;
            const dyCenter = star.sprite.y - this.app.renderer.screen.height / 2;
            const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter + dyCenter);
            const distanceScale = Math.max(0, (2000 - z) / 2000);
            star.sprite.scale.x = distanceScale * this.starBaseSize;
            star.sprite.scale.y = distanceScale * this.starBaseSize + distanceScale * this.speed * this.starStretch * distanceCenter / this.app.renderer.screen.width;
            star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
        }
    }

    protected randomizeStar(star, initial = true) 
    {
        star.z = initial ? Math.random() * 2000 : this.cameraZ + Math.random() * 1000 + 2000;
        const deg = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 1;
        star.x = Math.cos(deg) * distance;
        star.y = Math.sin(deg) * distance;
    }
}