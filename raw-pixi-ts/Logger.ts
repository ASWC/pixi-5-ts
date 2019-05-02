
export var OUTPUT_TO_CONSOLE:boolean = true;

export const trace = function(value:any):string
{
    try
    {
        if(!value)
        {
            if(isNaN(value))
            {
                var result:string = "show: null";
            }
            else
            {
                var result:string = "show: 0";
            }
            
        }
        else
        {
            var result:string = "show: " + value.toString();
        }	
        if(OUTPUT_TO_CONSOLE)
        {
            console.log(result);
        }	     
        return result;   
    }
    catch(e)
    {

    }
    return null;
}

export const revealMethods = function(value:any):string
{
    try
    {
        if(!value)
        {
            var result:string = "reveal methods: null";
        }
        else
        {
            var result:string = "reveal methods: ";
        }
        for(var key in value)
        {
            var instanceItem:any = value[key];
            if(instanceItem instanceof Function)
            {
                result += 'method: ' + key + ' : ' + value[key] + "\n";
                
            }       	
        }
        if(OUTPUT_TO_CONSOLE)
        {
            console.log(result);
        }     
        return result;   
    }
    catch(e)
    {

    }		 
    return null;  
}

export const reveal = function(value:any):string
{
    if(!value)
    {
        var result:string = "reveal: null";
        if(OUTPUT_TO_CONSOLE)
        {
            console.log(result);
        }        
        return;
    }
    if(value === undefined)
    {
        var result:string = "reveal: undefined";
        if(OUTPUT_TO_CONSOLE)
        {
            console.log(result);
        }        
        return;
    }
    var result:string = "reveal: ";			
    for(var key in value)
    {
        var instanceItem:any = getValue(key, value);
        if(instanceItem)
        {
            if(instanceItem instanceof Function)
            {
                result += 'method: ' + key + "\n";				
            }
            else
            {
                try
                {
                    result += key + ' : ' + instanceItem + "\n";
                }
                catch(e)
                {

                }
                                                    
            } 
        }	
    }
    if(OUTPUT_TO_CONSOLE)
    {
        console.log(result);	
    }    
    return result;     
}

const getValue = function(key:string, value:any):any
{
    var valueResult:any = null;
    try
    {
        valueResult = value[key];
    }
    catch(e)
    {

    }
    return valueResult;
}