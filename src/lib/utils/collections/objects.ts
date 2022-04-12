type VoidCallback<T extends Record<PropertyKey, unknown>, U extends keyof T> = (
	item: [string, T[U]],
	index: number,
	object: T
) => void;

// export function iter

export function iterObj<T, K extends keyof T>(
	object: T,
	cb: VoidCallback<T, K>
) {
	const keys: Array<string> = Object.keys(object);
	const length = keys.length;

	let idx = -1;
	for (; ++idx < length; ) {
		const item: [string, T[K]] = [keys[idx], object[keys[idx]]];
		cb(item, idx, object);
	}
}
