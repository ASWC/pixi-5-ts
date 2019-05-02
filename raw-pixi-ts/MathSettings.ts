

export class MathSettings
{
    static nextUid = 0;  
	static PI_2 = Math.PI * 2;  
    static RAD_TO_DEG = 180 / Math.PI;
	static DEG_TO_RAD = Math.PI / 180;
	static uid()
	{
	    return ++MathSettings.nextUid;
    }
	static sign(n)
	{
	    if (n === 0) { return 0; }

	    return n < 0 ? -1 : 1;
	}
	static string2hex(string)
	{
	    if (typeof string === 'string' && string[0] === '#')
	    {
	        string = string.substr(1);
	    }

	    return parseInt(string, 16);
	}
	static hex2string(hex)
	{
	    hex = hex.toString(16);
	    hex = '000000'.substr(0, 6 - hex.length) + hex;

	    return ("#" + hex);
	}
	static log2(v)
	{
	    var r = <any>(v > 0xFFFF) << 4;

	    v >>>= r;

	    var shift = <any>(v > 0xFF) << 3;

	    v >>>= shift; r |= shift;
	    shift = <any>(v > 0xF) << 2;
	    v >>>= shift; r |= shift;
	    shift = <any>(v > 0x3) << 1;
	    v >>>= shift; r |= shift;

	    return r | (v >> 1);
	}
	static nextPow2(v)
	{
	    v += v === 0;
	    --v;
	    v |= v >>> 1;
	    v |= v >>> 2;
	    v |= v >>> 4;
	    v |= v >>> 8;
	    v |= v >>> 16;

	    return v + 1;
	}
	static isPow2(v)
	{
	    return !(v & (v - 1)) && (!!v);
	}
}