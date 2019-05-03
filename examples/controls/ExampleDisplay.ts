import { Container } from "../../raw-pixi-ts/Container";
import { Application } from "../../raw-pixi-ts/Application";
import { Graphics } from "../../raw-pixi-ts/Graphics";
import { BaseExample } from "../BaseExample";
import { ExampleList } from "./ExampleList";
import { AdvancedCard } from "../AdvancedCard";
import { AdvancedSlots } from "../AdvancedSlots";
import { AdvancedTrail } from "../AdvancedTrail";
import { AdvancedWarp } from "../AdvancedWarp";
import { BasicBackground } from "../BasicBackground";
import { BasicBlend } from "../BasicBlend";
import { InteractionIcon } from "../InteractionIcon";
import { SpriteVideo } from "../SpriteVideo";
import { TextureRotate } from "../TextureRotate";
import { BasicContainer } from "../BasicContainer";
import { BasicTinting } from "../BasicTinting";
import { BasicParticles } from "../BasicParticles";
import { GraphicsSimple } from "../GraphicsSimple";
import { GraphicsAdvanced } from "../GraphicsAdvanced";
import { GraphicsDynamic } from "../GraphicsDynamic";
import { TextureRender } from "../TextureRender";
import { TextureAdvanced } from "../TextureAdvanced";
import { TextureGradientBasic } from "../TextureGradientBasic";
import { TextureGradientResource } from "../TextureGradientResource";
import { TextBase } from "../TextBase";
import { TextBitmap } from "../TextBitmap";
import { TextWebFont } from "../TextWebFont";
import { MaskGraphics } from "../MaskGraphics";
import { MaskSprite } from "../MaskSprite";
import { FilterBlur } from "../FilterBlur";
import { FilterColor } from "../FilterColor";
import { FilterCrawlies } from "../FilterCrawlies";
import { FilterFlag } from "../FilterFlag";
import { MaskFilter } from "../MaskFilter";
import { InteractionClick } from "../InteractionClick";
import { InteractionInteractivity } from "../InteractionInteractivity";
import { InteractionDragging } from "../InteractionDragging";
import { SpriteBasic } from "../SpriteBasic";
import { SpriteSwap } from "../SpriteSwap";
import { SpriteTiling } from "../SpriteTiling";
import { SpriteExplosion } from "../SpriteExplosion";
import { Spritejet } from "../Spritejet";
import { SpriteSpeed } from "../SpriteSpeed";
import { FilterBlending } from "../FilterBlending";
import { FilterCustom } from "../FilterCustom";
import { FilterShadow } from "../FilterShadow";
import { MeshBasic } from "../MeshBasic";
import { MeshAdvanced } from "../MeshAdvanced";
import { MeshTriangle } from "../MeshTriangle";
import { MeshColoredTriangle } from "../MeshColoredTriangle";
import { MeshTextured } from "../MeshTextured";
import { MeshUniforms } from "../MeshUniforms";
import { MeshGeometry } from "../MeshGeometry";
import { MeshShader } from "../MeshShader";
import { Event } from "../../raw-pixi-ts/Event";


export class ExampleDisplay extends Container
{
    protected stageLayer:Container;
    protected controlLayer:Container;
    protected app:Application;
    protected frame:Graphics;
    protected background:Graphics;
    protected currentExample:BaseExample;
    protected list:ExampleList;
    protected exampleWidth:number;
    protected exampleheight:number;
    protected framesize:number;

