

export class TextMetrics
{
    static canvas

	

	/**
	 * Cached canvas element for measuring text
	 * @memberof PIXI.TextMetrics
	 * @type {HTMLCanvasElement}
	 * @private
	 */
	static _canvas 

	/**
	 * Cache for context to use.
	 * @memberof PIXI.TextMetrics
	 * @type {CanvasRenderingContext2D}
	 * @private
	 */
    static _context 
    
    text;
    style;
    width;
    height;
    lines;
    lineWidths;
    lineHeight;
    maxLineWidth;
    fontProperties;

    constructor(text, style, width, height, lines, lineWidths, lineHeight, maxLineWidth, fontProperties)
    {
        if(!TextMetrics.canvas)
        {
            TextMetrics.canvas = document.createElement('canvas');
            TextMetrics.canvas.width = TextMetrics.canvas.height = 10;
            TextMetrics._canvas = TextMetrics.canvas;
            TextMetrics._context = TextMetrics.canvas.getContext('2d');
        }
        this.text = text;
	    this.style = style;
	    this.width = width;
	    this.height = height;
	    this.lines = lines;
	    this.lineWidths = lineWidths;
	    this.lineHeight = lineHeight;
	    this.maxLineWidth = maxLineWidth;
	    this.fontProperties = fontProperties;
	}
	
	public static init():void
	{
		if(!TextMetrics.canvas)
        {
            TextMetrics.canvas = document.createElement('canvas');
            TextMetrics.canvas.width = TextMetrics.canvas.height = 10;
            TextMetrics._canvas = TextMetrics.canvas;
            TextMetrics._context = TextMetrics.canvas.getContext('2d');
        }
	}

    /**
	 * Measures the supplied string of text and returns a Rectangle.
	 *
	 * @param {string} text - the text to measure.
	 * @param {PIXI.TextStyle} style - the text style to use for measuring
	 * @param {boolean} [wordWrap] - optional override for if word-wrap should be applied to the text.
	 * @param {HTMLCanvasElement} [canvas] - optional specification of the canvas to use for measuring.
	 * @return {PIXI.TextMetrics} measured width and height of the text.
	 */
	static measureText  (text, style, wordWrap, canvas = TextMetrics._canvas)
	{

	    wordWrap = (wordWrap === undefined || wordWrap === null) ? style.wordWrap : wordWrap;
	    var font = style.toFontString();
	    var fontProperties = TextMetrics.measureFont(font);

	    // fallback in case UA disallow canvas data extraction
	    // (toDataURI, getImageData functions)
	    if (fontProperties.fontSize === 0)
	    {
	        fontProperties.fontSize = style.fontSize;
	        fontProperties.ascent = style.fontSize;
	    }

	    var context = canvas.getContext('2d');

	    context.font = font;

	    var outputText = wordWrap ? TextMetrics.wordWrap(text, style, canvas) : text;
	    var lines = outputText.split(/(?:\r\n|\r|\n)/);
	    var lineWidths = new Array(lines.length);
	    var maxLineWidth = 0;

	    for (var i = 0; i < lines.length; i++)
	    {
	        var lineWidth = context.measureText(lines[i]).width + ((lines[i].length - 1) * style.letterSpacing);

	        lineWidths[i] = lineWidth;
	        maxLineWidth = Math.max(maxLineWidth, lineWidth);
	    }
	    var width = maxLineWidth + style.strokeThickness;

	    if (style.dropShadow)
	    {
	        width += style.dropShadowDistance;
	    }

	    var lineHeight = style.lineHeight || fontProperties.fontSize + style.strokeThickness;
	    var height = Math.max(lineHeight, fontProperties.fontSize + style.strokeThickness)
	        + ((lines.length - 1) * (lineHeight + style.leading));

	    if (style.dropShadow)
	    {
	        height += style.dropShadowDistance;
	    }

	    return new TextMetrics(
	        text,
	        style,
	        width,
	        height,
	        lines,
	        lineWidths,
	        lineHeight + style.leading,
	        maxLineWidth,
	        fontProperties
	    );
	};

