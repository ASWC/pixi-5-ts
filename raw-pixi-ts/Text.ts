import { Sprite } from "./Sprite";
import { Texture } from "./Texture";
import { Rectangle } from "./Rectangle";
import { TextMetrics } from "./TextMetrics";
import { TextStyle } from "./TextStyle";
import { DisplaySettings } from './DisplaySettings';
import { MathSettings } from './MathSettings';
import { CanvasSettings } from './CanvasSettings';
import { TextSettings } from './TextSettings';
import { CleanUpSettings } from './CleanUpSettings';
import { ColorSettings } from "./ColorSettings";
import { trace } from "./Logger";
import { InstanceCounter } from "./InstanceCounter";

export class Text extends Sprite
{
    // TextMetrics
    canvas
    context
    _text
    localStyleID
    _style
    _styleListener
    _font
    dirty
    
    _autoResolution
    
    _resolution
    constructor(text, style = null, canvas = null)
    {
        canvas = canvas || document.createElement('canvas');

        canvas.width = 3;
        canvas.height = 3;

        var texture:Texture = Texture.from(canvas);

        InstanceCounter.addCall("Rectangle.getRectangle", "Text")
        texture.orig = Rectangle.getRectangle();
        InstanceCounter.addCall("Rectangle.getRectangle", "Text")
        texture.trim = Rectangle.getRectangle();
        super(texture);

        /**
         * The canvas element that everything is drawn to
         *
         * @member {HTMLCanvasElement}
         */
        this.canvas = canvas;

        /**
         * The canvas 2d context that everything is drawn with
         * @member {CanvasRenderingContext2D}
         */
        this.context = this.canvas.getContext('2d');

        /**
         * The resolution / device pixel ratio of the canvas.
         * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
         * @member {number}
         * @default 1
         */
        this._resolution = DisplaySettings.RESOLUTION;
        this._autoResolution = true;

        /**
         * Private tracker for the current text.
         *
         * @member {string}
         * @private
         */
        this._text = null;

        /**
         * Private tracker for the current style.
         *
         * @member {object}
         * @private
         */
        this._style = null;
        /**
         * Private listener to track style changes.
         *
         * @member {Function}
         * @private
         */
        this._styleListener = null;

        /**
         * Private tracker for the current font.
         *
         * @member {string}
         * @private
         */
        this._font = '';

        this.text = text;
        this.style = style;

        this.localStyleID = -1;
    }

