
import { InteractionData } from "./InteractionData";
import { InteractionEvent } from "./InteractionEvent";
import { MouseEvent } from "./MouseEvent";
import { InteractionTrackingData } from "./InteractionTrackingData";
import { Ticker } from "./Ticker";
import { Point } from "../flash/geom/Point";
import { Renderer } from "./Renderer";
import { NumberDic } from "./Dictionary";
import { DisplayObject } from "./DisplayObject";
import { Container } from "./Container";
import { TilingSprite } from "./TilingSprite";
import { Sprite } from "./Sprite";
import { DestroyOptions } from "./DestroyOptions";
import { Rectangle } from "../flash/geom/Rectangle";
import { EventDispatcher } from "./EventDispatcher";
import { NativeEvent } from "./NativeEvent";
import { trace } from "./Logger";
import { InstanceCounter } from "./InstanceCounter";

export class InteractionManager extends EventDispatcher
{
	public static MOUSE_POINTER_ID:number = 1;        
	public hitTestEvent:InteractionEvent;
	public didMove:boolean;
	public _deltaTime:number;
	public resolution:number;
	public _tempPoint:Point;
	public cursor:string;
	public currentCursorMode:string;
	public cursorStyles:any;
	public mouseOverRenderer:boolean;
	public eventsAdded:boolean;
	public eventData:InteractionEvent;
	public renderer:Renderer;
	public autoPreventDefault:boolean;
	public interactionFrequency:number;
	public mouse:InteractionData;
	public activeInteractionData:InteractionDataDic;
	public interactionDataPool:InteractionData[];
	public interactionDOMElement:HTMLCanvasElement;
	public moveWhenInside:boolean;
	public supportsTouchEvents:boolean;
	public supportsPointerEvents:boolean;

	public destructor():void
	{
		if(this._tempPoint)
		{
			this._tempPoint.destructor();
		}
		this._tempPoint = null;
	}

    constructor(renderer:Renderer)
    {
		super();
		this.hitTestEvent = new InteractionEvent(null, null, null)		
		this.hitTestEvent.target = null;
        this.renderer = renderer;
        this.autoPreventDefault = true;
        this.interactionFrequency = 10;
        this.mouse = new InteractionData();
        this.mouse.identifier = InteractionManager.MOUSE_POINTER_ID;
        this.mouse.global.set(-999999);
        this.activeInteractionData = {};
        this.activeInteractionData[InteractionManager.MOUSE_POINTER_ID] = this.mouse;
        this.interactionDataPool = [];
        this.eventData = new InteractionEvent("interaction");
        this.interactionDOMElement = null;
        this.moveWhenInside = false;
        this.eventsAdded = false;
        this.mouseOverRenderer = false;
        this.supportsTouchEvents = 'ontouchstart' in window;
        this.supportsPointerEvents = !!window['PointerEvent'];
        this.cursorStyles = {
            default: 'inherit',
            pointer: 'pointer'
        };
        this.currentCursorMode = null;
        this.cursor = null;
        this._tempPoint = Point.getPoint();
        this.resolution = 1;
        this.setTargetElement(this.renderer.view, this.renderer.resolution);
	}

	public setTargetElement(element:HTMLCanvasElement, resolution:number = 1):void
	{
		this.removeEvents();
		this.interactionDOMElement = element;
		this.resolution = resolution;
		this.addEvents();
	};

