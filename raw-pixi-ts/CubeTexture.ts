import { BaseTexture } from "./BaseTexture";
import { CubeResource } from "./CubeResource";


export class CubeTexture extends BaseTexture
{
    constructor(resource)
    {
        super();
    }

    static from  (resources, options)
    {
        return new CubeTexture(new CubeResource(resources, options));
    };
}


