import { Mesh } from "./Mesh";
import { MeshMaterial } from "./MeshMaterial";
import { Texture } from "./Texture";
import { PlaneGeometry } from "./PlaneGeometry";

export class SimplePlane extends Mesh
{
    // PlaneGeometry
    _textureID
    constructor(texture, verticesX, verticesY)
    {
        var planeGeometry = new PlaneGeometry(texture.width, texture.height, verticesX, verticesY);
        var meshMaterial = new MeshMaterial(Texture.WHITE);
        super(planeGeometry, meshMaterial);   
        // lets call the setter to ensure all necessary updates are performed
        this.texture = texture;
    }

    /**
    * Method used for overrides, to do something in case texture frame was changed.
    * Meshes based on plane can override it and change more details based on texture.
    */
    textureUpdated  ()
    {
        this._textureID = this.shader.texture._updateID;

        this.geometry.width = this.shader.texture.width;
        this.geometry.height = this.shader.texture.height;

        this.geometry.build();
    };

    set texture (value)
    {
        // Track texture same way sprite does.
        // For generated meshes like NineSlicePlane it can change the geometry.
        // Unfortunately, this method might not work if you directly change texture in material.

        if (this.shader.texture === value)
        {
            return;
        }

        this.shader.texture = value;
        this._textureID = -1;

        if (value.baseTexture.valid)
        {
            this.textureUpdated();
        }
        else
        {
            value.once('update', this.textureUpdated, this);
        }
    };

    get texture ()
    {
        return this.shader.texture;
    };

    _render  (renderer)
    {
        if (this._textureID !== this.shader.texture._updateID)
        {
            this.textureUpdated();
        }

        super._render(renderer);
    };
}


