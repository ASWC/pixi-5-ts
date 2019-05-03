import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { Mesh } from "../raw-pixi-ts/Mesh";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { Texture } from "../raw-pixi-ts/Texture";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Geometry } from "../raw-pixi-ts/Geometry";
import { Program } from "../raw-pixi-ts/Program";
import { Shader } from "../raw-pixi-ts/Shader";


export class MeshUniforms extends BaseExample
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
        const vertexSrc = `
            precision mediump float;    
            attribute vec2 aVertexPosition;
            attribute vec2 aUvs;    
            uniform mat3 translationMatrix;
            uniform mat3 projectionMatrix;    
            varying vec2 vUvs;    
            void main() {    
                vUvs = aUvs;
                gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);    
            }`;
    
        const fragmentSrc = `    
            precision mediump float;    
            varying vec2 vUvs;    
            uniform sampler2D uSampler2;
            uniform float time;    
            void main() {    
                gl_FragColor = texture2D(uSampler2, vUvs + sin( (time + (vUvs.x) * 14.) ) * 0.1 );
            }`;
        const uniforms = {
            uSampler2: this.planeTxt,
            time: 0,
        };
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
        this.triangle.shader.uniforms.time += 0.1;
    }

    public destructor():void
    {
        super.destructor();        
        this.app.ticker.remove(this.runExample, null)
        this.planeTxt.destroy(null);
        this.planeTxt = null
        this.triangle.destroy(null);
        this.triangle = null
    }
}