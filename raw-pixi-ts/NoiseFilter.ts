import { Filter } from "./Filter";
import { settings } from "./settings";

export class NoiseFilter extends Filter
{
    static fragment$7 = "precision highp float;\r\n\r\nvarying vec2 vTextureCoord;\r\nvarying vec4 vColor;\r\n\r\nuniform float uNoise;\r\nuniform float uSeed;\r\nuniform sampler2D uSampler;\r\n\r\nfloat rand(vec2 co)\r\n{\r\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\r\n}\r\n\r\nvoid main()\r\n{\r\n    vec4 color = texture2D(uSampler, vTextureCoord);\r\n    float randomValue = rand(gl_FragCoord.xy * uSeed);\r\n    float diff = (randomValue - 0.5) * uNoise;\r\n\r\n    // Un-premultiply alpha before applying the color matrix. See issue #3539.\r\n    if (color.a > 0.0) {\r\n        color.rgb /= color.a;\r\n    }\r\n\r\n    color.r += diff;\r\n    color.g += diff;\r\n    color.b += diff;\r\n\r\n    // Premultiply alpha again.\r\n    color.rgb *= color.a;\r\n\r\n    gl_FragColor = color;\r\n}\r\n";

    constructor(noise, seed)
    {
        if ( noise === void 0 ) { noise = 0.5; }
        if ( seed === void 0 ) { seed = Math.random(); }
        super(settings.defaultFilterVertex, NoiseFilter.fragment$7, {uNoise: 0, uSeed: 0,});
    }

    /**
     * The amount of noise to apply, this value should be in the range (0, 1].
     *
     * @member {number}
     * @default 0.5
     */
    get noise ()
    {
        return this.uniforms.uNoise;
    };

    set noise (value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.uNoise = value;
    };

    /**
     * A seed value to apply to the random noise generation. `Math.random()` is a good value to use.
     *
     * @member {number}
     */
    get seed ()
    {
        return this.uniforms.uSeed;
    };

    set seed (value) // eslint-disable-line require-jsdoc
    {
        this.uniforms.uSeed = value;
    };
}


