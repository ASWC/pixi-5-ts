import { BatchGeometry } from "./BatchGeometry";
import { Bounds } from "./Bounds";
import { GraphicsData } from './GraphicsData';
import { BaseTexture } from "./BaseTexture";
import { BatchDrawCall } from "./BatchDrawCall";
import { Point } from "./Point";
import { ShapeSettings } from './ShapeSettings';
import { DrawModeSettings } from './DrawModeSettings';
import { ColorSettings } from './ColorSettings';


class BatchPart
{
    style 
    size 
    start 
    attribStart 
    attribSize 
    constructor()
    {
	    this.style = null;
	    this.size = 0;
	    this.start = 0;
	    this.attribStart = 0;
	    this.attribSize = 0;
    }
}


export class GraphicsGeometry extends BatchGeometry
{
    static BATCH_POOL = [];
    static DRAW_CALL_POOL = [];
    	// /**
	//  * Map of fill commands for each shape type.
	//  *
	//  * @member {Object}
	//  * @private
	//  */
    private static fillCommands;
    

    	/**
	 * The maximum number of points to consider an object "batchable",
	 * able to be batched by the renderer's batch system.
	 *
	 * @memberof PIXI.GraphicsGeometry
	 * @static
	 * @member {number} BATCHABLE_SIZE
	 * @default 100
	 */
	static BATCHABLE_SIZE = 100;
    points
    indices
    textureIds
    graphicsData:GraphicsData[];
    batchDirty
    drawCalls
    _bounds
    cacheDirty
    indicesUint16
    uvs
    uvsFloat32
    clearDirty
    shapeIndex
    boundsDirty
    public batchable:boolean;
    boundsPadding
    batches
    dirty
    colors
    constructor()
    {
        super();
        /**
         * An array of points to draw
         *
         * @member {PIXI.Point[]}
         * @protected
         */
        this.points = [];

        /**
         * The collection of colors
         *
         * @member {number[]}
         * @protected
         */
        this.colors = [];

        /**
         * The UVs collection
         *
         * @member {number[]}
         * @protected
         */
        this.uvs = [];

        /**
         * The indices of the vertices
         *
         * @member {number[]}
         * @protected
         */
        this.indices = [];

        /**
         * Reference to the texture IDs.
         *
         * @member {number[]}
         * @protected
         */
        this.textureIds = [];

        /**
         * The collection of drawn shapes.
         *
         * @member {PIXI.GraphicsData[]}
         * @protected
         */
        this.graphicsData = [];

        /**
         * Used to detect if the graphics object has changed. If this is set to true then the graphics
         * object will be recalculated.
         *
         * @member {number}
         * @protected
         */
        this.dirty = 0;

        /**
         * Batches need to regenerated if the geometry is updated.
         *
         * @member {number}
         * @protected
         */
        this.batchDirty = -1;

        /**
         * Used to check if the cache is dirty.
         *
         * @member {number}
         * @protected
         */
        this.cacheDirty = -1;

        /**
         * Used to detect if we clear the graphics WebGL data.
         *
         * @member {number}
         * @default 0
         * @protected
         */
        this.clearDirty = 0;

        /**
         * List of current draw calls drived from the batches.
         *
         * @member {object[]}
         * @protected
         */
        this.drawCalls = [];

        /**
         * Intermediate abstract format sent to batch system.
         * Can be converted to drawCalls or to batchable objects.
         *
         * @member {object[]}
         * @protected
         */
        this.batches = [];

        /**
         * Index of the current last shape in the stack of calls.
         *
         * @member {number}
         * @protected
         */
        this.shapeIndex = 0;

        /**
         * Cached bounds.
         *
         * @member {PIXI.Bounds}
         * @protected
         */
        this._bounds = new Bounds();

        /**
         * The bounds dirty flag.
         *
         * @member {number}
         * @protected
         */
        this.boundsDirty = -1;

        /**
         * Padding to add to the bounds.
         *
         * @member {number}
         * @default 0
         */
        this.boundsPadding = 0;

        this.batchable = false;

        this.indicesUint16 = null;

        this.uvsFloat32 = null;
    }


    public static getFillCommand(type)
    {
        if(!GraphicsGeometry.fillCommands)
        {
            GraphicsGeometry.fillCommands = {}
            GraphicsGeometry.fillCommands[ShapeSettings.SHAPES.POLY] = GraphicsGeometry.buildPoly;
            GraphicsGeometry.fillCommands[ShapeSettings.SHAPES.CIRC] = GraphicsGeometry.buildCircle;
            GraphicsGeometry.fillCommands[ShapeSettings.SHAPES.ELIP] = GraphicsGeometry.buildCircle;
            GraphicsGeometry.fillCommands[ShapeSettings.SHAPES.RECT] = GraphicsGeometry.buildRectangle;
            GraphicsGeometry.fillCommands[ShapeSettings.SHAPES.RREC] = GraphicsGeometry.buildRoundedRectangle;
        }
        return GraphicsGeometry.fillCommands[type]
    }
    /**
     * Get the current bounds of the graphic geometry.
     *
     * @member {PIXI.Bounds}
     * @readonly
     */
    get bounds()
    {
        if (this.boundsDirty !== this.dirty)
        {
            this.boundsDirty = this.dirty;
            this.calculateBounds();
        }

        return this._bounds;
    };

    /**
     * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
     *
     * @return {PIXI.GraphicsGeometry} This GraphicsGeometry object. Good for chaining method calls
     */
   clear  ()
    {
        if (this.graphicsData.length > 0)
        {
            this.boundsDirty = -1;
            this.dirty++;
            this.clearDirty++;
            this.batchDirty++;
            this.graphicsData.length = 0;
            this.shapeIndex = 0;

            this.points.length = 0;
            this.colors.length = 0;
            this.uvs.length = 0;
            this.indices.length = 0;
            this.textureIds.length = 0;

            for (var i = 0; i < this.drawCalls.length; i++)
            {
                this.drawCalls[i].textures.length = 0;
                GraphicsGeometry.DRAW_CALL_POOL.push(this.drawCalls[i]);
            }

            this.drawCalls.length = 0;

            for (var i$1 = 0; i$1 < this.batches.length; i$1++)
            {
                var batch =  this.batches[i$1];

                batch.start = 0;
                batch.attribStart = 0;
                batch.style = null;
                GraphicsGeometry.BATCH_POOL.push(batch);
            }

            this.batches.length = 0;
        }

        return this;
    };

    /**
     * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @param {PIXI.FillStyle} fillStyle - Defines style of the fill.
     * @param {PIXI.LineStyle} lineStyle - Defines style of the lines.
     * @param {PIXI.Matrix} matrix - Transform applied to the points of the shape.
     * @return {PIXI.GraphicsGeometry} Returns geometry for chaining.
     */
    drawShape  (shape, fillStyle, lineStyle, matrix)
    {
        var data = new GraphicsData(shape, fillStyle, lineStyle, matrix);

        this.graphicsData.push(data);
        this.dirty++;

        return this;
    };

    /**
     * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
     *
     * @param {PIXI.Circle|PIXI.Ellipse|PIXI.Polygon|PIXI.Rectangle|PIXI.RoundedRectangle} shape - The shape object to draw.
     * @param {PIXI.Matrix} matrix - Transform applied to the points of the shape.
     * @return {PIXI.GraphicsGeometry} Returns geometry for chaining.
     */
    drawHole  (shape, matrix)
    {
        if (!this.graphicsData.length)
        {
            return null;
        }

        var data = new GraphicsData(shape, null, null, matrix);

        var lastShape = this.graphicsData[this.graphicsData.length - 1];

        data.lineStyle = lastShape.lineStyle;

        lastShape.holes.push(data);

        this.dirty++;

        return data;
    };

