import { loop, type Task } from "$lib/utils";
import { circOut } from "svelte/easing";
import { dispatcher } from "./gestures/utils";
export interface ILongPressConfig {
	delay?: number;
	duration?: number;
}

export interface Detail {
	progress?: number;
	data?: number;
	timestamp: number;
}

export function mobileLongPress(node: HTMLElement, config: ILongPressConfig = { duration: 400, delay: 200 }) {
	const dispatch = dispatcher<{ pressEnd: Detail; pressing: Detail; pressStart: Detail }>();
	let curTime = 0;
	let running;
	let task: Task;
	async function handlePointerStart(event: PointerEvent) {
		event.preventDefault();
		const startTime = performance.now() + config?.delay;
		const endTime = startTime + config?.duration;
		console.log(startTime, endTime, task);
		if (task) task.abort();
		curTime = 0;
		running = true;

		task = loop((now) => {
			if (running) {
				if (now >= endTime) {
					console.log(now, endTime);
					cancel();
					return (running = false);
				}
				if (now >= startTime) {
					console.log(now, startTime);
					curTime = circOut((now - startTime) / config?.duration);
					dispatch(node, "pressing", { progress: curTime, timestamp: now });
				}
			}

			return running;
		});

		node.addEventListener("pointerup", handlePointerEnd);
		node.addEventListener("pointercancel", handlePointerEnd);
	}
	async function cancel() {
		if (task) task.abort();
		// dispatch(node, 'pressEnd', { progress: Math.ceil(curTime), timestamp: performance.now() });
	}
	async function handlePointerEnd(event: PointerEvent) {
		event.preventDefault();

		running = false;
		curTime = 0;

		dispatch(node, "pressEnd", { progress: Math.ceil(curTime), timestamp: performance.now() });
		node.removeEventListener("pointerup", handlePointerEnd);
		node.removeEventListener("pointercancel", handlePointerEnd);
	}
	node.addEventListener("pointerdown", handlePointerStart);
	return {
		destroy: () => {
			node.removeEventListener("pointerdown", handlePointerStart);
		},
	};
}
