import { Mesh } from "./Mesh";
import { RopeGeometry } from "./RopeGeometry";
import { MeshMaterial } from "./MeshMaterial";


export class SimpleRope extends Mesh
{
    autoUpdate
    constructor(texture, points)
    {
        var ropeGeometry = new RopeGeometry(texture.height, points);
        var meshMaterial = new MeshMaterial(texture);
        super(ropeGeometry, meshMaterial);
        this.autoUpdate = true;
    }

    _render  (renderer)
    {
        if (this.autoUpdate
            || this.geometry.width !== this.shader.texture.height)
        {
            this.geometry.width = this.shader.texture.height;
            this.geometry.update();
        }

        super._render(renderer);
    };
}

