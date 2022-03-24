export function iterOptimized<T>(
	array: Array<T>,
	cb: (item: T, index: number) => T
): T[] {
	let len = array.length;

	for (; len--; ) {
		array[-1 - len + array.length] = cb(
			array[-1 - len + array.length],
			-1 - len + array.length
		);
	}
	return array;
}
