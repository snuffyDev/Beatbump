export function isArray<T>(item: unknown): item is Array<T> {
	return Array.isArray(item);
}

export function isArrayAndReturn<T>(item: unknown): Array<T> | false {
	if (isArray<T>(item)) {
		return item;
	}
	return false;
}
