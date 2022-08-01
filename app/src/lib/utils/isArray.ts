export function isArray<T>(item: unknown) {
	if (Array.isArray(item)) {
		return item as unknown as T;
	}
	return false;
}
