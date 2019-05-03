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


export class MeshTextured extends BaseExample
{
    protected triangle:Mesh;
    protected loader:ResourceLoader;  
    protected planeTxt:Texture;    
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        this.loader = new ResourceLoader(new URLRequest("examples/assets/bg_scene_rotate.jpg"))
        this.loader.addEventListener(Event.COMPLETE, this.handlePlaneLoaded);
        this.loader.load(); 
    }

    protected handlePlaneLoaded = (event:Event)=>
    {
        this.planeTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        const geometry = new Geometry()
        geometry.addAttribute('aVertexPosition', // the attribute name
                [-100, -100, // x, y
                    100, -100, // x, y
                    100, 100], // x, y
                2) // the size of the attribute
        geometry.addAttribute('aColor', // the attribute name
                [1, 0, 0, // r, g, b
                    0, 1, 0, // r, g, b
                    0, 0, 1], // r, g, b
                3) // the size of the attribute
        geometry.addAttribute('aUvs', // the attribute name
                [0, 0, // u, v
                    1, 0, // u, v
                    1, 1], // u, v
                2); // the size of the attribute
        const vertexSrc = `
            precision mediump float;
            attribute vec2 aVertexPosition;
            attribute vec3 aColor;
            attribute vec2 aUvs;
            uniform mat3 translationMatrix;
            uniform mat3 projectionMatrix;
            varying vec2 vUvs;
            varying vec3 vColor;
            void main() {
                vUvs = aUvs;
                vColor = aColor;
                gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            }`;
        const fragmentSrc = `
            precision mediump float;
            varying vec3 vColor;
            varying vec2 vUvs;
            uniform sampler2D uSampler2;
            void main() {
                gl_FragColor = texture2D(uSampler2, vUvs) * vec4(vColor, 1.0);
            }`;
        const uniforms = { uSampler2: this.planeTxt };
        let program:Program = new Program(vertexSrc, fragmentSrc);
        const shader = new Shader(program, uniforms);
        this.triangle = new Mesh(geometry, shader);
        this.triangle.position.set(400, 300);
        this.triangle.scale.set(2);
        this.stage.addChild(this.triangle);
        this.app.ticker.add(this.runExample);
        this.exampleReady();
    }

    protected runExample = (delta:number)=>
    {
        this.triangle.rotation += 0.01;
    }

    public destructor():void
    {
        super.destructor();        
        this.app.ticker.remove(this.runExample, null)
        this.triangle.destroy(null);
        this.triangle = null
        this.planeTxt.destroy(null);
        this.planeTxt = null
    }
}