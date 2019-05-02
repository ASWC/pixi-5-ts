import { AbstractRenderer } from "./AbstractRenderer";
import { UniformGroup } from "./UniformGroup";
import { Matrix } from "./Matrix";
import { Event } from "./Event";
import { BatchRenderer } from "./BatchRenderer";
import { BatchSystem } from "./BatchSystem";
import { RenderTextureSystem } from "./RenderTextureSystem";
import { FilterSystem } from "./FilterSystem";
import { TextureGCSystem } from "./TextureGCSystem";
import { ProjectionSystem } from "./ProjectionSystem";
import { StencilSystem } from "./StencilSystem";
import { FramebufferSystem } from "./FramebufferSystem";
import { GeometrySystem } from "./GeometrySystem";
import { TextureSystem } from "./TextureSystem";
import { ShaderSystem } from "./ShaderSystem";
import { StateSystem } from "./StateSystem";
import { ContextSystem } from "./ContextSystem";
import { MaskSystem } from "./MaskSystem";
import { DisplaySettings } from './DisplaySettings';
import { StageOptions } from './StageOptions';
import { TilingSpriteRenderer } from './TilingSpriteRenderer';
import { AccessibilityManager } from './AccessibilityManager';
import { Extract } from './Extract';
import { InteractionManager } from './InteractionManager';
import { ParticleRenderer } from './ParticleRenderer';
import { Prepare } from './Prepare';
import { DisplayObject } from './DisplayObject';
import { RenderTexture } from './RenderTexture';
import { Transform } from './Transform';
import { DestroyOptions } from './DestroyOptions';
import { Runner } from './Runner';

export class Renderer extends AbstractRenderer
{    
	static __plugins = {};
    public CONTEXT_UID:number;
    public globalUniforms:UniformGroup;
    public context:ContextSystem;
    public framebuffer:FramebufferSystem;
    public renderingToScreen:boolean;
    public shader:ShaderSystem;
    public state:StateSystem;
    public batch:BatchSystem;
    public stencil:StencilSystem;
    public geometry:GeometrySystem;
    public renderTexture:RenderTextureSystem;
    public filter:FilterSystem;
    public textureGC:TextureGCSystem;
    public projection:ProjectionSystem;
    public texture:TextureSystem;
	public mask:MaskSystem;
	public plugins;
	runners

    constructor(options:StageOptions)
    {
		super('WebGL', options);
		this.plugins = {}
		this.type = DisplaySettings.RENDERER_TYPE.WEBGL;
		this.gl = null;
		this.CONTEXT_UID = 0;
		this.runners = {
			destroy: new Runner('destroy'),
			contextChange: new Runner('contextChange', 1),
			reset: new Runner('reset'),
			update: new Runner('update'),
			postrender: new Runner('postrender'),
			prerender: new Runner('prerender'),
			resize: new Runner('resize', 2),
		};
		this.globalUniforms = new UniformGroup({
			projectionMatrix: new Matrix(),
		}, true);
		this.addSystem(MaskSystem, 'mask')	
			.addSystem(ContextSystem, 'context')
			.addSystem(StateSystem, 'state')	
			.addSystem(ShaderSystem, 'shader')
			.addSystem(TextureSystem, 'texture')
			.addSystem(GeometrySystem, 'geometry')
			.addSystem(FramebufferSystem, 'framebuffer')
			.addSystem(StencilSystem, 'stencil')
			.addSystem(ProjectionSystem, 'projection')
			.addSystem(TextureGCSystem, 'textureGC')
			.addSystem(FilterSystem, 'filter')
			.addSystem(RenderTextureSystem, 'renderTexture')
			.addSystem(BatchSystem, 'batch');
		this.initPlugins(Renderer.__plugins);	
		if (options.context)
		{
			this.context.initFromContext(options.context);
		}
		else
		{
			this.context.initFromOptions({
				alpha: this.transparent,
				antialias: options.antialias,
				premultipliedAlpha: this.transparent ,//&& this.transparent !== 'notMultiplied',
				stencil: true,
				preserveDrawingBuffer: options.preserveDrawingBuffer,
				powerPreference: this.options.powerPreference,
			});
		}
		this.renderingToScreen = true;

	    //     sayHello(this.context.webGLVersion === 2 ? 'WebGL 2' : 'WebGL 1');

		this.resize(this.options.width, this.options.height);
			

       
	}

	static registerPlugin (pluginName, ctor)
	    {
	        Renderer.__plugins = Renderer.__plugins || {};
	        Renderer.__plugins[pluginName] = ctor;
	    };

	initPlugins (staticMap)
	    {
	        for (var o in staticMap)
	        {
	            this.plugins[o] = new (staticMap[o])(this);
	        }
	    };
	
