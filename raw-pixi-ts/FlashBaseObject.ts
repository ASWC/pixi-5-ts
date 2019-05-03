

export class FlashBaseObject
{
    private static nameCount:number = 0;    
    protected countID:number;
    protected _name:string;
    protected _className:string;
    protected _instanceName:string;
    protected _hasChanged:boolean;

    constructor()
    {
        FlashBaseObject.nameCount++;
        this._name = "instance-" + this.className + "-" + FlashBaseObject.nameCount;
        this._instanceName = "instance-" + this.className + "-" + FlashBaseObject.nameCount;     
        this._hasChanged = true;  
        this._className = this.constructor['name'];
    }   

    public get className():string
    {
        return this.constructor['name'];
    }

    public destructor():void
    {
        
    }

    public recycle():void
    {
        
    }

    public dispose():void
    {
        
    }

    public get hasChanged():boolean
    {
        return this._hasChanged;
    }

    public set hasChanged(value:boolean)
    {
        this._hasChanged = value;
    }

    public get name():string
    {
        return this._name;
    }

    public set name(value:string)
    {
        this._name = value;
    } 

    public get instanceName():string
    {
        return this._instanceName;
    }

    

    
}