    /**
     * Renders text and updates it when needed.
     *
     * @private
     * @param {boolean} respectDirty - Whether to abort updating the text if the Text isn't dirty and the function is called.
     */
    updateText  (respectDirty)
    {
        var style = this._style;

        // check if style has changed..
        if (this.localStyleID !== style.styleID)
        {
            this.dirty = true;
            this.localStyleID = style.styleID;
        }

        if (!this.dirty && respectDirty)
        {
            return;
        }

        this._font = this._style.toFontString();

        var context = this.context;
        TextMetrics.init();
        var measured = TextMetrics.measureText(this._text || ' ', this._style, this._style.wordWrap, this.canvas);
        var width = measured.width;
        var height = measured.height;
        var lines = measured.lines;
        var lineHeight = measured.lineHeight;
        var lineWidths = measured.lineWidths;
        var maxLineWidth = measured.maxLineWidth;
        var fontProperties = measured.fontProperties;

        this.canvas.width = Math.ceil((Math.max(1, width) + (style.padding * 2)) * this._resolution);
        this.canvas.height = Math.ceil((Math.max(1, height) + (style.padding * 2)) * this._resolution);

        context.scale(this._resolution, this._resolution);

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        context.font = this._font;
        context.strokeStyle = style.stroke;
        context.lineWidth = style.strokeThickness;
        context.textBaseline = style.textBaseline;
        context.lineJoin = style.lineJoin;
        context.miterLimit = style.miterLimit;

        var linePositionX;
        var linePositionY;

        if (style.dropShadow)
        {
            var dropShadowColor = style.dropShadowColor;
            var rgb = ColorSettings.hex2rgb(typeof dropShadowColor === 'number' ? dropShadowColor : MathSettings.string2hex(dropShadowColor));

            context.shadowColor = "rgba(" + (rgb[0] * 255) + "," + (rgb[1] * 255) + "," + (rgb[2] * 255) + "," + (style.dropShadowAlpha) + ")";
            context.shadowBlur = style.dropShadowBlur;
            context.shadowOffsetX = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
            context.shadowOffsetY = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;
        }
        else
        {
            context.shadowColor = 0;
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
        }

        // set canvas text styles
        context.fillStyle = this._generateFillStyle(style, lines);

        // draw lines line by line
        for (var i = 0; i < lines.length; i++)
        {
            linePositionX = style.strokeThickness / 2;
            linePositionY = ((style.strokeThickness / 2) + (i * lineHeight)) + fontProperties.ascent;

            if (style.align === 'right')
            {
                linePositionX += maxLineWidth - lineWidths[i];
            }
            else if (style.align === 'center')
            {
                linePositionX += (maxLineWidth - lineWidths[i]) / 2;
            }

            if (style.stroke && style.strokeThickness)
            {
                this.drawLetterSpacing(
                    lines[i],
                    linePositionX + style.padding,
                    linePositionY + style.padding,
                    true
                );
            }

            if (style.fill)
            {
                this.drawLetterSpacing(
                    lines[i],
                    linePositionX + style.padding,
                    linePositionY + style.padding
                );
            }
        }

        this.updateTexture();
    };

    /**
     * Render the text with letter-spacing.
     * @param {string} text - The text to draw
     * @param {number} x - Horizontal position to draw the text
     * @param {number} y - Vertical position to draw the text
     * @param {boolean} [isStroke=false] - Is this drawing for the outside stroke of the
     *  text? If not, it's for the inside fill
     * @private
     */
    drawLetterSpacing  (text, x, y, isStroke = false)
    {
        if ( isStroke === void 0 ) { isStroke = false; }

        var style = this._style;

        // letterSpacing of 0 means normal
        var letterSpacing = style.letterSpacing;

        if (letterSpacing === 0)
        {
            if (isStroke)
            {
                this.context.strokeText(text, x, y);
            }
            else
            {
                this.context.fillText(text, x, y);
            }

            return;
        }

        var characters = String.prototype.split.call(text, '');
        var currentPosition = x;
        var index = 0;
        var current = '';

        while (index < text.length)
        {
            current = characters[index++];
            if (isStroke)
            {
                this.context.strokeText(current, currentPosition, y);
            }
            else
            {
                this.context.fillText(current, currentPosition, y);
            }
            currentPosition += this.context.measureText(current).width + letterSpacing;
        }
    };

    /**
     * Updates texture size based on canvas size
     *
     * @private
     */
    updateTexture ()
    {
        var canvas = this.canvas;

        if (this._style.trim)
        {
            var trimmed = CanvasSettings.trimCanvas(canvas);

            if (trimmed.data)
            {
                canvas.width = trimmed.width;
                canvas.height = trimmed.height;
                this.context.putImageData(trimmed.data, 0, 0);
            }
        }

        var texture = this._texture;
        var style = this._style;
        var padding = style.trim ? 0 : style.padding;
        var baseTexture = texture.baseTexture;

        texture.trim.width = texture._frame.width = canvas.width / this._resolution;
        texture.trim.height = texture._frame.height = canvas.height / this._resolution;
        texture.trim.x = -padding;
        texture.trim.y = -padding;

        texture.orig.width = texture._frame.width - (padding * 2);
        texture.orig.height = texture._frame.height - (padding * 2);

        // call sprite onTextureUpdate to update scale if _width or _height were set
        this._onTextureUpdate();

        baseTexture.setRealSize(canvas.width, canvas.height, this._resolution);

        this.dirty = false;
    };

