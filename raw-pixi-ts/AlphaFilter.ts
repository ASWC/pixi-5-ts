import { Filter } from "./Filter";

export class AlphaFilter extends Filter
{
    	/*!
	 * @pixi/filter-alpha - v5.0.0-rc.3
	 * Compiled Wed, 10 Apr 2019 01:21:15 UTC
	 *
	 * @pixi/filter-alpha is licensed under the MIT License.
	 * http://www.opensource.org/licenses/mit-license
	 */

	static fragment$3 = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform float uAlpha;\r\n\r\nvoid main(void)\r\n{\r\n   gl_FragColor = texture2D(uSampler, vTextureCoord) * uAlpha;\r\n}\r\n";


    
    constructor(alpha)
    {
        super(AlphaFilter.fragment$3, { uAlpha: 1 });
        if ( alpha === void 0 ) { alpha = 1.0; }

        this.alpha = alpha;
    }

    /**
     * Coefficient for alpha multiplication
     *
     * @member {number}
     * @default 1
     */
    get alpha ()
    {
        return this.uniforms.uAlpha;
    };

    set alpha(value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.uAlpha = value;
    };
}
