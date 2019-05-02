import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { FontManager } from "../raw-pixi-ts/FontManager";
import { Text } from "../raw-pixi-ts/Text";


export class TextWebFont extends BaseExample
{
    constructor(app:Application)
    {
        super(app);
        FontManager.onWebFontloaded = this.handleWebFontLoaded;
        FontManager.WebFontConfig = {
            google: {
                families: ['Snippet', 'Arvo:700italic', 'Podkova:700'],
            }
        };
    }

    protected handleWebFontLoaded = ()=>
    {
        const textSample = new Text('Pixi.js text using the\ncustom "Snippet" Webfont', {
            fontFamily: 'Snippet',
            fontSize: 50,
            fill: 'white',
            align: 'left',
        });
        textSample.position.set(50, 200);
        this.app.stage.addChild(textSample);
    }
}