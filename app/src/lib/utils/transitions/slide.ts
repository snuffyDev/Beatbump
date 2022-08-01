import { cubicOut } from "svelte/easing";

export type EasingFunction = (t: number) => number;

export interface TransitionConfig {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}
interface SlideParams {
	delay?: number;
	duration?: number;
	y?: number;
	easing?: EasingFunction;
}
export function slide(
	node: Element,
	{ delay = 0, duration = 400, y = 0, easing = cubicOut }: SlideParams = {},
): TransitionConfig {
	const style = getComputedStyle(node);
	const opacity = +style.opacity;
	const height = parseFloat(style.height);
	const padding_top = parseFloat(style.paddingTop);
	const padding_bottom = parseFloat(style.paddingBottom);
	const margin_top = parseFloat(style.marginTop);
	const margin_bottom = parseFloat(style.marginBottom);
	const border_top_width = parseFloat(style.borderTopWidth);
	const border_bottom_width = parseFloat(style.borderBottomWidth);

	return {
		delay,
		duration,
		easing,
		css: (t) =>
			"overflow: hidden;" +
			`opacity: ${Math.min(t * 20, 1) * opacity};` +
			`height: ${1 - y * t * height}px;` +
			`padding-top: ${(1 - y) * t * padding_top}px;` +
			`padding-bottom: ${(1 - y) * t * padding_bottom}px;` +
			`margin-top: ${(1 - y) * t * margin_top}px;` +
			`margin-bottom: ${(1 - y) * t * margin_bottom}px;` +
			`border-top-width: ${t * border_top_width}px;` +
			`border-bottom-width: ${t * border_bottom_width}px;`,
	};
}
