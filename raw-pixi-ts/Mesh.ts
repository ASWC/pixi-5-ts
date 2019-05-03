import { Container } from './Container';
import { State } from './State';
import { Polygon } from './Polygon';
import { MeshBatchUvs } from './MeshBatchUvs';
import { Point } from '../flash/geom/Point';
import { DrawModeSettings } from './DrawModeSettings';
import { BlendModesSettings } from './BlendModesSettings';
import { DisplaySettings } from './DisplaySettings';

export class Mesh extends Container
{
    static tempPolygon = new Polygon();
    /**
	 * The maximum number of vertices to consider batchable. Generally, the complexity
	 * of the geometry.
	 * @memberof PIXI.Mesh
	 * @static
	 * @member {number} BATCHABLE_SIZE
	 */
	static BATCHABLE_SIZE = 100;
    geometry
    state
    _tintRGB
    start
    drawMode
    _texture
    _transformID
    uvs
    
    vertexDirty
    vertexData
    batchUvs
    
    _roundPixels
    indices
    size
    shader
    constructor(geometry, shader, state = null, drawMode = DrawModeSettings.DRAW_MODES.TRIANGLES)
    {
        super();
        this.interactive = false;
        /**
         * Includes vertex positions, face indices, normals, colors, UVs, and
         * custom attributes within buffers, reducing the cost of passing all
         * this data to the GPU. Can be shared between multiple Mesh objects.
         * @member {PIXI.Geometry}
         * @readonly
         */
        this.geometry = geometry;

        geometry.refCount++;

        /**
         * Represents the vertex and fragment shaders that processes the geometry and runs on the GPU.
         * Can be shared between multiple Mesh objects.
         * @member {PIXI.Shader|PIXI.MeshMaterial}
         */
        this.shader = shader;

        /**
         * Represents the WebGL state the Mesh required to render, excludes shader and geometry. E.g.,
         * blend mode, culling, depth testing, direction of rendering triangles, backface, etc.
         * @member {PIXI.State}
         */
        this.state = state || State.for2d();

        /**
         * The way the Mesh should be drawn, can be any of the {@link PIXI.DRAW_MODES} constants.
         *
         * @member {number}
         * @see PIXI.DRAW_MODES
         */
        this.drawMode = drawMode;

        /**
         * Typically the index of the IndexBuffer where to start drawing.
         * @member {number}
         * @default 0
         */
        this.start = 0;

        /**
         * How much of the geometry to draw, by default `0` renders everything.
         * @member {number}
         * @default 0
         */
        this.size = 0;

        /**
         * thease are used as easy access for batching
         * @member {Float32Array}
         * @private
         */
        this.uvs = null;

        /**
         * thease are used as easy access for batching
         * @member {Uint16Array}
         * @private
         */
        this.indices = null;

        /**
         * this is the caching layer used by the batcher
         * @member {Float32Array}
         * @private
         */
        this.vertexData = new Float32Array(1);

        /**
         * If geometry is changed used to decide to re-transform
         * the vertexData.
         * @member {number}
         * @private
         */
        this.vertexDirty = 0;

        this._transformID = -1;

        // Inherited from DisplayMode, set defaults
        this.tint = 0xFFFFFF;
        this.blendMode = BlendModesSettings.BLEND_MODES.NORMAL;

        /**
         * Internal roundPixels field
         *
         * @member {boolean}
         * @private
         */
        this._roundPixels = DisplaySettings.ROUND_PIXELS;

        /**
         * Batched UV's are cached for atlas textures
         * @member {PIXI.MeshBatchUvs}
         * @private
         */
        this.batchUvs = null;
    }

    /**
     * To change mesh uv's, change its uvBuffer data and increment its _updateID.
     * @member {PIXI.Buffer}
     * @readonly
     */
    get uvBuffer ()
    {
        return this.geometry.buffers[1].data;
    };

