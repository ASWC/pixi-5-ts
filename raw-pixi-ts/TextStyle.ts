
import { TextSettings } from './TextSettings';
import { ColorSettings } from './ColorSettings';
import { UtilsSettings } from './UtilsSettings';


export class TextStyle
{
    styleID
    _align
    _breakWords
    _dropShadow
    _wordWrapWidth
    _dropShadowAngle
    _dropShadowBlur
    _dropShadowDistance
    _fillGradientType
    _fontFamily
    _miterLimit
    _dropShadowColor
    _fontSize
    _fillGradientStops
    _padding
    _textBaseline
    _strokeThickness
    _dropShadowAlpha
    _lineHeight
    _fill
    _wordWrap
    _stroke
    _whiteSpace
    _fontStyle
    _fontVariant
    _letterSpacing
    _trim
    _leading
    _fontWeight
    _lineJoin
    constructor(style)
    {
        this.styleID = 0;

	    this.reset();

	    UtilsSettings.deepCopyProperties(this, style, style);
    }

	/**
	 * Creates a new TextStyle object with the same values as this one.
	 * Note that the only the properties of the object are cloned.
	 *
	 * @return {PIXI.TextStyle} New cloned TextStyle object
	 */
	clone ()
	{
	    var clonedProperties = {};

	    UtilsSettings.deepCopyProperties(clonedProperties, this, TextSettings.defaultStyle);

	    return new TextStyle(clonedProperties);
	};

	/**
	 * Resets all properties to the defaults specified in TextStyle.prototype._default
	 */
	reset  ()
	{
	    UtilsSettings.deepCopyProperties(this, TextSettings.defaultStyle, TextSettings.defaultStyle);
	};

	/**
	 * Alignment for multiline text ('left', 'center' or 'right'), does not affect single line text
	 *
	 * @member {string}
	 */
	get align ()
	{
	    return this._align;
	};
	set align (align) // eslint-disable-line require-jsdoc
	{
	    if (this._align !== align)
	    {
	        this._align = align;
	        this.styleID++;
	    }
	};

	/**
	 * Indicates if lines can be wrapped within words, it needs wordWrap to be set to true
	 *
	 * @member {boolean}
	 */
	get breakWords ()
	{
	    return this._breakWords;
	};
	set breakWords (breakWords) // eslint-disable-line require-jsdoc
	{
	    if (this._breakWords !== breakWords)
	    {
	        this._breakWords = breakWords;
	        this.styleID++;
	    }
	};

	/**
	 * Set a drop shadow for the text
	 *
	 * @member {boolean}
	 */
	get dropShadow ()
	{
	    return this._dropShadow;
	};
	set dropShadow (dropShadow) // eslint-disable-line require-jsdoc
	{
	    if (this._dropShadow !== dropShadow)
	    {
	        this._dropShadow = dropShadow;
	        this.styleID++;
	    }
	};

	/**
	 * Set alpha for the drop shadow
	 *
	 * @member {number}
	 */
	get dropShadowAlpha ()
	{
	    return this._dropShadowAlpha;
	};
	set dropShadowAlpha (dropShadowAlpha) // eslint-disable-line require-jsdoc
	{
	    if (this._dropShadowAlpha !== dropShadowAlpha)
	    {
	        this._dropShadowAlpha = dropShadowAlpha;
	        this.styleID++;
	    }
	};

	/**
	 * Set a angle of the drop shadow
	 *
	 * @member {number}
	 */
	get dropShadowAngle ()
	{
	    return this._dropShadowAngle;
	};
	set dropShadowAngle (dropShadowAngle) // eslint-disable-line require-jsdoc
	{
	    if (this._dropShadowAngle !== dropShadowAngle)
	    {
	        this._dropShadowAngle = dropShadowAngle;
	        this.styleID++;
	    }
	};

	/**
	 * Set a shadow blur radius
	 *
	 * @member {number}
	 */
	get dropShadowBlur ()
	{
	    return this._dropShadowBlur;
	};
	set dropShadowBlur (dropShadowBlur) // eslint-disable-line require-jsdoc
	{
	    if (this._dropShadowBlur !== dropShadowBlur)
	    {
	        this._dropShadowBlur = dropShadowBlur;
	        this.styleID++;
	    }
	};