    constructor(app:Application, displayWidth:number, displayheight:number)
    {
        super();
        let controlSize:number = 200;
        this.app = app;
        this.background = new Graphics();
        this.refreshBackground(0x969696);
        app.stage.addChild(this.background);
        this.stageLayer = new Container();
        app.stage.addChild(this.stageLayer);
        this.list = new ExampleList(controlSize, displayheight);
        this.list.x = displayWidth - controlSize;
        displayWidth = displayWidth - controlSize;
        app.stage.addChild(this.list);
        this.controlLayer = new Container();
        app.stage.addChild(this.controlLayer);
        this.framesize = 5;

        this.exampleWidth = displayWidth//(displayWidth - controlSize) - (this.framesize / 2)
        this.exampleheight = displayheight - (this.framesize / 2)
        this.frame = new Graphics();
        this.frame.beginFill(0x000FFF);
        this.frame.drawRect(0, 0, this.framesize, displayheight);
        this.frame.drawRect(displayWidth - this.framesize, 0, 5, displayheight);
        this.frame.drawRect(this.framesize, 0, displayWidth - (this.framesize * 2), this.framesize);
        this.frame.drawRect(this.framesize, displayheight - this.framesize, displayWidth - (this.framesize * 2), this.framesize);
        this.controlLayer.addChild(this.frame);

        // this.list.addExample("Sprite Basic", SpriteBasic);
        // this.list.addExample("Sprite Reveal", AdvancedCard);
        // this.list.addExample("Sprite Slots", AdvancedSlots);
        // this.list.addExample("Sprite Trail", AdvancedTrail);
        // this.list.addExample("Sprite Warp", AdvancedWarp);  
        // this.list.addExample("Sprite Blend", BasicBlend);
        // this.list.addExample("Sprite Tinting", BasicTinting);
        // this.list.addExample("Sprite Video", SpriteVideo);
        // this.list.addExample("Sprite Tiling", SpriteTiling);
        // this.list.addExample("Sprite Animation", SpriteExplosion);
        // this.list.addExample("Sprite Animation 2", Spritejet);
        // this.list.addExample("Sprite Animation 3", SpriteSpeed);
        // this.list.addExample("Graphics Basic", GraphicsSimple);
        // this.list.addExample("Graphics Advanced", GraphicsAdvanced);
        // this.list.addExample("Graphics Dynamic", GraphicsDynamic);
        // this.list.addExample("Container", BasicContainer);
        // this.list.addExample("Mask Graphics", MaskGraphics);
        // this.list.addExample("Mask Sprite", MaskSprite);
        // this.list.addExample("Particles", BasicParticles);
        // this.list.addExample("Text", TextBase);
        // this.list.addExample("Text Bitmap", TextBitmap);
        // this.list.addExample("Text WebFont", TextWebFont);
        // this.list.addExample("Interaction", InteractionInteractivity);
        // this.list.addExample("Interaction Click", InteractionClick);  
        // this.list.addExample("Interaction Drag", InteractionDragging);
        // this.list.addExample("Interaction Icon", InteractionIcon);    
        // this.list.addExample("texture Swap", SpriteSwap);
        // this.list.addExample("Texture Advanced", TextureAdvanced);
        // this.list.addExample("Texture Gradient", TextureGradientBasic);

        this.list.addExample("Texture Gradient 2", TextureGradientResource);
        this.list.addExample("Texture Rotate", TextureRotate);
        this.list.addExample("Texture Render", TextureRender);
        this.list.addExample("Filter Blur", FilterBlur);

        this.list.addExample("Filter Colormatrix", FilterColor);
        this.list.addExample("Filter Displacement", FilterCrawlies);
        this.list.addExample("Filter Displacement 2", FilterFlag);
        this.list.addExample("Filter Blur 2", MaskFilter);        
        this.list.addExample("Filter Blending", FilterBlending);
        this.list.addExample("Filter Custom", FilterCustom);
        this.list.addExample("Filter Shadow", FilterShadow);
        this.list.addExample("Mesh Basic", MeshBasic);
        this.list.addExample("Mesh Triangle", MeshTriangle);
        this.list.addExample("Mesh Triangle 2", MeshColoredTriangle);
        this.list.addExample("Mesh Texture", MeshTextured);
        this.list.addExample("Mesh Advanced", MeshAdvanced);
        this.list.addExample("Mesh Uniforms", MeshUniforms);
        this.list.addExample("Mesh Geometry", MeshGeometry);
        this.list.addExample("Mesh Shader", MeshShader);        
        this.setExample(SpriteBasic);
    }

    protected handleExampleRequest = (event:Event)=>
    {
        this.setExample(this.list.selectedClass);
    }

    public setExample(keyclass: typeof BaseExample):void
    {
        this.list.removeEventListener(Event.CHANGE, this.handleExampleRequest);
        if(this.currentExample)
        {
            this.currentExample.destructor();
        }
        this.currentExample = new keyclass(this.app, this.exampleWidth, this.exampleheight);
        this.currentExample.addEventListener(Event.COMPLETE, this.handleComplete)
        // this.currentExample.stage.x = this.currentExample.stage.y = this.framesize;
        this.stageLayer.removeChildren();
        this.stageLayer.addChild(this.currentExample.stage);
        this.refreshBackground(this.currentExample.backColor);
    }

    protected handleComplete = (event:Event)=>
    {
        this.list.addEventListener(Event.CHANGE, this.handleExampleRequest);
    }

    protected refreshBackground(color:number):void
    {
        this.background.clear();
        this.background.beginFill(color);
        this.background.drawRect(0, 0, this.exampleWidth, this.exampleheight);
    }

    
}