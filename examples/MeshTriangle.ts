import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { Geometry } from "../raw-pixi-ts/Geometry";
import { Shader } from "../raw-pixi-ts/Shader";
import { Program } from "../raw-pixi-ts/Program";
import { Mesh } from "../raw-pixi-ts/Mesh";


export class MeshTriangle extends BaseExample
{
    protected triangle:Mesh;
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        const geometry = new Geometry()
        geometry.addAttribute('aVertexPosition', [-100, -50, 100, -50, 0, 100]);
        let vx:string = `
            precision mediump float;
            attribute vec2 aVertexPosition;
            uniform mat3 translationMatrix;
            uniform mat3 projectionMatrix;
            void main() {
                gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            }`
        let fx:string = `precision mediump float;
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
        `;
        let program:Program = new Program(vx, fx)
        const shader = new Shader(program, null)
        this.triangle = new Mesh(geometry, shader);
        this.triangle.position.set(400, 300);
        app.stage.addChild(this.triangle);
        this.app.ticker.add(this.runExample);
    }

    protected runExample = (delta:number)=>
    {
        this.triangle.rotation += 0.01;
    }
}