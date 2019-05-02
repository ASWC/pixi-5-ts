import { Program } from './Program';
import { Matrix } from './Matrix';
import { Shader } from './Shader';
import { CacheSettings } from './CacheSettings';
import { UniformGroup } from './UniformGroup';
import { DisplaySettings } from './DisplaySettings';


export class WebGLSettings
{
	static UPLOADS_PER_FRAME = 4;
	static GLSL_TO_ARRAY_SETTERS = {

	    float:    "gl.uniform1fv(location, v)",

	    vec2:     "gl.uniform2fv(location, v)",
	    vec3:     "gl.uniform3fv(location, v)",
	    vec4:     'gl.uniform4fv(location, v)',

	    mat4:     'gl.uniformMatrix4fv(location, false, v)',
	    mat3:     'gl.uniformMatrix3fv(location, false, v)',
	    mat2:     'gl.uniformMatrix2fv(location, false, v)',

	    int:      'gl.uniform1iv(location, v)',
	    ivec2:    'gl.uniform2iv(location, v)',
	    ivec3:    'gl.uniform3iv(location, v)',
	    ivec4:    'gl.uniform4iv(location, v)',

	    bool:     'gl.uniform1iv(location, v)',
	    bvec2:    'gl.uniform2iv(location, v)',
	    bvec3:    'gl.uniform3iv(location, v)',
	    bvec4:    'gl.uniform4iv(location, v)',

	    sampler2D:      'gl.uniform1iv(location, v)',
	    samplerCube:    'gl.uniform1iv(location, v)',
	    sampler2DArray: 'gl.uniform1iv(location, v)',
	};
	static GLSL_TO_SINGLE_SETTERS_CACHED = {

		float: "\n    if(cv !== v)\n    {\n        cv.v = v;\n        gl.uniform1f(location, v)\n    }",

		vec2: "\n    if(cv[0] !== v[0] || cv[1] !== v[1])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        gl.uniform2f(location, v[0], v[1])\n    }",

		vec3: "\n    if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n\n        gl.uniform3f(location, v[0], v[1], v[2])\n    }",

		vec4:     'gl.uniform4f(location, v[0], v[1], v[2], v[3])',

		int:      'gl.uniform1i(location, v)',
		ivec2:    'gl.uniform2i(location, v[0], v[1])',
		ivec3:    'gl.uniform3i(location, v[0], v[1], v[2])',
		ivec4:    'gl.uniform4i(location, v[0], v[1], v[2], v[3])',

		bool:     'gl.uniform1i(location, v)',
		bvec2:    'gl.uniform2i(location, v[0], v[1])',
		bvec3:    'gl.uniform3i(location, v[0], v[1], v[2])',
		bvec4:    'gl.uniform4i(location, v[0], v[1], v[2], v[3])',

		mat2:     'gl.uniformMatrix2fv(location, false, v)',
		mat3:     'gl.uniformMatrix3fv(location, false, v)',
		mat4:     'gl.uniformMatrix4fv(location, false, v)',

		sampler2D:      'gl.uniform1i(location, v)',
		samplerCube:    'gl.uniform1i(location, v)',
		sampler2DArray: 'gl.uniform1i(location, v)',
	};
	static GLSL_TO_SIZE = {
		float:    1,
		vec2:     2,
		vec3:     3,
		vec4:     4,
	
		int:      1,
		ivec2:    2,
		ivec3:    3,
		ivec4:    4,
	
		bool:     1,
		bvec2:    2,
		bvec3:    3,
		bvec4:    4,
	
		mat2:     4,
		mat3:     9,
		mat4:     16,
	
		sampler2D:  1,
	};
	static GL_TO_GLSL_TYPES = {
		FLOAT:       'float',
		FLOAT_VEC2:  'vec2',
		FLOAT_VEC3:  'vec3',
		FLOAT_VEC4:  'vec4',
	
		INT:         'int',
		INT_VEC2:    'ivec2',
		INT_VEC3:    'ivec3',
		INT_VEC4:    'ivec4',
	
		BOOL:        'bool',
		BOOL_VEC2:   'bvec2',
		BOOL_VEC3:   'bvec3',
		BOOL_VEC4:   'bvec4',
	
		FLOAT_MAT2:  'mat2',
		FLOAT_MAT3:  'mat3',
		FLOAT_MAT4:  'mat4',
	
		SAMPLER_2D:  'sampler2D',
		SAMPLER_CUBE:  'samplerCube',
		SAMPLER_2D_ARRAY:  'sampler2DArray',
	};
	static GL_TABLE = null;
	static context = null;
    static PRECISION_FRAGMENT = 'highp'
    static PRECISION_VERTEX = 'highp'
	static fragTemplate = [
	    'precision mediump float;',
	    'void main(void){',
	    'float test = 0.1;',
	    '%forloop%',
	    'gl_FragColor = vec4(0.0);',
	    '}' ].join('\n');
	static vertex$1 = "precision highp float;\r\nattribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\nattribute vec4 aColor;\r\nattribute float aTextureId;\r\n\r\nuniform mat3 projectionMatrix;\r\nuniform mat3 translationMatrix;\r\nuniform vec4 tint;\r\n\r\nvarying vec2 vTextureCoord;\r\nvarying vec4 vColor;\r\nvarying float vTextureId;\r\n\r\nvoid main(void){\r\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n\r\n    vTextureCoord = aTextureCoord;\r\n    vTextureId = aTextureId;\r\n    vColor = aColor * tint;\r\n}\r\n";
	static fragTemplate$1 = [
	    'varying vec2 vTextureCoord;',
	    'varying vec4 vColor;',
	    'varying float vTextureId;',
	    'uniform sampler2D uSamplers[%count%];',

	    'void main(void){',
	    'vec4 color;',
	    '%forloop%',
	    'gl_FragColor = color * vColor;',
		'}' ].join('\n');
	static MIPMAP_TEXTURES = 1
    static WRAP_MODE = 33071
	static TARGETS = {
	    TEXTURE_2D: 3553,
	    TEXTURE_CUBE_MAP: 34067,
	    TEXTURE_2D_ARRAY: 35866,
	    TEXTURE_CUBE_MAP_POSITIVE_X: 34069,
	    TEXTURE_CUBE_MAP_NEGATIVE_X: 34070,
	    TEXTURE_CUBE_MAP_POSITIVE_Y: 34071,
	    TEXTURE_CUBE_MAP_NEGATIVE_Y: 34072,
	    TEXTURE_CUBE_MAP_POSITIVE_Z: 34073,
	    TEXTURE_CUBE_MAP_NEGATIVE_Z: 34074,
	};
	static FORMATS = {
	    RGBA:             6408,
	    RGB:              6407,
	    ALPHA:            6406,
	    LUMINANCE:        6409,
	    LUMINANCE_ALPHA:  6410,
	    DEPTH_COMPONENT:  6402,
	    DEPTH_STENCIL:    34041,
    };
	static TYPES = {
	    UNSIGNED_BYTE: 5121,
	    UNSIGNED_SHORT: 5123,
	    UNSIGNED_SHORT_5_6_5: 33635,
	    UNSIGNED_SHORT_4_4_4_4: 32819,
	    UNSIGNED_SHORT_5_5_5_1: 32820,
	    FLOAT: 5126,
	    HALF_FLOAT: 36193,
    };
	static MIPMAP_MODES = {
	    OFF: 0,
	    POW2: 1,
	    ON: 2,
	};
	static SCALE_MODES = {
	    LINEAR:     1,
	    NEAREST:    0,
	};
	static WRAP_MODES = {
	    CLAMP:           33071,
	    REPEAT:          10497,
	    MIRRORED_REPEAT: 33648,
	};
	static defaultBufferOptions = {
	    scaleMode: WebGLSettings.SCALE_MODES.NEAREST,
	    format: WebGLSettings.FORMATS.RGBA,
	    premultiplyAlpha: false,
	};
	static CAN_UPLOAD_SAME_BUFFER = WebGLSettings.canUploadSameBuffer()
    static SPRITE_MAX_TEXTURES = WebGLSettings.maxRecommendedTextures(32)