    /**
     * Destroys the Graphics object.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all
     *  options have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have
     *  their destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the texture of the child sprite
     * @param {boolean} [options.baseTexture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the base texture of the child sprite
     */
    destroy  (options)
    {
        super.destroy(options);

        // destroy each of the GraphicsData objects
        for (var i = 0; i < this.graphicsData.length; ++i)
        {
            this.graphicsData[i].destroy();
        }

        this.points.length = 0;
        this.points = null;
        this.colors.length = 0;
        this.colors = null;
        this.uvs.length = 0;
        this.uvs = null;
        this.indices.length = 0;
        this.indices = null;
        this.indexBuffer.destroy();
        this.indexBuffer = null;
        this.graphicsData.length = 0;
        this.graphicsData = null;
        this.drawCalls.length = 0;
        this.drawCalls = null;
        this.batches.length = 0;
        this.batches = null;
        this._bounds = null;
    };

    /**
     * Check to see if a point is contained within this geometry.
     *
     * @param {PIXI.Point} point - Point to check if it's contained.
     * @return {Boolean} `true` if the point is contained within geometry.
     */
    containsPoint  (point)
    {
        var graphicsData = this.graphicsData;

        for (var i = 0; i < graphicsData.length; ++i)
        {
            var data = graphicsData[i];

            if (!data.fillStyle.visible)
            {
                continue;
            }

            // only deal with fills..
            if (data.shape)
            {
                if (data.shape.contains(point.x, point.y))
                {
                    if (data.holes)
                    {
                        for (var i$1 = 0; i$1 < data.holes.length; i$1++)
                        {
                            var hole = data.holes[i$1];

                            if (hole.shape.contains(point.x, point.y))
                            {
                                return false;
                            }
                        }
                    }

                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Generates intermediate batch data. Either gets converted to drawCalls
     * or used to convert to batch objects directly by the Graphics object.
     * @protected
     */
    updateBatches  ()
    {
        
		if (this.dirty === this.cacheDirty) 
		{ 
			return; 
		}
		if (this.graphicsData.length === 0) 
		{ 
			return; 
		}



        if (this.dirty !== this.cacheDirty)
        {
			
            for (var i = 0; i < this.graphicsData.length; i++)
            {
				var data:GraphicsData = this.graphicsData[i];
				

				// reveal(data.fillStyle.texture.baseTexture.resource);
				// reveal(data.lineStyle.texture.baseTexture.resource);

                if (data.fillStyle && !data.fillStyle.texture.baseTexture.valid) 
                { 
                    
                    return; 
                }
                if (data.lineStyle && !data.lineStyle.texture.baseTexture.valid) 
                { 
                    
                    return; 
                }
            }
        }

        this.cacheDirty = this.dirty;

		var uvs = this.uvs;
		
		

        var batchPart = this.batches.pop()
            || GraphicsGeometry.BATCH_POOL.pop()
			|| new BatchPart();
			
		

        batchPart.style = batchPart.style
            || this.graphicsData[0].fillStyle
			|| this.graphicsData[0].lineStyle;
			
			

		var currentTexture = batchPart.style.texture.baseTexture;
		// reveal(currentTexture);


		var currentColor = batchPart.style.color + batchPart.style.alpha;
		
		

		this.batches.push(batchPart);
		
		// reveal(this.batches);

        

        // TODO - this can be simplified
        for (var i$1 = this.shapeIndex; i$1 < this.graphicsData.length; i$1++)
        {
            this.shapeIndex++;

			var data$1 = this.graphicsData[i$1];
			// reveal(data$1);

			var command = GraphicsGeometry.getFillCommand(data$1.type)
			

			// reveal(command)

            var fillStyle = data$1.fillStyle;
            var lineStyle = data$1.lineStyle;

            // build out the shapes points..
			command.build(data$1);
			




            if (data$1.matrix)
            {
				this.transformPoints(data$1.points, data$1.matrix);
				// reveal(data$1.points)
				// 	reveal(data$1.matrix)
            }

            for (var j = 0; j < 2; j++)
            {
                var style = (j === 0) ? fillStyle : lineStyle;

                if (!style.visible) { continue; }

                var nextTexture = style.texture.baseTexture;

                if (currentTexture !== nextTexture || (style.color + style.alpha) !== currentColor)
                {
                    // TODO use a const
                    nextTexture.wrapMode = 10497;
                    currentTexture = nextTexture;
                    currentColor = style.color + style.alpha;

                    var index$1 = this.indices.length;
                    var attribIndex = this.points.length / 2;

                    batchPart.size = index$1 - batchPart.start;
                    batchPart.attribSize = attribIndex - batchPart.attribStart;

                    if (batchPart.size > 0)
                    {
                        batchPart = GraphicsGeometry.BATCH_POOL.pop() || new BatchPart();

                        this.batches.push(batchPart);
                    }

                    batchPart.style = style;
                    batchPart.start = index$1;
                    batchPart.attribStart = attribIndex;

                    // TODO add this to the render part..
                }

				var start = this.points.length / 2;
				

                if (j === 0)
                {
                    if (data$1.holes.length)
                    {
                        this.processHoles(data$1.holes);

                        GraphicsGeometry.buildPoly.triangulate(data$1, this);
                    }
                    else
                    {
                        command.triangulate(data$1, this);
                    }
                }
                else
                {
                    GraphicsGeometry.buildLine(data$1, this);

                    for (var i$2 = 0; i$2 < data$1.holes.length; i$2++)
                    {
                        GraphicsGeometry.buildLine(data$1.holes[i$2], this);
                    }
                }

                var size = (this.points.length / 2) - start;

                this.addUvs(this.points, uvs, style.texture, start, size, style.matrix);
			}
			
		}
		
		

        var index = this.indices.length;
		var attrib = this.points.length / 2;
		
	

        batchPart.size = index - batchPart.start;
        batchPart.attribSize = attrib - batchPart.attribStart;
		this.indicesUint16 = new Uint16Array(this.indices);
		

        // TODO make this a const..
		this.batchable = this.isBatchable();
		
		

        if (this.batchable)
        {
            this.batchDirty++;

			this.uvsFloat32 = new Float32Array(this.uvs);
			

            // offset the indices so that it works with the batcher...
            for (var i$3 = 0; i$3 < this.batches.length; i$3++)
            {
                var batch = this.batches[i$3];

                for (var j$1 = 0; j$1 < batch.size; j$1++)
                {
                    var index$2 = batch.start + j$1;

                    this.indicesUint16[index$2] = this.indicesUint16[index$2] - batch.attribStart;
                }
			}
        }
        else
        {
            this.buildDrawCalls();
        }
    };

    /**
     * Checks to see if this graphics geometry can be batched.
     * Currently it needs to be small enough and not contain any native lines.
     * @protected
     */
    isBatchable  ()
    {
        var batches = this.batches;

        for (var i = 0; i < batches.length; i++)
        {
            if (batches[i].style.native)
            {
                return false;
            }
        }

        return (this.points.length < GraphicsGeometry.BATCHABLE_SIZE * 2);
    };

    /**
     * Converts intermediate batches data to drawCalls.
     * @protected
     */
    buildDrawCalls  ()
    {
        var TICK = ++BaseTexture._globalBatch;

        for (var i = 0; i < this.drawCalls.length; i++)
        {
            this.drawCalls[i].textures.length = 0;
            GraphicsGeometry.DRAW_CALL_POOL.push(this.drawCalls[i]);
        }

        this.drawCalls.length = 0;

        var uvs = this.uvs;
        var colors = this.colors;
        var textureIds = this.textureIds;

        var currentGroup =  GraphicsGeometry.DRAW_CALL_POOL.pop() || new BatchDrawCall();

        currentGroup.textureCount = 0;
        currentGroup.start = 0;
        currentGroup.size = 0;
        currentGroup.type = DrawModeSettings.DRAW_MODES.TRIANGLES;

        var textureCount = 0;
        var currentTexture = null;
        var textureId = 0;
        var native = false;
        var drawMode = DrawModeSettings.DRAW_MODES.TRIANGLES;

        var index = 0;

        this.drawCalls.push(currentGroup);

        // TODO - this can be simplified
        for (var i$1 = 0; i$1 < this.batches.length; i$1++)
        {
            var data = this.batches[i$1];

            // TODO add some full on MAX_TEXTURE CODE..
            var MAX_TEXTURES = 8;

            var style = data.style;

            var nextTexture = style.texture.baseTexture;

            if (native !== style.native)
            {
                native = style.native;
                drawMode = native ? DrawModeSettings.DRAW_MODES.LINES : DrawModeSettings.DRAW_MODES.TRIANGLES;

                // force the batch to break!
                currentTexture = null;
                textureCount = MAX_TEXTURES;
                TICK++;
            }

            if (currentTexture !== nextTexture)
            {
                currentTexture = nextTexture;

                if (nextTexture._batchEnabled !== TICK)
                {
                    if (textureCount === MAX_TEXTURES)
                    {
                        TICK++;

                        textureCount = 0;

                        if (currentGroup.size > 0)
                        {
                            currentGroup = GraphicsGeometry.DRAW_CALL_POOL.pop() || new BatchDrawCall();
                            this.drawCalls.push(currentGroup);
                        }

                        currentGroup.start = index;
                        currentGroup.size = 0;
                        currentGroup.textureCount = 0;
                        currentGroup.type = drawMode;
                    }

                    // TODO add this to the render part..
                    nextTexture.touched = 1;// touch;
                    nextTexture._batchEnabled = TICK;
                    nextTexture._id = textureCount;
                    nextTexture.wrapMode = 10497;

                    currentGroup.textures[currentGroup.textureCount++] = nextTexture;
                    textureCount++;
                }
            }

            currentGroup.size += data.size;
            index += data.size;

            textureId = nextTexture._id;

            this.addColors(colors, style.color, style.alpha, data.attribSize);
            this.addTextureIds(textureIds, textureId, data.attribSize);
        }

        BaseTexture._globalBatch = TICK;

        // upload..
        // merge for now!
        var verts = this.points;

        // verts are 2 positions.. so we * by 3 as there are 6 properties.. then 4 cos its bytes
        var glPoints = new ArrayBuffer(verts.length * 3 * 4);
        var f32 = new Float32Array(glPoints);
        var u32 = new Uint32Array(glPoints);

        var p = 0;

        for (var i$2 = 0; i$2 < verts.length / 2; i$2++)
        {
            f32[p++] = verts[i$2 * 2];
            f32[p++] = verts[(i$2 * 2) + 1];

            f32[p++] = uvs[i$2 * 2];
            f32[p++] = uvs[(i$2 * 2) + 1];

            u32[p++] = colors[i$2];

            f32[p++] = textureIds[i$2];
        }

        this._buffer.update(glPoints);
        this._indexBuffer.update(this.indicesUint16);
    };

    /**
     * Process the holes data.
     *
     * @param {PIXI.GraphicsData[]} holes - Holes to render
     * @protected
     */
    processHoles  (holes)
    {
        for (var i = 0; i < holes.length; i++)
        {
            var hole = holes[i];

            var command = GraphicsGeometry.fillCommands[hole.type];

            command.build(hole);

            if (hole.matrix)
            {
                this.transformPoints(hole.points, hole.matrix);
            }
        }
    };

    /**
     * Update the local bounds of the object. Expensive to use performance-wise.
     * @protected
     */
    calculateBounds ()
    {
        var minX = Infinity;
        var maxX = -Infinity;

        var minY = Infinity;
        var maxY = -Infinity;

        if (this.graphicsData.length)
        {
            var shape = null;
            var x = 0;
            var y = 0;
            var w = 0;
            var h = 0;

            for (var i = 0; i < this.graphicsData.length; i++)
            {
                var data = this.graphicsData[i];

                var type = data.type;
                var lineWidth = data.lineStyle ? data.lineStyle.width : 0;

                shape = data.shape;

                if (type === ShapeSettings.SHAPES.RECT || type === ShapeSettings.SHAPES.RREC)
                {
                    x = shape.x - (lineWidth / 2);
                    y = shape.y - (lineWidth / 2);
                    w = shape.width + lineWidth;
                    h = shape.height + lineWidth;

                    minX = x < minX ? x : minX;
                    maxX = x + w > maxX ? x + w : maxX;

                    minY = y < minY ? y : minY;
                    maxY = y + h > maxY ? y + h : maxY;
                }
                else if (type === ShapeSettings.SHAPES.CIRC)
                {
                    x = shape.x;
                    y = shape.y;
                    w = shape.radius + (lineWidth / 2);
                    h = shape.radius + (lineWidth / 2);

                    minX = x - w < minX ? x - w : minX;
                    maxX = x + w > maxX ? x + w : maxX;

                    minY = y - h < minY ? y - h : minY;
                    maxY = y + h > maxY ? y + h : maxY;
                }
                else if (type === ShapeSettings.SHAPES.ELIP)
                {
                    x = shape.x;
                    y = shape.y;
                    w = shape.width + (lineWidth / 2);
                    h = shape.height + (lineWidth / 2);

                    minX = x - w < minX ? x - w : minX;
                    maxX = x + w > maxX ? x + w : maxX;

                    minY = y - h < minY ? y - h : minY;
                    maxY = y + h > maxY ? y + h : maxY;
                }
                else
                {
                    // POLY
                    var points = shape.points;
                    var x2 = 0;
                    var y2 = 0;
                    var dx = 0;
                    var dy = 0;
                    var rw = 0;
                    var rh = 0;
                    var cx = 0;
                    var cy = 0;

                    for (var j = 0; j + 2 < points.length; j += 2)
                    {
                        x = points[j];
                        y = points[j + 1];
                        x2 = points[j + 2];
                        y2 = points[j + 3];
                        dx = Math.abs(x2 - x);
                        dy = Math.abs(y2 - y);
                        h = lineWidth;
                        w = Math.sqrt((dx * dx) + (dy * dy));

                        if (w < 1e-9)
                        {
                            continue;
                        }

                        rw = ((h / w * dy) + dx) / 2;
                        rh = ((h / w * dx) + dy) / 2;
                        cx = (x2 + x) / 2;
                        cy = (y2 + y) / 2;

                        minX = cx - rw < minX ? cx - rw : minX;
                        maxX = cx + rw > maxX ? cx + rw : maxX;

                        minY = cy - rh < minY ? cy - rh : minY;
                        maxY = cy + rh > maxY ? cy + rh : maxY;
                    }
                }
            }
        }
        else
        {
            minX = 0;
            maxX = 0;
            minY = 0;
            maxY = 0;
        }

        var padding = this.boundsPadding;

        this._bounds.minX = minX - padding;
        this._bounds.maxX = maxX + padding;

        this._bounds.minY = minY - padding;
        this._bounds.maxY = maxY + padding;
    };

    /**
     * Transform points using matrix.
     *
     * @protected
     * @param {number[]} points - Points to transform
     * @param {PIXI.Matrix} matrix - Transform matrix
     */
    transformPoints (points, matrix)
    {
        for (var i = 0; i < points.length / 2; i++)
        {
            var x = points[(i * 2)];
            var y = points[(i * 2) + 1];

            points[(i * 2)] = (matrix.a * x) + (matrix.c * y) + matrix.tx;
            points[(i * 2) + 1] = (matrix.b * x) + (matrix.d * y) + matrix.ty;
        }
    };

    /**
     * Add colors.
     *
     * @protected
     * @param {number[]} colors - List of colors to add to
     * @param {number} color - Color to add
     * @param {number} alpha - Alpha to use
     * @param {number} size - Number of colors to add
     */
    addColors (colors, color, alpha, size)
    {
        // TODO use the premultiply bits Ivan added
        var rgb = (color >> 16) + (color & 0xff00) + ((color & 0xff) << 16);

        var rgba =  ColorSettings.premultiplyTint(rgb, alpha);

        while (size-- > 0)
        {
            colors.push(rgba);
        }
    };

    /**
     * Add texture id that the shader/fragment wants to use.
     *
     * @protected
     * @param {number[]} textureIds
     * @param {number} id
     * @param {number} size
     */
    addTextureIds (textureIds, id, size)
    {
        while (size-- > 0)
        {
            textureIds.push(id);
        }
    };

    /**
     * Generates the UVs for a shape.
     *
     * @protected
     * @param {number[]} verts - Vertices
     * @param {number[]} uvs - UVs
     * @param {PIXI.Texture} texture - Reference to Texture
     * @param {number} start - Index buffer start index.
     * @param {number} size - The size/length for index buffer.
     * @param {PIXI.Matrix} [matrix] - Optional transform for all points.
     */
    addUvs  (verts, uvs, texture, start, size, matrix)
    {
        var index = 0;
        var uvsStart = uvs.length;
        var frame = texture.frame;

        while (index < size)
        {
            var x = verts[(start + index) * 2];
            var y = verts[((start + index) * 2) + 1];

            if (matrix)
            {
                var nx = (matrix.a * x) + (matrix.c * y) + matrix.tx;

                y = (matrix.b * x) + (matrix.d * y) + matrix.ty;
                x = nx;
            }

            index++;

            uvs.push(x / frame.width, y / frame.height);
        }

        var baseTexture = texture.baseTexture;

        if (frame.width < baseTexture.width
            || frame.height < baseTexture.height)
        {
            this.adjustUvs(uvs, texture, uvsStart, size);
        }
    };

    /**
     * Modify uvs array according to position of texture region
     * Does not work with rotated or trimmed textures
     * @param {number} uvs array
     * @param {PIXI.Texture} texture region
     * @param {number} start starting index for uvs
     * @param {number} size how many points to adjust
     */
    adjustUvs  (uvs, texture, start, size)
    {
        var baseTexture = texture.baseTexture;
        var eps = 1e-6;
        var finish = start + (size * 2);
        var frame = texture.frame;
        var scaleX = frame.width / baseTexture.width;
        var scaleY = frame.height / baseTexture.height;
        var offsetX = frame.x / frame.width;
        var offsetY = frame.y / frame.width;
        var minX = Math.floor(uvs[start] + eps);
        var minY = Math.floor(uvs[start + 1] + eps);

        for (var i = start + 2; i < finish; i += 2)
        {
            minX = Math.min(minX, Math.floor(uvs[i] + eps));
            minY = Math.min(minY, Math.floor(uvs[i + 1] + eps));
        }
        offsetX -= minX;
        offsetY -= minY;
        for (var i$1 = start; i$1 < finish; i$1 += 2)
        {
            uvs[i$1] = (uvs[i$1] + offsetX) * scaleX;
            uvs[i$1 + 1] = (uvs[i$1 + 1] + offsetY) * scaleY;
        }
    };

    	/**
	 * Builds a polygon to draw
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
	 * @param {object} webGLData - an object containing all the WebGL-specific information to create this shape
	 * @param {object} webGLDataNativeLines - an object containing all the WebGL-specific information to create nativeLines
	 */
	static buildPoly = {

		name: "buildPoly",
	    build: function build(graphicsData)
	    {
	        graphicsData.points = graphicsData.shape.points.slice();
	    },

	    triangulate: function triangulate(graphicsData, graphicsGeometry)
	    {
	        var points = graphicsData.points;
	        var holes = graphicsData.holes;
	        var verts = graphicsGeometry.points;
	        var indices = graphicsGeometry.indices;

	        if (points.length >= 6)
	        {
	            var holeArray = [];
	            // Process holes..

	            for (var i = 0; i < holes.length; i++)
	            {
	                var hole = holes[i];

	                holeArray.push(points.length / 2);
	                points = points.concat(hole.points);
	            }

	            // sort color
	            var triangles = GraphicsGeometry.earcut(points, holeArray, 2);

	            if (!triangles)
	            {
	                return;
	            }

	            var vertPos = verts.length / 2;

	            for (var i$1 = 0; i$1 < triangles.length; i$1 += 3)
	            {
	                indices.push(triangles[i$1] + vertPos);
	                indices.push(triangles[i$1 + 1] + vertPos);
	                indices.push(triangles[i$1 + 2] + vertPos);
	            }

	            for (var i$2 = 0; i$2 < points.length; i$2++)
	            {
	                verts.push(points[i$2]);
	            }
	        }
	    },
    };
    
    	/**
	 * Builds a line to draw
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {PIXI.GraphicsData} graphicsData - The graphics object containing all the necessary properties
	 * @param {PIXI.GraphicsGeometry} graphicsGeometry - Geometry where to append output
	 */
	static buildLine (graphicsData, graphicsGeometry)
	{
	    if (graphicsData.lineStyle.native)
	    {
	        GraphicsGeometry.buildNativeLine(graphicsData, graphicsGeometry);
	    }
	    else
	    {
	        GraphicsGeometry.buildLine$1(graphicsData, graphicsGeometry);
	    }
    }
    
    	/**
	 * Builds a line to draw using the gl.drawArrays(gl.LINES) method
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {PIXI.GraphicsData} graphicsData - The graphics object containing all the necessary properties
	 * @param {PIXI.GraphicsGeometry} graphicsGeometry - Geometry where to append output
	 */
	static buildNativeLine(graphicsData, graphicsGeometry)
	{
	    var i = 0;

	    var points = graphicsData.points || graphicsData.shape.points;

	    if (points.length === 0) { return; }

	    var verts = graphicsGeometry.points;
	    var indices = graphicsGeometry.indices;
	    var length = points.length / 2;

	    var indexStart = verts.length / 2;
	    // sort color

	    for (i = 1; i < length; i++)
	    {
	        var p1x = points[(i - 1) * 2];
	        var p1y = points[((i - 1) * 2) + 1];

	        var p2x = points[i * 2];
	        var p2y = points[(i * 2) + 1];

	        verts.push(p1x, p1y);

	        verts.push(p2x, p2y);

	        indices.push(indexStart++, indexStart++);
	    }
    }
    
    	/**
	 * Builds a line to draw using the polygon method.
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {PIXI.GraphicsData} graphicsData - The graphics object containing all the necessary properties
	 * @param {PIXI.GraphicsGeometry} graphicsGeometry - Geometry where to append output
	 */
	static buildLine$1(graphicsData, graphicsGeometry)
	{
	    var shape = graphicsData.shape;
	    var points = graphicsData.points || shape.points.slice();

	    if (points.length === 0)
	    {
	        return;
	    }
	    // if the line width is an odd number add 0.5 to align to a whole pixel
	    // commenting this out fixes #711 and #1620
	    // if (graphicsData.lineWidth%2)
	    // {
	    //     for (i = 0; i < points.length; i++)
	    //     {
	    //         points[i] += 0.5;
	    //     }
	    // }

	    var style = graphicsData.lineStyle;

	    // get first and last point.. figure out the middle!
	    var firstPoint = new Point(points[0], points[1]);
	    var lastPoint = new Point(points[points.length - 2], points[points.length - 1]);
	    var closedShape = shape.type !== ShapeSettings.SHAPES.POLY || shape.closeStroke;
	    var closedPath = firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y;

	    // if the first point is the last point - gonna have issues :)
	    if (closedShape)
	    {
	        // need to clone as we are going to slightly modify the shape..
	        points = points.slice();

	        if (closedPath)
	        {
	            points.pop();
	            points.pop();
	            lastPoint.set(points[points.length - 2], points[points.length - 1]);
	        }

	        var midPointX = lastPoint.x + ((firstPoint.x - lastPoint.x) * 0.5);
	        var midPointY = lastPoint.y + ((firstPoint.y - lastPoint.y) * 0.5);

	        points.unshift(midPointX, midPointY);
	        points.push(midPointX, midPointY);
	    }

	    var verts = graphicsGeometry.points;
	    var length = points.length / 2;
	    var indexCount = points.length;
	    var indexStart = verts.length / 2;

	    // DRAW the Line
	    var width = style.width / 2;

	    // sort color
	    var p1x = points[0];
	    var p1y = points[1];
	    var p2x = points[2];
	    var p2y = points[3];
	    var p3x = 0;
	    var p3y = 0;

	    var perpx = -(p1y - p2y);
	    var perpy = p1x - p2x;
	    var perp2x = 0;
	    var perp2y = 0;
	    var perp3x = 0;
	    var perp3y = 0;

	    var dist = Math.sqrt((perpx * perpx) + (perpy * perpy));

	    perpx /= dist;
	    perpy /= dist;
	    perpx *= width;
	    perpy *= width;

	    var ratio = style.alignment;// 0.5;
	    var r1 = (1 - ratio) * 2;
	    var r2 = ratio * 2;

	    // start
	    verts.push(
	        p1x - (perpx * r1),
	        p1y - (perpy * r1));

	    verts.push(
	        p1x + (perpx * r2),
	        p1y + (perpy * r2));

	    for (var i = 1; i < length - 1; ++i)
	    {
	        p1x = points[(i - 1) * 2];
	        p1y = points[((i - 1) * 2) + 1];

	        p2x = points[i * 2];
	        p2y = points[(i * 2) + 1];

	        p3x = points[(i + 1) * 2];
	        p3y = points[((i + 1) * 2) + 1];

	        perpx = -(p1y - p2y);
	        perpy = p1x - p2x;

	        dist = Math.sqrt((perpx * perpx) + (perpy * perpy));
	        perpx /= dist;
	        perpy /= dist;
	        perpx *= width;
	        perpy *= width;

	        perp2x = -(p2y - p3y);
	        perp2y = p2x - p3x;

	        dist = Math.sqrt((perp2x * perp2x) + (perp2y * perp2y));
	        perp2x /= dist;
	        perp2y /= dist;
	        perp2x *= width;
	        perp2y *= width;

	        var a1 = (-perpy + p1y) - (-perpy + p2y);
	        var b1 = (-perpx + p2x) - (-perpx + p1x);
	        var c1 = ((-perpx + p1x) * (-perpy + p2y)) - ((-perpx + p2x) * (-perpy + p1y));
	        var a2 = (-perp2y + p3y) - (-perp2y + p2y);
	        var b2 = (-perp2x + p2x) - (-perp2x + p3x);
	        var c2 = ((-perp2x + p3x) * (-perp2y + p2y)) - ((-perp2x + p2x) * (-perp2y + p3y));

	        var denom = (a1 * b2) - (a2 * b1);

	        if (Math.abs(denom) < 0.1)
	        {
	            denom += 10.1;
	            verts.push(
	                p2x - (perpx * r1),
	                p2y - (perpy * r1));

	            verts.push(
	                p2x + (perpx * r2),
	                p2y + (perpy * r2));

	            continue;
	        }

	        var px = ((b1 * c2) - (b2 * c1)) / denom;
	        var py = ((a2 * c1) - (a1 * c2)) / denom;
	        var pdist = ((px - p2x) * (px - p2x)) + ((py - p2y) * (py - p2y));

	        if (pdist > (196 * width * width))
	        {
	            perp3x = perpx - perp2x;
	            perp3y = perpy - perp2y;

	            dist = Math.sqrt((perp3x * perp3x) + (perp3y * perp3y));
	            perp3x /= dist;
	            perp3y /= dist;
	            perp3x *= width;
	            perp3y *= width;

	            verts.push(p2x - (perp3x * r1), p2y - (perp3y * r1));

	            verts.push(p2x + (perp3x * r2), p2y + (perp3y * r2));

	            verts.push(p2x - (perp3x * r2 * r1), p2y - (perp3y * r1));

	            indexCount++;
	        }
	        else
	        {
	            verts.push(p2x + ((px - p2x) * r1), p2y + ((py - p2y) * r1));

	            verts.push(p2x - ((px - p2x) * r2), p2y - ((py - p2y) * r2));
	        }
	    }

	    p1x = points[(length - 2) * 2];
	    p1y = points[((length - 2) * 2) + 1];

	    p2x = points[(length - 1) * 2];
	    p2y = points[((length - 1) * 2) + 1];

	    perpx = -(p1y - p2y);
	    perpy = p1x - p2x;

	    dist = Math.sqrt((perpx * perpx) + (perpy * perpy));
	    perpx /= dist;
	    perpy /= dist;
	    perpx *= width;
	    perpy *= width;

	    verts.push(p2x - (perpx * r1), p2y - (perpy * r1));

	    verts.push(p2x + (perpx * r2), p2y + (perpy * r2));

	    var indices = graphicsGeometry.indices;

	    // indices.push(indexStart);

	    for (var i$1 = 0; i$1 < indexCount - 2; ++i$1)
	    {
	        indices.push(indexStart, indexStart + 1, indexStart + 2);

	        indexStart++;
	    }
    }
    
    static earcut(data, holeIndices, dim) {

	    dim = dim || 2;

	    var hasHoles = holeIndices && holeIndices.length,
	        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
	        outerNode = GraphicsGeometry.linkedList(data, 0, outerLen, dim, true),
	        triangles = [];

	    if (!outerNode || outerNode.next === outerNode.prev) { return triangles; }

	    var minX, minY, maxX, maxY, x, y, invSize;

	    if (hasHoles) { outerNode = GraphicsGeometry.eliminateHoles(data, holeIndices, outerNode, dim); }

	    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
	    if (data.length > 80 * dim) {
	        minX = maxX = data[0];
	        minY = maxY = data[1];

	        for (var i = dim; i < outerLen; i += dim) {
	            x = data[i];
	            y = data[i + 1];
	            if (x < minX) { minX = x; }
	            if (y < minY) { minY = y; }
	            if (x > maxX) { maxX = x; }
	            if (y > maxY) { maxY = y; }
	        }

	        // minX, minY and invSize are later used to transform coords into integers for z-order calculation
	        invSize = Math.max(maxX - minX, maxY - minY);
	        invSize = invSize !== 0 ? 1 / invSize : 0;
	    }

	    GraphicsGeometry.earcutLinked(outerNode, triangles, dim, minX, minY, invSize);

	    return triangles;
    }
    
    	// create a circular doubly linked list from polygon points in the specified winding order
	static linkedList(data, start, end, dim, clockwise) {
	    var i, last;

	    if (clockwise === (GraphicsGeometry.signedArea(data, start, end, dim) > 0)) {
	        for (i = start; i < end; i += dim) { last = GraphicsGeometry.insertNode(i, data[i], data[i + 1], last); }
	    } else {
	        for (i = end - dim; i >= start; i -= dim) { last = GraphicsGeometry.insertNode(i, data[i], data[i + 1], last); }
	    }

	    if (last && GraphicsGeometry.equals(last, last.next)) {
	        GraphicsGeometry.removeNode(last);
	        last = last.next;
	    }

	    return last;
    }
    
    	// link every hole into the outer loop, producing a single-ring polygon without holes
	static eliminateHoles(data, holeIndices, outerNode, dim) {
	    var queue = [],
	        i, len, start, end, list;

	    for (i = 0, len = holeIndices.length; i < len; i++) {
	        start = holeIndices[i] * dim;
	        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
	        list = GraphicsGeometry.linkedList(data, start, end, dim, false);
	        if (list === list.next) { list.steiner = true; }
	        queue.push(GraphicsGeometry.getLeftmost(list));
	    }

	    queue.sort(GraphicsGeometry.compareX);

	    // process holes from left to right
	    for (i = 0; i < queue.length; i++) {
	        GraphicsGeometry.eliminateHole(queue[i], outerNode);
	        outerNode = GraphicsGeometry.filterPoints(outerNode, outerNode.next);
	    }

	    return outerNode;
    }
    
    	// main ear slicing loop which triangulates a polygon (given as a linked list)
	static earcutLinked(ear, triangles, dim, minX, minY, invSize, pass = null) {
	    if (!ear) { return; }

	    // interlink polygon nodes in z-order
	    if (!pass && invSize) { GraphicsGeometry.indexCurve(ear, minX, minY, invSize); }

	    var stop = ear,
	        prev, next;

	    // iterate through ears, slicing them one by one
	    while (ear.prev !== ear.next) {
	        prev = ear.prev;
	        next = ear.next;

	        if (invSize ? GraphicsGeometry.isEarHashed(ear, minX, minY, invSize) : GraphicsGeometry.isEar(ear)) {
	            // cut off the triangle
	            triangles.push(prev.i / dim);
	            triangles.push(ear.i / dim);
	            triangles.push(next.i / dim);

	            GraphicsGeometry.removeNode(ear);

	            // skipping the next vertex leads to less sliver triangles
	            ear = next.next;
	            stop = next.next;

	            continue;
	        }

	        ear = next;

	        // if we looped through the whole remaining polygon and can't find any more ears
	        if (ear === stop) {
	            // try filtering points and slicing again
	            if (!pass) {
	                GraphicsGeometry.earcutLinked(GraphicsGeometry.filterPoints(ear), triangles, dim, minX, minY, invSize, 1);

	            // if this didn't work, try curing all small self-intersections locally
	            } else if (pass === 1) {
	                ear = GraphicsGeometry.cureLocalIntersections(ear, triangles, dim);
	                GraphicsGeometry.earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);

	            // as a last resort, try splitting the remaining polygon into two
	            } else if (pass === 2) {
	                GraphicsGeometry.splitEarcut(ear, triangles, dim, minX, minY, invSize);
	            }

	            break;
	        }
	    }
    }
    
    static signedArea(data, start, end, dim) {
	    var sum = 0;
	    for (var i = start, j = end - dim; i < end; i += dim) {
	        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
	        j = i;
	    }
	    return sum;
    }
    
    	// create a node and optionally link it with previous one (in a circular doubly linked list)
	static insertNode(i, x, y, last) {
	    var p = new Node(i, x, y);

	    if (!last) {
	        p.prev = p;
	        p.next = p;

	    } else {
	        p.next = last.next;
	        p.prev = last;
	        last.next.prev = p;
	        last.next = p;
	    }
	    return p;
    }
    
    	// check if two points are equal
	static equals(p1, p2) {
	    return p1.x === p2.x && p1.y === p2.y;
    }
    
    static removeNode(p) {
	    p.next.prev = p.prev;
	    p.prev.next = p.next;

	    if (p.prevZ) { p.prevZ.nextZ = p.nextZ; }
	    if (p.nextZ) { p.nextZ.prevZ = p.prevZ; }
    }
    
    	// find the leftmost node of a polygon ring
	static getLeftmost(start) {
	    var p = start,
	        leftmost = start;
	    do {
	        if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) { leftmost = p; }
	        p = p.next;
	    } while (p !== start);

	    return leftmost;
    }
    
    static compareX(a, b) {
	    return a.x - b.x;
    }
    
    	// find a bridge between vertices that connects hole with an outer ring and and link it
	static eliminateHole(hole, outerNode) {
	    outerNode = GraphicsGeometry.findHoleBridge(hole, outerNode);
	    if (outerNode) {
	        var b = GraphicsGeometry.splitPolygon(outerNode, hole);
	        GraphicsGeometry.filterPoints(b, b.next);
	    }
    }
    
    	// eliminate colinear or duplicate points
	static filterPoints(start, end = null) {
	    if (!start) { return start; }
	    if (!end) { end = start; }

	    var p = start,
	        again;
	    do {
	        again = false;

	        if (!p.steiner && (GraphicsGeometry.equals(p, p.next) || GraphicsGeometry.area(p.prev, p, p.next) === 0)) {
	            GraphicsGeometry.removeNode(p);
	            p = end = p.prev;
	            if (p === p.next) { break; }
	            again = true;

	        } else {
	            p = p.next;
	        }
	    } while (again || p !== end);

	    return end;
    }
    
    	// signed area of a triangle
	static area(p, q, r) {
	    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    }
    
    	// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
	// if one belongs to the outer ring and another to a hole, it merges it into a single ring
	static splitPolygon(a, b) {
	    var a2 = new Node(a.i, a.x, a.y),
	        b2 = new Node(b.i, b.x, b.y),
	        an = a.next,
	        bp = b.prev;

	    a.next = b;
	    b.prev = a;

	    a2.next = an;
	    an.prev = a2;

	    b2.next = a2;
	    a2.prev = b2;

	    bp.next = b2;
	    b2.prev = bp;

	    return b2;
    }
    
    	// David Eberly's algorithm for finding a bridge between hole and outer polygon
	static findHoleBridge(hole, outerNode) {
	    var p = outerNode,
	        hx = hole.x,
	        hy = hole.y,
	        qx = -Infinity,
	        m;

	    // find a segment intersected by a ray from the hole's leftmost point to the left;
	    // segment's endpoint with lesser x will be potential connection point
	    do {
	        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
	            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
	            if (x <= hx && x > qx) {
	                qx = x;
	                if (x === hx) {
	                    if (hy === p.y) { return p; }
	                    if (hy === p.next.y) { return p.next; }
	                }
	                m = p.x < p.next.x ? p : p.next;
	            }
	        }
	        p = p.next;
	    } while (p !== outerNode);

	    if (!m) { return null; }

	    if (hx === qx) { return m.prev; } // hole touches outer segment; pick lower endpoint

	    // look for points inside the triangle of hole point, segment intersection and endpoint;
	    // if there are no points found, we have a valid connection;
	    // otherwise choose the point of the minimum angle with the ray as connection point

	    var stop = m,
	        mx = m.x,
	        my = m.y,
	        tanMin = Infinity,
	        tan;

	    p = m.next;

	    while (p !== stop) {
	        if (hx >= p.x && p.x >= mx && hx !== p.x &&
                GraphicsGeometry.pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

	            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

	            if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && GraphicsGeometry.locallyInside(p, hole)) {
	                m = p;
	                tanMin = tan;
	            }
	        }

	        p = p.next;
	    }

	    return m;
    }
    
