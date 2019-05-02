import { Filter } from "./Filter";


export class CrossHatchFilter extends Filter
{
    private static vertex:string = `
        attribute vec2 aVertexPosition;
        attribute vec2 aTextureCoord;
        uniform mat3 projectionMatrix;
        varying vec2 vTextureCoord;
        void main(void)
        {
            gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            vTextureCoord = aTextureCoord;
        }
    `
    private static fragment:string = `
        precision mediump float;

        varying vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void)
        {
            float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);

            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

            if (lum < 1.00)
            {
                if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)
                {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }

            if (lum < 0.75)
            {
                if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)
                {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }

            if (lum < 0.50)
            {
                if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)
                {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }

            if (lum < 0.3)
            {
                if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)
                {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }
        }
        `

    constructor() 
    {
        super(CrossHatchFilter.vertex, CrossHatchFilter.fragment);
    }
}