import { Application } from './raw-pixi-ts/Application';
import { StageOptions } from './raw-pixi-ts/StageOptions';
import { BasicContainer } from './examples/BasicContainer';
import { BasicBackground } from './examples/BasicBackground';
import { BasicTinting } from './examples/BasicTinting';
import { BasicCache } from './examples/BasicCache';
import { BasicParticles } from './examples/BasicParticles';
import { BasicBlend } from './examples/BasicBlend';
import { AdvancedSlots } from './examples/AdvancedSlots';
import { GraphicsSimple } from './examples/GraphicsSimple';
import { GraphicsAdvanced } from './examples/GraphicsAdvanced';
import { GraphicsDynamic } from './examples/GraphicsDynamic';
import { TextureRotate } from './examples/TextureRotate';
import { TextureRender } from './examples/TextureRender';
import { TextureAdvanced } from './examples/TextureAdvanced';
import { TextureGradientBasic } from './examples/TextureGradientBasic';
import { TextureGradientResource } from './examples/TextureGradientResource';
import { TextBase } from './examples/TextBase';
import { TextBitmap } from './examples/TextBitmap';
import { TextWebFont } from './examples/TextWebFont';
import { MaskGraphics } from './examples/MaskGraphics';
import { MaskSprite } from './examples/MaskSprite';
import { FilterBlur } from './examples/FilterBlur';
import { FilterColor } from './examples/FilterColor';
import { FilterCrawlies } from './examples/FilterCrawlies';
import { FilterFlag } from './examples/FilterFlag';
import { MaskFilter } from './examples/MaskFilter';
import { InteractionClick } from './examples/InteractionClick';
import { InteractionInteractivity } from './examples/InteractionInteractivity';
import { InteractionDragging } from './examples/InteractionDragging';
import { InteractionIcon } from './examples/InteractionIcon';
import { SpriteBasic } from './examples/SpriteBasic';
import { SpriteSwap } from './examples/SpriteSwap';
import { SpriteTiling } from './examples/SpriteTiling';
import { SpriteVideo } from './examples/SpriteVideo';
import { SpriteExplosion } from './examples/SpriteExplosion';
import { Spritejet } from './examples/Spritejet';
import { SpriteSpeed } from './examples/SpriteSpeed';
import { AdvancedCard } from './examples/AdvancedCard';
import { AdvancedTrail } from './examples/AdvancedTrail';
import { AdvancedWarp } from './examples/AdvancedWarp';
import { FilterBlending } from './examples/FilterBlending';
import { FilterCustom } from './examples/FilterCustom';
import { FilterShadow } from './examples/FilterShadow';
import { MeshBasic } from './examples/MeshBasic';
import { MeshAdvanced } from './examples/MeshAdvanced';
import { MeshTriangle } from './examples/MeshTriangle';
import { MeshColoredTriangle } from './examples/MeshColoredTriangle';
import { MeshTextured } from './examples/MeshTextured';
import { MeshUniforms } from './examples/MeshUniforms';
import { MeshGeometry } from './examples/MeshGeometry';
import { MeshShader } from './examples/MeshShader';
import { MeshMerging } from './examples/MeshMerging';
import { FilterTest } from './examples/FilterTest';
import { Button } from './fl-package/Button';
import { ExampleDisplay } from './examples/controls/ExampleDisplay';


window.addEventListener("load", ()=>{

    var options:StageOptions = new StageOptions();
    options.width = 1000;
    options.height = 600
    options.autoResize = false
    options.backgroundColor = 0x00000000;
    options.clearBeforeRender = true;
    options.resolution = 1;
    options.autoStart = true;
    options.transparent = true;
    options.antialias = true;
    options.view = <HTMLCanvasElement>document.getElementById("fakecanvas");    
    var app = new Application(options);
    let display:ExampleDisplay = new ExampleDisplay(app, 1024, 768);
    app.stage.addChild(display);


    // create a view class with frame
    // create a control class with buttons
    // each button click change content of class frame


    // let button:Button = new Button("Test", 200, 40);
    // app.stage.addChild(button);
    // button.x = 800;

    // let example:BasicCache = new BasicCache(app); NOT WORKING

    // let example:InteractionIcon = new InteractionIcon(app);
    // let example:SpriteVideo = new SpriteVideo(app);
    // let example:AdvancedSlots = new AdvancedSlots(app); 
    // let example:TextureRotate = new TextureRotate(app); 
    // let example:BasicContainer = new BasicContainer(app);
    // let example:BasicBackground = new BasicBackground(app);
    // let example:BasicTinting = new BasicTinting(app);    
    // let example:BasicParticles = new BasicParticles(app);
    // let example:BasicBlend = new BasicBlend(app);    
    // let example:GraphicsSimple = new GraphicsSimple(app);
    // let example:GraphicsAdvanced = new GraphicsAdvanced(app);
    // let example:GraphicsDynamic = new GraphicsDynamic(app);
    // let example:TextureRender = new TextureRender(app);
    // let example:TextureAdvanced = new TextureAdvanced(app);
    // let example:TextureGradientBasic = new TextureGradientBasic(app);
    // let example:TextureGradientResource = new TextureGradientResource(app);
    // let example:TextBase = new TextBase(app);
    // let example:TextBitmap = new TextBitmap(app); 
    // let example:TextWebFont = new TextWebFont(app); 
    // let example:MaskGraphics = new MaskGraphics(app);
    // let example:MaskSprite = new MaskSprite(app);
    // let example:FilterBlur = new FilterBlur(app);
    // let example:FilterColor = new FilterColor(app);
    // let example:FilterCrawlies = new FilterCrawlies(app);
    // let example:FilterFlag = new FilterFlag(app);
    // let example:MaskFilter = new MaskFilter(app);
    // let example:InteractionClick = new InteractionClick(app);
    // let example:InteractionInteractivity = new InteractionInteractivity(app);
    // let example:InteractionDragging = new InteractionDragging(app); 
    // let example:SpriteBasic = new SpriteBasic(app);  
    // let example:SpriteSwap = new SpriteSwap(app);    
    // let example:SpriteTiling = new SpriteTiling(app);    
    // let example:SpriteExplosion = new SpriteExplosion(app);
    // let example:Spritejet = new Spritejet(app); 
    // let example:SpriteSpeed = new SpriteSpeed(app); 
    // let example:AdvancedCard = new AdvancedCard(app); 
    // let example:AdvancedTrail = new AdvancedTrail(app); 
    // let example:AdvancedWarp = new AdvancedWarp(app); 
    // let example:FilterBlending = new FilterBlending(app); 
    // let example:FilterCustom = new FilterCustom(app); 
    // let example:FilterShadow = new FilterShadow(app); 
    // let example:MeshBasic = new MeshBasic(app);
    // let example:MeshAdvanced = new MeshAdvanced(app);
    // let example:MeshTriangle = new MeshTriangle(app);
    // let example:MeshColoredTriangle = new MeshColoredTriangle(app);
    // let example:MeshTextured = new MeshTextured(app);
    // let example:MeshUniforms = new MeshUniforms(app);
    // let example:MeshGeometry = new MeshGeometry(app);
    // let example:MeshShader = new MeshShader(app);
    
})











    