    	// check if a polygon diagonal is locally inside the polygon
	static locallyInside(a, b) {
	    return GraphicsGeometry.area(a.prev, a, a.next) < 0 ?
        GraphicsGeometry.area(a, b, a.next) >= 0 && GraphicsGeometry.area(a, a.prev, b) >= 0 :
        GraphicsGeometry.area(a, b, a.prev) < 0 || GraphicsGeometry.area(a, a.next, b) < 0;
    }
    
    	// check if a point lies within a convex triangle
    static pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
	    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
	           (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
	           (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
    }
    
    	// try splitting polygon into two and triangulate them independently
    static splitEarcut(start, triangles, dim, minX, minY, invSize) {
	    // look for a valid diagonal that divides the polygon into two
	    var a = start;
	    do {
	        var b = a.next.next;
	        while (b !== a.prev) {
	            if (a.i !== b.i && GraphicsGeometry.isValidDiagonal(a, b)) {
	                // split the polygon in two by the diagonal
	                var c = GraphicsGeometry.splitPolygon(a, b);

	                // filter colinear points around the cuts
	                a = GraphicsGeometry.filterPoints(a, a.next);
	                c = GraphicsGeometry.filterPoints(c, c.next);

	                // run earcut on each half
	                GraphicsGeometry.earcutLinked(a, triangles, dim, minX, minY, invSize);
	                GraphicsGeometry.earcutLinked(c, triangles, dim, minX, minY, invSize);
	                return;
	            }
	            b = b.next;
	        }
	        a = a.next;
	    } while (a !== start);
    }
    
    	// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
	static isValidDiagonal(a, b) {
	    return a.next.i !== b.i && a.prev.i !== b.i && !GraphicsGeometry.intersectsPolygon(a, b) &&
        GraphicsGeometry.locallyInside(a, b) && GraphicsGeometry.locallyInside(b, a) && GraphicsGeometry.middleInside(a, b);
    }
    
    	// check if the middle point of a polygon diagonal is inside the polygon
    static middleInside(a, b) {
	    var p = a,
	        inside = false,
	        px = (a.x + b.x) / 2,
	        py = (a.y + b.y) / 2;
	    do {
	        if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
	                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
	            { inside = !inside; }
	        p = p.next;
	    } while (p !== a);

	    return inside;
    }
    
    	// check if a polygon diagonal intersects any polygon segments
    static intersectsPolygon(a, b) {
	    var p = a;
	    do {
	        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                GraphicsGeometry.intersects(p, p.next, a, b)) { return true; }
	        p = p.next;
	    } while (p !== a);

	    return false;
    }
    
