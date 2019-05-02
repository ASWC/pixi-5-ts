import { Geometry } from "./Geometry";


export class Quad extends Geometry
{
    constructor()
    {
        super();
        this.addAttribute('aVertexPosition', [0, 0,1, 0, 1, 1, 0, 1 ]).addIndex([0, 1, 3, 2]);
    }
}