	/**
	 * A fill style to be used on the dropshadow e.g 'red', '#00FF00'
	 *
	 * @member {string|number}
	 */
	get dropShadowColor()
	{
	    return this._dropShadowColor;
	};
	set dropShadowColor (dropShadowColor) // eslint-disable-line require-jsdoc
	{
	    var outputColor = ColorSettings.getColor(dropShadowColor);
	    if (this._dropShadowColor !== outputColor)
	    {
	        this._dropShadowColor = outputColor;
	        this.styleID++;
	    }
	};

	/**
	 * Set a distance of the drop shadow
	 *
	 * @member {number}
	 */
	get dropShadowDistance()
	{
	    return this._dropShadowDistance;
	};
	set dropShadowDistance (dropShadowDistance) // eslint-disable-line require-jsdoc
	{
	    if (this._dropShadowDistance !== dropShadowDistance)
	    {
	        this._dropShadowDistance = dropShadowDistance;
	        this.styleID++;
	    }
	};

	/**
	 * A canvas fillstyle that will be used on the text e.g 'red', '#00FF00'.
	 * Can be an array to create a gradient eg ['#000000','#FFFFFF']
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|MDN}
	 *
	 * @member {string|string[]|number|number[]|CanvasGradient|CanvasPattern}
	 */
	get fill ()
	{
	    return this._fill;
	};
	set fill(fill) // eslint-disable-line require-jsdoc
	{
	    var outputColor = ColorSettings.getColor(fill);
	    if (this._fill !== outputColor)
	    {
	        this._fill = outputColor;
	        this.styleID++;
	    }
	};

	/**
	 * If fill is an array of colours to create a gradient, this can change the type/direction of the gradient.
	 * See {@link PIXI.TEXT_GRADIENT}
	 *
	 * @member {number}
	 */
	get fillGradientType ()
	{
	    return this._fillGradientType;
	};
	set fillGradientType (fillGradientType) // eslint-disable-line require-jsdoc
	{
	    if (this._fillGradientType !== fillGradientType)
	    {
	        this._fillGradientType = fillGradientType;
	        this.styleID++;
	    }
	};

	/**
	 * If fill is an array of colours to create a gradient, this array can set the stop points
	 * (numbers between 0 and 1) for the color, overriding the default behaviour of evenly spacing them.
	 *
	 * @member {number[]}
	 */
	get fillGradientStops ()
	{
	    return this._fillGradientStops;
	};
	set fillGradientStops (fillGradientStops) // eslint-disable-line require-jsdoc
	{
	    if (!UtilsSettings.areArraysEqual(this._fillGradientStops,fillGradientStops))
	    {
	        this._fillGradientStops = fillGradientStops;
	        this.styleID++;
	    }
	};

	/**
	 * The font family
	 *
	 * @member {string|string[]}
	 */
	get fontFamily ()
	{
	    return this._fontFamily;
	};
	set fontFamily (fontFamily) // eslint-disable-line require-jsdoc
	{
	    if (this.fontFamily !== fontFamily)
	    {
	        this._fontFamily = fontFamily;
	        this.styleID++;
	    }
	};

	/**
	 * The font size
	 * (as a number it converts to px, but as a string, equivalents are '26px','20pt','160%' or '1.6em')
	 *
	 * @member {number|string}
	 */
	get fontSize ()
	{
	    return this._fontSize;
	};
	set fontSize (fontSize) // eslint-disable-line require-jsdoc
	{
	    if (this._fontSize !== fontSize)
	    {
	        this._fontSize = fontSize;
	        this.styleID++;
	    }
	};

	/**
	 * The font style
	 * ('normal', 'italic' or 'oblique')
	 *
	 * @member {string}
	 */
	get fontStyle ()
	{
	    return this._fontStyle;
	};
	set fontStyle (fontStyle) // eslint-disable-line require-jsdoc
	{
	    if (this._fontStyle !== fontStyle)
	    {
	        this._fontStyle = fontStyle;
	        this.styleID++;
	    }
	};