    	// check if two segments intersect
    static intersects(p1, q1, p2, q2) {
	    if ((GraphicsGeometry.equals(p1, q1) && GraphicsGeometry.equals(p2, q2)) ||
	        (GraphicsGeometry.equals(p1, q2) && GraphicsGeometry.equals(p2, q1))) { return true; }
	    return GraphicsGeometry.area(p1, q1, p2) > 0 !== GraphicsGeometry.area(p1, q1, q2) > 0 &&
        GraphicsGeometry.area(p2, q2, p1) > 0 !== GraphicsGeometry.area(p2, q2, q1) > 0;
    }
    
    	// go through all polygon nodes and cure small local self-intersections
    static cureLocalIntersections(start, triangles, dim) {
	    var p = start;
	    do {
	        var a = p.prev,
	            b = p.next.next;

	        if (!GraphicsGeometry.equals(a, b) && GraphicsGeometry.intersects(a, p, p.next, b) && GraphicsGeometry.locallyInside(a, b) && GraphicsGeometry.locallyInside(b, a)) {

	            triangles.push(a.i / dim);
	            triangles.push(p.i / dim);
	            triangles.push(b.i / dim);

	            // remove two nodes involved
	            GraphicsGeometry.removeNode(p);
	            GraphicsGeometry.removeNode(p.next);

	            p = start = b;
	        }
	        p = p.next;
	    } while (p !== start);

	    return p;
    }
    
