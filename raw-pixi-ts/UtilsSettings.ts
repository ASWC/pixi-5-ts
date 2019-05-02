

export class UtilsSettings
{
	static unsafeEval;
	static removeItems(arr, startIdx, removeCount)
	{
	    var length = arr.length;
	    var i;

	    if (startIdx >= length || removeCount === 0)
	    {
	        return;
	    }

	    removeCount = (startIdx + removeCount > length ? length - startIdx : removeCount);

	    var len = length - removeCount;

	    for (i = startIdx; i < len; ++i)
	    {
	        arr[i] = arr[i + removeCount];
	    }

	    arr.length = len;
	}
	static deepCopyProperties(target, source, propertyObj) {
	    for (var prop in propertyObj) {
	        if (Array.isArray(source[prop])) {
	            target[prop] = source[prop].slice();
	        } else {
	            target[prop] = source[prop];
	        }
	    }
	}
	static areArraysEqual(array1, array2)
	{
	    if (!Array.isArray(array1) || !Array.isArray(array2))
	    {
	        return false;
	    }

	    if (array1.length !== array2.length)
	    {
	        return false;
	    }

	    for (var i = 0; i < array1.length; ++i)
	    {
	        if (array1[i] !== array2[i])
	        {
	            return false;
	        }
	    }
	    return true;
	}
	static unsafeEvalSupported()
	{
	    if (typeof UtilsSettings.unsafeEval === 'boolean')
	    {
	        return UtilsSettings.unsafeEval;
	    }
	    try
	    {
	        var func = new Function('param1', 'param2', 'param3', 'return param1[param2] === param3;');
	        UtilsSettings.unsafeEval = func({ a: 'b' }, 'a', 'b') === true;
	    }
	    catch (e)
	    {
	        UtilsSettings.unsafeEval = false;
	    }
	    return UtilsSettings.unsafeEval;
	}
	static util = 
	{
		isString: function(arg) {
		  return typeof(arg) === 'string';
		},
		isObject: function(arg) {
		  return typeof(arg) === 'object' && arg !== null;
		},
		isNull: function(arg) {
		  return arg === null;
		},
		isNullOrUndefined: function(arg) {
		  return arg == null;
		}
	};
	static isWebGLSupported()
	{
	    var contextOptions = { stencil: true, failIfMajorPerformanceCaveat: true };
	    try
	    {
	        if (!window['WebGLRenderingContext'])
	        {
	            return false;
	        }
	        var canvas = document.createElement('canvas');
	        var gl:any = canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);
	        var success = !!(gl && gl.getContextAttributes().stencil);
	        if (gl)
	        {
	            var loseContext = gl.getExtension('WEBGL_lose_context');
	            if (loseContext)
	            {
	                loseContext.loseContext();
	            }
	        }
	        gl = null;
	        return success;
	    }
	    catch (e)
	    {
	        return false;
	    }
	}
}