	/**
	 * The font variant
	 * ('normal' or 'small-caps')
	 *
	 * @member {string}
	 */
	get fontVariant()
	{
	    return this._fontVariant;
	};
	set fontVariant (fontVariant) // eslint-disable-line require-jsdoc
	{
	    if (this._fontVariant !== fontVariant)
	    {
	        this._fontVariant = fontVariant;
	        this.styleID++;
	    }
	};

	/**
	 * The font weight
	 * ('normal', 'bold', 'bolder', 'lighter' and '100', '200', '300', '400', '500', '600', '700', 800' or '900')
	 *
	 * @member {string}
	 */
	get fontWeight ()
	{
	    return this._fontWeight;
	};
	set fontWeight (fontWeight) // eslint-disable-line require-jsdoc
	{
	    if (this._fontWeight !== fontWeight)
	    {
	        this._fontWeight = fontWeight;
	        this.styleID++;
	    }
	};

	/**
	 * The amount of spacing between letters, default is 0
	 *
	 * @member {number}
	 */
	get letterSpacing ()
	{
	    return this._letterSpacing;
	};
	set letterSpacing (letterSpacing) // eslint-disable-line require-jsdoc
	{
	    if (this._letterSpacing !== letterSpacing)
	    {
	        this._letterSpacing = letterSpacing;
	        this.styleID++;
	    }
	};

	/**
	 * The line height, a number that represents the vertical space that a letter uses
	 *
	 * @member {number}
	 */
	get lineHeight ()
	{
	    return this._lineHeight;
	};
	set lineHeight(lineHeight) // eslint-disable-line require-jsdoc
	{
	    if (this._lineHeight !== lineHeight)
	    {
	        this._lineHeight = lineHeight;
	        this.styleID++;
	    }
	};

	/**
	 * The space between lines
	 *
	 * @member {number}
	 */
	get leading ()
	{
	    return this._leading;
	};
	set leading (leading) // eslint-disable-line require-jsdoc
	{
	    if (this._leading !== leading)
	    {
	        this._leading = leading;
	        this.styleID++;
	    }
	};

	/**
	 * The lineJoin property sets the type of corner created, it can resolve spiked text issues.
	 * Default is 'miter' (creates a sharp corner).
	 *
	 * @member {string}
	 */
	get lineJoin ()
	{
	    return this._lineJoin;
	};
	set lineJoin (lineJoin) // eslint-disable-line require-jsdoc
	{
	    if (this._lineJoin !== lineJoin)
	    {
	        this._lineJoin = lineJoin;
	        this.styleID++;
	    }
	};

	/**
	 * The miter limit to use when using the 'miter' lineJoin mode
	 * This can reduce or increase the spikiness of rendered text.
	 *
	 * @member {number}
	 */
	get miterLimit ()
	{
	    return this._miterLimit;
	};
	set miterLimit (miterLimit) // eslint-disable-line require-jsdoc
	{
	    if (this._miterLimit !== miterLimit)
	    {
	        this._miterLimit = miterLimit;
	        this.styleID++;
	    }
	};

	/**
	 * Occasionally some fonts are cropped. Adding some padding will prevent this from happening
	 * by adding padding to all sides of the text.
	 *
	 * @member {number}
	 */
	get padding ()
	{
	    return this._padding;
	};
	set padding (padding) // eslint-disable-line require-jsdoc
	{
	    if (this._padding !== padding)
	    {
	        this._padding = padding;
	        this.styleID++;
	    }
	};

	/**
	 * A canvas fillstyle that will be used on the text stroke
	 * e.g 'blue', '#FCFF00'
	 *
	 * @member {string|number}
	 */
	get stroke ()
	{
	    return this._stroke;
	};
	set stroke (stroke) // eslint-disable-line require-jsdoc
	{
	    var outputColor = ColorSettings.getColor(stroke);
	    if (this._stroke !== outputColor)
	    {
	        this._stroke = outputColor;
	        this.styleID++;
	    }
	};