    static isEarHashed(ear, minX, minY, invSize) {
	    var a = ear.prev,
	        b = ear,
	        c = ear.next;

	    if (GraphicsGeometry.area(a, b, c) >= 0) { return false; } // reflex, can't be an ear

	    // triangle bbox; min & max are calculated like this for speed
	    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
	        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
	        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
	        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

	    // z-order range for the current triangle bbox;
	    var minZ = GraphicsGeometry.zOrder(minTX, minTY, minX, minY, invSize),
	        maxZ = GraphicsGeometry.zOrder(maxTX, maxTY, minX, minY, invSize);

	    var p = ear.prevZ,
	        n = ear.nextZ;

	    // look for points inside the triangle in both directions
	    while (p && p.z >= minZ && n && n.z <= maxZ) {
	        if (p !== ear.prev && p !== ear.next &&
	            GraphicsGeometry.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
	            GraphicsGeometry.area(p.prev, p, p.next) >= 0) { return false; }
	        p = p.prevZ;

	        if (n !== ear.prev && n !== ear.next &&
	            GraphicsGeometry.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
	            GraphicsGeometry.area(n.prev, n, n.next) >= 0) { return false; }
	        n = n.nextZ;
	    }

	    // look for remaining points in decreasing z-order
	    while (p && p.z >= minZ) {
	        if (p !== ear.prev && p !== ear.next &&
	            GraphicsGeometry.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
	            GraphicsGeometry.area(p.prev, p, p.next) >= 0) { return false; }
	        p = p.prevZ;
	    }

	    // look for remaining points in increasing z-order
	    while (n && n.z <= maxZ) {
	        if (n !== ear.prev && n !== ear.next &&
	            GraphicsGeometry.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
	            GraphicsGeometry.area(n.prev, n, n.next) >= 0) { return false; }
	        n = n.nextZ;
	    }

	    return true;
    }
    
