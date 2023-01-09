export function throttle<T extends any, A extends T[] = T[]>(callback: (...args: A) => void, interval: number) {
	let enableCall = true;

	return function (...args) {
		if (!enableCall) return;

		enableCall = false;
		callback.apply(this, args);
		setTimeout(() => (enableCall = true), interval);
	};
}
