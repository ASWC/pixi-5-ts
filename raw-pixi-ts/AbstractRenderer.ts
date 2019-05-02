import { EventDispatcher } from "./EventDispatcher";
import { Matrix } from "./Matrix";
import { Rectangle } from "./Rectangle";
import { RenderTexture } from "./RenderTexture";
import { Container } from "./Container";
import { DisplaySettings } from './DisplaySettings';
import { MathSettings } from './MathSettings';
import { StageOptions } from './StageOptions';
import { DisplayObject } from './DisplayObject';
import { Texture } from './Texture';
import { ColorSettings } from "./ColorSettings";


export class AbstractRenderer extends EventDispatcher
{
    public static tempMatrix = new Matrix();
    public gl:WebGLRenderingContext;
    public options:StageOptions;
    public type:number;
    public resolution:number;
    public transparent:boolean;
    public _backgroundColorRgba:number[];
    public autoDensity:boolean;
    public preserveDrawingBuffer:boolean;
    public _lastObjectRendered:DisplayObject;
    public view:HTMLCanvasElement;
    public screen:Rectangle;
    public _backgroundColor:number;
    public _tempDisplayObjectParent:Container;
    public _backgroundColorString:string;
    public clearBeforeRender:boolean;
    public blendModes:number;

    constructor(system:string, options:StageOptions)
    {
        super();
        if (options.roundPixels)
        {
            DisplaySettings.ROUND_PIXELS = options.roundPixels;
        }
        this.options = options;
        this.type = DisplaySettings.RENDERER_TYPE.UNKNOWN;
        this.screen = new Rectangle(0, 0, options.width, options.height);
        this.view = options.view || document.createElement('canvas');
        this.resolution = options.resolution || DisplaySettings.RESOLUTION;
        this.transparent = options.transparent;
        this.autoDensity = options.autoDensity || options.autoResize || false;
        this.preserveDrawingBuffer = options.preserveDrawingBuffer;
        this.clearBeforeRender = options.clearBeforeRender;
        this._backgroundColor = 0x000000;
        this._backgroundColorRgba = [0, 0, 0, 0];
        this._backgroundColorString = '#000000';
        this.backgroundColor = options.backgroundColor || this._backgroundColor; 
        this._tempDisplayObjectParent = new Container();
        this._lastObjectRendered = this._tempDisplayObjectParent;
        this.blendModes = 0;
    }

    public resize(screenWidth:number, screenHeight:number):void
    {
        this.screen.width = screenWidth;
        this.screen.height = screenHeight;
        this.view.width = screenWidth * this.resolution;
        this.view.height = screenHeight * this.resolution;
        if (this.autoDensity)
        {
            this.view.style.width = screenWidth + "px";
            this.view.style.height = screenHeight + "px";
        }
    };

    public get width():number
    {
        return this.view.width;
    };

    public get height():number
    {
        return this.view.height;
    };

    public generateTexture(displayObject:DisplayObject, scaleMode:number, resolution:number, region:Rectangle):Texture
    {
        region = region || displayObject.getLocalBounds();
        if (region.width === 0) { region.width = 1; }
        if (region.height === 0) { region.height = 1; }
        var renderTexture:RenderTexture = RenderTexture.create(region.width | 0, region.height | 0, scaleMode, resolution);
        AbstractRenderer.tempMatrix.tx = -region.x;
        AbstractRenderer.tempMatrix.ty = -region.y;
        this.render(displayObject, renderTexture, false, AbstractRenderer.tempMatrix, !!displayObject.parent);
        return renderTexture;
    };

    public render(displayObject:DisplayObject, renderTexture:RenderTexture, b, m, parent)
    {

    }

    /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     */
    destroy(removeView)
    {
        // for (var o in this.plugins)
        // {
        //     this.plugins[o].destroy();
        //     this.plugins[o] = null;
        // }

        if (removeView && this.view.parentNode)
        {
            this.view.parentNode.removeChild(this.view);
        }

        // this.plugins = null;

        this.type = DisplaySettings.RENDERER_TYPE.UNKNOWN;

        this.view = null;

        this.screen = null;

        this.resolution = 0;

        this.transparent = false;

        this.autoDensity = false;

        this.blendModes = null;

        this.options = null;

        this.preserveDrawingBuffer = false;
        this.clearBeforeRender = false;

        this._backgroundColor = 0;
        this._backgroundColorRgba = null;
        this._backgroundColorString = null;

        this._tempDisplayObjectParent = null;
        this._lastObjectRendered = null;
    };

    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     */
    get backgroundColor ()
    {
        return this._backgroundColor;
    };

    set backgroundColor (value) // eslint-disable-line require-jsdoc
    {
        this._backgroundColor = value;
        this._backgroundColorString = MathSettings.hex2string(value);
        ColorSettings.hex2rgb(value, this._backgroundColorRgba);
    };


    

}

