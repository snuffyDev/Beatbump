import type { GestureHandlers } from "./types";
import { addListener, removeListener } from "./utils";

export function setHandlers(node: HTMLElement, handlers: GestureHandlers, capture = true) {
	addListener(node, "pointerdown", handlers.onStart, capture);
	return {
		destroy() {
			removeListener(node, "pointerdown", handlers.onStart, capture);
		},
	};
}
