type VoidCallback<T> = (item: T, index: number, array: Array<T>) => void;
type ItemCallback<T> = (item: T, index: number, array: Array<T>) => Partial<T>;

export function findFirst<T>(
	array: Array<T>,
	predicate: (item: T) => T
): T | undefined {
	const length = array.length;
	let idx = -1;
	for (; ++idx < length; ) {
		if (predicate(array[idx])) {
			return array[idx];
		}
	}
	return undefined;
}

export function findLast<T>(
	array: Array<T>,
	predicate: (item: T) => T
): T | undefined {
	let len = array.length;
	for (; len--; ) {
		if (predicate(array[len])) {
			return array[len];
		}
	}
	return undefined;
}

export function findAll<T>(array: Array<T>, predicate: (item: T) => T): T[] {
	let idx = -1;
	let curIdx = 0;
	const length = array.length;
	const result = [];

	for (; ++idx < length; ) {
		if (predicate(array[idx])) {
			result[curIdx++] = array[idx];
		}
	}
	return result;
}

export function iter<T>(array: Array<T>, cb: VoidCallback<T>): void {
	const len = array.length;
	let idx = -1;
	for (; ++idx < len; ) {
		cb(array[idx], idx, array);
	}
}

export function map<T>(array: Array<T>, cb: ItemCallback<T>): T[] {
	let idx = -1;
	const length = array.length;
	const newArray = Array(length);
	for (; ++idx < length; ) {
		newArray[idx] = cb(array[idx], idx, array);
	}
	return newArray;
}

export function filterMap<T>(
	array: Array<T>,
	cb: ItemCallback<T>,
	predicate: (item: T) => boolean
  ): T[] {
	let idx = -1;
	const length = array.length;
	const result: T[] = [];
	for (; ++idx < length; ) {
	  const res = cb(array[idx], idx, array);
	  const passes = predicate(res);
	  if (!passes) {
		continue;
	  }
	  result[idx] = res;
	}
	return result;
  }

export function rmUndef<T>(array: Array<T>): T[] {
	let idx = -1;
	let curIdx = 0;
	const length = array.length;
	const newArray = Array(length);
	for (; ++idx < length; ) {
		const item = array[idx];
		if (item) {
			newArray[curIdx++] = item;
		}
	}
	return newArray;
}
