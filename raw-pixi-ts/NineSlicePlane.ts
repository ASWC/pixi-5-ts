import { SimplePlane } from "./SimplePlane";
import { Texture } from "./Texture";
import { settings } from "./settings";

export class NineSlicePlane extends SimplePlane
{

	static DEFAULT_BORDER_SIZE = 10;
    _origWidth
    _origHeight
    _topHeight
    _leftWidth
    _rightWidth
    _bottomHeight
    constructor(texture, leftWidth, topHeight, rightWidth, bottomHeight)
    {
        super(Texture.WHITE, 4, 4);
        this._origWidth = texture.orig.width;
        this._origHeight = texture.orig.height;

        /**
         * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
         *
         * @member {number}
         * @override
         */
        this._width = this._origWidth;

        /**
         * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
         *
         * @member {number}
         * @override
         */
        this._height = this._origHeight;

        /**
         * The width of the left column (a)
         *
         * @member {number}
         * @private
         */
        this._leftWidth = typeof leftWidth !== 'undefined' ? leftWidth : NineSlicePlane.DEFAULT_BORDER_SIZE;

        /**
         * The width of the right column (b)
         *
         * @member {number}
         * @private
         */
        this._rightWidth = typeof rightWidth !== 'undefined' ? rightWidth : NineSlicePlane.DEFAULT_BORDER_SIZE;

        /**
         * The height of the top row (c)
         *
         * @member {number}
         * @private
         */
        this._topHeight = typeof topHeight !== 'undefined' ? topHeight : NineSlicePlane.DEFAULT_BORDER_SIZE;

        /**
         * The height of the bottom row (d)
         *
         * @member {number}
         * @private
         */
        this._bottomHeight = typeof bottomHeight !== 'undefined' ? bottomHeight : NineSlicePlane.DEFAULT_BORDER_SIZE;

        // lets call the setter to ensure all necessary updates are performed
        this.texture = texture;
    }

    textureUpdated ()
    {
        this._textureID = this.shader.texture._updateID;
        this._refresh();
    };

    get vertices ()
    {
        return this.geometry.getAttribute('aVertexPosition').data;
    };

    set vertices (value)
    {
        this.geometry.getAttribute('aVertexPosition').data = value;
    };

    /**
     * Updates the horizontal vertices.
     *
     */
    updateHorizontalVertices  ()
    {
        var vertices = this.vertices;

        var h = this._topHeight + this._bottomHeight;
        var scale = this._height > h ? 1.0 : this._height / h;

        vertices[9] = vertices[11] = vertices[13] = vertices[15] = this._topHeight * scale;
        vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - (this._bottomHeight * scale);
        vertices[25] = vertices[27] = vertices[29] = vertices[31] = this._height;
    };

    /**
     * Updates the vertical vertices.
     *
     */
    updateVerticalVertices  ()
    {
        var vertices = this.vertices;

        var w = this._leftWidth + this._rightWidth;
        var scale = this._width > w ? 1.0 : this._width / w;

        vertices[2] = vertices[10] = vertices[18] = vertices[26] = this._leftWidth * scale;
        vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - (this._rightWidth * scale);
        vertices[6] = vertices[14] = vertices[22] = vertices[30] = this._width;
    };

    /**
     * The width of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     */
    get width ()
    {
        return this._width;
    };

    set width (value) // eslint-disable-line require-jsdoc
    {
        this._width = value;
        this._refresh();
    };

    /**
     * The height of the NineSlicePlane, setting this will actually modify the vertices and UV's of this plane
     *
     * @member {number}
     */
    get height ()
    {
        return this._height;
    };

    set height (value) // eslint-disable-line require-jsdoc
    {
        this._height = value;
        this._refresh();
    };

    /**
     * The width of the left column
     *
     * @member {number}
     */
    get leftWidth ()
    {
        return this._leftWidth;
    };

    set leftWidth (value) // eslint-disable-line require-jsdoc
    {
        this._leftWidth = value;
        this._refresh();
    };

    /**
     * The width of the right column
     *
     * @member {number}
     */
    get rightWidth()
    {
        return this._rightWidth;
    };

    set rightWidth(value) // eslint-disable-line require-jsdoc
    {
        this._rightWidth = value;
        this._refresh();
    };

    /**
     * The height of the top row
     *
     * @member {number}
     */
    get topHeight ()
    {
        return this._topHeight;
    };

    set topHeight (value) // eslint-disable-line require-jsdoc
    {
        this._topHeight = value;
        this._refresh();
    };

    /**
     * The height of the bottom row
     *
     * @member {number}
     */
    get bottomHeight ()
    {
        return this._bottomHeight;
    };

    set bottomHeight (value) // eslint-disable-line require-jsdoc
    {
        this._bottomHeight = value;
        this._refresh();
    };

    /**
     * Refreshes NineSlicePlane coords. All of them.
     */
    _refresh ()
    {
        var texture = this.texture;

        var uvs = this.geometry.buffers[1].data;

        this._origWidth = texture.orig.width;
        this._origHeight = texture.orig.height;

        var _uvw = 1.0 / this._origWidth;
        var _uvh = 1.0 / this._origHeight;

        uvs[0] = uvs[8] = uvs[16] = uvs[24] = 0;
        uvs[1] = uvs[3] = uvs[5] = uvs[7] = 0;
        uvs[6] = uvs[14] = uvs[22] = uvs[30] = 1;
        uvs[25] = uvs[27] = uvs[29] = uvs[31] = 1;

        uvs[2] = uvs[10] = uvs[18] = uvs[26] = _uvw * this._leftWidth;
        uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - (_uvw * this._rightWidth);
        uvs[9] = uvs[11] = uvs[13] = uvs[15] = _uvh * this._topHeight;
        uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - (_uvh * this._bottomHeight);

        this.updateHorizontalVertices();
        this.updateVerticalVertices();

        this.geometry.buffers[0].update();
        this.geometry.buffers[1].update();
    };
}

