import { Container } from "../../raw-pixi-ts/Container";
import { Rectangle } from "../../raw-pixi-ts/Rectangle";


export class List extends Container
{
    protected topContainer:Container;
    protected itemContainer:Container;
    protected itemSize:number;
    protected _verticalItemGap:number;
    protected lastMousePosition:number;
    protected containerPosition:number;
    protected _verticalListGap:number;
    protected mouseStartY:number;
    protected inertia:number;
    protected _horizontalListGap:number;
    protected currentDisplay:any;

    constructor()
    {
        super();
        this.topContainer = new Container();
        this.addChild(this.topContainer);	
        this.itemContainer = new Container();
        this.topContainer.addChild(this.itemContainer);		
        this.itemSize = 200;        		
        this._verticalItemGap = 2;
        this._verticalListGap = 10;
        this._horizontalListGap = 10;
        this.inertia = 0;
        this.mouseStartY = 0;
        this.containerPosition = 0;
        this.lastMousePosition = 0;


        // this._selectedItems = new Vector.<StorageData>();
        // this.currentDisplay = new Dictionary(true);

        	
        
        
        this.itemContainer.interactive = false;					
        
        this.interactive = true;
       
    }
}