	protected removeEvents():void
	{
		if (!this.interactionDOMElement)
		{
			return;
		}
		Ticker.system.remove(this.update);
		if (window.navigator.msPointerEnabled)
		{
			this.interactionDOMElement.style['-ms-content-zooming'] = '';
			this.interactionDOMElement.style['-ms-touch-action'] = '';
		}
		else if (this.supportsPointerEvents)
		{
			this.interactionDOMElement.style['touch-action'] = '';
		}
		if (this.supportsPointerEvents)
		{
			window.document.removeEventListener('pointermove', this.onPointerMove);
			this.interactionDOMElement.removeEventListener('pointerdown', this.onPointerDown);
			this.interactionDOMElement.removeEventListener('pointerleave', this.onPointerOut);
			this.interactionDOMElement.removeEventListener('pointerover', this.onPointerOver);
			window.removeEventListener('pointercancel', this.onPointerCancel);
			window.removeEventListener('pointerup', this.onPointerUp);
		}
		else
		{
			window.document.removeEventListener('mousemove', this.onPointerMove);
			this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown);
			this.interactionDOMElement.removeEventListener('mouseout', this.onPointerOut);
			this.interactionDOMElement.removeEventListener('mouseover', this.onPointerOver);
			window.removeEventListener('mouseup', this.onPointerUp);
		}
		if (this.supportsTouchEvents)
		{
			this.interactionDOMElement.removeEventListener('touchstart', this.onPointerDown);
			this.interactionDOMElement.removeEventListener('touchcancel', this.onPointerCancel);
			this.interactionDOMElement.removeEventListener('touchend', this.onPointerUp);
			this.interactionDOMElement.removeEventListener('touchmove', this.onPointerMove);
		}
		this.interactionDOMElement = null;
		this.eventsAdded = false;
	};

	public update = (deltaTime:number)=>
	{
		this._deltaTime += deltaTime;
		if (this._deltaTime < this.interactionFrequency)
		{
			return;
		}
		this._deltaTime = 0;
		if (!this.interactionDOMElement)
		{
			return;
		}
		if (this.didMove)
		{
			this.didMove = false;
			return;
		}
		this.cursor = null;
		for (let k in this.activeInteractionData)
		{
			if (this.activeInteractionData.hasOwnProperty(k))
			{
				let interactionData:InteractionData = this.activeInteractionData[k];
				if (interactionData.originalEvent && interactionData.pointerType !== 'touch')
				{
					let interactionEvent:InteractionEvent = this.configureInteractionEventForDOMEvent(this.eventData, interactionData.originalEvent, interactionData);
					this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerOverOut, true);
				}
			}
		}
		this.setCursorMode(this.cursor);
	};
	
	public mapPositionToPoint(point:Point, x:number, y:number):void
	{
		let rect:Rectangle|ClientRect;
		if (!this.interactionDOMElement.parentElement)
		{
			InstanceCounter.addCall("Rectangle.getRectangle", "Interactionmanager mapPositionToPoint")
			rect = Rectangle.getRectangle();
		}
		else
		{
			rect = this.interactionDOMElement.getBoundingClientRect();
		}
		let resolutionMultiplier:number = 1.0 / this.resolution;
		point.x = ((x - rect.left) * (this.interactionDOMElement.width / rect.width)) * resolutionMultiplier;
		point.y = ((y - rect.top) * (this.interactionDOMElement.height / rect.height)) * resolutionMultiplier;
		if(rect instanceof Rectangle)
		{
			rect.recycle();
		}
	};

	public configureInteractionEventForDOMEvent(interactionEvent:InteractionEvent, pointerEvent:NativeEvent, interactionData:InteractionData):InteractionEvent
	{
		interactionEvent.data = interactionData;
		this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);
		if (pointerEvent.pointerType === 'touch')
		{
			pointerEvent.globalX = interactionData.global.x;
			pointerEvent.globalY = interactionData.global.y;
		}
		interactionData.originalEvent = pointerEvent;
		interactionEvent.reset();
		return interactionEvent;
	};

	public addEvents():void
	{
		if (!this.interactionDOMElement)
		{
			return;
		}
		Ticker.system.add(this.update, this, Ticker.UPDATE_PRIORITY.INTERACTION);
		if (window.navigator.msPointerEnabled)
		{
			this.interactionDOMElement.style['-ms-content-zooming'] = 'none';
			this.interactionDOMElement.style['-ms-touch-action'] = 'none';
		}
		else if (this.supportsPointerEvents)
		{
			this.interactionDOMElement.style['touch-action'] = 'none';
		}
		if (this.supportsPointerEvents)
		{
			window.document.addEventListener('pointermove', this.onPointerMove);
			this.interactionDOMElement.addEventListener('pointerdown', this.onPointerDown);
			this.interactionDOMElement.addEventListener('pointerleave', this.onPointerOut);
			this.interactionDOMElement.addEventListener('pointerover', this.onPointerOver);
			window.addEventListener('pointercancel', this.onPointerCancel);
			window.addEventListener('pointerup', this.onPointerUp);
		}
		else
		{
			window.document.addEventListener('mousemove', this.onPointerMove);
			this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown);
			this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut);
			this.interactionDOMElement.addEventListener('mouseover', this.onPointerOver);
			window.addEventListener('mouseup', this.onPointerUp);
		}
		if (this.supportsTouchEvents)
		{
			this.interactionDOMElement.addEventListener('touchstart', this.onPointerDown);
			this.interactionDOMElement.addEventListener('touchcancel', this.onPointerCancel);
			this.interactionDOMElement.addEventListener('touchend', this.onPointerUp);
			this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove);
		}
		this.eventsAdded = true;
	};

	protected onPointerUp = (event:PointerEvent)=>
	{
		if (this.supportsTouchEvents && event.pointerType === 'touch') { return; }
		this.onPointerComplete(event, false, this.processPointerUp);
	};
		
	protected onPointerCancel = (event:PointerEvent)=>
	{
		if (this.supportsTouchEvents && event.pointerType === 'touch') { return; }
		this.onPointerComplete(event, true, this.processPointerCancel);
	};
	
	protected onPointerOver = (originalEvent:PointerEvent)=>
	{
		let events:NativeEvent[] = this.normalizeToPointerData(originalEvent);
		let event:NativeEvent = <NativeEvent>events[0];
		let interactionData:InteractionData = this.getInteractionDataForPointerId(event);
		let interactionEvent:InteractionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
		interactionEvent.data.originalEvent = event;
		if (event.pointerType === 'mouse')
		{
			this.mouseOverRenderer = true;
		}
		let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_OVER);
		pointer.data = interactionData;
		this.dispatchEvent(pointer)
		if (event.pointerType === 'mouse' || event.pointerType === 'pen')
		{
			let pointer:MouseEvent = new MouseEvent(MouseEvent.MOUSE_OVER);
			pointer.data = interactionData;
			this.dispatchEvent(pointer)
			this.dispatchEvent(pointer)
		}
	};

	protected onPointerOut = (originalEvent:PointerEvent)=>
	{
		if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') { return; }
		let events:NativeEvent[] = this.normalizeToPointerData(originalEvent);
		let event:NativeEvent = <NativeEvent>events[0];
		if (event.pointerType === 'mouse')
		{
			this.mouseOverRenderer = false;
			this.setCursorMode(null);
		}
		let interactionData:InteractionData = this.getInteractionDataForPointerId(event);
		let interactionEvent:InteractionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
		interactionEvent.data.originalEvent = event;
		this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerOverOut, false);
		let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_OUT);
		pointer.data = interactionData;
		this.dispatchEvent(pointer)
		if (event.pointerType === 'mouse' || event.pointerType === 'pen')
		{
			let pointer:MouseEvent = new MouseEvent(MouseEvent.MOUSE_OUT);
			pointer.data = interactionData;
			this.dispatchEvent(pointer)
		}
		else
		{
			this.releaseInteractionDataForPointerId(interactionData.identifier);
		}
	};
	
	protected onPointerDown = (originalEvent:PointerEvent)=>
	{
		if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') 
		{ 			
			return; 
		}
		let events:NativeEvent[] = this.normalizeToPointerData(originalEvent);
		let event:NativeEvent = <NativeEvent>events[0];
		if (this.autoPreventDefault && event.isNormalized)
		{			
			let cancelable:boolean = originalEvent.cancelable || !('cancelable' in originalEvent);
			if (cancelable)
			{
				originalEvent.preventDefault();
			}
		}
		let eventLen:number = events.length;
		for (let i:number = 0; i < eventLen; i++)
		{
			let event:NativeEvent = <NativeEvent>events[i];			
			let interactionData:InteractionData = this.getInteractionDataForPointerId(event);
			let interactionEvent:InteractionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
			interactionEvent.data.originalEvent = <NativeEvent>originalEvent;
			let result:boolean = this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerDown, true);
			let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_DOWN);
			pointer.data = interactionData;
			this.dispatchEvent(pointer)
			if (event.pointerType === 'touch')
			{
				let pointer:MouseEvent = new MouseEvent(MouseEvent.TOUCH_START);
				pointer.data = interactionData;
				this.dispatchEvent(pointer)
			}
			else if (event.pointerType === 'mouse' || event.pointerType === 'pen')
			{				
				let isRightButton:boolean = event.button === 2;
				let pointer:MouseEvent = new MouseEvent(isRightButton ? MouseEvent.RIGHT_MOUSE_DOWN : MouseEvent.MOUSE_DOWN);
				pointer.data = interactionData;				
				this.dispatchEvent(pointer)
			}
		}
	};

	protected onPointerMove = (originalEvent:PointerEvent)=>
	{
		if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') { return; }
		let events:NativeEvent[] = this.normalizeToPointerData(originalEvent);
		if (events[0].pointerType === 'mouse' || events[0].pointerType === 'pen')
		{
			this.didMove = true;
			this.cursor = null;
		}
		let eventLen:number = events.length;
		for (var i:number = 0; i < eventLen; i++)
		{
			let event:NativeEvent = <NativeEvent>events[i];
			let interactionData:InteractionData = this.getInteractionDataForPointerId(event);
			let interactionEvent:InteractionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
			interactionEvent.data.originalEvent = <NativeEvent>originalEvent;
			let interactive:boolean = event.pointerType === 'touch' ? this.moveWhenInside : true;
			this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processPointerMove, interactive);

			let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_MOVE);
			pointer.data = interactionData;
			this.dispatchEvent(pointer)
			if (event.pointerType === 'touch') 
			{ 
				let pointer:MouseEvent = new MouseEvent(MouseEvent.TOUCH_MOVE);
				pointer.data = interactionData;
				this.dispatchEvent(pointer)
			}
			if (event.pointerType === 'mouse' || event.pointerType === 'pen') 
			{ 
				let pointer:MouseEvent = new MouseEvent(MouseEvent.MOUSE_MOVE);
				pointer.data = interactionData;
				this.dispatchEvent(pointer)
			}
		}
		if (events[0].pointerType === 'mouse')
		{
			this.setCursorMode(this.cursor);
		}
	};

	public processInteractive(interactionEvent:InteractionEvent, displayObject:DisplayObject, func:Function, hitTest:boolean, interactive:boolean = true):boolean
	{
		if (!displayObject || !displayObject.visible)
		{
			return false;
		}
		let point:Point = interactionEvent.data.global;
		interactive = displayObject.interactive || interactive;
		let hit:boolean = false;
		let interactiveParent:boolean = interactive;
		let hitTestChildren:boolean = true;
		if (displayObject.hitArea)
		{
			if (hitTest)
			{
				displayObject.worldTransform.applyInverse(point, this._tempPoint);
				if (!displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y))
				{
					hitTest = false;
					hitTestChildren = false;
				}
				else
				{
					hit = true;
				}
			}
			interactiveParent = false;
		}
		else if (displayObject._mask)
		{
			if (hitTest)
			{
				if (!(displayObject._mask.containsPoint && displayObject._mask.containsPoint(point)))
				{
					hitTest = false;
					hitTestChildren = false;
				}
			}
		}
		if(displayObject instanceof Container)
		{
			if (hitTestChildren && displayObject.interactiveChildren && displayObject.children)
			{
				let children:DisplayObject[] = displayObject.children;
				for (let i:number = children.length - 1; i >= 0; i--)
				{
					let child:DisplayObject = children[i];
					let childHit:boolean = this.processInteractive(interactionEvent, child, func, hitTest, interactiveParent);
					if (childHit)
					{
						if (!child.parent)
						{
							continue;
						}
						interactiveParent = false;
						if (childHit)
						{
							if (interactionEvent.target)
							{
								hitTest = false;
							}
							hit = true;
						}
					}
				}
			}
		}		
		if (interactive)
		{
			if (hitTest && !interactionEvent.target)
			{
				if (!displayObject.hitArea && displayObject.containsPoint)
				{
					if (displayObject.containsPoint(point))
					{
						hit = true;
					}
				}
			}
			if (displayObject.interactive)
			{
				if (hit && !interactionEvent.target)
				{
					interactionEvent.target = displayObject;
				}
				if (func)
				{
					func(interactionEvent, displayObject, !!hit);
				}
			}
		}
		return hit;
	};

	public setCursorMode(mode:string = "default"):void
	{
		if (this.currentCursorMode === mode)
		{
			return;
		}
		this.currentCursorMode = mode;
		let style:any = this.cursorStyles[mode];
		if (style)
		{
			switch (typeof style)
			{
				case 'string':
					this.interactionDOMElement.style.cursor = style;
					break;
				case 'function':
					style(mode);
					break;
				case 'object':
					Object.assign(this.interactionDOMElement.style, style);
					break;
			}
		}
		else if (typeof mode === 'string' && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode))
		{
			this.interactionDOMElement.style.cursor = mode;
		}
	};

	public hitTest(globalPoint:Point, root:Container):DisplayObject
	{
		this.hitTestEvent.target = null;
		this.hitTestEvent.data.global = globalPoint;
		let currentdisplay:DisplayObject;
		if(root)
		{
			currentdisplay = <DisplayObject>root;
		}
		else
		{
			currentdisplay = this.renderer._lastObjectRendered;
		}
		this.processInteractive(this.hitTestEvent, currentdisplay, null, true);
		return this.hitTestEvent.target;
	};
	
	public normalizeToPointerData(event:TouchEvent|PointerEvent):NativeEvent[]
	{
		let normalizedEvents:NativeEvent[] = [];
		if (this.supportsTouchEvents && event instanceof TouchEvent)
		{
			for (let i:number = 0, li = event.changedTouches.length; i < li; i++)
			{
				let touch:NativeEvent = <NativeEvent>event.changedTouches[i];
				if (typeof touch.button === 'undefined') { touch.button = event.touches.length ? 1 : 0; }
				if (typeof touch.buttons === 'undefined') { touch.buttons = event.touches.length ? 1 : 0; }
				if (typeof touch.isPrimary === 'undefined')
				{
					touch.isPrimary = event.touches.length === 1 && event.type === 'touchstart';
				}
				if (typeof touch.width === 'undefined') { touch.width = touch.radiusX || 1; }
				if (typeof touch.height === 'undefined') { touch.height = touch.radiusY || 1; }
				if (typeof touch.tiltX === 'undefined') { touch.tiltX = 0; }
				if (typeof touch.tiltY === 'undefined') { touch.tiltY = 0; }
				if (typeof touch.pointerType === 'undefined') { touch.pointerType = 'touch'; }
				if (typeof touch.pointerId === 'undefined') { touch.pointerId = touch.identifier || 0; }
				if (typeof touch.pressure === 'undefined') { touch.pressure = touch.force || 0.5; }
				if (typeof touch.twist === 'undefined') { touch.twist = 0; }
				if (typeof touch.tangentialPressure === 'undefined') { touch.tangentialPressure = 0; }
				if (typeof touch.layerX === 'undefined') { touch.layerX = touch.offsetX = touch.clientX; }
				if (typeof touch.layerY === 'undefined') { touch.layerY = touch.offsetY = touch.clientY; }
				touch.isNormalized = true;
				normalizedEvents.push(touch);
			}
		}
		else if (event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof window['PointerEvent'])))
		{
			let originevent:any = event
			if (typeof originevent.isPrimary === 'undefined') { originevent.isPrimary = true; }
			if (typeof originevent.width === 'undefined') { originevent.width = 1; }
			if (typeof originevent.height === 'undefined') { originevent.height = 1; }
			if (typeof originevent.tiltX === 'undefined') { originevent.tiltX = 0; }
			if (typeof originevent.tiltY === 'undefined') { originevent.tiltY = 0; }
			if (typeof originevent.pointerType === 'undefined') { originevent.pointerType = 'mouse'; }
			if (typeof originevent.pointerId === 'undefined') { originevent.pointerId = InteractionManager.MOUSE_POINTER_ID; }
			if (typeof originevent.pressure === 'undefined') { originevent.pressure = 0.5; }
			if (typeof originevent.twist === 'undefined') { originevent.twist = 0; }
			if (typeof originevent.tangentialPressure === 'undefined') { originevent.tangentialPressure = 0; }
			originevent.isNormalized = true;
			normalizedEvents.push(<NativeEvent>event);
		}
		else
		{
			normalizedEvents.push(<PointerEvent>event);
		}
		return normalizedEvents;
	};

	public getInteractionDataForPointerId(event:NativeEvent):InteractionData
	{
		let pointerId:number = event.pointerId;
		let interactionData:InteractionData;
		if (pointerId === InteractionManager.MOUSE_POINTER_ID || event.pointerType === 'mouse')
		{
			interactionData = this.mouse;
		}
		else if (this.activeInteractionData[pointerId])
		{
			interactionData = this.activeInteractionData[pointerId];
		}
		else
		{
			interactionData = this.interactionDataPool.pop() || new InteractionData();
			interactionData.identifier = pointerId;
			this.activeInteractionData[pointerId] = interactionData;
		}
		interactionData.copyEvent(<NativeEvent>event);
		return interactionData;
	};

	public processPointerDown = (interactionEvent:InteractionEvent, displayObject:Container|Sprite|TilingSprite, hit:boolean)=>
	{
		let data:InteractionData = interactionEvent.data;
		let id:number = interactionEvent.data.identifier;
		if (hit)
		{
			if (!displayObject.trackedPointers[id])
			{
				displayObject.trackedPointers[id] = new InteractionTrackingData(id);
			}
			let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_DOWN);
			pointer.data = data;
			displayObject.dispatchEvent(pointer)
			if (data.pointerType === 'touch')
			{
				let pointer:MouseEvent = new MouseEvent(MouseEvent.TOUCH_START);
				pointer.data = data;
				displayObject.dispatchEvent(pointer)
			}
			else if (data.pointerType === 'mouse' || data.pointerType === 'pen')
			{
				let isRightButton:boolean = data.button === 2;
				if (isRightButton)
				{
					displayObject.trackedPointers[id].rightDown = true;
				}
				else
				{
					displayObject.trackedPointers[id].leftDown = true;
				}
				let pointer:MouseEvent = new MouseEvent(isRightButton ? MouseEvent.RIGHT_MOUSE_DOWN : MouseEvent.MOUSE_DOWN);
				pointer.data = data;
				displayObject.dispatchEvent(pointer)
			}
		}
	};

	public onPointerComplete(originalEvent:PointerEvent, cancelled:boolean, func:Function):void
	{
		let events:NativeEvent[] = this.normalizeToPointerData(originalEvent);
		let eventLen:number = events.length;
		let eventAppend:string = originalEvent.target !== this.interactionDOMElement ? 'outside' : '';
		for (let i:number = 0; i < eventLen; i++)
		{
			let event:NativeEvent = <NativeEvent>events[i];
			let interactionData:InteractionData = this.getInteractionDataForPointerId(event);
			let interactionEvent:InteractionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
			interactionEvent.data.originalEvent = <NativeEvent>originalEvent;
			this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, func, cancelled || !eventAppend);
			let pointer:MouseEvent = new MouseEvent(cancelled ? MouseEvent.POINTER_CANCEL : (MouseEvent.POINTER_UP));
			pointer.data = interactionData;
			this.dispatchEvent(pointer)
			if (event.pointerType === 'mouse' || event.pointerType === 'pen')
			{
				let isRightButton:boolean = event.button === 2;
				let pointer:MouseEvent = new MouseEvent(isRightButton ? (MouseEvent.RIGHT_MOUSE_UP) : (MouseEvent.MOUSE_UP));
				pointer.data = interactionData;
				this.dispatchEvent(pointer)
			}
			else if (event.pointerType === 'touch')
			{
				let pointer:MouseEvent = new MouseEvent(cancelled ? MouseEvent.TOUCH_CANCEL : (MouseEvent.TOUCH_END));
				pointer.data = interactionData;
				this.dispatchEvent(pointer)
				this.releaseInteractionDataForPointerId(event.pointerId);
			}
		}
	};

	public releaseInteractionDataForPointerId(pointerId:number):void
	{
		let interactionData:InteractionData = this.activeInteractionData[pointerId];
		if (interactionData)
		{
			delete this.activeInteractionData[pointerId];
			interactionData.reset();
			this.interactionDataPool.push(interactionData);
		}
	};

	public processPointerCancel(interactionEvent:InteractionEvent, displayObject:Container|Sprite|TilingSprite):void
	{
		let data:InteractionData = interactionEvent.data;
		let id:number = interactionEvent.data.identifier;
		if (displayObject.trackedPointers[id] !== undefined)
		{
			delete displayObject.trackedPointers[id];
			let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_CANCEL);
			pointer.data = data;
			displayObject.dispatchEvent(pointer)
			if (data.pointerType === 'touch')
			{
				let pointer:MouseEvent = new MouseEvent(MouseEvent.TOUCH_CANCEL);
				pointer.data = data;
				displayObject.dispatchEvent(pointer)
			}
		}
	};

	public processPointerUp = (interactionEvent:InteractionEvent, displayObject:Container|Sprite|TilingSprite, hit:boolean)=>
	{
		let data:InteractionData = interactionEvent.data;
		let id:number = interactionEvent.data.identifier;
		let trackingData:InteractionTrackingData = displayObject.trackedPointers[id];
		let isTouch:boolean = data.pointerType === 'touch';
		let isMouse:boolean = (data.pointerType === 'mouse' || data.pointerType === 'pen');
		let isMouseTap:boolean = false;
		if (isMouse)
		{
			let isRightButton:boolean = data.button === 2;
			let flags:NumberDic = InteractionTrackingData.FLAGS;
			let test:number = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;
			let isDown:number = trackingData !== undefined && (trackingData.flags & test);
			if (hit)
			{
				let pointer:MouseEvent = new MouseEvent(isRightButton ? MouseEvent.RIGHT_MOUSE_UP : MouseEvent.MOUSE_UP);
				pointer.data = data;
				displayObject.dispatchEvent(pointer)
				if (isDown)
				{
					let pointer:MouseEvent = new MouseEvent(isRightButton ? MouseEvent.RIGHT_CLICK : MouseEvent.CLICK);
					pointer.data = data;
					displayObject.dispatchEvent(pointer);
					isMouseTap = true;
				}
			}
			else if (isDown)
			{
				let pointer:MouseEvent = new MouseEvent(isRightButton ? MouseEvent.RIGHT_MOUSE_UP_OUTSIDE : MouseEvent.MOUSE_UP_OUTSIDE);
				pointer.data = data;
				displayObject.dispatchEvent(pointer);
			}
			if (trackingData)
			{
				if (isRightButton)
				{
					trackingData.rightDown = false;
				}
				else
				{
					trackingData.leftDown = false;
				}
			}
		}
		if (hit)
		{
			let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_UP);
			pointer.data = data;
			displayObject.dispatchEvent(pointer)
			if (isTouch) 
			{
				let pointer:MouseEvent = new MouseEvent(MouseEvent.TOUCH_END);
				pointer.data = data;
				displayObject.dispatchEvent(pointer)
			}
			if (trackingData)
			{
				if (!isMouse || isMouseTap)
				{
					let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_TAP);
					pointer.data = data;
					displayObject.dispatchEvent(pointer)
				}
				if (isTouch)
				{
					let pointer:MouseEvent = new MouseEvent(MouseEvent.TOUCH_TAP);
					pointer.data = data;
					displayObject.dispatchEvent(pointer)
					trackingData.over = false;
				}
			}
		}
		else if (trackingData)
		{
			let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_UP_OUTSIDE);
			pointer.data = data;
			displayObject.dispatchEvent(pointer)
			if (isTouch) 
			{ 
				let pointer:MouseEvent = new MouseEvent(MouseEvent.TOUCH_END_OUTSIDE);
				pointer.data = data;
				displayObject.dispatchEvent(pointer)
			}
		}
		if (trackingData && trackingData.none)
		{
			delete displayObject.trackedPointers[id];
		}
	};

	public processPointerMove = (interactionEvent:InteractionEvent, displayObject:Container|Sprite|TilingSprite, hit:boolean)=>
	{
		let data:InteractionData = interactionEvent.data;
		let isTouch:boolean = data.pointerType === 'touch';
		let isMouse:boolean = (data.pointerType === 'mouse' || data.pointerType === 'pen');
		if (isMouse)
		{
			this.processPointerOverOut(interactionEvent, displayObject, hit);
		}
		if (!this.moveWhenInside || hit)
		{
			let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_MOVE);
			pointer.data = data;
			displayObject.dispatchEvent(pointer)
			if (isTouch) 
			{ 
				let pointer:MouseEvent = new MouseEvent(MouseEvent.TOUCH_MOVE);
				pointer.data = data;
				displayObject.dispatchEvent(pointer)
			}
			if (isMouse) 
			{ 
				let pointer:MouseEvent = new MouseEvent(MouseEvent.MOUSE_MOVE);
				pointer.data = data;
				displayObject.dispatchEvent(pointer)			 
			}
		}
	};

	public processPointerOverOut = (interactionEvent:InteractionEvent, displayObject:Container|Sprite|TilingSprite, hit:boolean)=>
	{
		let data:InteractionData = interactionEvent.data;
		let id:number = interactionEvent.data.identifier;
		let isMouse:boolean = (data.pointerType === 'mouse' || data.pointerType === 'pen');
		let trackingData:InteractionTrackingData = displayObject.trackedPointers[id];
		if (hit && !trackingData)
		{
			trackingData = displayObject.trackedPointers[id] = new InteractionTrackingData(id);
		}
		if (trackingData === undefined) { return; }
		if (hit && this.mouseOverRenderer)
		{
			if (!trackingData.over)
			{
				trackingData.over = true;
				let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_OVER);
				pointer.data = data;
				displayObject.dispatchEvent(pointer)
				if (isMouse)
				{
					let pointer:MouseEvent = new MouseEvent(MouseEvent.MOUSE_OVER);
					pointer.data = data;
					displayObject.dispatchEvent(pointer)
				}
			}
			if (isMouse && this.cursor === null)
			{
				this.cursor = displayObject.cursor;
			}
		}
		else if (trackingData.over)
		{
			trackingData.over = false;
			let pointer:MouseEvent = new MouseEvent(MouseEvent.POINTER_OUT);
			pointer.data = data;
			displayObject.dispatchEvent(pointer)
			if (isMouse)
			{
				let pointer:MouseEvent = new MouseEvent(MouseEvent.MOUSE_OUT);
				pointer.data = data;
				displayObject.dispatchEvent(pointer)
			}
			if (trackingData.none)
			{
				delete displayObject.trackedPointers[id];
			}
		}
	};

	public destroy(options:DestroyOptions = null):void
	{
		this.removeEvents();
		this.renderer = null;
		this.mouse = null;
		this.eventData = null;
		this.interactionDOMElement = null;
		this.onPointerDown = null;
		this.processPointerDown = null;
		this.onPointerUp = null;
		this.processPointerUp = null;
		this.onPointerCancel = null;
		this.processPointerCancel = null;
		this.onPointerMove = null;
		this.processPointerMove = null;
		this.onPointerOut = null;
		this.processPointerOverOut = null;
		this.onPointerOver = null;
		this._tempPoint = null;
	};
}


interface InteractionDataDic
{
	[name:string]:InteractionData;
}