    /**
     * To change mesh vertices, change its uvBuffer data and increment its _updateID.
     * Incrementing _updateID is optional because most of Mesh objects do it anyway.
     * @member {PIXI.Buffer}
     * @readonly
     */
    get verticesBuffer ()
    {
        return this.geometry.buffers[0].data;
    };

    /**
     * Alias for {@link PIXI.Mesh#shader}.
     * @member {PIXI.Shader|PIXI.MeshMaterial}
     */
    set material (value)
    {
        this.shader = value;
    };

    get material ()
    {
        return this.shader;
    };

    /**
     * The blend mode to be applied to the Mesh. Apply a value of
     * `PIXI.BLEND_MODES.NORMAL` to reset the blend mode.
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL;
     * @see PIXI.BLEND_MODES
     */
    set blendMode (value)
    {
        this.state.blendMode = value;
    };

    get blendMode ()
    {
        return this.state.blendMode;
    };

    /**
     * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
     * Advantages can include sharper image quality (like text) and faster rendering on canvas.
     * The main disadvantage is movement of objects may appear less smooth.
     * To set the global default, change {@link PIXI.settings.ROUND_PIXELS}
     *
     * @member {boolean}
     * @default false
     */
    set roundPixels (value)
    {
        if (this._roundPixels !== value)
        {
            this._transformID = -1;
        }
        this._roundPixels = value;
    };

    get roundPixels ()
    {
        return this._roundPixels;
    };

    /**
     * The multiply tint applied to the Mesh. This is a hex value. A value of
     * `0xFFFFFF` will remove any tint effect.
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    get tint ()
    {
        return this.shader.tint;
    };

    set tint (value)
    {
        this.shader.tint = value;
    };

    /**
     * The texture that the Mesh uses.
     *
     * @member {PIXI.Texture}
     */
    get texture ()
    {
        return this.shader.texture;
    };

    set texture (value)
    {
        this.shader.texture = value;
    };

    /**
     * Standard renderer draw.
     * @protected
     */
    _render  (renderer)
    {
        // set properties for batching..
        // TODO could use a different way to grab verts?
        var vertices = this.geometry.buffers[0].data;

        // TODO benchmark check for attribute size..
        if (this.shader.batchable && this.drawMode === DrawModeSettings.DRAW_MODES.TRIANGLES && vertices.length < Mesh.BATCHABLE_SIZE * 2)
        {
            this._renderToBatch(renderer);
        }
        else
        {
            this._renderDefault(renderer);
        }
    };

    /**
     * Standard non-batching way of rendering.
     * @protected
     * @param {PIXI.Renderer} renderer - Instance to renderer.
     */
    _renderDefault (renderer)
    {
        var shader = this.shader;

        shader.alpha = this.worldAlpha;
        if (shader.update)
        {
            shader.update();
        }

        renderer.batch.flush();

        if (shader.program.uniformData.translationMatrix)
        {
            shader.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);
        }

        // bind and sync uniforms..
        renderer.shader.bind(shader);

        // set state..
        renderer.state.setState(this.state);

        // bind the geometry...
        renderer.geometry.bind(this.geometry, shader);

