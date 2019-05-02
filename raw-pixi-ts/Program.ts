
import { Shader } from "./Shader";
import { CacheSettings } from './CacheSettings';
import { WebGLSettings } from './WebGLSettings';


export class Program
{
	static UID$3 = 0;
    id
    vertexSrc
    syncUniforms
    glPrograms
    uniformData
    attributeData
    fragmentSrc
    constructor(vertexSrc, fragmentSrc, name = 'pixi-shader')
    {
		
	    this.id = Program.UID$3++;

	    /**
	     * The vertex shader.
	     *
	     * @member {string}
	     */
	    this.vertexSrc = vertexSrc || Program.defaultVertexSrc;

	    /**
	     * The fragment shader.
	     *
	     * @member {string}
	     */
	    this.fragmentSrc = fragmentSrc || Program.defaultFragmentSrc;

	    this.vertexSrc = this.vertexSrc.trim();
	    this.fragmentSrc = this.fragmentSrc.trim();

	    if (this.vertexSrc.substring(0, 8) !== '#version')
	    {
	        name = name.replace(/\s+/g, '-');

	        if (CacheSettings.nameCache[name])
	        {
	            CacheSettings.nameCache[name]++;
	            name += "-" + (CacheSettings.nameCache[name]);
	        }
	        else
	        {
	            CacheSettings.nameCache[name] = 1;
	        }

	        this.vertexSrc = "#define SHADER_NAME " + name + "\n" + (this.vertexSrc);
	        this.fragmentSrc = "#define SHADER_NAME " + name + "\n" + (this.fragmentSrc);

	        this.vertexSrc = WebGLSettings.setPrecision(this.vertexSrc, WebGLSettings.PRECISION_VERTEX);
	        this.fragmentSrc = WebGLSettings.setPrecision(this.fragmentSrc, WebGLSettings.PRECISION_FRAGMENT);
		}
		if(name == "pixi-shader-4")
		{
		}
		
	    // currently this does not extract structs only default types
	    this.extractData(this.vertexSrc, this.fragmentSrc);

	    // this is where we store shader references..
	    this.glPrograms = {};

	    this.syncUniforms = null;
    }

    /**
	 * Extracts the data for a buy creating a small test program
	 * or reading the src directly.
	 * @protected
	 *
	 * @param {string} [vertexSrc] - The source of the vertex shader.
	 * @param {string} [fragmentSrc] - The source of the fragment shader.
	 */
	extractData (vertexSrc, fragmentSrc)
	{
	    var gl = WebGLSettings.getTestContext();

	    if (gl)
	    {
	        var program = Program.compileProgram(gl, vertexSrc, fragmentSrc);

	        this.attributeData = this.getAttributeData(program, gl);
	        this.uniformData = this.getUniformData(program, gl);

	        gl.deleteProgram(program);
	    }
	    else
	    {
	        this.uniformData = {};
	        this.attributeData = {};
	    }
	};

	/**
	 * returns the attribute data from the program
	 * @private
	 *
	 * @param {WebGLProgram} [program] - the WebGL program
	 * @param {WebGLRenderingContext} [gl] - the WebGL context
	 *
	 * @returns {object} the attribute data for this program
	 */
	getAttributeData (program, gl)
	{
	    var attributes = {};
	    var attributesArray = [];

	    var totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

	    for (var i = 0; i < totalAttributes; i++)
	    {
	        var attribData = gl.getActiveAttrib(program, i);
	        var type = WebGLSettings.mapType(gl, attribData.type);

	        /*eslint-disable */
	        var data = {
	            type: type,
	            name: attribData.name,
	            size: WebGLSettings.mapSize(type),
	            location: 0,
	        };
	        /* eslint-enable */

	        attributes[attribData.name] = data;
	        attributesArray.push(data);
	    }

	    attributesArray.sort(function (a, b) { return (a.name > b.name) ? 1 : -1; }); // eslint-disable-line no-confusing-arrow

	    for (var i$1 = 0; i$1 < attributesArray.length; i$1++)
	    {
	        attributesArray[i$1].location = i$1;
	    }

	    return attributes;
	};

