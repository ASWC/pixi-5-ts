import { MeshGeometry } from "./MeshGeometry";

export class PlaneGeometry extends MeshGeometry
{
    segWidth
    segHeight
    width
    height
    constructor(width = 100, height = 100, segWidth = 10, segHeight = 10)
    {
        super();
        if ( width === void 0 ) { width = 100; }
        if ( height === void 0 ) { height = 100; }
        if ( segWidth === void 0 ) { segWidth = 10; }
        if ( segHeight === void 0 ) { segHeight = 10; }

        this.segWidth = segWidth;
        this.segHeight = segHeight;

        this.width = width;
        this.height = height;

        this.build();
    }

    /**
     * Refreshes plane coordinates
     * @private
     */
    build ()
    {
        var total = this.segWidth * this.segHeight;
        var verts = [];
        var uvs = [];
        var indices = [];

        var segmentsX = this.segWidth - 1;
        var segmentsY = this.segHeight - 1;

        var sizeX = (this.width) / segmentsX;
        var sizeY = (this.height) / segmentsY;

        for (var i = 0; i < total; i++)
        {
            var x = (i % this.segWidth);
            var y = ((i / this.segWidth) | 0);

            verts.push(x * sizeX, y * sizeY);
            uvs.push(x / segmentsX, y / segmentsY);
        }

        var totalSub = segmentsX * segmentsY;

        for (var i$1 = 0; i$1 < totalSub; i$1++)
        {
            var xpos = i$1 % segmentsX;
            var ypos = (i$1 / segmentsX) | 0;

            var value = (ypos * this.segWidth) + xpos;
            var value2 = (ypos * this.segWidth) + xpos + 1;
            var value3 = ((ypos + 1) * this.segWidth) + xpos;
            var value4 = ((ypos + 1) * this.segWidth) + xpos + 1;

            indices.push(value, value2, value3,
                value2, value4, value3);
        }

        this.buffers[0].data = new Float32Array(verts);
        this.buffers[1].data = new Float32Array(uvs);
        this.indexBuffer.data = new Uint16Array(indices);

        // ensure that the changes are uploaded
        this.buffers[0].update();
        this.buffers[1].update();
        this.indexBuffer.update();
    };
}