	/**
	 * Applies newlines to a string to have it optimally fit into the horizontal
	 * bounds set by the Text object's wordWrapWidth property.
	 *
	 * @private
	 * @param {string} text - String to apply word wrapping to
	 * @param {PIXI.TextStyle} style - the style to use when wrapping
	 * @param {HTMLCanvasElement} [canvas] - optional specification of the canvas to use for measuring.
	 * @return {string} New string with new lines applied where required
	 */
	static wordWrap  (text, style, canvas)
	{
	        if ( canvas === void 0 ) { canvas = TextMetrics._canvas; }

	    var context = canvas.getContext('2d');

	    var width = 0;
	    var line = '';
	    var lines = '';

	    var cache = {};
	    var letterSpacing = style.letterSpacing;
	        var whiteSpace = style.whiteSpace;

	    // How to handle whitespaces
	    var collapseSpaces = TextMetrics.collapseSpaces(whiteSpace);
	    var collapseNewlines = TextMetrics.collapseNewlines(whiteSpace);

	    // whether or not spaces may be added to the beginning of lines
	    var canPrependSpaces = !collapseSpaces;

	    // There is letterSpacing after every char except the last one
	    // t_h_i_s_' '_i_s_' '_a_n_' '_e_x_a_m_p_l_e_' '_!
	    // so for convenience the above needs to be compared to width + 1 extra letterSpace
	    // t_h_i_s_' '_i_s_' '_a_n_' '_e_x_a_m_p_l_e_' '_!_
	    // ________________________________________________
	    // And then the final space is simply no appended to each line
	    var wordWrapWidth = style.wordWrapWidth + letterSpacing;

	    // break text into words, spaces and newline chars
	    var tokens = TextMetrics.tokenize(text);

	    for (var i = 0; i < tokens.length; i++)
	    {
	        // get the word, space or newlineChar
	        var token = tokens[i];

	        // if word is a new line
	        if (TextMetrics.isNewline(token))
	        {
	            // keep the new line
	            if (!collapseNewlines)
	            {
	                lines += TextMetrics.addLine(line);
	                canPrependSpaces = !collapseSpaces;
	                line = '';
	                width = 0;
	                continue;
	            }

	            // if we should collapse new lines
	            // we simply convert it into a space
	            token = ' ';
	        }

	        // if we should collapse repeated whitespaces
	        if (collapseSpaces)
	        {
	            // check both this and the last tokens for spaces
	            var currIsBreakingSpace = TextMetrics.isBreakingSpace(token);
	            var lastIsBreakingSpace = TextMetrics.isBreakingSpace(line[line.length - 1]);

	            if (currIsBreakingSpace && lastIsBreakingSpace)
	            {
	                continue;
	            }
	        }

	        // get word width from cache if possible
	        var tokenWidth = TextMetrics.getFromCache(token, letterSpacing, cache, context);

	        // word is longer than desired bounds
	        if (tokenWidth > wordWrapWidth)
	        {
	            // if we are not already at the beginning of a line
	            if (line !== '')
	            {
	                // start newlines for overflow words
	                lines += TextMetrics.addLine(line);
	                line = '';
	                width = 0;
	            }

	            // break large word over multiple lines
	            if (TextMetrics.canBreakWords(token, style.breakWords))
	            {
	                // break word into characters
	                var characters = token.split('');

	                // loop the characters
	                for (var j = 0; j < characters.length; j++)
	                {
	                    var char = characters[j];

	                    var k = 1;
	                    // we are not at the end of the token

	                    while (characters[j + k])
	                    {
	                        var nextChar = characters[j + k];
	                        var lastChar = char[char.length - 1];

	                        // should not split chars
	                        if (!TextMetrics.canBreakChars(lastChar, nextChar, token, j, style.breakWords))
	                        {
	                            // combine chars & move forward one
	                            char += nextChar;
	                        }
	                        else
	                        {
	                            break;
	                        }

	                        k++;
	                    }

	                    j += char.length - 1;

	                    var characterWidth = TextMetrics.getFromCache(char, letterSpacing, cache, context);

	                    if (characterWidth + width > wordWrapWidth)
	                    {
	                        lines += TextMetrics.addLine(line);
	                        canPrependSpaces = false;
	                        line = '';
	                        width = 0;
	                    }

	                    line += char;
	                    width += characterWidth;
	                }
	            }

	            // run word out of the bounds
	            else
	            {
	                // if there are words in this line already
	                // finish that line and start a new one
	                if (line.length > 0)
	                {
	                    lines += TextMetrics.addLine(line);
	                    line = '';
	                    width = 0;
	                }

	                var isLastToken = i === tokens.length - 1;

	                // give it its own line if it's not the end
	                lines += TextMetrics.addLine(token, !isLastToken);
	                canPrependSpaces = false;
	                line = '';
	                width = 0;
	            }
	        }

	        // word could fit
	        else
	        {
	            // word won't fit because of existing words
	            // start a new line
	            if (tokenWidth + width > wordWrapWidth)
	            {
	                // if its a space we don't want it
	                canPrependSpaces = false;

	                // add a new line
	                lines += TextMetrics.addLine(line);

	                // start a new line
	                line = '';
	                width = 0;
	            }

	            // don't add spaces to the beginning of lines
	            if (line.length > 0 || !TextMetrics.isBreakingSpace(token) || canPrependSpaces)
	            {
	                // add the word to the current line
	                line += token;

	                // update width counter
	                width += tokenWidth;
	            }
	        }
	    }

	    lines += TextMetrics.addLine(line, false);

	    return lines;
	};

