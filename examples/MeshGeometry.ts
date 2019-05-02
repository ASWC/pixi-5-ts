import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Geometry } from "../raw-pixi-ts/Geometry";
import { Program } from "../raw-pixi-ts/Program";
import { Mesh } from "../raw-pixi-ts/Mesh";
import { Shader } from "../raw-pixi-ts/Shader";


export class MeshGeometry extends BaseExample
{
    protected loader:ResourceLoader;  
    protected txt1:Texture;
    protected txt2:Texture;
    protected txt3:Texture;
    protected triangle:Mesh;
    protected triangle2:Mesh;
    protected triangle3:Mesh;
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_scene_rotate.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleTxt1Loaded);
        this.loader.load(); 
    }

    protected handleTxt3Loaded = (event:Event)=>
    {
        this.txt3 = new Texture(new BaseTexture(this.loader.imageData)); 
        const geometry = new Geometry()
        geometry.addAttribute('aVertexPosition', // the attribute name
            [-100, -100, // x, y
                100, -100, // x, y
                100, 100], // x, y
            2) // the size of the attribute    
        geometry.addAttribute('aUvs', // the attribute name
            [0, 0, // u, v
                1, 0, // u, v
                1, 1], // u, v
            2); // the size of the attribute    
        const program = Program.from(`    
            precision mediump float;    
            attribute vec2 aVertexPosition;
            attribute vec2 aUvs;    
            uniform mat3 translationMatrix;
            uniform mat3 projectionMatrix;    
            varying vec2 vUvs;    
            void main() {    
                vUvs = aUvs;
                gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);    
            }`,    
        `precision mediump float;    
            varying vec2 vUvs;    
            uniform sampler2D uSamplerTexture;    
            void main() {    
                gl_FragColor = texture2D(uSamplerTexture, vUvs);
            }    
        `);    
        this.triangle = new Mesh(geometry, new Shader(program, {
            uSamplerTexture: this.txt1,
        }));    
        this.triangle2 = new Mesh(geometry, new Shader(program, {
            uSamplerTexture: this.txt2,
        }));    
        this.triangle3 = new Mesh(geometry, new Shader(program, {
            uSamplerTexture: this.txt3,
        }));    
        this.triangle.position.set(400, 300);
        this.triangle.scale.set(2);    
        this.triangle2.position.set(200, 100);    
        this.triangle3.position.set(500, 400);
        this.triangle3.scale.set(3);    
        this.app.stage.addChild(this.triangle3);
        this.app.stage.addChild(this.triangle2);
        this.app.stage.addChild(this.triangle);
        this.app.ticker.add(this.runExample);
    }

    protected runExample = (delta:number)=>
    {
        this.triangle.rotation += 0.01;
        this.triangle2.rotation -= 0.01;
        this.triangle3.rotation -= 0.005;
    }

    protected handleTxt2Loaded = (event:Event)=>
    {
        this.txt2 = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_displacement.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleTxt3Loaded);
        this.loader.load(); 
    }

    protected handleTxt1Loaded = (event:Event)=>
    {
        this.txt1 = new Texture(new BaseTexture(this.loader.imageData)); 
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_rotate.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handleTxt2Loaded);
        this.loader.load(); 
    }
}