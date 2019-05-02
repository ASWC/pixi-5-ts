import { Geometry } from './Geometry';
import { Buffer } from './Buffer';
import { WebGLSettings } from './WebGLSettings';


export class MeshGeometry extends Geometry
{
    _updateId
    constructor(vertices = null, uvs = null, index = null)
    {
        super();
        var verticesBuffer = new Buffer(vertices);
        var uvsBuffer = new Buffer(uvs, true);
        var indexBuffer = new Buffer(index, true, true);

        this.addAttribute('aVertexPosition', verticesBuffer, 2, false, WebGLSettings.TYPES.FLOAT)
            .addAttribute('aTextureCoord', uvsBuffer, 2, false, WebGLSettings.TYPES.FLOAT)
            .addIndex(indexBuffer);

        /**
         * Dirty flag to limit update calls on Mesh. For example,
         * limiting updates on a single Mesh instance with a shared Geometry
         * within the render loop.
         * @private
         * @member {number}
         * @default -1
         */
        this._updateId = -1;
    }

    /**
     * If the vertex position is updated.
     * @member {number}
     * @readonly
     * @private
     */
    get vertexDirtyId()
    {
        return this.buffers[0]._updateID;
    };
}