	addSystem (ClassRef, name)
	    {
	        if (!name)
	        {
	            name = ClassRef.name;
	        }

	        var system = new ClassRef(this);

	        if (this[name])
	        {
	            throw new Error(("Whoops! The name \"" + name + "\" is already in use"));
	        }

	        this[name] = system;

	        for (var i in this.runners)
	        {
	            this.runners[i].add(system);
	        }

	        /**
	         * Fired after rendering finishes.
	         *
	         * @event PIXI.Renderer#postrender
	         */

	        /**
	         * Fired before rendering starts.
	         *
	         * @event PIXI.Renderer#prerender
	         */

	        /**
	         * Fired when the WebGL context is set.
	         *
	         * @event PIXI.Renderer#context
	         * @param {WebGLRenderingContext} gl - WebGL context.
	         */

	        return this;
	    };

    // protected handleContextChange = (event:Event)=>
    // {
	// 	this.plugins.particle.contextChange(this.context.gl)
	// 	this.framebuffer.contextChange(this.context.gl)		
	// 	this.shader.contextChange(this.context.gl)
	// 	this.geometry.contextChange();
	// 	this.state.contextChange(this.context.gl)
	// 	this.texture.contextChange();
	// 	this.framebuffer.contextChange(this.context.gl)
	// 	this.stencil.contextChange(this.context.gl)
	// 	this.projection.contextChange(this.context.gl)
	// 	this.textureGC.contextChange(this.context.gl)
	// 	this.filter.contextChange(this.context.gl)
	// 	this.renderTexture.contextChange(this.context.gl)
	// 	this.batch.contextChange(this.context.gl)
	// 	this.mask.contextChange(this.context.gl);
	// 	this.plugins.batch.contextChange();		
	// 	this.plugins.tilingSprite.contextChange(this.context.gl)		
    // }

	public render(displayObject:DisplayObject, renderTexture:RenderTexture = null, clear:boolean = true, transform:Transform = null, skipUpdateTransform:boolean = false):void
	{
		this.renderingToScreen = !renderTexture;

		this.runners.prerender.run();
			// this.emit('prerender');
			
		this.dispatchEvent(Event.getEvent("prerender"));
		if (this.context.isLost)
		{
			return;
		}
		if (!renderTexture)
		{
			this._lastObjectRendered = displayObject;
		}
		if (!skipUpdateTransform)
		{
			let cacheParent = displayObject.parent;
			displayObject.parent = this._tempDisplayObjectParent;
			displayObject.updateTransform();
			displayObject.parent = cacheParent;
		}
		this.renderTexture.bind(renderTexture);
		this.batch.currentRenderer.start();
		if (clear !== undefined ? clear : this.clearBeforeRender)
		{
			this.renderTexture.clear();
		}
		displayObject.render(this);
		this.batch.currentRenderer.flush();
		if (renderTexture)
		{
			renderTexture.baseTexture.update();
		}
		this.runners.postrender.run();
		this.dispatchEvent(Event.getEvent("postrender"));
	};

	public resize(screenWidth:number, screenHeight:number):void
	{
		super.resize(screenWidth, screenHeight);
		this.runners.resize.run(screenWidth, screenHeight);
		// this.dispatchEvent(Event.getEvent("resize"));
	};

	public reset():Renderer
	{
		this.runners.reset.run();
		// this.dispatchEvent(Event.getEvent("reset"));
		return this;
	};

	public clear():void
	{
		this.framebuffer.bind();
		this.framebuffer.clear();
	};

	public destroy(options:DestroyOptions = null):void
	{		
		this.runners.destroy.run();
		// this.dispatchEvent(Event.getEvent("destroy"));
		super.destroy(options);
		this.gl = null;
	};
}


class RendererPlugins
{
	public tilingSprite:TilingSpriteRenderer;
	public accessibility:AccessibilityManager;
	public extract:Extract;
	public interaction:InteractionManager;
	public particle:ParticleRenderer;
	public prepare:Prepare;
	public batch:BatchRenderer;

	constructor(renderer:Renderer)
	{
		this.particle = new ParticleRenderer(renderer);
		this.tilingSprite = new TilingSpriteRenderer(renderer);
		this.accessibility = new AccessibilityManager(renderer);
		this.extract = new Extract(renderer);
		this.interaction = new InteractionManager(renderer);
		
		this.prepare = new Prepare(renderer);
		this.batch = new BatchRenderer(renderer);
		// Loader$2.registerPlugin(BitmapFontLoader);
		// Loader$2.registerPlugin(SpritesheetLoader);	
	}
}