        // then render it
        renderer.geometry.draw(this.drawMode, this.size, this.start, this.geometry.instanceCount);
    };

    /**
     * Rendering by using the Batch system.
     * @protected
     * @param {PIXI.Renderer} renderer - Instance to renderer.
     */
    _renderToBatch (renderer)
    {
        var geometry = this.geometry;

        if (this.shader.uvMatrix)
        {
            this.shader.uvMatrix.update();
            this.calculateUvs();
        }

        // set properties for batching..
        this.calculateVertices();
        this.indices = geometry.indexBuffer.data;
        this._tintRGB = this.shader._tintRGB;
        this._texture = this.shader.texture;

        var pluginName = this.material.pluginName;

        renderer.batch.setObjectRenderer(renderer.plugins[pluginName]);
        renderer.plugins[pluginName].render(this);
    };

    /**
     * Updates vertexData field based on transform and vertices
     */
    calculateVertices ()
    {
        var geometry = this.geometry;
        var vertices = geometry.buffers[0].data;

        if (geometry.vertexDirtyId === this.vertexDirty && this._transformID === this.transform._worldID)
        {
            return;
        }

        this._transformID = this.transform._worldID;

        if (this.vertexData.length !== vertices.length)
        {
            this.vertexData = new Float32Array(vertices.length);
        }

        var wt = this.transform.worldTransform;
        var a = wt.a;
        var b = wt.b;
        var c = wt.c;
        var d = wt.d;
        var tx = wt.tx;
        var ty = wt.ty;

        var vertexData = this.vertexData;

        for (var i = 0; i < vertexData.length / 2; i++)
        {
            var x = vertices[(i * 2)];
            var y = vertices[(i * 2) + 1];

            vertexData[(i * 2)] = (a * x) + (c * y) + tx;
            vertexData[(i * 2) + 1] = (b * x) + (d * y) + ty;
        }

        if (this._roundPixels)
        {
            for (var i$1 = 0; i$1 < vertexData.length; i$1++)
            {
                vertexData[i$1] = Math.round(vertexData[i$1]);
            }
        }

        this.vertexDirty = geometry.vertexDirtyId;
    };

    /**
     * Updates uv field based on from geometry uv's or batchUvs
     */
    calculateUvs  ()
    {
        var geomUvs = this.geometry.buffers[1];

        if (!this.shader.uvMatrix.isSimple)
        {
            if (!this.batchUvs)
            {
                this.batchUvs = new MeshBatchUvs(geomUvs, this.shader.uvMatrix);
            }
            this.batchUvs.update();
            this.uvs = this.batchUvs.data;
        }
        else
        {
            this.uvs = geomUvs.data;
        }
    };

    /**
     * Updates the bounds of the mesh as a rectangle. The bounds calculation takes the worldTransform into account.
     * there must be a aVertexPosition attribute present in the geometry for bounds to be calculated correctly.
     *
     * @protected
     */
    _calculateBounds ()
    {
        this.calculateVertices();

        this._bounds.addVertexData(this.vertexData, 0, this.vertexData.length);
    };

    /**
     * Tests if a point is inside this mesh. Works only for PIXI.DRAW_MODES.TRIANGLES.
     *
     * @param {PIXI.Point} point the point to test
     * @return {boolean} the result of the test
     */
    containsPoint  (point)
    {
        if(!this.interactive)
        {
            return false;
        }
        if (!this.getBounds().contains(point.x, point.y))
        {
            return false;
        }

        let defaultpoint:Point = Point.DEFAULT;
        this.worldTransform.applyInverse(point, defaultpoint);

        var vertices = this.geometry.getAttribute('aVertexPosition').data;

        var points = Mesh.tempPolygon.points;
        var indices =  this.geometry.getIndex().data;
        var len = indices.length;
        var step = this.drawMode === 4 ? 3 : 1;

        for (var i = 0; i + 2 < len; i += step)
        {
            var ind0 = indices[i] * 2;
            var ind1 = indices[i + 1] * 2;
            var ind2 = indices[i + 2] * 2;

            points[0] = vertices[ind0];
            points[1] = vertices[ind0 + 1];
            points[2] = vertices[ind1];
            points[3] = vertices[ind1 + 1];
            points[4] = vertices[ind2];
            points[5] = vertices[ind2 + 1];

            if (Mesh.tempPolygon.contains(defaultpoint.x, defaultpoint.y))
            {
                return true;
            }
        }

        return false;
    };
    /**
     * Destroys the Mesh object.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all
     *  options have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have
     *  their destroy method called as well. 'options' will be passed on to those calls.
     */
    destroy (options)
    {
        super.destroy(options);

        this.geometry.refCount--;
        if (this.geometry.refCount === 0)
        {
            this.geometry.dispose();
        }

        this.geometry = null;
        this.shader = null;
        this.state = null;
        this.uvs = null;
        this.indices = null;
        this.vertexData = null;
    };
}

