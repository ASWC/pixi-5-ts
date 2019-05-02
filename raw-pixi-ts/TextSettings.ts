

export class TextSettings
{
	static TEXT_GRADIENT = {
	    LINEAR_VERTICAL: 0,
	    LINEAR_HORIZONTAL: 1,
	};

	static defaultStyle = {
		align: 'left',
		breakWords: false,
		dropShadow: false,
		dropShadowAlpha: 1,
		dropShadowAngle: Math.PI / 6,
		dropShadowBlur: 0,
		dropShadowColor: 'black',
		dropShadowDistance: 5,
		fill: 'black',
		fillGradientType: TextSettings.TEXT_GRADIENT.LINEAR_VERTICAL,
		fillGradientStops: [],
		fontFamily: 'Arial',
		fontSize: 26,
		fontStyle: 'normal',
		fontVariant: 'normal',
		fontWeight: 'normal',
		letterSpacing: 0,
		lineHeight: 0,
		lineJoin: 'miter',
		miterLimit: 10,
		padding: 0,
		stroke: 'black',
		strokeThickness: 0,
		textBaseline: 'alphabetic',
		trim: false,
		whiteSpace: 'pre',
		wordWrap: false,
		wordWrapWidth: 100,
		leading: 0,
	};
}