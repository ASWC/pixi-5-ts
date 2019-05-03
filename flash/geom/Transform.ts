import { Matrix } from "../../raw-pixi-ts/Matrix";
import { ObservablePoint } from "../../raw-pixi-ts/ObservablePoint";
import { FlashBaseObject } from "../../raw-pixi-ts/FlashBaseObject";
import { ColorTransform } from "./ColorTransform";
import { Rectangle } from "./Rectangle";

export class Transform extends FlashBaseObject
{
	protected static _transform:Transform;
	protected _cx:number;
    protected _sx:number;
    protected _cy:number;
    protected _sy:number;
    protected _localID:number;
	protected _currentLocalID:number;	
    protected _worldID:number;
	protected _parentID:number;
	protected _rotation:number;
    public worldTransform:Matrix;
    public localTransform:Matrix;
    public position:ObservablePoint;
    public skew:ObservablePoint;    
    public pivot:ObservablePoint;
    public scale:ObservablePoint;    
	
    constructor()
    {
		super();
	    this.worldTransform = new Matrix();
	    this.localTransform = new Matrix();
		this.position = new ObservablePoint(0, 0);
		this.position.scope = this;
		this.position.callback = this.onChange;
		this.scale = new ObservablePoint(1, 1);
		this.scale.scope = this;
		this.scale.callback = this.onChange;
		this.pivot = new ObservablePoint(0, 0);
		this.pivot.scope = this;
		this.pivot.callback = this.onChange;
		this.skew = new ObservablePoint(0, 0);
		this.skew.scope = this;
		this.skew.callback = this.updateSkew;
	    this._rotation = 0;
	    this._cx = 1; 
	    this._sx = 0; 
	    this._cy = 0; 
	    this._sy = 1; 
	    this._localID = 0;
	    this._currentLocalID = 0;
	    this._worldID = 0;
	    this._parentID = 0;
	}

	public get pixelBounds():Rectangle
	{
		return null;
	}

	// public get matrix():Matrix
	// {
	// 	return null;
	// }

	// public set matrix(value:Matrix)
	// {

	// }

	// public get concatenatedMatrix():Matrix
	// {
	// 	return null;
	// }

	// public get concatenatedColorTransform():ColorTransform
	// {
	// 	return null;
	// }

	// public get colorTransform():ColorTransform
	// {
	// 	return null;
	// }

	// public set colorTransform(value:ColorTransform)
	// {
		
	// }
	
	public get rotation():number
	{
	    return this._rotation;
	};

	public set rotation(value:number) 
	{
	    if (this._rotation !== value)
	    {
	        this._rotation = value;
	        this.updateSkew();
	    }
	};

	protected setFromMatrix (matrix:Matrix):void
	{
	    matrix.decompose(this);
	    this._localID++;
	};

	public updateTransform(parentTransform:Transform):void
	{
	    let lt:Matrix = this.localTransform;
	    if (this._localID !== this._currentLocalID)
	    {
	        lt.a = this._cx * this.scale.x;
	        lt.b = this._sx * this.scale.x;
	        lt.c = this._cy * this.scale.y;
	        lt.d = this._sy * this.scale.y;
	        lt.tx = this.position.x - ((this.pivot.x * lt.a) + (this.pivot.y * lt.c));
	        lt.ty = this.position.y - ((this.pivot.x * lt.b) + (this.pivot.y * lt.d));
	        this._currentLocalID = this._localID;
	        this._parentID = -1;
	    }
	    if (this._parentID !== parentTransform._worldID)
	    {
	        let pt:Matrix = parentTransform.worldTransform;
	        let wt:Matrix = this.worldTransform;
	        wt.a = (lt.a * pt.a) + (lt.b * pt.c);
	        wt.b = (lt.a * pt.b) + (lt.b * pt.d);
	        wt.c = (lt.c * pt.a) + (lt.d * pt.c);
	        wt.d = (lt.c * pt.b) + (lt.d * pt.d);
	        wt.tx = (lt.tx * pt.a) + (lt.ty * pt.c) + pt.tx;
	        wt.ty = (lt.tx * pt.b) + (lt.ty * pt.d) + pt.ty;
	        this._parentID = parentTransform._worldID;
	        this._worldID++;
	    }
	};

	protected onChange():void
	{
	    this._localID++;
	};
	
	protected updateSkew():void
	{
	    this._cx = Math.cos(this._rotation + this.skew.y);
	    this._sx = Math.sin(this._rotation + this.skew.y);
	    this._cy = -Math.sin(this._rotation - this.skew.x); 
	    this._sy = Math.cos(this._rotation - this.skew.x); 
	    this._localID++;
	};

	protected updateLocalTransform():void
	{
	    let lt:Matrix = this.localTransform;
	    if (this._localID !== this._currentLocalID)
	    {
	        lt.a = this._cx * this.scale.x;
	        lt.b = this._sx * this.scale.x;
	        lt.c = this._cy * this.scale.y;
	        lt.d = this._sy * this.scale.y;
	        lt.tx = this.position.x - ((this.pivot.x * lt.a) + (this.pivot.y * lt.c));
	        lt.ty = this.position.y - ((this.pivot.x * lt.b) + (this.pivot.y * lt.d));
	        this._currentLocalID = this._localID;
	        this._parentID = -1;
	    }
	};

	public get worldID():number
	{
		return this._worldID;
	}

	public set parentID(value:number)
	{
		this._parentID = value;
	}

	
}