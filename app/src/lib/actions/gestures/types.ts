export type Axis = "x" | "y";
export type EventKind = "drag";
export interface Detail {
	velocityY?: number;
	clientY: number;
	startY: number;
	endY?: number;
	deltaY?: number;
	timeStamp: number;
	startTime: number;
}
export type GestureEventTarget = Window | HTMLElement;

export interface GestureHandlers {
	onStart(event: PointerEvent): void;
	onMove(event: PointerEvent): void;
	onEnd(event: PointerEvent): void;
}
export interface DragEvent {
	"bb-dragstart": Detail;
	"bb-dragmove": Detail;
	"bb-dragend": Detail;
}

export interface PanEvent {
	panstart: Detail;
	pan: Detail;
	panend: Detail;
}
