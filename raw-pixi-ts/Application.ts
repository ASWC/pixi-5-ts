import { Container } from "./Container";
import { Renderer } from "./Renderer";
import { StageOptions } from './StageOptions';
import { Ticker } from './Ticker';
import { Rectangle } from '../flash/geom/Rectangle';
import { DestroyOptions } from './DestroyOptions';
import { AccessibilityManager } from "./AccessibilityManager";
import { Extract } from "./Extract";
import { InteractionManager } from "./InteractionManager";
import { ParticleRenderer } from "./ParticleRenderer";
import { Prepare } from "./Prepare";
import { BatchRenderer } from "./BatchRenderer";
import { TilingSpriteRenderer } from "./TilingSpriteRenderer";

export class Application
{	
	protected _ticker:Ticker;
    public renderer:Renderer;
    protected _stage:Container;
    protected _options:StageOptions;
	// loader    
	protected _resizeTo:Window|HTMLElement;

    constructor(options:StageOptions = null)
    {
		if(!options)
		{
			options = new StageOptions();
		}        
		Renderer.registerPlugin('accessibility', AccessibilityManager);
		Renderer.registerPlugin('extract', Extract);
		Renderer.registerPlugin('interaction', InteractionManager);
		Renderer.registerPlugin('particle', ParticleRenderer);
		Renderer.registerPlugin('prepare', Prepare);
		Renderer.registerPlugin('batch', BatchRenderer);
		Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer);
        // this.loader = /*options.sharedLoader ? Loader.shared : */new Loader();
		this.renderer = new Renderer(options)//Application.autoDetectRenderer(options);
	    this._stage = new Container();			
		this.ticker = options.sharedTicker ? Ticker.shared : new Ticker();

		this.resizeTo = window;
		// DisplayObject.mixin(interactiveTarget);
	    if (options.autoStart)
	    {
	        this.start();
	    }
	}

	public get ticker()
	{
		return this._ticker;
	}

	public set ticker(ticker)
	{
		if (this._ticker)
		{
			this._ticker.remove(this.render, this);
		}
		this._ticker = ticker;
		if (ticker)
		{
			ticker.add(this.render, this, Ticker.UPDATE_PRIORITY.LOW);
		}
	}

	public start():void
	{
		this._ticker.start();
	};

	public stop():void
	{
		this._ticker.stop();
	};

	public get resizeTo():Window|HTMLElement
	{
		return this._resizeTo;
	}

	public set resizeTo(value:Window|HTMLElement)
	{
		window.removeEventListener('resize', this.resize);
		this._resizeTo = value;
		if (value)
		{
			window.addEventListener('resize', this.resize);
			this.resize();
		}
	}

	public resize = ()=> 
	{
		if (this._resizeTo)
		{
			if (this._resizeTo === window)
			{
				this.renderer.resize(window.innerWidth,	window.innerHeight);
			}
			else
			{
				this.renderer.resize(this._resizeTo['clientWidth'],	this._resizeTo['clientHeight']);
			}
		}
	};

	public render():void
	{
	    this.renderer.render(this._stage);
	};

	public get stage():Container
	{
		return this._stage;
	}

	public get view():HTMLCanvasElement
	{
	    return this.renderer.view;
	};

	public get screen():Rectangle
	{
	    return this.renderer.screen;
	};
	
	public destroy (options:DestroyOptions = null)
	{
	    this._stage.destroy(options);
	    this._stage = null;
	    this.renderer.destroy(options);
	    this.renderer = null;
        this._options = null;
        // if (this.loader)
	    // {
	    //     this.loader.destroy();
	    //     this.loader = null;
	    // }
    };

}