    /**
     * Renders the object using the WebGL renderer
     *
     * @param {PIXI.Renderer} renderer - The renderer
     */
    render  (renderer)
    {
        if (this._autoResolution && this._resolution !== renderer.resolution)
        {
            this._resolution = renderer.resolution;
            this.dirty = true;
        }

        this.updateText(true);

        super.render(renderer);
    };

    /**
     * Renders the object using the Canvas renderer
     *
     * @private
     * @param {PIXI.CanvasRenderer} renderer - The renderer
     */
    _renderCanvas(renderer)
    {
        if (this._autoResolution && this._resolution !== renderer.resolution)
        {
            this._resolution = renderer.resolution;
            this.dirty = true;
        }

        this.updateText(true);

        // super._renderCanvas(renderer);
    };

    /**
     * Gets the local bounds of the text object.
     *
     * @param {Rectangle} rect - The output rectangle.
     * @return {Rectangle} The bounds.
     */
    getLocalBounds (rect)
    {
        this.updateText(true);

        return super.getLocalBounds(rect);
    };

    /**
     * calculates the bounds of the Text as a rectangle. The bounds calculation takes the worldTransform into account.
     * @protected
     */
    _calculateBounds  ()
    {
        this.updateText(true);
        this.calculateVertices();
        // if we have already done this on THIS frame.
        this._bounds.addQuad(this.vertexData);
    };

    /**
     * Method to be called upon a TextStyle change.
     * @private
     */
    _onStyleChange  ()
    {
        this.dirty = true;
    };

    /**
     * Generates the fill style. Can automatically generate a gradient based on the fill style being an array
     *
     * @private
     * @param {object} style - The style.
     * @param {string[]} lines - The lines of text.
     * @return {string|number|CanvasGradient} The fill style
     */
    _generateFillStyle  (style, lines)
    {
        if (!Array.isArray(style.fill))
        {
            return style.fill;
        }

        // the gradient will be evenly spaced out according to how large the array is.
        // ['#FF0000', '#00FF00', '#0000FF'] would created stops at 0.25, 0.5 and 0.75
        var gradient;
        var totalIterations;
        var currentIteration;
        var stop;

        var width = this.canvas.width / this._resolution;
        var height = this.canvas.height / this._resolution;

        // make a copy of the style settings, so we can manipulate them later
        var fill = style.fill.slice();
        var fillGradientStops = style.fillGradientStops.slice();

        // wanting to evenly distribute the fills. So an array of 4 colours should give fills of 0.25, 0.5 and 0.75
        if (!fillGradientStops.length)
        {
            var lengthPlus1 = fill.length + 1;

            for (var i = 1; i < lengthPlus1; ++i)
            {
                fillGradientStops.push(i / lengthPlus1);
            }
        }

        // stop the bleeding of the last gradient on the line above to the top gradient of the this line
        // by hard defining the first gradient colour at point 0, and last gradient colour at point 1
        fill.unshift(style.fill[0]);
        fillGradientStops.unshift(0);

        fill.push(style.fill[style.fill.length - 1]);
        fillGradientStops.push(1);

        if (style.fillGradientType === TextSettings.TEXT_GRADIENT.LINEAR_VERTICAL)
        {
            // start the gradient at the top center of the canvas, and end at the bottom middle of the canvas
            gradient = this.context.createLinearGradient(width / 2, 0, width / 2, height);

            // we need to repeat the gradient so that each individual line of text has the same vertical gradient effect
            // ['#FF0000', '#00FF00', '#0000FF'] over 2 lines would create stops at 0.125, 0.25, 0.375, 0.625, 0.75, 0.875
            totalIterations = (fill.length + 1) * lines.length;
            currentIteration = 0;
            for (var i$1 = 0; i$1 < lines.length; i$1++)
            {
                currentIteration += 1;
                for (var j = 0; j < fill.length; j++)
                {
                    if (typeof fillGradientStops[j] === 'number')
                    {
                        stop = (fillGradientStops[j] / lines.length) + (i$1 / lines.length);
                    }
                    else
                    {
                        stop = currentIteration / totalIterations;
                    }
                    gradient.addColorStop(stop, fill[j]);
                    currentIteration++;
                }
            }
        }
        else
        {
            // start the gradient at the center left of the canvas, and end at the center right of the canvas
            gradient = this.context.createLinearGradient(0, height / 2, width, height / 2);

            // can just evenly space out the gradients in this case, as multiple lines makes no difference
            // to an even left to right gradient
            totalIterations = fill.length + 1;
            currentIteration = 1;

            for (var i$2 = 0; i$2 < fill.length; i$2++)
            {
                if (typeof fillGradientStops[i$2] === 'number')
                {
                    stop = fillGradientStops[i$2];
                }
                else
                {
                    stop = currentIteration / totalIterations;
                }
                gradient.addColorStop(stop, fill[i$2]);
                currentIteration++;
            }
        }

        return gradient;
    };

