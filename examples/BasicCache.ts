import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";


export class BasicCache extends BaseExample
{
    protected loader:ResourceLoader;  
    
    constructor(app:Application, width:number, height:number)
    {
        super(app, width, height);
        app.stop();
    }
}