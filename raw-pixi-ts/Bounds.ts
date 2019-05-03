import { Rectangle } from "../flash/geom/Rectangle";
import { trace } from "./Logger";
import { InstanceCounter } from "./InstanceCounter";
import { FlashBaseObject } from "./FlashBaseObject";


export class Bounds extends FlashBaseObject
{
    minX
    maxX
    rect
    maxY
    minY
    updateID
    constructor()
    {
		super();
        /**
	     * @member {number}
	     * @default 0
	     */
	    this.minX = Infinity;

	    /**
	     * @member {number}
	     * @default 0
	     */
	    this.minY = Infinity;

	    /**
	     * @member {number}
	     * @default 0
	     */
	    this.maxX = -Infinity;

	    /**
	     * @member {number}
	     * @default 0
	     */
	    this.maxY = -Infinity;

	    this.rect = null;
    }

    	/**
	 * Checks if bounds are empty.
	 *
	 * @return {boolean} True if empty.
	 */
	isEmpty  ()
	{
	    return this.minX > this.maxX || this.minY > this.maxY;
	};

	/**
	 * Clears the bounds and resets.
	 *
	 */
	clear  ()
	{
	    this.updateID++;

	    this.minX = Infinity;
	    this.minY = Infinity;
	    this.maxX = -Infinity;
	    this.maxY = -Infinity;
    };
    
    	/**
	 * Can return Rectangle.EMPTY constant, either construct new rectangle, either use your rectangle
	 * It is not guaranteed that it will return tempRect
	 *
	 * @param {PIXI.Rectangle} rect - temporary object will be used if AABB is not empty
	 * @returns {PIXI.Rectangle} A rectangle of the bounds
	 */
	getRectangle (rect)
	{
	    if (this.minX > this.maxX || this.minY > this.maxY)
	    {
			InstanceCounter.addCall("Rectangle.getRectangle", "Bounds getRectangle")
	        return Rectangle.getRectangle();
	    }
		
		rect = rect;
		if(!rect)
		{
			InstanceCounter.addCall("Rectangle.getRectangle", "Bounds getRectangle")
			rect = Rectangle.getRectangle(0, 0, 1, 1);
		}
		

	    rect.x = this.minX;
	    rect.y = this.minY;
	    rect.width = this.maxX - this.minX;
	    rect.height = this.maxY - this.minY;

	    return rect;
	};

	/**
	 * This function should be inlined when its possible.
	 *
	 * @param {PIXI.Point} point - The point to add.
	 */
	addPoint  (point)
	{
	    this.minX = Math.min(this.minX, point.x);
	    this.maxX = Math.max(this.maxX, point.x);
	    this.minY = Math.min(this.minY, point.y);
	    this.maxY = Math.max(this.maxY, point.y);
    };
    
    /**
	 * Adds a quad, not transformed
	 *
	 * @param {Float32Array} vertices - The verts to add.
	 */
	addQuad  (vertices)
	{
	    var minX = this.minX;
	    var minY = this.minY;
	    var maxX = this.maxX;
	    var maxY = this.maxY;

	    var x = vertices[0];
	    var y = vertices[1];

	    minX = x < minX ? x : minX;
	    minY = y < minY ? y : minY;
	    maxX = x > maxX ? x : maxX;
	    maxY = y > maxY ? y : maxY;

	    x = vertices[2];
	    y = vertices[3];
	    minX = x < minX ? x : minX;
	    minY = y < minY ? y : minY;
	    maxX = x > maxX ? x : maxX;
	    maxY = y > maxY ? y : maxY;

	    x = vertices[4];
	    y = vertices[5];
	    minX = x < minX ? x : minX;
	    minY = y < minY ? y : minY;
	    maxX = x > maxX ? x : maxX;
	    maxY = y > maxY ? y : maxY;

	    x = vertices[6];
	    y = vertices[7];
	    minX = x < minX ? x : minX;
	    minY = y < minY ? y : minY;
	    maxX = x > maxX ? x : maxX;
	    maxY = y > maxY ? y : maxY;

	    this.minX = minX;
	    this.minY = minY;
	    this.maxX = maxX;
	    this.maxY = maxY;
	};

	/**
	 * Adds sprite frame, transformed.
	 *
	 * @param {PIXI.Transform} transform - TODO
	 * @param {number} x0 - TODO
	 * @param {number} y0 - TODO
	 * @param {number} x1 - TODO
	 * @param {number} y1 - TODO
	 */
	addFrame  (transform, x0, y0, x1, y1)
	{
	    var matrix = transform.worldTransform;
	    var a = matrix.a;
	    var b = matrix.b;
	    var c = matrix.c;
	    var d = matrix.d;
	    var tx = matrix.tx;
	    var ty = matrix.ty;

	    var minX = this.minX;
	    var minY = this.minY;
	    var maxX = this.maxX;
	    var maxY = this.maxY;

	    var x = (a * x0) + (c * y0) + tx;
	    var y = (b * x0) + (d * y0) + ty;

	    minX = x < minX ? x : minX;
	    minY = y < minY ? y : minY;
	    maxX = x > maxX ? x : maxX;
	    maxY = y > maxY ? y : maxY;

	    x = (a * x1) + (c * y0) + tx;
	    y = (b * x1) + (d * y0) + ty;
	    minX = x < minX ? x : minX;
	    minY = y < minY ? y : minY;
	    maxX = x > maxX ? x : maxX;
	    maxY = y > maxY ? y : maxY;

	    x = (a * x0) + (c * y1) + tx;
	    y = (b * x0) + (d * y1) + ty;
	    minX = x < minX ? x : minX;
	    minY = y < minY ? y : minY;
	    maxX = x > maxX ? x : maxX;
	    maxY = y > maxY ? y : maxY;

	    x = (a * x1) + (c * y1) + tx;
	    y = (b * x1) + (d * y1) + ty;
	    minX = x < minX ? x : minX;
	    minY = y < minY ? y : minY;
	    maxX = x > maxX ? x : maxX;
	    maxY = y > maxY ? y : maxY;

	    this.minX = minX;
	    this.minY = minY;
	    this.maxX = maxX;
	    this.maxY = maxY;
	};

