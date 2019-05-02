import { System } from "./System";


export class ObjectRenderer extends System
{
    constructor(renderer)
    {
        super(renderer);
    }
    start  ()
	    {
	        // set the shader..
	    };

	    /**
	     * Stops the renderer
	     *
	     */
	  stop ()
	    {
	        this.flush();
	    };

	    /**
	     * Stub method for rendering content and emptying the current batch.
	     *
	     */
	    flush ()
	    {
	        // flush!
	    };

	    /**
	     * Renders an object
	     *
	     * @param {PIXI.DisplayObject} object - The object to render.
	     */
	    render (object) // eslint-disable-line no-unused-vars
	    {
	        // render the object
	    };
}

