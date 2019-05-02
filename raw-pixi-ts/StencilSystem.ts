import { System } from "./System";

export class StencilSystem extends System
{
    stencilMaskStack
    constructor(renderer)
    {
        super(renderer);
        this.stencilMaskStack = [];
    }

    /**
     * Changes the mask stack that is used by this System.
     *
     * @param {PIXI.Graphics[]} stencilMaskStack - The mask stack
     */
    setMaskStack  (stencilMaskStack)
    {
        var gl = this.renderer.gl;

        if (stencilMaskStack.length !== this.stencilMaskStack.length)
        {
            if (stencilMaskStack.length === 0)
            {
                gl.disable(gl.STENCIL_TEST);
            }
            else
            {
                gl.enable(gl.STENCIL_TEST);
            }
        }

        this.stencilMaskStack = stencilMaskStack;
    };

    /**
     * Applies the Mask and adds it to the current stencil stack. @alvin
     *
     * @param {PIXI.Graphics} graphics - The mask
     */
    pushStencil (graphics)
    {
        var gl = this.renderer.gl;
        var prevMaskCount = this.stencilMaskStack.length;

        if (prevMaskCount === 0)
        {
            gl.enable(gl.STENCIL_TEST);
        }

        this.stencilMaskStack.push(graphics);

        // Increment the reference stencil value where the new mask overlaps with the old ones.
        gl.colorMask(false, false, false, false);
        gl.stencilFunc(gl.EQUAL, prevMaskCount, this._getBitwiseMask());
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

        

        graphics.renderable = true;
        graphics.render(this.renderer);
        this.renderer.batch.flush();
        graphics.renderable = false;

        this._useCurrent();
    };

    /**
     * Removes the last mask from the stencil stack. @alvin
     */
    popStencil  ()
    {
        var gl = this.renderer.gl;
        var graphics = this.stencilMaskStack.pop();

        if (this.stencilMaskStack.length === 0)
        {
            // the stack is empty!
            gl.disable(gl.STENCIL_TEST);
            gl.clear(gl.STENCIL_BUFFER_BIT);
            gl.clearStencil(0);
        }
        else
        {
            // Decrement the reference stencil value where the popped mask overlaps with the other ones
            gl.colorMask(false, false, false, false);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

            graphics.renderable = true;
            graphics.render(this.renderer);
            this.renderer.batch.flush();
            graphics.renderable = false;

            this._useCurrent();
        }
    };

    /**
     * Setup renderer to use the current stencil data.
     * @private
     */
    _useCurrent  ()
    {
        var gl = this.renderer.gl;

        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.EQUAL, this.stencilMaskStack.length, this._getBitwiseMask());
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    };

    /**
     * Fill 1s equal to the number of acitve stencil masks.
     * @private
     * @return {number} The bitwise mask.
     */
    _getBitwiseMask  ()
    {
        return (1 << this.stencilMaskStack.length) - 1;
    };

    /**
     * Destroys the mask stack.
     *
     */
    destroy  ()
    {
        super.destroy();

        this.stencilMaskStack = null;
    };
}
