import { BaseExample } from "./BaseExample";
import { Application } from "../raw-pixi-ts/Application";
import { ResourceLoader } from "../raw-pixi-ts/ResourceLoader";
import { URLRequest } from "../raw-pixi-ts/URLRequest";
import { Event } from "../raw-pixi-ts/Event";
import { Texture } from "../raw-pixi-ts/Texture";
import { BaseTexture } from "../raw-pixi-ts/BaseTexture";
import { Container } from "../raw-pixi-ts/Container";
import { BlurFilter } from "../raw-pixi-ts/BlurFilter";
import { Sprite } from "../raw-pixi-ts/Sprite";
import { Graphics } from "../raw-pixi-ts/Graphics";
import { TextStyle } from "../raw-pixi-ts/TextStyle";
import { Text } from "../raw-pixi-ts/Text";
import { MouseEvent } from "../raw-pixi-ts/MouseEvent";


export class AdvancedSlots extends BaseExample
{
    protected loader:ResourceLoader; 
    protected eggTxt:Texture;
    protected flowerTxt:Texture;
    protected helmTxt:Texture;
    protected skullTxt:Texture;    
    protected reels:any[];
    protected running:boolean;
    protected SYMBOL_SIZE:number;
    protected slotTextures:any[];
    protected tweening:any[];
    
    constructor(app:Application)
    {
        super(app);
        this.tweening = [];
        this.loader = new ResourceLoader(new URLRequest("examples/assets/eggHead.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleEggLoaded);
        this.loader.load(); 
    }

    protected handleEggLoaded = (event:Event)=>
    {
        this.eggTxt = new Texture(new BaseTexture(this.loader.imageData));  
        this.loader = new ResourceLoader(new URLRequest("examples/assets/flowerTop.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleFlowerLoaded);
        this.loader.load(); 
    }

    protected handleFlowerLoaded = (event:Event)=>
    {
        this.flowerTxt = new Texture(new BaseTexture(this.loader.imageData));  
        this.loader = new ResourceLoader(new URLRequest("examples/assets/helmlok.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleHelmLoaded);
        this.loader.load(); 
    }

    protected handleHelmLoaded = (event:Event)=>
    {
        this.helmTxt = new Texture(new BaseTexture(this.loader.imageData));  
        this.loader = new ResourceLoader(new URLRequest("examples/assets/skully.png"))
        this.loader.addEventListener(Event.COMPLETE, this.handleSkullLoaded);
        this.loader.load(); 
    }

    protected handleSkullLoaded = (event:Event)=>
    {
        this.skullTxt = new Texture(new BaseTexture(this.loader.imageData)); 
        const REEL_WIDTH = 160;
        this.SYMBOL_SIZE = 150;
        this.slotTextures = [
            this.eggTxt,
            this.flowerTxt,
            this.helmTxt,
            this.skullTxt,
        ];
        this.reels = [];
        const reelContainer = new Container();
        for (let i = 0; i < 5; i++) 
        {
            const rc = new Container();
            rc.x = i * REEL_WIDTH;
            reelContainer.addChild(rc);    
            const reel = {
                container: rc,
                symbols: [],
                position: 0,
                previousPosition: 0,
                blur: new BlurFilter(),
            };
            reel.blur.blurX = 0;
            reel.blur.blurY = 0;
            rc.filters = [reel.blur];
            for (let j = 0; j < 4; j++) {
                const symbol = new Sprite(this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)]);
                symbol.y = j * this.SYMBOL_SIZE;
                symbol.scale.x = symbol.scale.y = Math.min(this.SYMBOL_SIZE / symbol.width, this.SYMBOL_SIZE / symbol.height);
                symbol.x = Math.round((this.SYMBOL_SIZE - symbol.width) / 2);
                reel.symbols.push(symbol);
                rc.addChild(symbol);
            }
            this.reels.push(reel);
            this.app.stage.addChild(reelContainer);
            const margin = (this.app.screen.height - this.SYMBOL_SIZE * 3) / 2;
            reelContainer.y = margin;
            reelContainer.x = Math.round(this.app.screen.width - REEL_WIDTH * 5);
            const top = new Graphics();
            top.beginFill(0, 1);
            top.drawRect(0, 0, this.app.screen.width, margin);
            const bottom = new Graphics();
            bottom.beginFill(0, 1);
            bottom.drawRect(0, this.SYMBOL_SIZE * 3 + margin, this.app.screen.width, margin);
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
            const playText = new Text('Spin the wheels!', style);
            playText.x = Math.round((bottom.width - playText.width) / 2);
            playText.y = this.app.screen.height - margin + Math.round((margin - playText.height) / 2);
            bottom.addChild(playText);
            const headerText = new Text('PIXI MONSTER SLOTS!', style);
            headerText.x = Math.round((top.width - headerText.width) / 2);
            headerText.y = Math.round((margin - headerText.height) / 2);
            top.addChild(headerText);
            this.app.stage.addChild(top);
            this.app.stage.addChild(bottom);
            bottom.interactive = true;
            bottom.buttonMode = true;
            bottom.addEventListener(MouseEvent.POINTER_DOWN, this.startPlay);
            this.running = false;
        }
        this.app.ticker.add(this.runExample);
        this.app.ticker.add(this.tween);
    }

    protected startPlay = ()=>
    {
        if (this.running) return;
        this.running = true;
        for (let i = 0; i < this.reels.length; i++) {
            const r = this.reels[i];
            const extra = Math.floor(Math.random() * 3);
            const target = r.position + 10 + i * 5 + extra;
            const time = 2500 + i * 600 + extra * 600;
            this.tweenTo(r, 'position', target, time, this.backout(0.5), null, i === this.reels.length - 1 ? this.reelsComplete : null);
        }
    }

    protected reelsComplete = ()=>
    {
        this.running = false;
    }

    protected runExample = (delta:number)=>
    {
        for (let i = 0; i < this.reels.length; i++) 
        {
            const r = this.reels[i];
            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;
            for (let j = 0; j < r.symbols.length; j++) 
            {
                const s = r.symbols[j];
                const prevy = s.y;
                s.y = ((r.position + j) % r.symbols.length) * this.SYMBOL_SIZE - this.SYMBOL_SIZE;
                if (s.y < 0 && prevy > this.SYMBOL_SIZE) 
                {
                    s.texture = this.slotTextures[Math.floor(Math.random() * this.slotTextures.length)];
                    s.scale.x = s.scale.y = Math.min(this.SYMBOL_SIZE / s.texture.width, this.SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((this.SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    }

    protected tweenTo(object, property, target, time, easing, onchange, oncomplete) 
    {
        const tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing,
            time,
            change: onchange,
            complete: oncomplete,
            start: Date.now(),
        };
        this.tweening.push(tween);
        return tween;
    }

    protected tween = (delta:number)=>
    {
        const now = Date.now();
        const remove = [];
        for (let i = 0; i < this.tweening.length; i++) {
            const t = this.tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);

            t.object[t.property] = this.lerp(t.propertyBeginValue, t.target, t.easing(phase));
            if (t.change) t.change(t);
            if (phase === 1) {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        for (let i = 0; i < remove.length; i++) {
            this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
        }
    }

    protected lerp(a1, a2, t) 
    {
        return a1 * (1 - t) + a2 * t;
    }
    
    protected backout(amount) 
    {
        return t => (--t * t * ((amount + 1) * t + amount) + 1);
    }
}