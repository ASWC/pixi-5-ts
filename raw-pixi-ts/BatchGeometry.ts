import { Geometry } from "./Geometry";
import { Buffer } from "./Buffer";
import { WebGLSettings } from './WebGLSettings';


export class BatchGeometry extends Geometry
{
    _buffer
    _indexBuffer
    constructor(_static = false)
    {
        super();


        /**
         * Buffer used for position, color, texture IDs
         *
         * @member {PIXI.Buffer}
         * @protected
         */
        this._buffer = new Buffer(null, _static, false);

        /**
         * Index buffer data
         *
         * @member {PIXI.Buffer}
         * @protected
         */
        this._indexBuffer = new Buffer(null, _static, true);

        this.addAttribute('aVertexPosition', this._buffer, 2, false, WebGLSettings.TYPES.FLOAT)
            .addAttribute('aTextureCoord', this._buffer, 2, false, WebGLSettings.TYPES.FLOAT)
            .addAttribute('aColor', this._buffer, 4, true, WebGLSettings.TYPES.UNSIGNED_BYTE)
            .addAttribute('aTextureId', this._buffer, 1, true, WebGLSettings.TYPES.FLOAT)
            .addIndex(this._indexBuffer);
    }
}

