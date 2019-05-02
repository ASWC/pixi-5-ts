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

export class MeshShader extends BaseExample
{
    protected loader:ResourceLoader;  
    protected txt1:Texture;
    protected triangle:Mesh;
    protected triangle2:Mesh;
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
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
            100, 100]) // x, y
        geometry.addAttribute('aUvs', // the attribute name
        [0, 0, // u, v
            1, 0, // u, v
            1, 1]); // u, v

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
                gl_FragColor = texture2D(uSampler2, vUvs);
            }        
            `;
        let program:Program = new Program(vx, fx);
        const shader = new Shader(program, {uSampler2: this.txt1});

        let vx2:string = `
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
        let fx2:string = `precision mediump float;
            varying vec2 vUvs;    
            uniform sampler2D uSampler2;    
            void main() {    
                gl_FragColor = texture2D(uSampler2, vUvs);
                gl_FragColor.r += (abs(sin(gl_FragCoord.x * 0.06)) * 0.5) * 2.;
                gl_FragColor.g += (abs(cos(gl_FragCoord.y * 0.06)) * 0.5) * 2.;
            }    
            `;
        let program2:Program = new Program(vx2, fx2);
        const shader2 = new Shader(program2, {uSampler2: this.txt1});
        this.triangle = new Mesh(geometry, shader);
        this.triangle2 = new Mesh(geometry, shader2);
        this.triangle.position.set(400, 300);
        this.triangle.scale.set(2);
        this.triangle2.position.set(500, 400);
        this.triangle2.scale.set(3);
        this.app.stage.addChild(this.triangle2);
        this.app.stage.addChild(this.triangle);
        this.app.ticker.add(this.runExample);
    }

    protected runExample = (delta:number)=>
    {
        this.triangle.rotation += 0.01;
        this.triangle2.rotation -= 0.005;
    }
}