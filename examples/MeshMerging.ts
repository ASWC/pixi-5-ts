import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Geometry } from "../raw-pixi-ts/Geometry";
import { Program } from "../raw-pixi-ts/Program";
import { Shader } from "../raw-pixi-ts/Shader";
import { Mesh } from "../raw-pixi-ts/Mesh";

export class MeshMerging extends BaseExample
{
    protected loader:ResourceLoader;  
    protected txt1:Texture;
    protected quad:Mesh;
    
    constructor(app:Application)
    {
        super(app);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_scene_rotate.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleTxt1Loaded);
        this.loader.load(); 
    }

    protected handleTxt1Loaded = (event:Event)=>
    {
        this.txt1 = new Texture(new BaseTexture(this.loader.imageData));         
        const geometry = new Geometry()
        geometry.addAttribute('aVertexPosition', // the attribute name
            [-100, -100, // x, y
                100, -100, // x, y
                100, 100,
                -100, 100], // x, y
            2) // the size of the attribute
        geometry.addAttribute('aUvs', // the attribute name
            [0, 0, // u, v
                1, 0, // u, v
                1, 1,
                0, 1], // u, v
            2) // the size of the attribute
        geometry.addIndex([0, 1, 2, 0, 2, 3]);
        const geometry2 = new Geometry()
        geometry2.addAttribute('aVertexPosition', // the attribute name
            [-100 + 100, -100, // x, y
                100 + 100, -100, // x, y
                100 + 100, 100], // x, y
            2) // the size of the attribute
        geometry2.addAttribute('aUvs', // the attribute name
            [0, 0, // u, v
                1, 0, // u, v
                1, 1], // u, v
            2) // the size of the attribute
        geometry2.addIndex([0, 1, 2]);
        const geometry3 = Geometry.merge([geometry, geometry2]);
        let vx:string = `
            precision mediump float;    
            attribute vec2 aVertexPosition;
            attribute vec2 aUvs;    
            uniform mat3 translationMatrix;
            uniform mat3 projectionMatrix;    
            varying vec2 vUvs;    
            void main() {    
                vUvs = aUvs;
                gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);    
            }`
        let fx:string = `precision mediump float;
            varying vec2 vUvs;    
            uniform sampler2D uSampler2;    
            void main() {    
                gl_FragColor = texture2D(uSampler2, vUvs );
            }    
            `;
        let program:Program = new Program(vx, fx);
        const shader = new Shader(program, {uSampler2: this.txt1});
        this.quad = new Mesh(geometry3, shader);
        this.quad.position.set(400, 300);
        this.quad.scale.set(2);
        this.app.stage.addChild(this.quad);
        this.app.ticker.add(this.runExample);
    }

    protected runExample = (delta:number)=>
    {
        this.quad.rotation += 0.01;
    }
}