import { MeshGeometry } from "./MeshGeometry";

export class RopeGeometry extends MeshGeometry
{
    points
    width
    constructor(width= 200, points = null)
    {
        if ( width === void 0 ) { width = 200; }
        super(new Float32Array(points.length * 4), new Float32Array(points.length * 4), new Uint16Array((points.length - 1) * 6));
        


        /**
        * An array of points that determine the rope
        * @member {PIXI.Point[]}
        */
        this.points = points;

        /**
        * The width (i.e., thickness) of the rope.
        * @member {number}
        * @readOnly
        */
        this.width = width;

        this.build();
    }

    /**
    * Refreshes Rope indices and uvs
    * @private
    */
    build  ()
    {
        var points = this.points;

        if (!points) { return; }

        var vertexBuffer = this.getAttribute('aVertexPosition');
        var uvBuffer = this.getAttribute('aTextureCoord');
        var indexBuffer = this.getIndex();

        // if too little points, or texture hasn't got UVs set yet just move on.
        if (points.length < 1)
        {
            return;
        }

        // if the number of points has changed we will need to recreate the arraybuffers
        if (vertexBuffer.data.length / 4 !== points.length)
        {
            vertexBuffer.data = new Float32Array(points.length * 4);
            uvBuffer.data = new Float32Array(points.length * 4);
            indexBuffer.data = new Uint16Array((points.length - 1) * 6);
        }

        var uvs = uvBuffer.data;
        var indices = indexBuffer.data;

        uvs[0] = 0;
        uvs[1] = 0;
        uvs[2] = 0;
        uvs[3] = 1;

        // indices[0] = 0;
        // indices[1] = 1;

        var total = points.length; // - 1;

        for (var i = 0; i < total; i++)
        {
            // time to do some smart drawing!
            var index = i * 4;
            var amount = i / (total - 1);

            uvs[index] = amount;
            uvs[index + 1] = 0;

            uvs[index + 2] = amount;
            uvs[index + 3] = 1;
        }

        var indexCount = 0;

        for (var i$1 = 0; i$1 < total - 1; i$1++)
        {
            var index$1 = i$1 * 2;

            indices[indexCount++] = index$1;
            indices[indexCount++] = index$1 + 1;
            indices[indexCount++] = index$1 + 2;

            indices[indexCount++] = index$1 + 2;
            indices[indexCount++] = index$1 + 1;
            indices[indexCount++] = index$1 + 3;
        }

        // ensure that the changes are uploaded
        uvBuffer.update();
        indexBuffer.update();

        this.updateVertices();
    };

    /**
    * refreshes vertices of Rope mesh
    */
    updateVertices  ()
    {
        var points = this.points;

        if (points.length < 1)
        {
            return;
        }

        var lastPoint = points[0];
        var nextPoint;
        var perpX = 0;
        var perpY = 0;

        // this.count -= 0.2;

        var vertices = this.buffers[0].data;
        var total = points.length;

        for (var i = 0; i < total; i++)
        {
            var point = points[i];
            var index = i * 4;

            if (i < points.length - 1)
            {
                nextPoint = points[i + 1];
            }
            else
            {
                nextPoint = point;
            }

            perpY = -(nextPoint.x - lastPoint.x);
            perpX = nextPoint.y - lastPoint.y;

            var perpLength = Math.sqrt((perpX * perpX) + (perpY * perpY));
            var num = this.width / 2; // (20 + Math.abs(Math.sin((i + this.count) * 0.3) * 50) )* ratio;

            perpX /= perpLength;
            perpY /= perpLength;

            perpX *= num;
            perpY *= num;

            vertices[index] = point.x + perpX;
            vertices[index + 1] = point.y + perpY;
            vertices[index + 2] = point.x - perpX;
            vertices[index + 3] = point.y - perpY;

            lastPoint = point;
        }

        this.buffers[0].update();
    };

    update ()
    {
        this.updateVertices();
    };
}