    	// z-order of a point given coords and inverse of the longer side of data bbox
	static zOrder(x, y, minX, minY, invSize) {
	    // coords are transformed into non-negative 15-bit integer range
	    x = 32767 * (x - minX) * invSize;
	    y = 32767 * (y - minY) * invSize;

	    x = (x | (x << 8)) & 0x00FF00FF;
	    x = (x | (x << 4)) & 0x0F0F0F0F;
	    x = (x | (x << 2)) & 0x33333333;
	    x = (x | (x << 1)) & 0x55555555;

	    y = (y | (y << 8)) & 0x00FF00FF;
	    y = (y | (y << 4)) & 0x0F0F0F0F;
	    y = (y | (y << 2)) & 0x33333333;
	    y = (y | (y << 1)) & 0x55555555;

	    return x | (y << 1);
    }
    
    	// check whether a polygon node forms a valid ear with adjacent nodes
	static isEar(ear) {
	    var a = ear.prev,
	        b = ear,
	        c = ear.next;

	    if (GraphicsGeometry.area(a, b, c) >= 0) { return false; } // reflex, can't be an ear

	    // now make sure we don't have other points inside the potential ear
	    var p = ear.next.next;

	    while (p !== ear.prev) {
	        if (GraphicsGeometry.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            GraphicsGeometry.area(p.prev, p, p.next) >= 0) { return false; }
	        p = p.next;
	    }

	    return true;
    }
    
