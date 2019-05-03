import { FlashBaseObject } from "../../raw-pixi-ts/FlashBaseObject";


export class ColorTransform extends FlashBaseObject
{
    public alphaMultiplier:number;
    public alphaOffset:number;
    public blueMultiplier:number;
    public blueOffset:number;
    public greenMultiplier:number;
    public greenOffset:number;
    public redMultiplier:number;
    public redOffset:number;

    constructor(redMultiplier:number = 1.0, greenMultiplier:number = 1.0, blueMultiplier:number = 1.0, alphaMultiplier:number = 1.0, redOffset:number = 0, greenOffset:number = 0, blueOffset:number = 0, alphaOffset:number = 0)
    {
        super();
        this.redMultiplier = redMultiplier;
        this.greenMultiplier = greenMultiplier;
        this.blueMultiplier = blueMultiplier;
        this.alphaMultiplier = alphaMultiplier;
        this.redOffset = redOffset;
        this.greenOffset = greenOffset;
        this.blueOffset = blueOffset;
        this.alphaOffset = alphaOffset;
    }

    public get color():number
    {
        return 0;
    }

    public set color(value:number)
    {
        this.redMultiplier = 0;
        this.greenMultiplier = 0;
        this.blueMultiplier = 0;
        // adjust colors
    }

    public concat(second:ColorTransform):void
    {

    }
}