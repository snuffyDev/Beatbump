import type { GestureHandlers } from "./types";
import { addListener, removeListener } from "./utils";

export function setHandlers(
	node: HTMLElement,
	args: { handlers: GestureHandlers; capture?: boolean; onDestroy?: () => void | null },
) {
	const { capture, handlers, onDestroy = null } = args;
	addListener(node, "pointerdown", handlers.onStart, capture);
	return {
		destroy() {
			if (typeof onDestroy === "function") {
				onDestroy();
			}
			removeListener(node, "pointerdown", handlers.onStart, capture);
		},
	};
}
