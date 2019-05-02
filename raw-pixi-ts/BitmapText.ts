import { Container } from "./Container";
import { ObservablePoint } from "./ObservablePoint";
import { Sprite } from "./Sprite";
import { Texture } from "./Texture";
import { DisplaySettings } from './DisplaySettings';
import { UtilsSettings } from './UtilsSettings';
import { Rectangle } from "./Rectangle";
import { Point } from "./Point";
import { FlashBaseObject } from "./FlashBaseObject";
import { NumberDic } from "./Dictionary";
import { FontManager, BitmapFont } from "./FontManager";
import { Renderer } from "./Renderer";

export class BitmapText extends Container
{
    protected _textWidth:number;
    protected _glyphs:Sprite[];
    protected _font:BitmapFontTracker;
    protected _maxWidth:number;
    protected _anchor:ObservablePoint;
    protected _maxLineHeight:number;
    public roundPixels:boolean;
    protected _letterSpacing:number;
    public dirty:boolean;
    protected _text:string;
    protected _textHeight:number;
    protected bitmapfont:BitmapFont;
    protected hasFont:boolean;

    constructor(text:string)
    {
        super();
        this.hasFont = false;
        this.bitmapfont = null;
        this._textWidth = 0;
        this._textHeight = 0;
        this._glyphs = [];
        this._font = new BitmapFontTracker();
        this._font.align = "left";
        this._font.size = 16;
        this._font.tint = 0xFFFFFF;
        this.font = null; 
        this._text = text;
        this._maxWidth = 0;
        this._maxLineHeight = 0;
        this._letterSpacing = 0;
        this._anchor = new ObservablePoint(function () { this.dirty = true; }, this, 0, 0);
        this.dirty = false;
        this.roundPixels = DisplaySettings.ROUND_PIXELS;
        this.updateText();
    }

    public get font():string
    {
        return this._font.name;
    };

    public set font(value:string) 
    {        
        if (!value)
        {
            return;
        }
        if(value == this._font.name)
        {
            return;
        }
        this._font.name = value;
        this.dirty = true;
    };

    public render(renderer:Renderer):void
    {
        if(!this.bitmapfont)
        {
            this.bitmapfont = FontManager.getBitmapFont(this._font.name);
            return;
        }
        if(this.bitmapfont && !this.hasFont)
        {
            this.hasFont = true;
            this.dirty = true;            
            return;
        }
        super.render(renderer);
    }

