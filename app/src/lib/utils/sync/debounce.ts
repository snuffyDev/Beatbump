export function debounce<T>(cb: (...args: T[]) => void, timeout = 500) {
	let timer;
	return (...args: T[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			cb.apply(this, args);
		}, timeout);
	};
}
