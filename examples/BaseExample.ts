import { FlashBaseObject } from "../raw-pixi-ts/FlashBaseObject";
import { Application } from "../raw-pixi-ts/Application";
import { Graphics } from "../raw-pixi-ts/Graphics";


export class BaseExample extends FlashBaseObject
{
    protected app:Application;

    constructor(app:Application)
    {
        super();
        let graphic:Graphics = new Graphics();
        graphic.beginFill(0x636363);
        graphic.drawRect(0, 0, app.screen.width, app.screen.height);
        app.stage.addChild(graphic);
        this.app = app;
    }
}