	/**
	 * Convienience function for logging each line added during the wordWrap
	 * method
	 *
	 * @private
	 * @param  {string}   line    - The line of text to add
	 * @param  {boolean}  newLine - Add new line character to end
	 * @return {string}   A formatted line
	 */
	static addLine (line, newLine = true)
	{
	        if ( newLine === void 0 ) { newLine = true; }

	    line = TextMetrics.trimRight(line);

	    line = (newLine) ? (line + "\n") : line;

	    return line;
	};

	/**
	 * Gets & sets the widths of calculated characters in a cache object
	 *
	 * @private
	 * @param  {string}                key        The key
	 * @param  {number}                letterSpacing  The letter spacing
	 * @param  {object}                cache      The cache
	 * @param  {CanvasRenderingContext2D}  context    The canvas context
	 * @return {number}                The from cache.
	 */
	static getFromCache (key, letterSpacing, cache, context)
	{
	    var width = cache[key];

	    if (width === undefined)
	    {
	        var spacing = ((key.length) * letterSpacing);

	        width = context.measureText(key).width + spacing;
	        cache[key] = width;
	    }

	    return width;
	};

	/**
	 * Determines whether we should collapse breaking spaces
	 *
	 * @private
	 * @param  {string}   whiteSpace  The TextStyle property whiteSpace
	 * @return {boolean}  should collapse
	 */
	static collapseSpaces  (whiteSpace)
	{
	    return (whiteSpace === 'normal' || whiteSpace === 'pre-line');
	};

	/**
	 * Determines whether we should collapse newLine chars
	 *
	 * @private
	 * @param  {string}   whiteSpace  The white space
	 * @return {boolean}  should collapse
	 */
	static collapseNewlines  (whiteSpace)
	{
	    return (whiteSpace === 'normal');
	};

	/**
	 * trims breaking whitespaces from string
	 *
	 * @private
	 * @param  {string}  text  The text
	 * @return {string}  trimmed string
	 */
	static trimRight (text)
	{
	    if (typeof text !== 'string')
	    {
	        return '';
	    }

	    for (var i = text.length - 1; i >= 0; i--)
	    {
	        var char = text[i];

	        if (!TextMetrics.isBreakingSpace(char))
	        {
	            break;
	        }

	        text = text.slice(0, -1);
	    }

	    return text;
	};

