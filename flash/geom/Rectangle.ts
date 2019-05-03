
import { ShapeSettings } from '../../raw-pixi-ts/ShapeSettings';
import { FlashBaseObject } from '../../raw-pixi-ts/FlashBaseObject';
import { InstanceCounter } from '../../raw-pixi-ts/InstanceCounter';
import { Point } from './Point';

export class Rectangle extends FlashBaseObject
{
	protected static _Rect:Rectangle;
	protected static cachedInstances:Rectangle[] = [];
	protected static instanceCount:number = 0;
    protected _x:number;
    protected _y:number;
    protected _width:number;
	protected _height:number;	
	protected type:number;
	
    protected constructor(x:number = 0, y:number = 0, width:number = 0, height:number = 0)
    {
		super();
		Rectangle.instanceCount++;
		this.reset(x, y, width, height);
		this.type = ShapeSettings.SHAPES.RECT;
		InstanceCounter.count(this);		
	}

	public get bottom():number
	{
	    return this._y + this._height;
	};
	
	public set bottom(value:number)
	{
		this._y = value - this._height
	}

	public get bottomRight():Point
	{
		return new Point(this._x + this._width, this._y + this._height);
	}

	public set bottomRight(value:Point)
	{
		this._x = value.x - this._width;
		this._y = value.y - this._height;
	}

	public get height():number
	{
	    return this._height;
	};

	public set height(value:number)
	{
	    this._height = value;
	};

	public get left():number
	{
		return this._x;
	}

	public set left(value:number)
	{
		this._x = value;
	}

	public get right():number
	{
	    return this._x + this._width;
	};
	
	public set right(value:number)
	{
		this._x = value - this._width;
	}

	public get size():Point
	{
		return new Point(this._width, this._height);
	}

	public set size(value:Point)
	{
		this._width = value.x;
		this._height = value.y;
	}

	public get top():number
	{
	    return this._y;
	};
	
	public set top(value:number)
	{
		this._y = value - this._height;
	}

	public get topLeft():Point
	{
		return new Point(this._x, this._y);
	}

	public set topLeft(value:Point)
	{
		this._x = value.x;
		this._y = value.y;
	}

	public get width():number
	{
	    return this._width;
	};

