import { Filter } from "./Filter";


export class BulgePinchFilter extends Filter
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
        uniform float radius;
        uniform float strength;
        uniform vec2 center;
        uniform sampler2D uSampler;
        varying vec2 vTextureCoord;

        uniform vec4 filterArea;
        uniform vec4 filterClamp;
        uniform vec2 dimensions;

        void main()
        {
            vec2 coord = vTextureCoord * filterArea.xy;
            coord -= center * dimensions.xy;
            float distance = length(coord);
            if (distance < radius) {
                float percent = distance / radius;
                if (strength > 0.0) {
                    coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);
                } else {
                    coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);
                }
            }
            coord += center * dimensions.xy;
            coord /= filterArea.xy;
            vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);
            vec4 color = texture2D(uSampler, clampedCoord);
            if (coord != clampedCoord) {
                color *= max(0.0, 1.0 - length(coord - clampedCoord));
            }

            gl_FragColor = color;
        }
        `

    constructor(center, radius, strength) 
    {
        super(BulgePinchFilter.vertex, BulgePinchFilter.fragment);
        this.uniforms.dimensions = new Float32Array(2);
        this.center = center || [0.5, 0.5];
        this.radius = (typeof radius === 'number') ? radius : 100; // allow 0 to be passed
        this.strength = (typeof strength === 'number') ? strength : 1; // allow 0 to be passed
    }

    apply(filterManager, input, output, clear) {
        this.uniforms.dimensions[0] = input.filterFrame.width;
        this.uniforms.dimensions[1] = input.filterFrame.height;
        filterManager.applyFilter(this, input, output, clear);
    }

    /**
     * The radius of the circle of effect.
     *
     * @member {number}
     */
    get radius() {
        return this.uniforms.radius;
    }
    set radius(value) {
        this.uniforms.radius = value;
    }

    /**
     * The strength of the effect. -1 to 1 (-1 is strong pinch, 0 is no effect, 1 is strong bulge)
     *
     * @member {number}
     */
    get strength() {
        return this.uniforms.strength;
    }
    set strength(value) {
        this.uniforms.strength = value;
    }

    /**
     * The x and y coordinates of the center of the circle of effect.
     *
     * @member {PIXI.Point}
     */
    get center() {
        return this.uniforms.center;
    }
    set center(value) {
        this.uniforms.center = value;
    }
}