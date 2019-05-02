import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";


export class BasicCache extends BaseExample
{
    protected loader:ResourceLoader;  
    
    constructor(app:Application)
    {
        super(app);
        app.stop();
    }
}