    	// interlink polygon nodes in z-order
	static indexCurve(start, minX, minY, invSize) {
	    var p = start;
	    do {
	        if (p.z === null) { p.z = GraphicsGeometry.zOrder(p.x, p.y, minX, minY, invSize); }
	        p.prevZ = p.prev;
	        p.nextZ = p.next;
	        p = p.next;
	    } while (p !== start);

	    p.prevZ.nextZ = null;
	    p.prevZ = null;

	    GraphicsGeometry.sortLinked(p);
    }
    
    	// Simon Tatham's linked list merge sort algorithm
	// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
	static sortLinked(list) {
	    var i, p, q, e, tail, numMerges, pSize, qSize,
	        inSize = 1;

	    do {
	        p = list;
	        list = null;
	        tail = null;
	        numMerges = 0;

	        while (p) {
	            numMerges++;
	            q = p;
	            pSize = 0;
	            for (i = 0; i < inSize; i++) {
	                pSize++;
	                q = q.nextZ;
	                if (!q) { break; }
	            }
	            qSize = inSize;

	            while (pSize > 0 || (qSize > 0 && q)) {

	                if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
	                    e = p;
	                    p = p.nextZ;
	                    pSize--;
	                } else {
	                    e = q;
	                    q = q.nextZ;
	                    qSize--;
	                }

	                if (tail) { tail.nextZ = e; }
	                else { list = e; }

	                e.prevZ = tail;
	                tail = e;
	            }

	            p = q;
	        }

	        tail.nextZ = null;
	        inSize *= 2;

	    } while (numMerges > 1);

