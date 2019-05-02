import { Filter } from "./Filter";


export class ConvolutionFilter extends Filter
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
    private static fragment:string =  `
        precision mediump float;

        varying mediump vec2 vTextureCoord;

        uniform sampler2D uSampler;
        uniform vec2 texelSize;
        uniform float matrix[9];

        void main(void)
        {
        vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left
        vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center
        vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right

        vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left
        vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center
        vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right

        vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left
        vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center
        vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right

        gl_FragColor =
            c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +
            c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +
            c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];

        gl_FragColor.a = c22.a;
        }`

    constructor(matrix, width = 200, height = 200) 
    {
        super(ConvolutionFilter.vertex, ConvolutionFilter.fragment);
        this.uniforms.texelSize = new Float32Array(2);
        this.uniforms.matrix = new Float32Array(9);
        if (matrix !== undefined) {
            this.matrix = matrix;
        }
        this.width = width;
        this.height = height;
    }

    /**
     * An array of values used for matrix transformation. Specified as a 9 point Array.
     *
     * @member {Array<number>}
     */
    get matrix() {
        return this.uniforms.matrix;
    }
    set matrix(matrix) {
        matrix.forEach((v, i) => this.uniforms.matrix[i] = v);
    }

    /**
     * Width of the object you are transforming
     *
     * @member {number}
     */
    get width() {
        return 1/this.uniforms.texelSize[0];
    }
    set width(value) {
        this.uniforms.texelSize[0] = 1/value;
    }

    /**
     * Height of the object you are transforming
     *
     * @member {number}
     */
    get height() {
        return 1/this.uniforms.texelSize[1];
    }
    set height(value) {
        this.uniforms.texelSize[1] = 1/value;
    }
}