    /**
     * Destroys this text object.
     * Note* Unlike a Sprite, a Text object will automatically destroy its baseTexture and texture as
     * the majority of the time the texture will not be shared with any other Sprites.
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their
     *  destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=true] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=true] - Should it destroy the base texture of the sprite as well
     */
    destroy  (options)
    {
        if (typeof options === 'boolean')
        {
            options = { children: options };
        }

        options = Object.assign({}, CleanUpSettings.defaultDestroyOptions, options);

        super.destroy(options);

        // make sure to reset the the context and canvas.. dont want this hanging around in memory!
        this.context = null;
        this.canvas = null;

        this._style = null;
    };

    /**
     * The width of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width ()
    {
        this.updateText(true);

        return Math.abs(this.scale.x) * this._texture.orig.width;
    };

    set width (value) // eslint-disable-line require-jsdoc
    {
        this.updateText(true);

        var s = MathSettings.sign(this.scale.x) || 1;

        this.scale.x = s * value / this._texture.orig.width;
        this._width = value;
    };

    /**
     * The height of the Text, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height ()
    {
        this.updateText(true);

        return Math.abs(this.scale.y) * this._texture.orig.height;
    };

    set height (value) // eslint-disable-line require-jsdoc
    {
        this.updateText(true);

        var s = MathSettings.sign(this.scale.y) || 1;

        this.scale.y = s * value / this._texture.orig.height;
        this._height = value;
    };

    /**
     * Set the style of the text. Set up an event listener to listen for changes on the style
     * object and mark the text as dirty.
     *
     * @member {object|PIXI.TextStyle}
     */
    get style ()
    {
        return this._style;
    };

    set style (style) // eslint-disable-line require-jsdoc
    {
        style = style || {};

        if (style instanceof TextStyle)
        {
            this._style = style;
        }
        else
        {
            this._style = new TextStyle(style);
        }

        this.localStyleID = -1;
        this.dirty = true;
    };

    /**
     * Set the copy for the text object. To split a line you can use '\n'.
     *
     * @member {string}
     */
    get text ()
    {
        return this._text;
    };

    set text (text) // eslint-disable-line require-jsdoc
    {
        text = String(text === null || text === undefined ? '' : text);

        if (this._text === text)
        {
            return;
        }
        this._text = text;
        this.dirty = true;
    };

    /**
     * The resolution / device pixel ratio of the canvas.
     * This is set to automatically match the renderer resolution by default, but can be overridden by setting manually.
     * @member {number}
     * @default 1
     */
    get resolution()
    {
        return this._resolution;
    };

    set resolution(value) // eslint-disable-line require-jsdoc
    {
        this._autoResolution = false;

        if (this._resolution === value)
        {
            return;
        }

        this._resolution = value;
        this.dirty = true;
    };
}


