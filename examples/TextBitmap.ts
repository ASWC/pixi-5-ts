import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { FontManager } from "../raw-pixi-ts/FontManager";
import { Event } from "../raw-pixi-ts/Event";
import { BitmapText } from "../raw-pixi-ts/BitmapText";


export class TextBitmap extends BaseExample
{    
    constructor(app:Application)
    {
        super(app);        
        let loader = FontManager.loadBitmapFont("examples/assets/bitmap-font/desyrel.xml")
        loader.addEventListener(Event.COMPLETE, this.handleFontLoaded);
    }

    protected handleFontLoaded = (event:Event)=>
    { 
        const bitmapFontText = new BitmapText('bitmap fonts are supported!\nWoo yay!');
        bitmapFontText.fontSize = 55;
        bitmapFontText.font = "Desyrel";
        bitmapFontText.align = 'left';
        bitmapFontText.x = 50;
        bitmapFontText.y = 200;
        this.app.stage.addChild(bitmapFontText);        
    }
}