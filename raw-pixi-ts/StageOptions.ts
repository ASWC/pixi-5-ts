import { ContextSystem } from './ContextSystem';

export class StageOptions
{
    public sharedLoader:boolean = false;
    public forceCanvas:boolean = false;
    public view:HTMLCanvasElement = null;
    public antialias:boolean = false;
    public forceFXAA:boolean = false;
    public autoDensity:boolean = true;
    public autoResize:boolean = true;
    public transparent:boolean = false;
    public backgroundColor:number = 0x000000;
    public clearBeforeRender:boolean = true;
    public autoStart:boolean = true;
    public preserveDrawingBuffer:boolean = false;
    public width:number = 1024;
    public height:number = 768;
    public resolution:number = 1;
    public legacy:boolean = false;
    public roundPixels:boolean = false;
    public sharedTicker:boolean = false;
    public context:ContextSystem = null;
    public resizeTo:Window|HTMLElement = null;  
    public powerPreference:string = "high-performance";  
}