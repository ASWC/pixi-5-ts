
import { Point } from "../flash/geom/Point";
import { MathSettings } from './MathSettings';
import { FlashBaseObject } from "./FlashBaseObject";
import { Transform } from "../flash/geom/Transform";

export class Matrix extends FlashBaseObject
{
    public a:number;
    public b:number;
    public c:number;
    public d:number;
    public tx:number;
    public ty:number;

    constructor(a:number = 1, b:number = 0, c:number = 0, d:number = 1, tx:number = 0, ty:number = 0)
    {
        super();
	    this.a = a;
	    this.b = b;
	    this.c = c;
	    this.d = d;
	    this.tx = tx;
	    this.ty = ty;
    }

    public setTo(a:number, b:number, c:number, d:number, tx:number, ty:number):void
    {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    };

    public toArray(transpose:boolean = true):Float32Array
    {
        let array:Float32Array = new Float32Array(9);
        if (transpose)
        {
            array[0] = this.a;
            array[1] = this.b;
            array[2] = 0;
            array[3] = this.c;
            array[4] = this.d;
            array[5] = 0;
            array[6] = this.tx;
            array[7] = this.ty;
            array[8] = 1;
        }
        else
        {
            array[0] = this.a;
            array[1] = this.c;
            array[2] = this.tx;
            array[3] = this.b;
            array[4] = this.d;
            array[5] = this.ty;
            array[6] = 0;
            array[7] = 0;
            array[8] = 1;
        }
        return array;
    };

    public apply(pos:Point, newPos:Point):Point
    {
        newPos = newPos;
        if(!newPos)
        {
            newPos = Point.getPoint();
        }
        let x:number = pos.x;
        let y:number = pos.y;
        newPos.x = (this.a * x) + (this.c * y) + this.tx;
        newPos.y = (this.b * x) + (this.d * y) + this.ty;
        return newPos;
    };
   
    public applyInverse(pos:Point, newPos:Point):Point
    {
        newPos = newPos
        if(!newPos)
        {
            newPos = Point.getPoint();
        }
        let id:number = 1 / ((this.a * this.d) + (this.c * -this.b));
        let x:number = pos.x;
        let y:number = pos.y;
        newPos.x = (this.d * id * x) + (-this.c * id * y) + (((this.ty * this.c) - (this.tx * this.d)) * id);
        newPos.y = (this.a * id * y) + (-this.b * id * x) + (((-this.ty * this.a) + (this.tx * this.b)) * id);
        return newPos;
    };

    public translate(x:number, y:number):void
    {
        this.tx += x;
        this.ty += y;
    };

    public scale(x:number, y:number):void
    {
        this.a *= x;
        this.d *= y;
        this.c *= x;
        this.b *= y;
        this.tx *= x;
        this.ty *= y;
    };

    public rotate(angle:number):void
    {
        let cos:number = Math.cos(angle);
        let sin:number = Math.sin(angle);
        let a1:number = this.a;
        let c1:number = this.c;
        let tx1:number = this.tx;
        this.a = (a1 * cos) - (this.b * sin);
        this.b = (a1 * sin) + (this.b * cos);
        this.c = (c1 * cos) - (this.d * sin);
        this.d = (c1 * sin) + (this.d * cos);
        this.tx = (tx1 * cos) - (this.ty * sin);
        this.ty = (tx1 * sin) + (this.ty * cos);
    };

    public append(matrix:Matrix):void
    {
        let a1:number = this.a;
        let b1:number = this.b;
        let c1:number = this.c;
        let d1:number = this.d;
        this.a = (matrix.a * a1) + (matrix.b * c1);
        this.b = (matrix.a * b1) + (matrix.b * d1);
        this.c = (matrix.c * a1) + (matrix.d * c1);
        this.d = (matrix.c * b1) + (matrix.d * d1);
        this.tx = (matrix.tx * a1) + (matrix.ty * c1) + this.tx;
        this.ty = (matrix.tx * b1) + (matrix.ty * d1) + this.ty;
    };

    public setTransform(x:number, y:number, pivotX:number, pivotY:number, scaleX:number, scaleY:number, rotation:number, skewX:number, skewY:number):void
    {
        this.a = Math.cos(rotation + skewY) * scaleX;
        this.b = Math.sin(rotation + skewY) * scaleX;
        this.c = -Math.sin(rotation - skewX) * scaleY;
        this.d = Math.cos(rotation - skewX) * scaleY;
        this.tx = x - ((pivotX * this.a) + (pivotY * this.c));
        this.ty = y - ((pivotX * this.b) + (pivotY * this.d));
    };

