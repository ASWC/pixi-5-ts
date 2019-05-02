import { MathSettings } from "./MathSettings";

export class ColorSettings
{
	static premultiplyTint(tint, alpha)
	{
	    if (alpha === 1.0)
	    {
	        return (alpha * 255 << 24) + tint;
	    }
	    if (alpha === 0.0)
	    {
	        return 0;
	    }
	    var R = ((tint >> 16) & 0xFF);
	    var G = ((tint >> 8) & 0xFF);
	    var B = (tint & 0xFF);

	    R = ((R * alpha) + 0.5) | 0;
	    G = ((G * alpha) + 0.5) | 0;
	    B = ((B * alpha) + 0.5) | 0;

	    return (alpha * 255 << 24) + (R << 16) + (G << 8) + B;
	}
	static premultiplyTintToRgba(tint, alpha, out, premultiply)
	{
	    out = out || new Float32Array(4);
	    out[0] = ((tint >> 16) & 0xFF) / 255.0;
	    out[1] = ((tint >> 8) & 0xFF) / 255.0;
	    out[2] = (tint & 0xFF) / 255.0;
	    if (premultiply || premultiply === undefined)
	    {
	        out[0] *= alpha;
	        out[1] *= alpha;
	        out[2] *= alpha;
	    }
	    out[3] = alpha;

	    return out;
	}
	static getSingleColor(color)
	{
	    if (typeof color === 'number')
	    {
	        return MathSettings.hex2string(color);
	    }
	    else if ( typeof color === 'string' )
	    {
	        if ( color.indexOf('0x') === 0 )
	        {
	            color = color.replace('0x', '#');
	        }
	    }

	    return color;
	}
	static getColor(color)
	{
	    if (!Array.isArray(color))
	    {
	        return ColorSettings.getSingleColor(color);
	    }
	    else
	    {
	        for (var i = 0; i < color.length; ++i)
	        {
	            color[i] = ColorSettings.getSingleColor(color[i]);
	        }

	        return color;
	    }
	}
	static premultiplyRgba(rgb, alpha, out, premultiply)
	{
	    out = out || new Float32Array(4);
	    if (premultiply || premultiply === undefined)
	    {
	        out[0] = rgb[0] * alpha;
	        out[1] = rgb[1] * alpha;
	        out[2] = rgb[2] * alpha;
	    }
	    else
	    {
	        out[0] = rgb[0];
	        out[1] = rgb[1];
	        out[2] = rgb[2];
	    }
	    out[3] = alpha;

	    return out;
	}

	    	/**
	 * Converts a hexadecimal color number to an [R, G, B] array of normalized floats (numbers from 0.0 to 1.0).
	 *
	 * @example
	 * PIXI.utils.hex2rgb(0xffffff); // returns [1, 1, 1]
	 * @memberof PIXI.utils
	 * @function hex2rgb
	 * @param {number} hex - The hexadecimal number to convert
	 * @param  {number[]} [out=[]] If supplied, this array will be used rather than returning a new one
	 * @return {number[]} An array representing the [R, G, B] of the color where all values are floats.
	 */
	static hex2rgb(hex, out = null)
	{
	    out = out || [];

	    out[0] = ((hex >> 16) & 0xFF) / 255;
	    out[1] = ((hex >> 8) & 0xFF) / 255;
	    out[2] = (hex & 0xFF) / 255;

	    return out;
	}
	
			/**
	 * Converts a color as an [R, G, B] array of normalized floats to a hexadecimal number.
	 *
	 * @example
	 * PIXI.utils.rgb2hex([1, 1, 1]); // returns 0xffffff
	 * @memberof PIXI.utils
	 * @function rgb2hex
	 * @param {number[]} rgb - Array of numbers where all values are normalized floats from 0.0 to 1.0.
	 * @return {number} Number in hexadecimal.
	 */
	static rgb2hex(rgb)
	{
	    return (((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + (rgb[2] * 255 | 0));
	}
}