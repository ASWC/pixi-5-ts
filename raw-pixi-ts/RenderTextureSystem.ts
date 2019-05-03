import { System } from "./System";
import { Rectangle } from "./Rectangle";
import { trace } from "./Logger";
import { InstanceCounter } from "./InstanceCounter";

export class RenderTextureSystem extends System
{

	// static tempRect = new Rectangle();
    clearColor
    current
    public destinationFrame:Rectangle;
    public sourceFrame:Rectangle;
    defaultMaskStack
    constructor(renderer)
    {
        super(renderer);
        /**
         * The clear background color as rgba
         * @member {number[]}
         */
        this.clearColor = renderer._backgroundColorRgba;

        // TODO move this property somewhere else!
        /**
         * List of masks for the StencilSystem
         * @member {PIXI.Graphics[]}
         * @readonly
         */
        this.defaultMaskStack = [];

        // empty render texture?
        /**
         * Render texture
         * @member {PIXI.RenderTexture}
         * @readonly
         */
        this.current = null;

        /**
         * Source frame
         * @member {PIXI.Rectangle}
         * @readonly
         */
        InstanceCounter.addCall("Rectangle.getRectangle", "RendertextureSystem")
        this.sourceFrame = Rectangle.getRectangle();

        /**
         * Destination frame
         * @member {PIXI.Rectangle}
         * @readonly
         */
        InstanceCounter.addCall("Rectangle.getRectangle", "RendertextureSystem")
        this.destinationFrame = Rectangle.getRectangle();
    }

    public destructor():void
    {
        this.sourceFrame.recycle();
        this.destinationFrame.recycle();
        this.sourceFrame = null;
        this.destinationFrame = null;
    }
    /**
     * Bind the current render texture
     * @param {PIXI.RenderTexture} renderTexture
     * @param {PIXI.Rectangle} sourceFrame
     * @param {PIXI.Rectangle} destinationFrame
     */
    bind  (renderTexture, sourceFrame = null, destinationFrame = null)
    {
        if ( renderTexture === void 0 ) { renderTexture = null; }

        this.current = renderTexture;

        var renderer = this.renderer;

        var resolution;

        if (renderTexture)
        {
            var baseTexture = renderTexture.baseTexture;

            resolution = baseTexture.resolution;

            if (!destinationFrame)
            {
                // InstanceCounter.addCall("Rectangle.getRectangle", "RendertextureSystem bind")
                let temprect:Rectangle = Rectangle.DEFAULT;
                temprect.width = baseTexture.realWidth;
                temprect.height = baseTexture.realHeight;
                destinationFrame = temprect;
            }

            if (!sourceFrame)
            {
                sourceFrame = destinationFrame;
            }

            this.renderer.framebuffer.bind(baseTexture.framebuffer, destinationFrame);

            this.renderer.projection.update(destinationFrame, sourceFrame, resolution, false);
            

            this.renderer.stencil.setMaskStack(baseTexture.stencilMaskStack);
        }
        else
        {
            resolution = this.renderer.resolution;

            // TODO these validation checks happen deeper down..
            // thing they can be avoided..
            if (!destinationFrame)
            {

                // InstanceCounter.addCall("Rectangle.getRectangle", "RendertextureSystem bind")

                let tempRect:Rectangle = Rectangle.DEFAULT;
                tempRect.width = renderer.width;
                tempRect.height = renderer.height;
                destinationFrame = tempRect;
            }
            if (!sourceFrame)
            {
                sourceFrame = destinationFrame;
            }
            renderer.framebuffer.bind(null, destinationFrame);
            this.renderer.projection.update(destinationFrame, sourceFrame, resolution, true);
            this.renderer.stencil.setMaskStack(this.defaultMaskStack);
           
        }

        this.sourceFrame.copyFrom(sourceFrame);

        this.destinationFrame.x = destinationFrame.x / resolution;
        this.destinationFrame.y = destinationFrame.y / resolution;

        this.destinationFrame.width = destinationFrame.width / resolution;
        this.destinationFrame.height = destinationFrame.height / resolution;
    };

    /**
     * Erases the render texture and fills the drawing area with a colour
     *
     * @param {number[]} [clearColor] - The color as rgba, default to use the renderer backgroundColor
     * @return {PIXI.Renderer} Returns itself.
     */
    clear (clearColor:number[] = null)
    {
        if (this.current)
        {
            clearColor = clearColor || this.current.baseTexture.clearColor;
        }
        else
        {
            clearColor = clearColor || this.clearColor;
        }

        this.renderer.framebuffer.clear(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    };

    resize  ()// screenWidth, screenHeight)
    {
        // resize the root only!
        this.bind(null);
    };

    /**
     * Resets renderTexture state
     */
    reset  ()
    {
        this.bind(null);
    };
}


