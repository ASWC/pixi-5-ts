





export class settings
{
	
	
	
	
	
	

	
	







    
    static isMobile_min:any









    /**
	 * Target frames per millisecond.
	 *
	 * @static
	 * @name TARGET_FPMS
	 * @memberof PIXI.settings
	 * @type {number}
	 * @default 0.06
	 */
    static TARGET_FPMS = 0.06;

    /**
     * Default filter resolution.
     *
     * @static
     * @name FILTER_RESOLUTION
     * @memberof PIXI.settings
     * @type {number}
     * @default 1
     */
    static FILTER_RESOLUTION = 1

    // TODO: maybe change to SPRITE.BATCH_SIZE: 2000
    // TODO: maybe add PARTICLE.BATCH_SIZE: 15000

    /**
     * The default sprite batch size.
     *
     * The default aims to balance desktop and mobile devices.
     *
     * @static
     * @name SPRITE_BATCH_SIZE
     * @memberof PIXI.settings
     * @type {number}
     * @default 4096
     */
    static SPRITE_BATCH_SIZE = 4096

    /**
     * Default Garbage Collection mode.
     *
     * @static
     * @name GC_MODE
     * @memberof PIXI.settings
     * @type {PIXI.GC_MODES}
     * @default PIXI.GC_MODES.AUTO
     */
    static GC_MODE = 0
    /**
     * Default Garbage Collection max idle.
     *
     * @static
     * @name GC_MAX_IDLE
     * @memberof PIXI.settings
     * @type {number}
     * @default 3600
     */
    static GC_MAX_IDLE = 60 * 60
    /**
     * Default Garbage Collection maximum check count.
     *
     * @static
     * @name GC_MAX_CHECK_COUNT
     * @memberof PIXI.settings
     * @type {number}
     * @default 600
     */
	static GC_MAX_CHECK_COUNT = 60 * 10
		/**
	 * The gc modes that are supported by pixi.
	 *
	 * The {@link PIXI.settings.GC_MODE} Garbage Collection mode for PixiJS textures is AUTO
	 * If set to GC_MODE, the renderer will occasionally check textures usage. If they are not
	 * used for a specified period of time they will be removed from the GPU. They will of course
	 * be uploaded again when they are required. This is a silent behind the scenes process that
	 * should ensure that the GPU does not  get filled up.
	 *
	 * Handy for mobile devices!
	 * This property only affects WebGL.
	 *
	 * @name GC_MODES
	 * @enum {number}
	 * @static
	 * @memberof PIXI
	 * @property {number} AUTO - Garbage collection will happen periodically automatically
	 * @property {number} MANUAL - Garbage collection will need to be called manually
	 */
	static GC_MODES = {
	    AUTO:           0,
	    MANUAL:         1,
	};



	/**
	 * Constants that specify float precision in shaders.
	 *
	 * @name PRECISION
	 * @memberof PIXI
	 * @static
	 * @enum {string}
	 * @constant
	 * @property {string} LOW='lowp'
	 * @property {string} MEDIUM='mediump'
	 * @property {string} HIGH='highp'
	 */
	static PRECISION = {
	    LOW: 'lowp',
	    MEDIUM: 'mediump',
	    HIGH: 'highp',
	};
		/**
	 * Graphics curves resolution settings. If `adaptive` flag is set to `true`,
	 * the resolution is calculated based on the curve's length to ensure better visual quality.
	 * Adaptive draw works with `bezierCurveTo` and `quadraticCurveTo`.
	 *
	 * @static
	 * @constant
	 * @memberof PIXI
	 * @name GRAPHICS_CURVES
	 * @type {object}
	 * @property {boolean} adaptive=false - flag indicating if the resolution should be adaptive
	 * @property {number} maxLength=10 - maximal length of a single segment of the curve (if adaptive = false, ignored)
	 * @property {number} minSegments=8 - minimal number of segments in the curve (if adaptive = false, ignored)
	 * @property {number} maxSegments=2048 - maximal number of segments in the curve (if adaptive = false, ignored)
	 */
	static GRAPHICS_CURVES = {
	    adaptive: true,
	    maxLength: 10,
	    minSegments: 8,
	    maxSegments: 2048,
	    _segmentsCount: function _segmentsCount(length, defaultSegments = null)
	    {
	        if ( defaultSegments === void 0 ) { defaultSegments = 20; }

	        if (!this.adaptive)
	        {
	            return defaultSegments;
	        }

	        var result = Math.ceil(length / this.maxLength);

	        if (result < this.minSegments)
	        {
	            result = this.minSegments;
	        }
	        else if (result > this.maxSegments)
	        {
	            result = this.maxSegments;
	        }

	        return result;
	    },
	};










 
    



    

    



    

    

    

    