	    return list;
    }

    	/**
	 * Builds a rectangle to draw
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
	 * @param {object} webGLData - an object containing all the WebGL-specific information to create this shape
	 * @param {object} webGLDataNativeLines - an object containing all the WebGL-specific information to create nativeLines
	 */
	static buildRectangle = {

		name: "buildRectangle",
	    build: function build(graphicsData)
	    {
	        // --- //
	        // need to convert points to a nice regular data
	        //
			var rectData = graphicsData.shape;
	        var x = rectData.x;
			var y = rectData.y;
	        var width = rectData.width;
	        var height = rectData.height;

			var points = graphicsData.points;
			

	        points.length = 0;

	        points.push(x, y,
	            x + width, y,
	            x + width, y + height,
				x, y + height);
	    },

	    triangulate: function triangulate(graphicsData, graphicsGeometry)
	    {
			var points = graphicsData.points;
			var verts = graphicsGeometry.points;

	        var vertPos = verts.length / 2;

	        verts.push(points[0], points[1],
	            points[2], points[3],
	            points[6], points[7],
				points[4], points[5]);

	        graphicsGeometry.indices.push(vertPos, vertPos + 1, vertPos + 2,
				vertPos + 1, vertPos + 2, vertPos + 3);
	    },
    };
    
    	/**
	 * Builds a rounded rectangle to draw
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object containing all the necessary properties
	 * @param {object} webGLData - an object containing all the WebGL-specific information to create this shape
	 * @param {object} webGLDataNativeLines - an object containing all the WebGL-specific information to create nativeLines
	 */
	static buildRoundedRectangle = {

		name: "buildRoundedRectangle",
	    build: function build(graphicsData)
	    {
	        var rrectData = graphicsData.shape;
	        var points = graphicsData.points;
	        var x = rrectData.x;
	        var y = rrectData.y;
	        var width = rrectData.width;
	        var height = rrectData.height;

	        var radius = rrectData.radius;

	        points.length = 0;

	        GraphicsGeometry.quadraticBezierCurve(x, y + radius,
	            x, y,
	            x + radius, y,
	            points);
                GraphicsGeometry.quadraticBezierCurve(x + width - radius,
	            y, x + width, y,
	            x + width, y + radius,
	            points);
                GraphicsGeometry.quadraticBezierCurve(x + width, y + height - radius,
	            x + width, y + height,
	            x + width - radius, y + height,
	            points);
                GraphicsGeometry.quadraticBezierCurve(x + radius, y + height,
	            x, y + height,
	            x, y + height - radius,
	            points);

	        // this tiny number deals with the issue that occurs when points overlap and earcut fails to triangulate the item.
	        // TODO - fix this properly, this is not very elegant.. but it works for now.
	    },

	    triangulate: function triangulate(graphicsData, graphicsGeometry)
	    {
	        var points = graphicsData.points;

	        var verts = graphicsGeometry.points;
	        var indices = graphicsGeometry.indices;

	        var vecPos = verts.length / 2;

	        var triangles = GraphicsGeometry.earcut(points, null, 2);

	        for (var i = 0, j = triangles.length; i < j; i += 3)
	        {
	            indices.push(triangles[i] + vecPos);
	            //     indices.push(triangles[i] + vecPos);
	            indices.push(triangles[i + 1] + vecPos);
	            //   indices.push(triangles[i + 2] + vecPos);
	            indices.push(triangles[i + 2] + vecPos);
	        }

	        for (var i$1 = 0, j$1 = points.length; i$1 < j$1; i$1++)
	        {
	            verts.push(points[i$1], points[++i$1]);
	        }
	    },
    };
    
    	/**
	 * Calculate the points for a quadratic bezier curve. (helper function..)
	 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {number} fromX - Origin point x
	 * @param {number} fromY - Origin point x
	 * @param {number} cpX - Control point x
	 * @param {number} cpY - Control point y
	 * @param {number} toX - Destination point x
	 * @param {number} toY - Destination point y
	 * @param {number[]} [out=[]] - The output array to add points into. If not passed, a new array is created.
	 * @return {number[]} an array of points
	 */
	static quadraticBezierCurve(fromX, fromY, cpX, cpY, toX, toY, out)
	{
	    if ( out === void 0 ) { out = []; }

	    var n = 20;
	    var points = out;

	    var xa = 0;
	    var ya = 0;
	    var xb = 0;
	    var yb = 0;
	    var x = 0;
	    var y = 0;

	    for (var i = 0, j = 0; i <= n; ++i)
	    {
	        j = i / n;

	        // The Green Line
	        xa = GraphicsGeometry.getPt(fromX, cpX, j);
	        ya = GraphicsGeometry.getPt(fromY, cpY, j);
	        xb = GraphicsGeometry.getPt(cpX, toX, j);
	        yb = GraphicsGeometry.getPt(cpY, toY, j);

	        // The Black Dot
	        x = GraphicsGeometry.getPt(xa, xb, j);
	        y = GraphicsGeometry.getPt(ya, yb, j);

	        points.push(x, y);
	    }

	    return points;
    }
    
    	/**
	 * Calculate a single point for a quadratic bezier curve.
	 * Utility function used by quadraticBezierCurve.
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {number} n1 - first number
	 * @param {number} n2 - second number
	 * @param {number} perc - percentage
	 * @return {number} the result
	 *
	 */
	static getPt(n1, n2, perc)
	{
	    var diff = n2 - n1;

	    return n1 + (diff * perc);
	}
    
        	/**
	 * Builds a circle to draw
	 *
	 * Ignored from docs since it is not directly exposed.
	 *
	 * @ignore
	 * @private
	 * @param {PIXI.WebGLGraphicsData} graphicsData - The graphics object to draw
	 * @param {object} webGLData - an object containing all the WebGL-specific information to create this shape
	 * @param {object} webGLDataNativeLines - an object containing all the WebGL-specific information to create nativeLines
	 */
	static buildCircle = {

		name: "buildCircle",
	    build: function build(graphicsData)
	    {
	        // need to convert points to a nice regular data
	        var circleData = graphicsData.shape;
	        var points = graphicsData.points;
	        var x = circleData.x;
	        var y = circleData.y;
	        var width;
	        var height;

	        points.length = 0;

	        // TODO - bit hacky??
	        if (graphicsData.type === ShapeSettings.SHAPES.CIRC)
	        {
	            width = circleData.radius;
	            height = circleData.radius;
	        }
	        else
	        {
	            width = circleData.width;
	            height = circleData.height;
	        }

	        if (width === 0 || height === 0)
	        {
	            return;
	        }

	        var totalSegs = Math.floor(30 * Math.sqrt(circleData.radius))
	            || Math.floor(15 * Math.sqrt(circleData.width + circleData.height));

	        totalSegs /= 2.3;

	        var seg = (Math.PI * 2) / totalSegs;

	        for (var i = 0; i < totalSegs; i++)
	        {
	            points.push(
	                x + (Math.sin(-seg * i) * width),
	                y + (Math.cos(-seg * i) * height)
	            );
	        }

	        points.push(
	            points[0],
	            points[1]
	        );
	    },

	    triangulate: function triangulate(graphicsData, graphicsGeometry)
	    {
	        var points = graphicsData.points;
	        var verts = graphicsGeometry.points;
	        var indices = graphicsGeometry.indices;

	        var vertPos = verts.length / 2;
	        var center = vertPos;

	        verts.push(graphicsData.shape.x, graphicsData.shape.y);

	        for (var i = 0; i < points.length; i += 2)
	        {
	            verts.push(points[i], points[i + 1]);

	            // add some uvs
	            indices.push(vertPos++, center, vertPos);
	        }
	    },
	};
}

class Node
{
    i
    x
    nextZ
    y
    prevZ
    steiner
    z
    prev
    next
    constructor(i, x, y)
    {
        // vertex index in coordinates array
        this.i = i;

        // vertex coordinates
        this.x = x;
        this.y = y;

        // previous and next vertex nodes in a polygon ring
        this.prev = null;
        this.next = null;

        // z-order curve value
        this.z = null;

        // previous and next nodes in z-order
        this.prevZ = null;
        this.nextZ = null;

        // indicates whether this is a steiner point
        this.steiner = false;
    }


    
}




