

export interface NativeEvent
{
    pointerId?:number;
    pointerType?:string;
    button?:number;
    clientY:number;
    offsetY?:number;
    layerY?:number;
    isNormalized?:boolean;
    clientX:number;
    offsetX?:number;
    layerX?:number;
    tangentialPressure?:number;
    twist?:number;
    force?:number;
    pressure?:number;
    identifier?:number;
    tiltY?:number;
    tiltX?:number;
    radiusY?:number;
    height?:number;
    radiusX?:number;
    width?:number;
    isPrimary?:boolean;
    buttons?:number;
    altKey?:boolean;
    ctrlKey?:boolean;
    fromElement?:Element;
    metaKey?:boolean;
    movementX?:number;
    movementY?:number;
    pageX?:number;
    pageY?:number;
    screenX?:number;
    relatedTarget?:EventTarget;
    screenY?:number;
    shiftKey?:boolean;
    toElement?:Element;
    which?:number;
    x?:number;
    y?:number;
    detail?:number;
    view?:Window;
    bubbles?:boolean;
    cancelBubble?:boolean;
    cancelable?:boolean;
    composed?:boolean;
    currentTarget?:EventTarget;
    defaultPrevented?:boolean;
    eventPhase?:number;
    isTrusted?:boolean;
    returnValue?:boolean;
    rotationAngle?:number;
    globalX?:number;
    globalY?:number;

    getModifierState?(key:string);
    initMouseEvent?(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, viewArg: Window, detailArg: number, screenXArg: number, screenYArg: number, clientXArg: number, clientYArg: number, ctrlKeyArg: boolean, altKeyArg: boolean, shiftKeyArg: boolean, metaKeyArg: boolean, buttonArg: number, relatedTargetArg: EventTarget | null): void;
    initUIEvent?(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, viewArg: Window, detailArg: number): void;
}

// new PointerEvent().relatedTarget
// new MouseEvent().returnValue