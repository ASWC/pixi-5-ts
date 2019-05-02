import { Texture } from "./Texture";


export class TextureLoader
{
    constructor()
    {

    }

    static use (resource, next)
	{
	    // create a new texture if the data is an Image object
	    // if (resource.data && resource.type === lib_1.TYPE.IMAGE)
	    // {
	    //     resource.texture = Texture.fromLoader(
	    //         resource.data,
	    //         resource.url,
	    //         resource.name
	    //     );
	    // }
	    next();
	};
}