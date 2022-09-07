import { loop } from "$lib/utils";

export function longtouch(node: HTMLElement) {
	let prevTime = 0;
	let cb = loop((now) => {
		prevTime - now;
	});
	async function handleTouchStart(event: TouchEvent) {

		node.addEventListener('touchcancel', handleTouchEnd, { capture: true });
		node.addEventListener('touchend', handleTouchEnd, { capture: true });
	}
	async function handleTouchEnd(event: TouchEvent) {

		node.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
		node.removeEventListener('touchend', handleTouchEnd, { capture: true });
	}
	node.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
	return {
		destroy: () => {
			console.log("Change me!");
		}
	};
}
