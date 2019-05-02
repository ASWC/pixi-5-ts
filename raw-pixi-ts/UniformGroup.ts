

export class UniformGroup
{
	static UID$2 = 0;
    static;
    dirtyId
    id
    group
    syncUniforms
    uniforms
    constructor(uniforms = null, _static = null)
    {
/**
	     * uniform values
	     * @member {object}
	     * @readonly
	     */
	    this.uniforms = uniforms;

	    /**
	     * Its a group and not a single uniforms
	     * @member {boolean}
	     * @readonly
	     * @default true
	     */
	    this.group = true;

	    // lets generate this when the shader ?
	    this.syncUniforms = {};

	    /**
	     * dirty version
	     * @protected
	     * @member {number}
	     */
	    this.dirtyId = 0;

	    /**
	     * unique id
	     * @protected
	     * @member {number}
	     */
	    this.id = UniformGroup.UID$2++;

	    /**
	     * Uniforms wont be changed after creation
	     * @member {boolean}
	     */
	    this.static = !!_static;
    }

    update  ()
	{
	    this.dirtyId++;
	};

	add  (name, uniforms, _static)
	{
	    this.uniforms[name] = new UniformGroup(uniforms, _static);
	};

	static from  (uniforms, _static)
	{
	    return new UniformGroup(uniforms, _static);
	};
}

