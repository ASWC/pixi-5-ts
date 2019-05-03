import { Matrix } from './Matrix';


export class TextureMatrix
{
	static tempMat = new Matrix();
    _texture
    mapCoord
    uClampOffset
    clampOffset
    isSimple
    _updateID
    clampMargin
    uClampFrame
    constructor(texture, clampMargin = null)
    {
        this._texture = texture;

	    this.mapCoord = new Matrix();

	    this.uClampFrame = new Float32Array(4);

	    this.uClampOffset = new Float32Array(2);

	    /**
	     * Tracks Texture frame changes
	     * @member {number}
	     * @protected
	     */
	    this._updateID = -1;

	    /**
	     * Changes frame clamping
	     * Works with TilingSprite and Mesh
	     * Change to 1.5 if you texture has repeated right and bottom lines, that leads to smoother borders
	     *
	     * @default 0
	     * @member {number}
	     */
	    this.clampOffset = 0;

	    /**
	     * Changes frame clamping
	     * Works with TilingSprite and Mesh
	     * Change to -0.5 to add a pixel to the edge, recommended for transparent trimmed textures in atlas
	     *
	     * @default 0.5
	     * @member {number}
	     */
	    this.clampMargin = (typeof clampMargin === 'undefined') ? 0.5 : clampMargin;

	    /**
	     * If texture size is the same as baseTexture
	     * @member {boolean}
	     * @default false
	     * @readonly
	     */
	    this.isSimple = false;
    }

    /**
	 * texture property
	 * @member {PIXI.Texture}
	 */
	get texture ()
	{
	    return this._texture;
	};

	set texture (value) // eslint-disable-line require-jsdoc
	{
	    this._texture = value;
	    this._updateID = -1;
	};

	/**
	 * Multiplies uvs array to transform
	 * @param {Float32Array} uvs mesh uvs
	 * @param {Float32Array} [out=uvs] output
	 * @returns {Float32Array} output
	 */
	multiplyUvs  (uvs, out)
	{
	    if (out === undefined)
	    {
	        out = uvs;
	    }

	    var mat = this.mapCoord;

	    for (var i = 0; i < uvs.length; i += 2)
	    {
	        var x = uvs[i];
	        var y = uvs[i + 1];

	        out[i] = (x * mat.a) + (y * mat.c) + mat.tx;
	        out[i + 1] = (x * mat.b) + (y * mat.d) + mat.ty;
	    }

	    return out;
	};

	/**
	 * updates matrices if texture was changed
	 * @param {boolean} forceUpdate if true, matrices will be updated any case
	 * @returns {boolean} whether or not it was updated
	 */
	update  (forceUpdate)
	{
	    var tex = this._texture;

	    if (!tex || !tex.valid)
	    {
	        return false;
	    }

	    if (!forceUpdate
	        && this._updateID === tex._updateID)
	    {
	        return false;
	    }

	    this._updateID = tex._updateID;

	    var uvs = tex._uvs;

	    this.mapCoord.set(uvs.x1 - uvs.x0, uvs.y1 - uvs.y0, uvs.x3 - uvs.x0, uvs.y3 - uvs.y0, uvs.x0, uvs.y0);

	    var orig = tex.orig;
	    var trim = tex.trim;

	    if (trim)
	    {
	        TextureMatrix.tempMat.setTo(orig.width / trim.width, 0, 0, orig.height / trim.height,
	            -trim.x / trim.width, -trim.y / trim.height);
	        this.mapCoord.append(TextureMatrix.tempMat);
	    }

	    var texBase = tex.baseTexture;
	    var frame = this.uClampFrame;
	    var margin = this.clampMargin / texBase.resolution;
	    var offset = this.clampOffset;

	    frame[0] = (tex._frame.x + margin + offset) / texBase.width;
	    frame[1] = (tex._frame.y + margin + offset) / texBase.height;
	    frame[2] = (tex._frame.x + tex._frame.width - margin + offset) / texBase.width;
	    frame[3] = (tex._frame.y + tex._frame.height - margin + offset) / texBase.height;
	    this.uClampOffset[0] = offset / texBase.realWidth;
	    this.uClampOffset[1] = offset / texBase.realHeight;

	    this.isSimple = tex._frame.width === texBase.width
	        && tex._frame.height === texBase.height
	        && tex.rotate === 0;

	    return true;
	};
}



	