	static initialN = 128
	static initialBias = 72
	static stringFromCharCode = String.fromCharCode
	static delimiter = '-'
	static maxInt = 2147483647
	static floor = Math.floor
	static base = 36
	static tMin = 1
	static tMax = 26
	/** Error messages */
	static errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	}
	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	static digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * <any>(digit < 26) - (<any>(flag != 0) << 5);
	}
	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	static error(type) {
		throw RangeError(settings.errors[type]);
	}
			/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 * @memberOf punycode
		 * @param {String} input The string of Unicode symbols.
		 * @returns {String} The resulting Punycode string of ASCII-only symbols.
		 */
		static encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],
			    /** `inputLength` will hold the number of code points in `input`. */
			    inputLength,
			    /** Cached calculation results */
			    handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;

			// Convert the input in UCS-2 to Unicode
			input = settings.ucs2decode(input);

			// Cache the length
			inputLength = input.length;

			// Initialize the state
			n = settings.initialN;
			delta = 0;
			bias = settings.initialBias;

			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(settings.stringFromCharCode(currentValue));
				}
			}

			handledCPCount = basicLength = output.length;

			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.

			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(settings.delimiter);
			}

			// Main encoding loop:
			while (handledCPCount < inputLength) {

				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = settings.maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}

				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > settings.floor((settings.maxInt - delta) / handledCPCountPlusOne)) {
					settings.error('overflow');
				}

				delta += (m - n) * handledCPCountPlusOne;
				n = m;

				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];

					if (currentValue < n && ++delta > settings.maxInt) {
						settings.error('overflow');
					}

					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = settings.base; /* no condition */; k += settings.base) {
							t = k <= bias ? settings.tMin : (k >= bias + settings.tMax ? settings.tMax : k - bias);
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = settings.base - t;
							output.push(
								settings.stringFromCharCode(settings.digitToBasic(t + qMinusT % baseMinusT, 0))
							);
							q = settings.floor(qMinusT / baseMinusT);
						}

						output.push(settings.stringFromCharCode(settings.digitToBasic(q, 0)));
						bias = settings.adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}

				++delta;
				++n;

			}
			return output.join('');
		}

		static damp = 700
		static baseMinusTMin = settings.base - settings.tMin
		static skew = 38

				/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * http://tools.ietf.org/html/rfc3492#section-3.4
		 * @private
		 */
		static adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? settings.floor(delta / settings.damp) : delta >> 1;
			delta += settings.floor(delta / numPoints);
			for (/* no initialization */; delta > settings.baseMinusTMin * settings.tMax >> 1; k += settings.base) {
				delta = settings.floor(delta / settings.baseMinusTMin);
			}
			return settings.floor(k + (settings.baseMinusTMin + 1) * delta / (delta + settings.skew));
		}

				/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 * @see `punycode.ucs2.encode`
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode.ucs2
		 * @name decode
		 * @param {String} string The Unicode input string (UCS-2).
		 * @returns {Array} The new array of code points.
		 */
		static ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}
	











    
 








		/**
	 * Regexp for data URI.
	 * Based on: {@link https://github.com/ragingwind/data-uri-regex}
	 *
	 * @static
	 * @constant {RegExp|string} DATA_URI
	 * @memberof PIXI
	 * @example data:image/png;base64
	 */
	static DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;charset=([\w-]+))?(?:;(base64))?,(.*)/i;

		/**
	 * Typedef for decomposeDataUri return object.
	 *
	 * @memberof PIXI.utils
	 * @typedef {object} DecomposedDataUri
	 * @property {string} mediaType Media type, eg. `image`
	 * @property {string} subType Sub type, eg. `png`
	 * @property {string} encoding Data encoding, eg. `base64`
	 * @property {string} data The actual data
	 */

	/**
	 * Split a data URI into components. Returns undefined if
	 * parameter `dataUri` is not a valid data URI.
	 *
	 * @memberof PIXI.utils
	 * @function decomposeDataUri
	 * @param {string} dataUri - the data URI to check
	 * @return {PIXI.utils.DecomposedDataUri|undefined} The decomposed data uri or undefined
	 */
	static decomposeDataUri(dataUri)
	{
	    var dataUriMatch = settings.DATA_URI.exec(dataUri);

	    if (dataUriMatch)
	    {
	        return {
	            mediaType: dataUriMatch[1] ? dataUriMatch[1].toLowerCase() : undefined,
	            subType: dataUriMatch[2] ? dataUriMatch[2].toLowerCase() : undefined,
	            charset: dataUriMatch[3] ? dataUriMatch[3].toLowerCase() : undefined,
	            encoding: dataUriMatch[4] ? dataUriMatch[4].toLowerCase() : undefined,
	            data: dataUriMatch[5],
	        };
	    }

	    return undefined;
	}


















		// Taken from the bit-twiddle package





























	static defaultVertex = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n    vTextureCoord = aTextureCoord;\r\n}";


	static defaultFilterVertex = "attribute vec2 aVertexPosition;\r\n\r\nuniform mat3 projectionMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform vec4 inputSize;\r\nuniform vec4 outputFrame;\r\n\r\nvec4 filterVertexPosition( void )\r\n{\r\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\r\n\r\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\r\n}\r\n\r\nvec2 filterTextureCoord( void )\r\n{\r\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\r\n}\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = filterVertexPosition();\r\n    vTextureCoord = filterTextureCoord();\r\n}\r\n";































	
   
}

