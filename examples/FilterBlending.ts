import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { Container } from "../raw-pixi-ts/Container";
import { Rectangle } from "../raw-pixi-ts/Rectangle";
import { Filter } from "../raw-pixi-ts/Filter";
import { Point } from "../raw-pixi-ts/Point";


export class FilterBlending extends BaseExample
{
    protected loader:ResourceLoader;
    protected backgroundtxt:Texture;
    protected filter:Filter;

    constructor(app:Application)
    {
        super(app);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_grass.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleGrassLoaded);
        this.loader.load(); 
    }

    protected handleGrassLoaded = (event:Event)=>
    {
        this.backgroundtxt = new Texture(new BaseTexture(this.loader.imageData)); 
        const background = new Sprite(this.backgroundtxt);
        background.width = this.app.screen.width;
        background.height = this.app.screen.height;
        this.app.stage.addChild(background);
        const shaderFrag:string = `
            precision highp float;
            varying vec2 vTextureCoord;
            uniform vec2 mouse;
            uniform vec4 inputSize;
            uniform vec4 outputFrame;
            uniform float time;
            void main() {
            vec2 screenPos = vTextureCoord * inputSize.xy + outputFrame.xy;
            if (length(mouse - screenPos) < 25.0) {
                gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0) * 0.7; //yellow circle, alpha=0.7
            } else {
                gl_FragColor = vec4( sin(time), (mouse.xy - outputFrame.xy) / outputFrame.zw, 1.0) * 0.5; // blend with underlying image, alpha=0.5
            }
            }
            `;
        const container = new Container();
        container.filterArea = new Rectangle(100, 100, this.app.screen.width - 200, this.app.screen.height - 200);
        this.app.stage.addChild(container);
        this.filter = new Filter(null, shaderFrag, {
            mouse: new Point()
        });
        container.filters = [this.filter];
        this.app.ticker.add(this.runExample)
    }

    protected runExample = (delta:number)=>
    {
        this.filter.uniforms.mouse.copyFrom(this.app.renderer.plugins.interaction.mouse.global);
    }
}