import { Filter } from "./Filter";
import { DisplaySettings } from './DisplaySettings';

export class BlurFilterPass extends Filter
{
    static GAUSSIAN_VALUES = {
	    5: [0.153388, 0.221461, 0.250301],
	    7: [0.071303, 0.131514, 0.189879, 0.214607],
	    9: [0.028532, 0.067234, 0.124009, 0.179044, 0.20236],
	    11: [0.0093, 0.028002, 0.065984, 0.121703, 0.175713, 0.198596],
	    13: [0.002406, 0.009255, 0.027867, 0.065666, 0.121117, 0.174868, 0.197641],
	    15: [0.000489, 0.002403, 0.009246, 0.02784, 0.065602, 0.120999, 0.174697, 0.197448],
	};
    static vertTemplate = "\n    attribute vec2 aVertexPosition;\n\n    uniform mat3 projectionMatrix;\n\n    uniform float strength;\n\n    varying vec2 vBlurTexCoords[%size%];\n\n    uniform vec4 inputSize;\n    uniform vec4 outputFrame;\n    \n    vec4 filterVertexPosition( void )\n    {\n        vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n    \n        return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n    }\n    \n    vec2 filterTextureCoord( void )\n    {\n        return aVertexPosition * (outputFrame.zw * inputSize.zw);\n    }\n\n    void main(void)\n    {\n        gl_Position = filterVertexPosition();\n\n        vec2 textureCoord = filterTextureCoord();\n        %blur%\n    }";
	static fragTemplate$2 = [
	    'varying vec2 vBlurTexCoords[%size%];',
	    'uniform sampler2D uSampler;',

	    'void main(void)',
	    '{',
	    '    gl_FragColor = vec4(0.0);',
	    '    %blur%',
	    '}' ].join('\n');
    horizontal
    _quality
    strength
    passes
    
    constructor(horizontal, strength, quality, resolution, kernelSize)
    {
        
        kernelSize = kernelSize || 5;
        var vertSrc = BlurFilterPass.generateBlurVertSource(kernelSize, horizontal);
        var fragSrc = BlurFilterPass.generateBlurFragSource(kernelSize);
        super(vertSrc, fragSrc);


        this.horizontal = horizontal;

        this.resolution = resolution || DisplaySettings.RESOLUTION;

        this._quality = 0;

        this.quality = quality || 4;

        this.blur = strength || 8;
    }

    static generateBlurFragSource(kernelSize)
	{
	    var kernel = BlurFilterPass.GAUSSIAN_VALUES[kernelSize];
	    var halfLength = kernel.length;

	    var fragSource = BlurFilterPass.fragTemplate$2;

	    var blurLoop = '';
	    var template = 'gl_FragColor += texture2D(uSampler, vBlurTexCoords[%index%]) * %value%;';
	    var value;

	    for (var i = 0; i < kernelSize; i++)
	    {
	        var blur = template.replace('%index%', i.toString());

	        value = i;

	        if (i >= halfLength)
	        {
	            value = kernelSize - i - 1;
	        }

	        blur = blur.replace('%value%', kernel[value]);

	        blurLoop += blur;
	        blurLoop += '\n';
	    }

	    fragSource = fragSource.replace('%blur%', blurLoop);
	    fragSource = fragSource.replace('%size%', kernelSize);

	    return fragSource;
	}

    static generateBlurVertSource(kernelSize, x)
	{
	    var halfLength = Math.ceil(kernelSize / 2);

	    var vertSource = BlurFilterPass.vertTemplate;

	    var blurLoop = '';
	    var template;
	    // let value;

	    if (x)
	    {
	        template = 'vBlurTexCoords[%index%] =  textureCoord + vec2(%sampleIndex% * strength, 0.0);';
	    }
	    else
	    {
	        template = 'vBlurTexCoords[%index%] =  textureCoord + vec2(0.0, %sampleIndex% * strength);';
	    }

	    for (var i = 0; i < kernelSize; i++)
	    {
	        var blur = template.replace('%index%', i);

	        // value = i;

	        // if(i >= halfLength)
	        // {
	        //     value = kernelSize - i - 1;
	        // }

	        blur = blur.replace('%sampleIndex%', ((i - (halfLength - 1)) + ".0"));

	        blurLoop += blur;
	        blurLoop += '\n';
	    }

	    vertSource = vertSource.replace('%blur%', blurLoop);
	    vertSource = vertSource.replace('%size%', kernelSize);

	    return vertSource;
	}

    apply  (filterManager, input, output, clear)
    {
        if (output)
        {
            if (this.horizontal)
            {
                this.uniforms.strength = (1 / output.width) * (output.width / input.width);
            }
            else
            {
                this.uniforms.strength = (1 / output.height) * (output.height / input.height);
            }
        }
        else
        {
            if (this.horizontal) // eslint-disable-line
            {
                this.uniforms.strength = (1 / filterManager.renderer.width) * (filterManager.renderer.width / input.width);
            }
            else
            {
                this.uniforms.strength = (1 / filterManager.renderer.height) * (filterManager.renderer.height / input.height); // eslint-disable-line
            }
        }

        // screen space!
        this.uniforms.strength *= this.strength;
        this.uniforms.strength /= this.passes;

        if (this.passes === 1)
        {
            filterManager.applyFilter(this, input, output, clear);
        }
        else
        {
            var renderTarget = filterManager.getFilterTexture();
            var renderer = filterManager.renderer;

            var flip = input;
            var flop = renderTarget;

            this.state.blend = false;
            filterManager.applyFilter(this, flip, flop, false);

            for (var i = 1; i < this.passes - 1; i++)
            {
                renderer.renderTexture.bind(flip, flip.filterFrame);

                this.uniforms.uSampler = flop;

                var temp = flop;

                flop = flip;
                flip = temp;

                renderer.shader.bind(this);
                renderer.geometry.draw(5);
            }

            this.state.blend = true;
            filterManager.applyFilter(this, flop, output, clear);
            filterManager.returnFilterTexture(renderTarget);
        }
    };
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @default 16
     */
    get blur ()
    {
        return this.strength;
    };

    set blur (value) // eslint-disable-line require-jsdoc
    {
        this.padding = 1 + (Math.abs(value) * 2);
        this.strength = value;
    };

    /**
     * Sets the quality of the blur by modifying the number of passes. More passes means higher
     * quaility bluring but the lower the performance.
     *
     * @member {number}
     * @default 4
     */
    get quality ()
    {
        return this._quality;
    };

    set quality (value) // eslint-disable-line require-jsdoc
    {
        this._quality = value;
        this.passes = value;
    };
}

