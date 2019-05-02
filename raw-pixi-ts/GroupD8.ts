import { Matrix } from "./Matrix";


export class GroupD8
{
    public static isInit:boolean = false;
    public static E:number = 0;
    public static SE:number = 1;
    public static S:number = 2;
    public static SW:number = 3;
    public static W:number = 4;
    public static NW:number = 5;
    public static N:number = 6;
    public static NE:number = 7;
    public static MIRROR_VERTICAL:number = 8;
    public static MIRROR_HORIZONTAL:number = 12;
    public static ux:number[] = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1];
    public static uy:number[] = [0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1];
    public static vx:number[] = [0, -1, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 0, -1, -1, -1];
    public static vy:number[] = [1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, 1, 0, -1];
    public static tempMatrices:Matrix[] = [];
    public static mul:number[][] = [];

    public static uX(ind:number):number 
    { 
        GroupD8.init();
        return GroupD8.ux[ind]; 
    }

    public static uY(ind:number):number 
    { 
        GroupD8.init();
        return GroupD8.uy[ind]; 
    }

    public static vX(ind:number):number 
    { 
        GroupD8.init();
        return GroupD8.vx[ind]; 
    }

    public static vY(ind:number):number 
    { 
        GroupD8.init();
        return GroupD8.vy[ind]; 
    }

    public static inv (rotation:number):number
    {
        if (rotation & 8)
        {
            return rotation & 15;
        }
        return (-rotation) & 7;
    }

    public static add(rotationSecond:number, rotationFirst:number):number 
    { 
        GroupD8.init();
        return GroupD8.mul[rotationSecond][rotationFirst]; 
    }

    public static sub(rotationSecond:number, rotationFirst:number):number 
    { 
        GroupD8.init();
        return GroupD8.mul[rotationSecond][GroupD8.inv(rotationFirst)]; 
    }
    
    public static rotate180(rotation:number):number 
    { 
        return rotation ^ 4; 
    }
   
    public static isVertical(rotation:number):boolean 
    { 
        return (rotation & 3) === 2; 
    }
   
    public static byDirection(dx:number, dy:number):number 
    {
        GroupD8.init();
        if (Math.abs(dx) * 2 <= Math.abs(dy))
        {
            if (dy >= 0)
            {
                return GroupD8.S;
            }
            return GroupD8.N;
        }
        else if (Math.abs(dy) * 2 <= Math.abs(dx))
        {
            if (dx > 0)
            {
                return GroupD8.E;
            }
            return GroupD8.W;
        }
        else if (dy > 0)
        {
            if (dx > 0)
            {
                return GroupD8.SE;
            }
            return GroupD8.SW;
        }
        else if (dx > 0)
        {
            return GroupD8.NE;
        }
        return GroupD8.NW;
    }
    
    public static matrixAppendRotationInv(matrix:Matrix, rotation:number, tx:number = 0, ty:number = 0):void 
    {
        GroupD8.init();
        let mat:Matrix = GroupD8.tempMatrices[GroupD8.inv(rotation)];
        mat.tx = tx;
        mat.ty = ty;
        matrix.append(mat);
    }

    public static signum(x)
	{
	    if (x < 0)
	    {
	        return -1;
	    }
	    if (x > 0)
	    {
	        return 1;
	    }

	    return 0;
	}

    public static init():void
	{
        if(GroupD8.isInit)
        {
            return;
        }
        GroupD8.isInit = true;
	    for (var i = 0; i < 16; i++)
	    {
	        var row:number[] = [];

	        GroupD8.mul.push(row);

	        for (var j = 0; j < 16; j++)
	        {
	            var _ux = GroupD8.signum((GroupD8.ux[i] * GroupD8.ux[j]) + (GroupD8.vx[i] * GroupD8.uy[j]));
	            var _uy = GroupD8.signum((GroupD8.uy[i] * GroupD8.ux[j]) + (GroupD8.vy[i] * GroupD8.uy[j]));
	            var _vx = GroupD8.signum((GroupD8.ux[i] * GroupD8.vx[j]) + (GroupD8.vx[i] * GroupD8.vy[j]));
	            var _vy = GroupD8.signum((GroupD8.uy[i] * GroupD8.vx[j]) + (GroupD8.vy[i] * GroupD8.vy[j]));

	            for (var k = 0; k < 16; k++)
	            {
	                if (GroupD8.ux[k] === _ux && GroupD8.uy[k] === _uy && GroupD8.vx[k] === _vx && GroupD8.vy[k] === _vy)
	                {
	                    row.push(k);
	                    break;
	                }
	            }
	        }
	    }

	    for (var i$1 = 0; i$1 < 16; i$1++)
	    {
	        var mat = new Matrix();

	        mat.set(GroupD8.ux[i$1], GroupD8.uy[i$1], GroupD8.vx[i$1], GroupD8.vy[i$1], 0, 0);
	        GroupD8.tempMatrices.push(mat);
	    }
	}
}

