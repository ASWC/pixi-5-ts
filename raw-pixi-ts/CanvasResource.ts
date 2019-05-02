import { BaseImageResource } from "./BaseImageResource";


export class CanvasResource extends BaseImageResource
{
    constructor(source)
    {
        super(source);
    }

    static test  (source)
    {
        return (source instanceof HTMLCanvasElement);
    };
}