	static createIndicesForQuads(size)
	{
	    var totalIndices = size * 6;
	    var indices = new Uint16Array(totalIndices);
	    for (var i = 0, j = 0; i < totalIndices; i += 6, j += 4)
	    {
	        indices[i + 0] = j + 0;
	        indices[i + 1] = j + 1;
	        indices[i + 2] = j + 2;
	        indices[i + 3] = j + 0;
	        indices[i + 4] = j + 2;
	        indices[i + 5] = j + 3;
	    }
	    return indices;
	}
	static canUploadSameBuffer()
	{
	    return true;
	}
	static generateMultiTextureShader(gl, maxTextures)
	{
	    if (!CacheSettings.programCache[maxTextures])
	    {
	        var sampleValues = new Int32Array(maxTextures);
	        for (var i = 0; i < maxTextures; i++)
	        {
	            sampleValues[i] = i;
	        }
	        CacheSettings.defaultGroupCache[maxTextures] = UniformGroup.from({ uSamplers: sampleValues }, true);
	        var fragmentSrc = WebGLSettings.fragTemplate$1;
	        fragmentSrc = fragmentSrc.replace(/%count%/gi, maxTextures);
	        fragmentSrc = fragmentSrc.replace(/%forloop%/gi, WebGLSettings.generateSampleSrc(maxTextures));
	        CacheSettings.programCache[maxTextures] = new Program(WebGLSettings.vertex$1, fragmentSrc);
	    }
	    var uniforms = {
	        tint: new Float32Array([1, 1, 1, 1]),
	        translationMatrix: new Matrix(),
	        default: CacheSettings.defaultGroupCache[maxTextures],
	    };
	    var shader = new Shader(CacheSettings.programCache[maxTextures], uniforms);
	    return shader;
	}
	static generateSampleSrc(maxTextures)
	{
	    var src = '';
	    src += '\n';
	    src += '\n';
	    for (var i = 0; i < maxTextures; i++)
	    {
	        if (i > 0)
	        {
	            src += '\nelse ';
	        }
	        if (i < maxTextures - 1)
	        {
	            src += "if(vTextureId < " + i + ".5)";
	        }
	        src += '\n{';
	        src += "\n\tcolor = texture2D(uSamplers[" + i + "], vTextureCoord);";
	        src += '\n}';
	    }
	    src += '\n';
	    src += '\n';
	    return src;
	}
	static checkMaxIfStatementsInShader(maxIfs, gl)
	{
	    if (maxIfs === 0)
	    {
	        throw new Error('Invalid value of `0` passed to `checkMaxIfStatementsInShader`');
	    }
	    var shader = gl.createShader(gl.FRAGMENT_SHADER);
	    while (true) // eslint-disable-line no-constant-condition
	    {
	        var fragmentSrc = WebGLSettings.fragTemplate.replace(/%forloop%/gi, WebGLSettings.generateIfTestSrc(maxIfs));
	        gl.shaderSource(shader, fragmentSrc);
	        gl.compileShader(shader);
	        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	        {
	            maxIfs = (maxIfs / 2) | 0;
	        }
	        else
	        {
	            // valid!
	            break;
	        }
	    }
	    return maxIfs;
	}
	static generateIfTestSrc(maxIfs)
	{
	    var src = '';
	    for (var i = 0; i < maxIfs; ++i)
	    {
	        if (i > 0)
	        {
	            src += '\nelse ';
	        }

	        if (i < maxIfs - 1)
	        {
	            src += "if(test == " + i + ".0){}";
	        }
	    }
	    return src;
	}
	static maxRecommendedTextures(max)
	{
	    var allowMax = true;	        
		var match = (navigator.userAgent).match(/OS (\d+)_(\d+)?/);
		if (match)
		{
			var majorVersion = parseInt(match[1], 10);
			if (majorVersion >= 11)
			{
				allowMax = true;
			}
		}	       
		var match$1 = (navigator.userAgent).match(/Android\s([0-9.]*)/);
		if (match$1)
		{
			var majorVersion$1 = parseInt(match$1[1], 10);
			if (majorVersion$1 >= 7)
			{
				allowMax = true;
			}
		}	       	   
	    return allowMax ? max : 4;
	}
	static setPrecision(src, precision)
	{
	    if (src.substring(0, 9) !== 'precision')// && src.substring(0, 1) !== '#')
	    {
	        return ("precision " + precision + " float;\n" + src);
	    }
	    return src;
	}
	static getTestContext()
	{
	    if (!WebGLSettings.context)
	    {
	        var canvas = document.createElement('canvas');
	        var gl;
	        if (DisplaySettings.PREFER_ENV >= DisplaySettings.ENV.WEBGL2)
	        {
	            gl = canvas.getContext('webgl2', {});
	        }
	        if (!gl)
	        {
	            gl = canvas.getContext('webgl', {})
	            || canvas.getContext('experimental-webgl', {});
	            if (!gl)
	            {
	                // fail, not able to get a context
	                throw new Error('This browser does not support WebGL. Try using the canvas renderer');
	            }
	            else
	            {
	                // for shader testing..
	                gl.getExtension('WEBGL_draw_buffers');
	            }
	        }
	        WebGLSettings.context = gl;
	        return gl;
	    }
	    return WebGLSettings.context;
	}
	static defaultValue(type, size)
	{
	    switch (type)
	    {
	        case 'float':
	            return 0;

	        case 'vec2':
	            return new Float32Array(2 * size);

	        case 'vec3':
	            return new Float32Array(3 * size);

	        case 'vec4':
	            return new Float32Array(4 * size);

	        case 'int':
	        case 'sampler2D':
	        case 'sampler2DArray':
	            return 0;

	        case 'ivec2':
	            return new Int32Array(2 * size);

	        case 'ivec3':
	            return new Int32Array(3 * size);

	        case 'ivec4':
	            return new Int32Array(4 * size);

	        case 'bool':
	            return false;

	        case 'bvec2':

	            return WebGLSettings.booleanArray(2 * size);

	        case 'bvec3':
	            return WebGLSettings.booleanArray(3 * size);

	        case 'bvec4':
	            return WebGLSettings.booleanArray(4 * size);

	        case 'mat2':
	            return new Float32Array([1, 0,
	                0, 1]);

	        case 'mat3':
	            return new Float32Array([1, 0, 0,
	                0, 1, 0,
	                0, 0, 1]);

	        case 'mat4':
	            return new Float32Array([1, 0, 0, 0,
	                0, 1, 0, 0,
	                0, 0, 1, 0,
	                0, 0, 0, 1]);
	    }
	    return null;
	}
	static booleanArray(size)
	{
	    var array = new Array(size);
	    for (var i = 0; i < array.length; i++)
	    {
	        array[i] = false;
	    }
	    return array;
	}
	static mapType(gl, type)
	{
	    if (!WebGLSettings.GL_TABLE)
	    {
	        var typeNames = Object.keys(WebGLSettings.GL_TO_GLSL_TYPES);
	        WebGLSettings.GL_TABLE = {};
	        for (var i = 0; i < typeNames.length; ++i)
	        {
	            var tn = typeNames[i];
	            WebGLSettings.GL_TABLE[gl[tn]] = WebGLSettings.GL_TO_GLSL_TYPES[tn];
	        }
	    }
	    return WebGLSettings.GL_TABLE[type];
	}
	static mapSize(type)
	{
	    return WebGLSettings.GLSL_TO_SIZE[type];
	}
	static generateUniformsSync(group, uniformData)
	{
	    var textureCount = 0;
	    var func = "var v = null;\n    var cv = null\n    var gl = renderer.gl";
	    for (var i in group.uniforms)
	    {
	        var data = uniformData[i];
	        if (!data)
	        {
	            if (group.uniforms[i].group)
	            {
	                func += "\n                    renderer.shader.syncUniformGroup(uv." + i + ");\n                ";
	            }
	            continue;
	        }
	        // TODO && uniformData[i].value !== 0 <-- do we still need this?
	        if (data.type === 'float' && data.size === 1)
	        {
	            func += "\n            if(uv." + i + " !== ud." + i + ".value)\n            {\n                ud." + i + ".value = uv." + i + "\n                gl.uniform1f(ud." + i + ".location, uv." + i + ")\n            }\n";
	        }
	        /* eslint-disable max-len */
	        else if ((data.type === 'sampler2D' || data.type === 'samplerCube' || data.type === 'sampler2DArray') && data.size === 1 && !data.isArray)
	        /* eslint-disable max-len */
	        {
	            func += "\n            renderer.texture.bind(uv." + i + ", " + textureCount + ");\n\n            if(ud." + i + ".value !== " + textureCount + ")\n            {\n                ud." + i + ".value = " + textureCount + ";\n                gl.uniform1i(ud." + i + ".location, " + textureCount + ");\n; // eslint-disable-line max-len\n            }\n";

	            textureCount++;
	        }
	        else if (data.type === 'mat3' && data.size === 1)
	        {
	            if (group.uniforms[i].a !== undefined)
	            {
	                // TODO and some smart caching dirty ids here!
	                func += "\n                gl.uniformMatrix3fv(ud." + i + ".location, false, uv." + i + ".toArray(true));\n                \n";
	            }
	            else
	            {
	                func += "\n                gl.uniformMatrix3fv(ud." + i + ".location, false, uv." + i + ");\n                \n";
	            }
	        }
	        else if (data.type === 'vec2' && data.size === 1)
	        {
	            // TODO - do we need both here?
	            // maybe we can get away with only using points?
	            if (group.uniforms[i].x !== undefined)
	            {
	                func += "\n                cv = ud." + i + ".value;\n                v = uv." + i + ";\n\n                if(cv[0] !== v.x || cv[1] !== v.y)\n                {\n                    cv[0] = v.x;\n                    cv[1] = v.y;\n                    gl.uniform2f(ud." + i + ".location, v.x, v.y);\n                }\n";
	            }
	            else
	            {
	                func += "\n                cv = ud." + i + ".value;\n                v = uv." + i + ";\n\n                if(cv[0] !== v[0] || cv[1] !== v[1])\n                {\n                    cv[0] = v[0];\n                    cv[1] = v[1];\n                    gl.uniform2f(ud." + i + ".location, v[0], v[1]);\n                }\n                \n";
	            }
	        }
	        else if (data.type === 'vec4' && data.size === 1)
	        {
	            // TODO - do we need both here?
	            // maybe we can get away with only using points?
	            if (group.uniforms[i].width !== undefined)
	            {
	                func += "\n                cv = ud." + i + ".value;\n                v = uv." + i + ";\n\n                if(cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)\n                {\n                    cv[0] = v.x;\n                    cv[1] = v.y;\n                    cv[2] = v.width;\n                    cv[3] = v.height;\n                    gl.uniform4f(ud." + i + ".location, v.x, v.y, v.width, v.height)\n                }\n";
	            }
	            else
	            {
	                func += "\n                cv = ud." + i + ".value;\n                v = uv." + i + ";\n\n                if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])\n                {\n                    cv[0] = v[0];\n                    cv[1] = v[1];\n                    cv[2] = v[2];\n                    cv[3] = v[3];\n\n                    gl.uniform4f(ud." + i + ".location, v[0], v[1], v[2], v[3])\n                }\n                \n";
	            }
	        }
	        else
	        {
	            var templateType = (data.size === 1) ? WebGLSettings.GLSL_TO_SINGLE_SETTERS_CACHED : WebGLSettings.GLSL_TO_ARRAY_SETTERS;

	            var template =  templateType[data.type].replace('location', ("ud." + i + ".location"));

	            func += "\n            cv = ud." + i + ".value;\n            v = uv." + i + ";\n            " + template + ";\n";
	        }
	    }
	    return new Function('ud', 'uv', 'renderer', func); // eslint-disable-line no-new-func
	}
}