	/**
	 * A number that represents the thickness of the stroke.
	 * Default is 0 (no stroke)
	 *
	 * @member {number}
	 */
	get strokeThickness ()
	{
	    return this._strokeThickness;
	};
	set strokeThickness(strokeThickness) // eslint-disable-line require-jsdoc
	{
	    if (this._strokeThickness !== strokeThickness)
	    {
	        this._strokeThickness = strokeThickness;
	        this.styleID++;
	    }
	};

	/**
	 * The baseline of the text that is rendered.
	 *
	 * @member {string}
	 */
	get textBaseline ()
	{
	    return this._textBaseline;
	};
	set textBaseline (textBaseline) // eslint-disable-line require-jsdoc
	{
	    if (this._textBaseline !== textBaseline)
	    {
	        this._textBaseline = textBaseline;
	        this.styleID++;
	    }
	};

	/**
	 * Trim transparent borders
	 *
	 * @member {boolean}
	 */
	get trim ()
	{
	    return this._trim;
	};
	set trim (trim) // eslint-disable-line require-jsdoc
	{
	    if (this._trim !== trim)
	    {
	        this._trim = trim;
	        this.styleID++;
	    }
	};

	/**
	 * How newlines and spaces should be handled.
	 * Default is 'pre' (preserve, preserve).
	 *
	 *  value   | New lines |   Spaces
	 *  ---     | ---       |   ---
	 * 'normal' | Collapse  |   Collapse
	 * 'pre'    | Preserve  |   Preserve
	 * 'pre-line'   | Preserve  |   Collapse
	 *
	 * @member {string}
	 */
	get whiteSpace ()
	{
	    return this._whiteSpace;
	};
	set whiteSpace (whiteSpace) // eslint-disable-line require-jsdoc
	{
	    if (this._whiteSpace !== whiteSpace)
	    {
	        this._whiteSpace = whiteSpace;
	        this.styleID++;
	    }
	};

	/**
	 * Indicates if word wrap should be used
	 *
	 * @member {boolean}
	 */
	get wordWrap ()
	{
	    return this._wordWrap;
	};
	set wordWrap(wordWrap) // eslint-disable-line require-jsdoc
	{
	    if (this._wordWrap !== wordWrap)
	    {
	        this._wordWrap = wordWrap;
	        this.styleID++;
	    }
	};

	/**
	 * The width at which text will wrap, it needs wordWrap to be set to true
	 *
	 * @member {number}
	 */
	get wordWrapWidth ()
	{
	    return this._wordWrapWidth;
	};
	set wordWrapWidth (wordWrapWidth) // eslint-disable-line require-jsdoc
	{
	    if (this._wordWrapWidth !== wordWrapWidth)
	    {
	        this._wordWrapWidth = wordWrapWidth;
	        this.styleID++;
	    }
	};

	/**
	 * Generates a font style string to use for `TextMetrics.measureFont()`.
	 *
	 * @return {string} Font style string, for passing to `TextMetrics.measureFont()`
	 */
	toFontString  ()
	{
	    // build canvas api font setting from individual components. Convert a numeric this.fontSize to px
	    var fontSizeString = (typeof this.fontSize === 'number') ? ((this.fontSize) + "px") : this.fontSize;

	    // Clean-up fontFamily property by quoting each font name
	    // this will support font names with spaces
	    var fontFamilies = this.fontFamily;

	    if (!Array.isArray(this.fontFamily))
	    {
	        fontFamilies = this.fontFamily.split(',');
	    }

	    for (var i = fontFamilies.length - 1; i >= 0; i--)
	    {
	        // Trim any extra white-space
	        var fontFamily = fontFamilies[i].trim();

	        // Check if font already contains strings
	        if (!(/([\"\'])[^\'\"]+\1/).test(fontFamily))
	        {
	            fontFamily = "\"" + fontFamily + "\"";
	        }
	        fontFamilies[i] = fontFamily;
	    }

	    return ((this.fontStyle) + " " + (this.fontVariant) + " " + (this.fontWeight) + " " + fontSizeString + " " + (fontFamilies.join(',')));
	};
}