	public set width(value:number)
	{
	    this._width = value;
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

	public clone():Rectangle
	{
	    return new Rectangle(this._x, this._y, this._width, this._height);
	};
	
	public contains(x:number, y:number):boolean
	{
	    if (this._width <= 0 || this._height <= 0)
	    {
	        return false;
	    }
	    if (x >= this._x && x < this._x + this._width)
	    {
	        if (y >= this._y && y < this._y + this._height)
	        {
	            return true;
	        }
	    }
	    return false;
    };
	
	public containsPoint(point:Point):boolean
	{
		return this.contains(point.x, point.y);
	}

	public containsRect(rect:Rectangle):boolean
	{
		if(this.contains(rect.x, rect.y) && this.contains(rect.bottomRight.x, rect.bottomRight.y))
		{
			return true;
		}
		return false;
	}
    
	public copyFrom(rectangle:Rectangle):Rectangle
	{
	    this._x = rectangle._x;
	    this._y = rectangle._y;
	    this._width = rectangle._width;
	    this._height = rectangle._height;
	    return this;
	};

	public equals(rect:Rectangle):boolean
	{
		if(rect._x == this._x && rect._y == this._y && rect._width == this._width && rect._height == this._height)
		{
			return true;
		}
		return false;
	}

	public inflate(dx:number, dy:number):void
	{
		this._x -= dx;
		this._width += 2 * dx;
		this._y -= dy;
		this._height += 2 * dy;
	}

	public pad(paddingX:number = 0, paddingY:number = 0):void
	{
	    this._x -= paddingX;
	    this._y -= paddingY;
	    this._width += paddingX * 2;
	    this._height += paddingY * 2;
    };
	
	public inflatePoint(point:Point):void
	{
		this.inflate(point.x, point.y);
	}

	public intersection(toIntersect:Rectangle):Rectangle
	{		
		let x1:number = Math.max(this._x, toIntersect._x);
	    let x2:number = Math.min(this._x + this._width, toIntersect._x + toIntersect._width);
	    let y1:number = Math.max(this._y, toIntersect._y);
	    let y2:number = Math.min(this._y + this._height, toIntersect._y + toIntersect._height);
		let rect:Rectangle = new Rectangle(x1, y1, x2, y2);
		return rect;
	}

	public intersects(toIntersect:Rectangle):boolean
	{
		return this.contains(toIntersect._x, toIntersect._y);
	}

	public isEmpty():boolean
	{
		if(this._width == 0 && this._height == 0)
		{
			return true;
		}
		return false;
	}

	public offset(dx:number, dy:number):void
	{
		this._x = dx;
		this._y = dy;
	}

	public offsetPoint(point:Point):void
	{
		this.offset(point.x, point.y);
	}

	public setEmpty():void
	{
		this._x = this._y = this._width = this._height = 0;
	}

  
	public copyTo(rectangle:Rectangle):Rectangle
	{
	    rectangle._x = this._x;
	    rectangle._y = this._y;
	    rectangle._width = this._width;
	    rectangle._height = this._height;
	    return rectangle;
    };
 
	public setTo(xa:number, ya:number, widtha:number, heighta:number):void
	{
		this.reset(xa, ya, widtha, heighta);
	}
	
	public toString():string
	{
		return "x: " + this._x + ", y: " + this._y + ", width: " + this._width + ", height: " + this._height;
	} 
	
	public union(toUnion:Rectangle):Rectangle
	{
		let x1:number = Math.min(this._x, toUnion._x);
		let x2:number = Math.max(this._x + this._width, toUnion._x + toUnion._width);		
	    let y1:number = Math.min(this._y, toUnion._y);
	    let y2:number = Math.max(this._y + this._height, toUnion._y + toUnion._height);
		let rect:Rectangle = new Rectangle(x1, y1, x2, y2);
		return rect;
	}
  
	public fit(rectangle:Rectangle):void
	{
	    let x1:number = Math.max(this._x, rectangle._x);
	    let x2:number = Math.min(this._x + this._width, rectangle._x + rectangle._width);
	    let y1:number = Math.max(this._y, rectangle._y);
	    let y2:number = Math.min(this._y + this._height, rectangle._y + rectangle._height);
	    this._x = x1;
	    this._width = Math.max(x2 - x1, 0);
	    this._y = y1;
	    this._height = Math.max(y2 - y1, 0);
    };
 
	public ceil(resolution:number = 1, eps:number = 0.001):void
	{
	    let x2:number = Math.ceil((this._x + this._width - eps) * resolution) / resolution;
	    let y2:number = Math.ceil((this._y + this._height - eps) * resolution) / resolution;
	    this._x = Math.floor((this._x + eps) * resolution) / resolution;
	    this._y = Math.floor((this._y + eps) * resolution) / resolution;
	    this._width = x2 - this._x;
	    this._height = y2 - this._y;
    };
  
	public enlarge(rectangle:Rectangle):void
	{
	    let x1:number = Math.min(this._x, rectangle._x);
	    let x2:number = Math.max(this._x + this._width, rectangle._x + rectangle._width);
	    let y1:number = Math.min(this._y, rectangle._y);
	    let y2:number = Math.max(this._y + this._height, rectangle._y + rectangle._height);
	    this._x = x1;
	    this._width = x2 - x1;
	    this._y = y1;
	    this._height = y2 - y1;
	};

	public static getRectangle(x:number = 0, y:number = 0, width:number = 0, height:number = 0):Rectangle
	{
		if(Rectangle.cachedInstances.length)
		{
			let r:Rectangle = Rectangle.cachedInstances[Rectangle.cachedInstances.length - 1];
			Rectangle.cachedInstances.length -= 1;
			r.reset(x, y, width, height);
			return r;
		}
		return new Rectangle(x, y, width, height);
	}

	public static get DEFAULT():Rectangle
	{
		if(!Rectangle._Rect)
		{
			Rectangle._Rect = new Rectangle();
		}
		Rectangle._Rect.reset();
		return Rectangle._Rect;
	}

	public destructor():void
	{
		InstanceCounter.destructorCount(this);		
	}

	public recycle():void
	{
		InstanceCounter.recycleCount(this);	
		let index:number = Rectangle.cachedInstances.indexOf(this);
		if(index < 0)
		{
			Rectangle.cachedInstances.unshift(this);
		}
	}

	public reset(x:number = 0, y:number = 0, width:number = 0, height:number = 0):void
	{
		this._x = Number(x);
	    this._y = Number(y);
	    this._width = Number(width);
        this._height = Number(height);
	}
}
	