    public prepend(matrix:Matrix):void
    {
        let tx1:number = this.tx;
        if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1)
        {
            let a1:number = this.a;
            let c1:number = this.c;
            this.a = (a1 * matrix.a) + (this.b * matrix.c);
            this.b = (a1 * matrix.b) + (this.b * matrix.d);
            this.c = (c1 * matrix.a) + (this.d * matrix.c);
            this.d = (c1 * matrix.b) + (this.d * matrix.d);
        }
        this.tx = (tx1 * matrix.a) + (this.ty * matrix.c) + matrix.tx;
        this.ty = (tx1 * matrix.b) + (this.ty * matrix.d) + matrix.ty;
    };

    public decompose(transform:Transform):void
    {
        let a:number = this.a;
        let b:number = this.b;
        let c:number = this.c;
        let d:number = this.d;
        let skewX:number = -Math.atan2(-c, d);
        let skewY:number = Math.atan2(b, a);
        let delta:number = Math.abs(skewX + skewY);
        if (delta < 0.00001 || Math.abs(MathSettings.PI_2 - delta) < 0.00001)
        {
            transform.rotation = skewY;
            transform.skew.x = transform.skew.y = 0;
        }
        else
        {
            transform.rotation = 0;
            transform.skew.x = skewX;
            transform.skew.y = skewY;
        }
        transform.scale.x = Math.sqrt((a * a) + (b * b));
        transform.scale.y = Math.sqrt((c * c) + (d * d));
        transform.position.x = this.tx;
        transform.position.y = this.ty;
    };

    public invert():void
    {
        let a1:number = this.a;
        let b1:number = this.b;
        let c1:number = this.c;
        let d1:number = this.d;
        let tx1:number = this.tx;
        let n:number = (a1 * d1) - (b1 * c1);
        this.a = d1 / n;
        this.b = -b1 / n;
        this.c = -c1 / n;
        this.d = a1 / n;
        this.tx = ((c1 * this.ty) - (d1 * tx1)) / n;
        this.ty = -((a1 * this.ty) - (b1 * tx1)) / n;
    };

    public identity():void
    {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.tx = 0;
        this.ty = 0;
    };

    /**
     * Creates a new Matrix object with the same values as this one.
     *
     * @return {PIXI.Matrix} A copy of this matrix. Good for chaining method calls.
     */
    clone()
    {
        var matrix = new Matrix();

        matrix.a = this.a;
        matrix.b = this.b;
        matrix.c = this.c;
        matrix.d = this.d;
        matrix.tx = this.tx;
        matrix.ty = this.ty;

        return matrix;
    };


    /**
     * Changes the values of the given matrix to be the same as the ones in this matrix
     *
     * @param {PIXI.Matrix} matrix - The matrix to copy to.
     * @return {PIXI.Matrix} The matrix given in parameter with its values updated.
     */
    copyTo(matrix)
    {
        matrix.a = this.a;
        matrix.b = this.b;
        matrix.c = this.c;
        matrix.d = this.d;
        matrix.tx = this.tx;
        matrix.ty = this.ty;

        return matrix;
    };

    /**
     * Changes the values of the matrix to be the same as the ones in given matrix
     *
     * @param {PIXI.Matrix} matrix - The matrix to copy from.
     * @return {PIXI.Matrix} this
     */
    copyFrom(matrix)
    {
        this.a = matrix.a;
        this.b = matrix.b;
        this.c = matrix.c;
        this.d = matrix.d;
        this.tx = matrix.tx;
        this.ty = matrix.ty;

        return this;
    };

    /**
     * A default (identity) matrix
     *
     * @static
     * @const
     * @member {PIXI.Matrix}
     */
    static get IDENTITY ()
    {
        return new Matrix();
    };

    /**
     * A temp matrix
     *
     * @static
     * @const
     * @member {PIXI.Matrix}
     */
    static get TEMP_MATRIX ()
    {
        return new Matrix();
    };



    public fromArray(array:number[]):void
    {
        this.a = array[0];
        this.b = array[1];
        this.c = array[3];
        this.d = array[4];
        this.tx = array[2];
        this.ty = array[5];
    };
}






