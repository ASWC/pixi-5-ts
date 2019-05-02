

import { EventDispatcher } from './EventDispatcher';
import { Renderer } from "./Renderer";
import { DestroyOptions } from './DestroyOptions';

export class System extends EventDispatcher
{
	public renderer;
	
    constructor(renderer:Renderer = null)
    {
		super()
		this.renderer = renderer;
		this.renderer.runners.contextChange.add(this);
    }

	public contextChange(gl:WebGLRenderingContext):void
	{
	
	};

	public destroy(options:DestroyOptions = null)
	{
		this.renderer.runners.contextChange.remove(this);
	    this.renderer = null;
	};
}