	/**
	 * Determines if char is a newline.
	 *
	 * @private
	 * @param  {string}  char  The character
	 * @return {boolean}  True if newline, False otherwise.
	 */
	static isNewline  (char)
	{
	    if (typeof char !== 'string')
	    {
	        return false;
	    }

	    return (TextMetrics._newlines.indexOf(char.charCodeAt(0)) >= 0);
	};

	/**
	 * Determines if char is a breaking whitespace.
	 *
	 * @private
	 * @param  {string}  char  The character
	 * @return {boolean}  True if whitespace, False otherwise.
	 */
	static isBreakingSpace  (char)
	{
	    if (typeof char !== 'string')
	    {
	        return false;
	    }

	    return (TextMetrics._breakingSpaces.indexOf(char.charCodeAt(0)) >= 0);
	};

	/**
	 * Splits a string into words, breaking-spaces and newLine characters
	 *
	 * @private
	 * @param  {string}  text   The text
	 * @return {string[]}  A tokenized array
	 */
	static tokenize  (text)
	{
	    var tokens = [];
	    var token = '';

	    if (typeof text !== 'string')
	    {
	        return tokens;
	    }

	    for (var i = 0; i < text.length; i++)
	    {
	        var char = text[i];

	        if (TextMetrics.isBreakingSpace(char) || TextMetrics.isNewline(char))
	        {
	            if (token !== '')
	            {
	                tokens.push(token);
	                token = '';
	            }

	            tokens.push(char);

	            continue;
	        }

	        token += char;
	    }

	    if (token !== '')
	    {
	        tokens.push(token);
	    }

	    return tokens;
	};

	/**
	 * This method exists to be easily overridden
	 * It allows one to customise which words should break
	 * Examples are if the token is CJK or numbers.
	 * It must return a boolean.
	 *
	 * @private
	 * @param  {string}  token   The token
	 * @param  {boolean}  breakWords  The style attr break words
	 * @return {boolean} whether to break word or not
	 */
	static canBreakWords  (token, breakWords)
	{
	    return breakWords;
	};

	/**
	 * This method exists to be easily overridden
	 * It allows one to determine whether a pair of characters
	 * should be broken by newlines
	 * For example certain characters in CJK langs or numbers.
	 * It must return a boolean.
	 *
	 * @private
	 * @param  {string}  char  The character
	 * @param  {string}  nextChar  The next character
	 * @param  {string}  token The token/word the characters are from
	 * @param  {number}  index The index in the token of the char
	 * @param  {boolean}  breakWords  The style attr break words
	 * @return {boolean} whether to break word or not
	 */
	static canBreakChars  (char, nextChar, token, index, breakWords) // eslint-disable-line no-unused-vars
	{
	    return true;
	};

	/**
	 * Calculates the ascent, descent and fontSize of a given font-style
	 *
	 * @static
	 * @param {string} font - String representing the style of the font
	 * @return {PIXI.IFontMetrics} Font properties object
	 */
	static measureFont (font)
	{
	    // as this method is used for preparing assets, don't recalculate things if we don't need to
	    if (TextMetrics._fonts[font])
	    {
	        return TextMetrics._fonts[font];
	    }

	    var properties:any = {};

	    var canvas = TextMetrics._canvas;
	    var context = TextMetrics._context;

	    context.font = font;

	    var metricsString = TextMetrics.METRICS_STRING + TextMetrics.BASELINE_SYMBOL;
	    var width = Math.ceil(context.measureText(metricsString).width);
	    var baseline = Math.ceil(context.measureText(TextMetrics.BASELINE_SYMBOL).width);
	    var height = 2 * baseline;

	    baseline = baseline * TextMetrics.BASELINE_MULTIPLIER | 0;

	    canvas.width = width;
	    canvas.height = height;

	    context.fillStyle = '#f00';
	    context.fillRect(0, 0, width, height);

	    context.font = font;

	    context.textBaseline = 'alphabetic';
	    context.fillStyle = '#000';
	    context.fillText(metricsString, 0, baseline);

	    var imagedata = context.getImageData(0, 0, width, height).data;
	    var pixels = imagedata.length;
	    var line = width * 4;

	    var i = 0;
	    var idx = 0;
	    var stop = false;

	    // ascent. scan from top to bottom until we find a non red pixel
	    for (i = 0; i < baseline; ++i)
	    {
	        for (var j = 0; j < line; j += 4)
	        {
	            if (imagedata[idx + j] !== 255)
	            {
	                stop = true;
	                break;
	            }
	        }
	        if (!stop)
	        {
	            idx += line;
	        }
	        else
	        {
	            break;
	        }
	    }

	    properties.ascent = baseline - i;

	    idx = pixels - line;
	    stop = false;

	    // descent. scan from bottom to top until we find a non red pixel
	    for (i = height; i > baseline; --i)
	    {
	        for (var j$1 = 0; j$1 < line; j$1 += 4)
	        {
	            if (imagedata[idx + j$1] !== 255)
	            {
	                stop = true;
	                break;
	            }
	        }

	        if (!stop)
	        {
	            idx -= line;
	        }
	        else
	        {
	            break;
	        }
	    }

	    properties.descent = i - baseline;
	    properties.fontSize = properties.ascent + properties.descent;

	    TextMetrics._fonts[font] = properties;

	    return properties;
	};

