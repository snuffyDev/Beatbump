export function isArray<T>(item: unknown): item is Array<T> {
	return Array.isArray(item);
}

export function isArrayAndReturn<T, V>(
	item: unknown,
	onSuccess: (item: Array<T>) => V,
): V | false {
	if (isArray<T>(item)) {
		return onSuccess(item);
	}
	return false;
}
