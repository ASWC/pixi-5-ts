
import { Texture } from "./Texture";
import { URLRequest } from "./URLRequest";
import { URLLoader } from "./URLLoader";
import { Event } from "./Event";
import { IOErrorEvent } from "./IOErrorEvent";
import { EventDispatcher } from "./EventDispatcher";
import { URLRequestMethod } from "./URLRequestMethod";
import { XMLParser } from "./XMLParser";
import { NetworkSettings } from "./NetworkSettings";
import { DisplaySettings } from "./DisplaySettings";
import { NumberDic } from "./Dictionary";
import { Rectangle } from "./Rectangle";
import { BaseTexture } from './BaseTexture';
import { ResourceLoader } from "./ResourceLoader";

export class FontManager
{
	private static fontLoaders:BitmapFontLoaderDic = {};
	private static bitmapfonts:BitmapFontDic = {};
	public static onWebFontloaded:Function;

	constructor()
	{

	}

	public static set WebFontConfig(value:any)
	{
		let config:any = {
			active() {
                FontManager.webFontActive();
            }
		};
		for(let key in value)
		{
			config[key] = value[key];
		}
		window['WebFontConfig'] = config;
		FontManager.loadWebFont();
	}

	protected static webFontActive = ()=>
	{
		if(FontManager.onWebFontloaded)
		{
			FontManager.onWebFontloaded();
		}
	}

	private static loadWebFont = ()=> 
	{
		const wf:any = document.createElement('script');
		wf.src = `${document.location.protocol === 'https:' ? 'https' : 'http'
		}://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`;
		wf.type = 'text/javascript';
		wf.async = 'true';
		const s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(wf, s);
	}		

	public static getBitmapFont(name:string):BitmapFont
	{
		if(FontManager.bitmapfonts[name] != undefined)
		{
			return FontManager.bitmapfonts[name];
		}		
		return null;
	}

	public static addBitmapFont(data:BitmapFont):void
	{
		FontManager.bitmapfonts[data.font] = data;	
	}

	public static loadBitmapFont(path:string):BitmapFontLoader
	{
		let loader:BitmapFontLoader = new BitmapFontLoader();
		FontManager.fontLoaders[loader.instanceName] = loader;
		loader.loadFont(path);
		return loader;
	}

	public static parseBitmapFontData(xml:XMLDocument, base:Texture):BitmapFont
	{
		let pageid:string;
		let pagepath:string;
		let data:BitmapFont = new BitmapFont();
		data.texture = base;
		let info:Element = xml.getElementsByTagName('info')[0];
		let common:Element = xml.getElementsByTagName('common')[0];
		let pages:Element = xml.getElementsByTagName('page')[0];
		let res:number = NetworkSettings.getResolutionOfUrl(pages.getAttribute('file'), DisplaySettings.RESOLUTION);
		data.font = info.getAttribute('face');
		data.size = parseInt(info.getAttribute('size'), 10);
		data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10) / res;
		data.chars = {};
		pageid = pages.getAttribute('id');
		pagepath = pages.getAttribute('file');
		data.texturePath = pagepath;
		let letters:Element[] = Array.from(xml.getElementsByTagName('char'));		
        for (let i$1:number = 0; i$1 < letters.length; i$1++)
        {
            let letter:Element = letters[i$1];
            let charCode:number = parseInt(letter.getAttribute('id'), 10);
            let page:number = parseInt(letter.getAttribute('page')) || 0;
            let textureRect:Rectangle = new Rectangle(
                (parseInt(letter.getAttribute('x'), 10) / res) + (base.frame.x / res),
                (parseInt(letter.getAttribute('y'), 10) / res) + (base.frame.y / res),
                parseInt(letter.getAttribute('width'), 10) / res,
                parseInt(letter.getAttribute('height'), 10) / res
            );
            let fontchar:FontCharacterData = new FontCharacterData();
            fontchar.xOffset = parseInt(letter.getAttribute('xoffset'), 10) / res;
            fontchar.yOffset = parseInt(letter.getAttribute('yoffset'), 10) / res;
            fontchar.xAdvance = parseInt(letter.getAttribute('xadvance'), 10) / res;
			fontchar.kerning = {};
			fontchar.texture = new Texture(base.baseTexture, textureRect);
            fontchar.page = page;
            data.chars[charCode] = fontchar;
        }
        let kernings:Element[] = Array.from(xml.getElementsByTagName('kerning'));
        for (let i$2:number = 0; i$2 < kernings.length; i$2++)
        {
            let kerning:Element = kernings[i$2];
            let first:number = parseInt(kerning.getAttribute('first'), 10) / res;
            let second:number = parseInt(kerning.getAttribute('second'), 10) / res;
            let amount:number = parseInt(kerning.getAttribute('amount'), 10) / res;
            if (data.chars[second])
            {
                data.chars[second].kerning[first] = amount;
            }
        }
        return data;
	}
}

export class BitmapFont
{
	public font:string;
    public size:number;
    public lineHeight:number;
	public chars:FontCharacterDic;
	public texturePath:string;
	public texture:Texture;
}

class BitmapFontLoader extends EventDispatcher
{
	private urlloader:URLLoader;
	private textureloader:ResourceLoader;
	private rootpath:string;
	private fontdata:BitmapFont;
	private fontxml:XMLDocument;

	constructor()
	{
		super();
	}

	public loadFont(path:string):void
	{
		let request:URLRequest = new URLRequest(path);
		if(path.indexOf("/") >= 0)
		{
			let pathparts:string[] = path.split("/");
			pathparts.pop();
			this.rootpath = pathparts.join("/") + "/";
		}
		else
		{
			this.rootpath = "";
		}
		request.method = URLRequestMethod.POST
		this.urlloader = new URLLoader();
		this.urlloader.addEventListener(Event.COMPLETE, this.handleFontXMLComplete);
		this.urlloader.addEventListener(IOErrorEvent.IO_ERROR, this.handleFontLoadError);
		this.urlloader.load(request);
	}

	private handleFontXMLComplete = (event:Event)=>
	{
		this.fontxml = XMLParser.parse(this.urlloader.data);
		let pages:Element = this.fontxml.getElementsByTagName('page')[0];
		let pagepath:string = pages.getAttribute('file');
		this.textureloader = new ResourceLoader(new URLRequest(this.rootpath + pagepath));
		this.textureloader.addEventListener(Event.COMPLETE, this.handletextureLoaded)
		this.textureloader.load();
	}

	private handletextureLoaded = (event:Event)=>
	{
		let b:BaseTexture = new BaseTexture(this.textureloader.imageData);
		let t:Texture = new Texture(b);		
		this.fontdata = FontManager.parseBitmapFontData(this.fontxml, t);
		FontManager.addBitmapFont(this.fontdata);
		this.dispatchEvent(Event.getEvent(Event.COMPLETE));
	}

	private handleFontLoadError = (event:IOErrorEvent)=>
	{
		this.dispatchEvent(event);
	}
}

class FontCharacterData
{
    public xOffset:number;
    public yOffset:number;
    public xAdvance:number;
    public kerning:NumberDic;
    public texture:Texture;
	public page:number;
}

interface FontCharacterDic
{
    [name:string]:FontCharacterData;
}

interface BitmapFontLoaderDic
{
	[name:string]:BitmapFontLoader;
}

interface BitmapFontDic
{
	[name:string]:BitmapFont;
}