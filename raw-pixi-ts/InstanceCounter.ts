import { NumberDic } from "./Dictionary";
import { trace } from "./Logger";
import { FlashBaseObject } from "./FlashBaseObject";


export class InstanceCounter
{
    protected static classInstances:NumberDic = {};
    protected static destructorClassInstances:NumberDic = {};
    protected static recycleClassInstances:NumberDic = {};
    protected static callStacks:NumberDic = {};
    protected static ENABLED:boolean = false;

    public static enable():void
    {
        InstanceCounter.ENABLED = true;
    }

    
    public static recycleCount(instance:FlashBaseObject):void
    {
        if(!InstanceCounter.ENABLED)
        {
            return;
        }
        if(!InstanceCounter.recycleClassInstances[instance.className])
        {
            InstanceCounter.recycleClassInstances[instance.className] = 0;
        }
        InstanceCounter.recycleClassInstances[instance.className]++;
        // trace(instance.className + " destructor count: " + InstanceCounter.recycleClassInstances[instance.className])        
    }
    
    public static destructorCount(instance:FlashBaseObject):void
    {
        if(!InstanceCounter.ENABLED)
        {
            return;
        }
        if(!InstanceCounter.destructorClassInstances[instance.className])
        {
            InstanceCounter.destructorClassInstances[instance.className] = 0;
        }
        InstanceCounter.destructorClassInstances[instance.className]++;
        // trace(instance.className + " destructor count: " + InstanceCounter.destructorClassInstances[instance.className])        
    }
    
    public static count(instance:FlashBaseObject):void
    {
        if(!InstanceCounter.ENABLED)
        {
            return;
        }
        if(!InstanceCounter.classInstances[instance.className])
        {
            InstanceCounter.classInstances[instance.className] = 0;
        }
        InstanceCounter.classInstances[instance.className]++;
        let created:number = InstanceCounter.classInstances[instance.className];
        let recyled:number = 0;
        let destroyed:number = 0;
        if(InstanceCounter.destructorClassInstances[instance.className])
        {
            destroyed = InstanceCounter.destructorClassInstances[instance.className]
        }
        if(InstanceCounter.recycleClassInstances[instance.className])
        {
            recyled = InstanceCounter.recycleClassInstances[instance.className]
        }
        trace(instance.className + " created: " + created + " , destroyed: " + destroyed + " , recycled: " + recyled)
    }

    public static addCall(callTarget:string, caller:string):void
    {
        if(!InstanceCounter.ENABLED)
        {
            return;
        }
        let callstack:string = callTarget + ":" + caller;
        if(!InstanceCounter[callstack])
        {
            InstanceCounter[callstack] = 0;
        }
        InstanceCounter[callstack]++;
        trace(caller + " called " + callTarget + " " + InstanceCounter[callstack] + " times.")
    }
}