	/**
	 * Clear font metrics in metrics cache.
	 *
	 * @static
	 * @param {string} [font] - font name. If font name not set then clear cache for all fonts.
	 */
	static clearMetrics  (font)
	{
	        if ( font === void 0 ) { font = ''; }

	    if (font)
	    {
	        delete TextMetrics._fonts[font];
	    }
	    else
	    {
	        TextMetrics._fonts = {};
	    }
	};

	/**
	 * Internal return object for {@link PIXI.TextMetrics.measureFont `TextMetrics.measureFont`}.
	 *
	 * @typedef {object} FontMetrics
	 * @property {number} ascent - The ascent distance
	 * @property {number} descent - The descent distance
	 * @property {number} fontSize - Font size from ascent to descent
	 * @memberof PIXI.TextMetrics
	 * @private
	 */

	

	/**
	 * Cache of {@see PIXI.TextMetrics.FontMetrics} objects.
	 * @memberof PIXI.TextMetrics
	 * @type {Object}
	 * @private
	 */
	static _fonts = {};

	/**
	 * String used for calculate font metrics.
	 * @static
	 * @memberof PIXI.TextMetrics
	 * @name METRICS_STRING
	 * @type {string}
	 * @default |Éq
	 */
	static METRICS_STRING = '|Éq';

	/**
	 * Baseline symbol for calculate font metrics.
	 * @static
	 * @memberof PIXI.TextMetrics
	 * @name BASELINE_SYMBOL
	 * @type {string}
	 * @default M
	 */
	static BASELINE_SYMBOL = 'M';

	/**
	 * Baseline multiplier for calculate font metrics.
	 * @static
	 * @memberof PIXI.TextMetrics
	 * @name BASELINE_MULTIPLIER
	 * @type {number}
	 * @default 1.4
	 */
	static BASELINE_MULTIPLIER = 1.4;

	/**
	 * Cache of new line chars.
	 * @memberof PIXI.TextMetrics
	 * @type {number[]}
	 * @private
	 */
	static _newlines = [
	    0x000A, // line feed
	    0x000D ];

	/**
	 * Cache of breaking spaces.
	 * @memberof PIXI.TextMetrics
	 * @type {number[]}
	 * @private
	 */
	static _breakingSpaces = [
	    0x0009, // character tabulation
	    0x0020, // space
	    0x2000, // en quad
	    0x2001, // em quad
	    0x2002, // en space
	    0x2003, // em space
	    0x2004, // three-per-em space
	    0x2005, // four-per-em space
	    0x2006, // six-per-em space
	    0x2008, // punctuation space
	    0x2009, // thin space
	    0x200A, // hair space
	    0x205F, // medium mathematical space
	    0x3000 ];
}


