import { System } from "./System";
import { settings } from "./settings";

export class TextureGCSystem extends System
{
    count
    checkCountMax
    maxIdle
    checkCount
    mode
    constructor(renderer)
    {
        super(renderer);
        /**
         * Count
         * @member {number}
         * @readonly
         */
        this.count = 0;

        /**
         * Check count
         * @member {number}
         * @readonly
         */
        this.checkCount = 0;

        /**
         * Maximum idle time, in seconds
         * @member {number}
         * @see PIXI.settings.GC_MAX_IDLE
         */
        this.maxIdle = settings.GC_MAX_IDLE;

        /**
         * Maximum number of itesm to check
         * @member {number}
         * @see PIXI.settings.GC_MAX_CHECK_COUNT
         */
        this.checkCountMax = settings.GC_MAX_CHECK_COUNT;

        /**
         * Current garabage collection mode
         * @member {PIXI.GC_MODES}
         * @see PIXI.settings.GC_MODE
         */
        this.mode = settings.GC_MODE;
    }

    /**
     * Checks to see when the last time a texture was used
     * if the texture has not been used for a specified amount of time it will be removed from the GPU
     */
    postrender ()
    {
        this.count++;

        if (this.mode === settings.GC_MODES.MANUAL)
        {
            return;
        }

        this.checkCount++;

        if (this.checkCount > this.checkCountMax)
        {
            this.checkCount = 0;

            this.run();
        }
    };

    /**
     * Checks to see when the last time a texture was used
     * if the texture has not been used for a specified amount of time it will be removed from the GPU
     */
    run ()
    {
        var tm = this.renderer.texture;
        var managedTextures =  tm.managedTextures;
        var wasRemoved = false;

        for (var i = 0; i < managedTextures.length; i++)
        {
            var texture = managedTextures[i];

            // only supports non generated textures at the moment!
            if (!texture.framebuffer && this.count - texture.touched > this.maxIdle)
            {
                tm.destroyTexture(texture, true);
                managedTextures[i] = null;
                wasRemoved = true;
            }
        }

        if (wasRemoved)
        {
            var j = 0;

            for (var i$1 = 0; i$1 < managedTextures.length; i$1++)
            {
                if (managedTextures[i$1] !== null)
                {
                    managedTextures[j++] = managedTextures[i$1];
                }
            }

            managedTextures.length = j;
        }
    };

    /**
     * Removes all the textures within the specified displayObject and its children from the GPU
     *
     * @param {PIXI.DisplayObject} displayObject - the displayObject to remove the textures from.
     */
    unload  (displayObject)
    {
        // var tm = this.renderer.textureSystem;
        var tm = this.renderer.texture;

        // only destroy non generated textures
        if (displayObject._texture && displayObject._texture._glRenderTargets)
        {
            tm.destroyTexture(displayObject._texture);
        }

        for (var i = displayObject.children.length - 1; i >= 0; i--)
        {
            this.unload(displayObject.children[i]);
        }
    };
}


