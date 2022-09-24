import type { Detail } from "./types";

export function boundingRect(node: HTMLElement): {
	top: number;
	height: number;
	left: number;
	width: number;
	parent_top: number;
} {
	const nodeRect = node.getBoundingClientRect();
	const parentRectTop = node.parentElement.offsetTop;
	return {
		top: nodeRect.top,
		height: nodeRect.height,
		left: nodeRect.left,
		width: nodeRect.width,
		parent_top: parentRectTop,
	};
}
export function updateDetail(event: PointerEvent, detail: Detail) {
	// detail.deltaY = detail.clientY - event.pageY;
	detail.clientY = event.clientY;
}
export function calculateVelocity(event: PointerEvent, detail: Detail) {
	const lastY = detail.clientY;
	const lastTime = detail.timeStamp;
	updateDetail(event, detail);

	const currentY = detail.clientY;
	const timeStamp = (detail.timeStamp = event.timeStamp);

	const timeDelta = timeStamp - lastTime;

	if (timeDelta > 0 && timeDelta < 100) {
		const distance = (currentY - lastY) / timeDelta;
		detail.velocityY = distance * 0.7 + detail.velocityY * 0.3;
	}
	// detail.deltaY = (currentY - detail.startY) - lastY;
}

export type EventHandler<T> = (event: T) => void;
export const dispatcher =
	<
		Events extends Record<string, any> = Record<string, any>,
		Event extends keyof Events & string = keyof Events & string,
	>() =>
	(node: HTMLElement, type: Event, detail: Events[Event]): boolean =>
		node.dispatchEvent(new CustomEvent(type, { detail: detail, bubbles: true }));

export function addListener<
	EventType extends keyof WindowEventMap = keyof WindowEventMap,
	Event extends WindowEventMap[EventType] = WindowEventMap[EventType],
>(
	target: Window,
	type: EventType,
	listener: (event: Event) => void,
	options?: AddEventListenerOptions | boolean | undefined,
);
export function addListener<
	EventType extends keyof HTMLElementEventMap = keyof HTMLElementEventMap,
	Event extends HTMLElementEventMap[EventType] = HTMLElementEventMap[EventType],
>(
	target: HTMLElement,
	type: EventType,
	listener: (event: Event) => void,
	options?: AddEventListenerOptions | boolean | undefined,
);
export function addListener<
	EventType extends keyof (WindowEventMap | HTMLElementEventMap) = keyof (WindowEventMap | HTMLElementEventMap),
	Event extends (WindowEventMap | HTMLElementEventMap)[EventType] = (WindowEventMap | HTMLElementEventMap)[EventType],
>(
	target: Window | HTMLElement,
	type: EventType,
	listener: (event: Event) => void,
	options?: AddEventListenerOptions | boolean | undefined,
) {
	target.addEventListener(type, listener, options);
}
export function removeListener<
	EventType extends keyof WindowEventMap = keyof WindowEventMap,
	Event extends WindowEventMap[EventType] = WindowEventMap[EventType],
>(target: Window, type: EventType, listener: (event: Event) => void, options?: AddEventListenerOptions | boolean);
export function removeListener<
	EventType extends keyof HTMLElementEventMap = keyof HTMLElementEventMap,
	Event extends HTMLElementEventMap[EventType] = HTMLElementEventMap[EventType],
>(target: HTMLElement, type: EventType, listener: (event: Event) => void, options?: AddEventListenerOptions | boolean);
export function removeListener<
	EventType extends keyof (WindowEventMap | HTMLElementEventMap) = keyof (WindowEventMap | HTMLElementEventMap),
	Event extends (WindowEventMap | HTMLElementEventMap)[EventType] = (WindowEventMap | HTMLElementEventMap)[EventType],
>(
	target: Window | HTMLElement,
	type: EventType,
	listener: (event: Event) => void,
	options?: AddEventListenerOptions | boolean,
) {
	target.removeEventListener(type, listener, options);
}
