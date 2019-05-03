
import { ShapeSettings } from './ShapeSettings';
import { FlashBaseObject } from './FlashBaseObject';
import { trace } from './Logger';
import { InstanceCounter } from './InstanceCounter';

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

	public static get DEFAULT():Rectangle
	{
		if(!Rectangle._Rect)
		{
			Rectangle._Rect = new Rectangle();
		}
		Rectangle._Rect.reset();
		return Rectangle._Rect;
	}

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

	public get width():number
	{
	    return this._width;
	};

	public set width(value:number)
	{
	    this._width = value;
	};

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
    };
    
	public get right():number
	{
	    return this._x + this._width;
    };
   
	public get top():number
	{
	    return this._y;
    };
    
	public get bottom():number
	{
	    return this._y + this._height;
    };
    
	public clone():Rectangle
	{
	    return new Rectangle(this._x, this._y, this._width, this._height);
    };
    
	public copyFrom(rectangle:Rectangle):Rectangle
	{
	    this._x = rectangle._x;
	    this._y = rectangle._y;
	    this._width = rectangle._width;
	    this._height = rectangle._height;
	    return this;
    };
  
	public copyTo(rectangle:Rectangle):Rectangle
	{
	    rectangle._x = this._x;
	    rectangle._y = this._y;
	    rectangle._width = this._width;
	    rectangle._height = this._height;
	    return rectangle;
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
   
	public pad(paddingX:number = 0, paddingY:number = 0):void
	{
	    this._x -= paddingX;
	    this._y -= paddingY;
	    this._width += paddingX * 2;
	    this._height += paddingY * 2;
    };
  
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
}
	

