import { FlashBaseObject } from "../../raw-pixi-ts/FlashBaseObject";
import { InstanceCounter } from "../../raw-pixi-ts/InstanceCounter";



export class Point extends FlashBaseObject
{
	protected static cachedInstances:Point[] = [];
	protected static _Rect:Point;
    protected _x:number;
	protected _y:number;
	
    constructor(x:number = 0, y:number = 0)
    {
		super();
	    this._x = x;
		this._y = y;
		InstanceCounter.count(this);
	}

	public get length():number
	{
	    return Point.distance(Point.DEFAULT, this);
	};
	
	public get x():number
	{
	    return this._x;
	};

	public set x(value:number)
	{
	    this._x = value;
	};

	public get y():number
	{
	    return this._y;
	};

	public set y(value:number)
	{
	    this._y = value;
	};

	public subtract(v:Point):Point
	{
		let point:Point = new Point();
		point.x = this._x - v.x;
		point.y = this._y - v.y;
		return point;
	}

	public setTo(xa:number, ya:number):void
	{
		this._x = xa;
		this._y = ya;
	}

	public offset(dx:number, dy:number):void
	{
		this._x += dx;
		this._y += dy;
	}

	public normalize(thickness:number):void
	{
		let norm:number = Math.sqrt(this._x * this._x + this._y * this._y);
		this._x = this._x / norm * thickness;
		this._y = this._y / norm * thickness;
	}

	public add(v:Point):Point
	{
		let point:Point = new Point();
		point.x = v.x + this._x;
		point.y = v.y + this._y;
		return point;
	}

	public set(x:number = 0, y:number = 0):void
	{
	    this._x = x;
	    this._y = y;
	};

	public equals(p:Point):boolean
	{
	    return (p._x === this._x) && (p._y === this._y);
    };
    
	public copyTo(p:Point):Point
	{
	    p.set(this._x, this._y);
	    return p;
	};

	public copyFrom(p:Point):Point
	{
	    this.set(p._x, p._y);
	    return this;
	};

	public clone():Point
	{
	    return new Point(this._x, this._y);
	};

	public reset(x:number = 0, y:number = 0):void
	{
		this._x = x;
		this._y = y;
	}

	public recycle():void
	{
		InstanceCounter.recycleCount(this);
		let index:number = Point.cachedInstances.indexOf(this);
		if(index < 0)
		{
			Point.cachedInstances.unshift(this);
		}
	}

	public destructor():void
	{
		InstanceCounter.destructorCount(this);
	}

	public static getPoint(x:number = 0, y:number = 0):Point
	{
		if(Point.cachedInstances.length)
		{
			let r:Point = Point.cachedInstances[Point.cachedInstances.length - 1];
			Point.cachedInstances.length -= 1;
			r.reset(x, y);
			return r;
		}
		return new Point(x, y);
	}

	public static polar(len:number, angle:number):Point
	{
		return new Point(len * Math.cos(angle), len * Math.sin(angle));
	}

	public static interpolate(pt1:Point, pt2:Point, f:number):Point
	{
		if(f <0 || f > 1)
		{
			return null;
		}
		let nx:number = pt1.x + (pt2.x - pt1.x) * f;
		let ny:number = pt1.y + (pt2.y- pt1.y) * f;
		return new Point(nx, ny);
	}

	public static distance(pt1:Point, pt2:Point):number
	{		
		return Math.sqrt(((pt2.x - pt1.x) * (pt2.x - pt1.x)) + ((pt2.y - pt1.y) * (pt2.y - pt1.y)));
	}

	public static get DEFAULT():Point
	{
		if(!Point._Rect)
		{
			Point._Rect = new Point();
		}
		Point._Rect.reset();
		return Point._Rect;
	}
}