    public updateText():void
    {
        if(!this.bitmapfont)
        {
            this.bitmapfont = FontManager.getBitmapFont(this._font.name);
            return;
        }     
        let scale:number = this._font.fontSize / this.bitmapfont.size;
        if(scale <= 0)
        {
            scale = 1;
        }
        let pos:Point = new Point();
        let chars:DataGlipth[] = [];
        let lineWidths:number[] = [];
        let text:string = this._text.replace(/(?:\r\n|\r)/g, '\n') || ' ';
        let textLength:number = text.length;
        let maxWidth:number = this._maxWidth * this.bitmapfont.size / this._font.size;
        let prevCharCode:number = null;
        let lastLineWidth:number = 0;
        let maxLineWidth:number = 0;
        let line:number = 0;
        let lastBreakPos:number = -1;
        let lastBreakWidth:number = 0;
        let spacesRemoved:number = 0;
        let maxLineHeight:number = 0;
        for (let i:number = 0; i < textLength; i++)
        {
            let charCode:number = text.charCodeAt(i);
            let char:string = text.charAt(i);
            if ((/(?:\s)/).test(char))
            {
                lastBreakPos = i;
                lastBreakWidth = lastLineWidth;
            }
            if (char === '\r' || char === '\n')
            {
                lineWidths.push(lastLineWidth);
                maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
                ++line;
                ++spacesRemoved;
                pos.x = 0;
                pos.y += this.bitmapfont.lineHeight;
                prevCharCode = null;
                continue;
            }
            let charData:FontCharacterData = this.bitmapfont.chars[charCode];
            if (!charData)
            {
                continue;
            }
            if (prevCharCode && charData.kerning[prevCharCode])
            {
                pos.x += charData.kerning[prevCharCode];
            }
            let glipthdata:DataGlipth = new DataGlipth();
            glipthdata.texture = charData.texture;
            glipthdata.line = line;
            glipthdata.charCode = charCode;
            glipthdata.position = new Point(pos.x + charData.xOffset + (this._letterSpacing / 2), pos.y + charData.yOffset);
            chars.push(glipthdata);
            pos.x += charData.xAdvance + this._letterSpacing;
            lastLineWidth = pos.x;
            maxLineHeight = Math.max(maxLineHeight, (charData.yOffset + charData.texture.height));
            prevCharCode = charCode;
            if (lastBreakPos !== -1 && maxWidth > 0 && pos.x > maxWidth)
            {
                ++spacesRemoved;
                UtilsSettings.removeItems(chars, 1 + lastBreakPos - spacesRemoved, 1 + i - lastBreakPos);
                i = lastBreakPos;
                lastBreakPos = -1;
                lineWidths.push(lastBreakWidth);
                maxLineWidth = Math.max(maxLineWidth, lastBreakWidth);
                line++;
                pos.x = 0;
                pos.y += this.bitmapfont.lineHeight;
                prevCharCode = null;
            }
        }
        let lastChar:string = text.charAt(text.length - 1);
        if (lastChar !== '\r' && lastChar !== '\n')
        {
            if ((/(?:\s)/).test(lastChar))
            {
                lastLineWidth = lastBreakWidth;
            }
            lineWidths.push(lastLineWidth);
            maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
        }
        let lineAlignOffsets:number[] = [];
        for (let i$1:number = 0; i$1 <= line; i$1++)
        {
            let alignOffset:number = 0;
            if (this._font.align === 'right')
            {
                alignOffset = maxLineWidth - lineWidths[i$1];
            }
            else if (this._font.align === 'center')
            {
                alignOffset = (maxLineWidth - lineWidths[i$1]) / 2;
            }
            lineAlignOffsets.push(alignOffset);
        }
        let lenChars:number = chars.length;
        let tint:number = this.tint;
        for (let i$2:number = 0; i$2 < lenChars; i$2++)
        {            
            let c:Sprite = this._glyphs[i$2];
            if (c)
            {
                c.texture = chars[i$2].texture;
            }
            else
            {
                c = new Sprite(chars[i$2].texture);
                c.roundPixels = this.roundPixels;
                this._glyphs.push(c);
                this.addChild(c);
            }
            c.position.x = (chars[i$2].position.x + lineAlignOffsets[chars[i$2].line]) * scale;
            c.position.y = chars[i$2].position.y * scale;
            c.scale.x = c.scale.y = scale;
            c.tint = tint;            
        }
        for (let i$3:number = lenChars; i$3 < this._glyphs.length; ++i$3)
        {
            this.removeChild(this._glyphs[i$3]);
        }
        this._textWidth = maxLineWidth * scale;
        this._textHeight = (pos.y + this.bitmapfont.lineHeight) * scale;
        if (this.anchor.x !== 0 || this.anchor.y !== 0)
        {
            for (let i$4:number = 0; i$4 < lenChars; i$4++)
            {
                this._glyphs[i$4].x -= this._textWidth * this.anchor.x;
                this._glyphs[i$4].y -= this._textHeight * this.anchor.y;
            }
        }
        this._maxLineHeight = maxLineHeight * scale;
    };

    public updateTransform():void
    {
        super.updateTransform();
        this.validate();
    };

    public getLocalBounds():Rectangle
    {
        this.validate();
        return super.getLocalBounds();
    };

    private validate():void
    {
        if (this.dirty)
        {
            this.updateText();
            this.dirty = false;
        }
    };

    public get fontSize():number
    {
        return this._font.fontSize;
    };

    public set fontSize(value:number) 
    {
        this._font.fontSize = value;
        this.dirty = true;
    };

    public get tint():number
    {
        return this._font.tint;
    };

    public set tint(value:number) 
    {
        this._font.tint = value;
        this.dirty = true;
    };

    public get align():string
    {
        return this._font.align;
    };

    public set align(value:string)
    {
        this._font.align = value || 'left';
        this.dirty = true;
    };

    public get anchor():ObservablePoint
    {
        return this._anchor;
    };

    public set anchor(value:ObservablePoint) 
    {
        this._anchor.copyFrom(value);
    };

    public get text():string
    {
        return this._text;
    };

    public set text(text:string)
    {
        if (this._text === text)
        {
            return;
        }
        this._text = text;
        this.dirty = true;
    };

    public get maxWidth():number
    {
        return this._maxWidth;
    };

    public set maxWidth(value:number)
    {
        if (this._maxWidth === value)
        {
            return;
        }
        this._maxWidth = value;
        this.dirty = true;
    };

    public get maxLineHeight():number
    {
        this.validate();
        return this._maxLineHeight;
    };

    public get textWidth():number
    {
        this.validate();
        return this._textWidth;
    };

    public get letterSpacing():number
    {
        return this._letterSpacing;
    };

    public set letterSpacing(value:number) 
    {
        if (this._letterSpacing !== value)
        {
            this._letterSpacing = value;
            this.dirty = true;
        }
    };

    public get textHeight():number
    {
        this.validate();
        return this._textHeight;
    };
}


class BitmapFontTracker extends FlashBaseObject
{
    public tint:number;
    public align:string;
    public size:number;
    public fontSize:number = 16;
}

class DataGlipth
{
    public texture:Texture;
    public line:number;
    public charCode:number;
    public position:Point;
}

class FontMap
{
    public font:string;
    public size:number;
    public lineHeight:number;
    public chars:FontCharacterDic;
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

