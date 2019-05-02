import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { Text } from "../raw-pixi-ts/Text";
import { TextStyle } from "../raw-pixi-ts/TextStyle";


export class TextBase extends BaseExample
{
    constructor(app:Application)
    {
        super(app);
        const basicText = new Text('Basic text in pixi');
        basicText.x = 50;
        basicText.y = 100;
        app.stage.addChild(basicText);
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
        });
        const richText = new Text('Rich text with a lot of options and across multiple lines', style);
        richText.x = 50;
        richText.y = 250;
        app.stage.addChild(richText);
    }
}