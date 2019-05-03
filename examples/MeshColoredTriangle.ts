import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { Geometry } from "../raw-pixi-ts/Geometry";
import { Program } from "../raw-pixi-ts/Program";
import { Shader } from "../raw-pixi-ts/Shader";
import { Mesh } from "../raw-pixi-ts/Mesh";


export class MeshColoredTriangle extends BaseExample
{
    protected triangle:Mesh;
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        const geometry = new Geometry()
        geometry.addAttribute('aVertexPosition', // the attribute name
            [-100, -50, // x, y
                100, -50, // x, y
                0.0, 100.0], // x, y
            2) // the size of the attribute
        geometry.addAttribute('aColor', // the attribute name
            [1, 0, 0, // r, g, b
                0, 1, 0, // r, g, b
                0, 0, 1], // r, g, b
            3); // the size of the attribute

        let vx:string = `
            precision mediump float;
            attribute vec2 aVertexPosition;
            attribute vec3 aColor;    
            uniform mat3 translationMatrix;
            uniform mat3 projectionMatrix;    
            varying vec3 vColor;    
            void main() {    
                vColor = aColor;
                gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);    
            }`

        let fx:string = `precision mediump float;
            varying vec3 vColor;    
            void main() {
                gl_FragColor = vec4(vColor, 1.0);
            }    
            `;
        let program:Program = new Program(vx, fx);
        const shader = new Shader(program, null);
        this.triangle = new Mesh(geometry, shader);
        this.triangle.position.set(400, 300);
        this.triangle.scale.set(2);
        this.stage.addChild(this.triangle);
        this.app.ticker.add(this.runExample);
        setTimeout(() => {
            this.exampleReady();
        }, 1000);
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
    }
}