	/**
	 * Adds screen vertices from array
	 *
	 * @param {Float32Array} vertexData - calculated vertices
	 * @param {number} beginOffset - begin offset
	 * @param {number} endOffset - end offset, excluded
	 */
	addVertexData  (vertexData, beginOffset, endOffset)
	{
	    var minX = this.minX;
	    var minY = this.minY;
	    var maxX = this.maxX;
	    var maxY = this.maxY;

	    for (var i = beginOffset; i < endOffset; i += 2)
	    {
	        var x = vertexData[i];
	        var y = vertexData[i + 1];

	        minX = x < minX ? x : minX;
	        minY = y < minY ? y : minY;
	        maxX = x > maxX ? x : maxX;
	        maxY = y > maxY ? y : maxY;
	    }

	    this.minX = minX;
	    this.minY = minY;
	    this.maxX = maxX;
	    this.maxY = maxY;
	};

	/**
	 * Add an array of mesh vertices
	 *
	 * @param {PIXI.Transform} transform - mesh transform
	 * @param {Float32Array} vertices - mesh coordinates in array
	 * @param {number} beginOffset - begin offset
	 * @param {number} endOffset - end offset, excluded
	 */
	addVertices  (transform, vertices, beginOffset, endOffset)
	{
	    var matrix = transform.worldTransform;
	    var a = matrix.a;
	    var b = matrix.b;
	    var c = matrix.c;
	    var d = matrix.d;
	    var tx = matrix.tx;
	    var ty = matrix.ty;

	    var minX = this.minX;
	    var minY = this.minY;
	    var maxX = this.maxX;
	    var maxY = this.maxY;

	    for (var i = beginOffset; i < endOffset; i += 2)
	    {
	        var rawX = vertices[i];
	        var rawY = vertices[i + 1];
	        var x = (a * rawX) + (c * rawY) + tx;
	        var y = (d * rawY) + (b * rawX) + ty;

	        minX = x < minX ? x : minX;
	        minY = y < minY ? y : minY;
	        maxX = x > maxX ? x : maxX;
	        maxY = y > maxY ? y : maxY;
	    }

	    this.minX = minX;
	    this.minY = minY;
	    this.maxX = maxX;
	    this.maxY = maxY;
	};

	/**
	 * Adds other Bounds
	 *
	 * @param {PIXI.Bounds} bounds - TODO
	 */
	addBounds  (bounds)
	{
	    var minX = this.minX;
	    var minY = this.minY;
	    var maxX = this.maxX;
	    var maxY = this.maxY;

	    this.minX = bounds.minX < minX ? bounds.minX : minX;
	    this.minY = bounds.minY < minY ? bounds.minY : minY;
	    this.maxX = bounds.maxX > maxX ? bounds.maxX : maxX;
	    this.maxY = bounds.maxY > maxY ? bounds.maxY : maxY;
	};

	/**
	 * Adds other Bounds, masked with Bounds
	 *
	 * @param {PIXI.Bounds} bounds - TODO
	 * @param {PIXI.Bounds} mask - TODO
	 */
	addBoundsMask  (bounds, mask)
	{
	    var _minX = bounds.minX > mask.minX ? bounds.minX : mask.minX;
	    var _minY = bounds.minY > mask.minY ? bounds.minY : mask.minY;
	    var _maxX = bounds.maxX < mask.maxX ? bounds.maxX : mask.maxX;
	    var _maxY = bounds.maxY < mask.maxY ? bounds.maxY : mask.maxY;

	    if (_minX <= _maxX && _minY <= _maxY)
	    {
	        var minX = this.minX;
	        var minY = this.minY;
	        var maxX = this.maxX;
	        var maxY = this.maxY;

	        this.minX = _minX < minX ? _minX : minX;
	        this.minY = _minY < minY ? _minY : minY;
	        this.maxX = _maxX > maxX ? _maxX : maxX;
	        this.maxY = _maxY > maxY ? _maxY : maxY;
	    }
	};

	/**
	 * Adds other Bounds, masked with Rectangle
	 *
	 * @param {PIXI.Bounds} bounds - TODO
	 * @param {PIXI.Rectangle} area - TODO
	 */
	addBoundsArea  (bounds, area)
	{
	    var _minX = bounds.minX > area.x ? bounds.minX : area.x;
	    var _minY = bounds.minY > area.y ? bounds.minY : area.y;
	    var _maxX = bounds.maxX < area.x + area.width ? bounds.maxX : (area.x + area.width);
	    var _maxY = bounds.maxY < area.y + area.height ? bounds.maxY : (area.y + area.height);

	    if (_minX <= _maxX && _minY <= _maxY)
	    {
	        var minX = this.minX;
	        var minY = this.minY;
	        var maxX = this.maxX;
	        var maxY = this.maxY;

	        this.minX = _minX < minX ? _minX : minX;
	        this.minY = _minY < minY ? _minY : minY;
	        this.maxX = _maxX > maxX ? _maxX : maxX;
	        this.maxY = _maxY > maxY ? _maxY : maxY;
	    }
	};

}
