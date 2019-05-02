
export class DisplaySettings
{
	static SORTABLE_CHILDREN = false;
    static CREATE_IMAGE_BITMAP = true
	static RENDERER_TYPE = {
	    UNKNOWN:    0,
	    WEBGL:      1,
	    CANVAS:     2,
	};
	static ENV = {
	    WEBGL_LEGACY: 0,
	    WEBGL: 1,
	    WEBGL2: 2,
	};
    static RESOLUTION = 1
    static SCALE_MODE = 1
    static ROUND_PIXELS = false
    static PREFER_ENV = DisplaySettings.ENV.WEBGL;
   
}