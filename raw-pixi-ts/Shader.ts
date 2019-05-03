import { UniformGroup } from "./UniformGroup";
import { Program } from "./Program";
import { FlashBaseObject } from "./FlashBaseObject";


export class Shader extends FlashBaseObject
{
    program
    uniformGroup
    constructor(program, uniforms)
    {
		super();
        this.program = program;

	    // lets see whats been passed in
	    // uniforms should be converted to a uniform group
	    if (uniforms)
	    {
	        if (uniforms instanceof UniformGroup)
	        {
	            this.uniformGroup = uniforms;
	        }
	        else
	        {
	            this.uniformGroup = new UniformGroup(uniforms);
	        }
	    }
	    else
	    {
	        this.uniformGroup = new UniformGroup({});
	    }

	    // time to build some getters and setters!
	    // I guess down the line this could sort of generate an instruction list rather than use dirty ids?
	    // does the trick for now though!
	    for (var i in program.uniformData)
	    {
	        if (this.uniformGroup.uniforms[i] instanceof Array)
	        {
	            this.uniformGroup.uniforms[i] = new Float32Array(this.uniformGroup.uniforms[i]);
	        }
	    }
    }

    // TODO move to shader system..
	checkUniformExists  (name, group)
	{
	    if (group.uniforms[name])
	    {
	        return true;
	    }

	    for (var i in group.uniforms)
	    {
	        var uniform = group.uniforms[i];

	        if (uniform.group)
	        {
	            if (this.checkUniformExists(name, uniform))
	            {
	                return true;
	            }
	        }
	    }

	    return false;
	};

	destroy  ()
	{
	    // usage count on programs?
	    // remove if not used!
	    this.uniformGroup = null;
	};

	/**
	 * Shader uniform values, shortcut for `uniformGroup.uniforms`
	 * @readonly
	 * @member {object}
	 */
	get uniforms ()
	{
	    return this.uniformGroup.uniforms;
	};

	/**
	 * A short hand function to create a shader based of a vertex and fragment shader
	 *
	 * @param {string} [vertexSrc] - The source of the vertex shader.
	 * @param {string} [fragmentSrc] - The source of the fragment shader.
	 * @param {object} [uniforms] - Custom uniforms to use to augment the built-in ones.
	 *
	 * @returns {PIXI.Shader} an shiny new Pixi shader!
	 */
	static from  (vertexSrc, fragmentSrc, uniforms)
	{
	    var program = Program.from(vertexSrc, fragmentSrc);

	    return new Shader(program, uniforms);
	};

		/**
	 * @private
	 * @param gl {WebGLRenderingContext} The current WebGL context {WebGLProgram}
	 * @param type {Number} the type, can be either VERTEX_SHADER or FRAGMENT_SHADER
	 * @param vertexSrc {string|string[]} The vertex shader source as an array of strings.
	 * @return {WebGLShader} the shader
	 */
	static compileShader(gl, type, src)
	{
	    var shader = gl.createShader(type);

	    gl.shaderSource(shader, src);
	    gl.compileShader(shader);

	    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	    {
	        console.warn(src);
	        console.error(gl.getShaderInfoLog(shader));

	        return null;
	    }

	    return shader;
	}

}