	/**
	 * returns the uniform data from the program
	 * @private
	 *
	 * @param {webGL-program} [program] - the webgl program
	 * @param {context} [gl] - the WebGL context
	 *
	 * @returns {object} the uniform data for this program
	 */
	getUniformData  (program, gl)
	{
	    var uniforms = {};

	    var totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

	    // TODO expose this as a prop?
	    // const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');
	    // const maskRegex = new RegExp('^(projectionMatrix|uSampler|translationMatrix)$');

	    for (var i = 0; i < totalUniforms; i++)
	    {
	        var uniformData = gl.getActiveUniform(program, i);
	        var name = uniformData.name.replace(/\[.*?\]/, '');

	        var isArray = uniformData.name.match(/\[.*?\]/, '');
	        var type = WebGLSettings.mapType(gl, uniformData.type);

	        /*eslint-disable */
	        uniforms[name] = {
	            type: type,
	            size: uniformData.size,
	            isArray:isArray,
	            value: WebGLSettings.defaultValue(type, uniformData.size),
	        };
	        /* eslint-enable */
	    }

	    return uniforms;
	};

	/**
	 * The default vertex shader source
	 *
	 * @static
	 * @constant
	 * @member {string}
	 */
	static get defaultVertexSrc ()
	{
	    return Program.defaultVertex;
	};

	/**
	 * The default fragment shader source
	 *
	 * @static
	 * @constant
	 * @member {string}
	 */
	static get defaultFragmentSrc ()
	{
	    return Program.defaultFragment;
	};

	/**
	 * A short hand function to create a program based of a vertex and fragment shader
	 * this method will also check to see if there is a cached program.
	 *
	 * @param {string} [vertexSrc] - The source of the vertex shader.
	 * @param {string} [fragmentSrc] - The source of the fragment shader.
	 * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
	 *
	 * @returns {PIXI.Program} an shiny new Pixi shader!
	 */
	static from (vertexSrc, fragmentSrc, name = "pixi-shader")
	{
	    var key = vertexSrc + fragmentSrc;

	    var program = CacheSettings.ProgramCache[key];

	    if (!program)
	    {
	        CacheSettings.ProgramCache[key] = program = new Program(vertexSrc, fragmentSrc, name);
	    }

	    return program;
    };
    
    static defaultFragment = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\n\r\nvoid main(void){\r\n   gl_FragColor *= texture2D(uSampler, vTextureCoord);\r\n}";

	static defaultVertex = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void){\r\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n   vTextureCoord = aTextureCoord;\r\n}\r\n";

    	/**
	 * @method compileProgram
	 * @private
	 * @memberof PIXI.glCore.shader
	 * @param gl {WebGLRenderingContext} The current WebGL context {WebGLProgram}
	 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
	 * @param fragmentSrc {string|string[]} The fragment shader source as an array of strings.
	 * @param attributeLocations {Object} An attribute location map that lets you manually set the attribute locations
	 * @return {WebGLProgram} the shader program
	 */
	static compileProgram(gl, vertexSrc, fragmentSrc, attributeLocations = null)
	{
	    var glVertShader = Shader.compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
	    var glFragShader = Shader.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

	    var program = gl.createProgram();

	    gl.attachShader(program, glVertShader);
	    gl.attachShader(program, glFragShader);

	    // optionally, set the attributes manually for the program rather than letting WebGL decide..
	    if (attributeLocations)
	    {
	        for (var i in attributeLocations)
	        {
	            gl.bindAttribLocation(program, attributeLocations[i], i);
	        }
	    }

	    gl.linkProgram(program);

	    // if linking fails, then log and cleanup
	    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
	    {
	        console.error('Pixi.js Error: Could not initialize shader.');
	        console.error('gl.VALIDATE_STATUS', gl.getProgramParameter(program, gl.VALIDATE_STATUS));
	        console.error('gl.getError()', gl.getError());

	        // if there is a program info log, log it
	        if (gl.getProgramInfoLog(program) !== '')
	        {
	            console.warn('Pixi.js Warning: gl.getProgramInfoLog()', gl.getProgramInfoLog(program));
	        }

	        gl.deleteProgram(program);
	        program = null;
	    }

	    // clean up some shaders
	    gl.deleteShader(glVertShader);
	    gl.deleteShader(glFragShader);

	    return program;
	}
}

