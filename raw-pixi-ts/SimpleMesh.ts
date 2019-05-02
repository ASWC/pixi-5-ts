import { Mesh } from "./Mesh";
import { Texture } from "./Texture";
import { MeshGeometry } from "./MeshGeometry";
import { MeshMaterial } from "./MeshMaterial";


export class SimpleMesh extends Mesh
{
    autoUpdate
    constructor(texture = null, vertices = null, uvs = null, indices = null, drawMode = null)
    {
        if ( texture === void 0 ) { texture = Texture.EMPTY; }

        super(geometry, meshMaterial, null, drawMode);
        
        var geometry = new MeshGeometry(vertices, uvs, indices);

        geometry.getAttribute('aVertexPosition').static = false;

        var meshMaterial = new MeshMaterial(texture);


        /**
         * upload vertices buffer each frame
         * @member {boolean}
         */
        this.autoUpdate = true;
    }

    /**
     * Collection of vertices data.
     * @member {Float32Array}
     */
    get vertices ()
    {
        return this.geometry.getAttribute('aVertexPosition').data;
    };
    set vertices (value)
    {
        this.geometry.getAttribute('aVertexPosition').data = value;
    };

    _render (renderer)
    {
        if (this.autoUpdate)
        {
            this.geometry.getAttribute('aVertexPosition').update();
        }

        super._render(renderer);
    };
}

