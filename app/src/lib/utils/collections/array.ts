export type Maybe<T> = T | undefined;
export type VoidCallback<T> = (item: T, index: number, array: ArrayLike<T>) => void;
export type ItemCallback<T, U> = (item: T, index: number, array: ArrayLike<T>) => U;

export function findFirst<T>(array: Array<T>, predicate: (item: T) => T): T | undefined {
	const length = array.length;
	let idx = -1;
	for (; ++idx < length; ) {
		if (predicate(array[idx])) {
			return array[idx];
		}
	}
	return undefined;
}
export function reduce<T, K = unknown>(
	array: Array<T>,
	callback: (previousValue: K, currentValue: T, index: number, array: Array<T>) => K,
	thisArg: K,
): K {
	let result = thisArg,
		length = array.length,
		idx = -1;
	for (; ++idx < length; ) {
		result = callback(result as K, array[idx], idx, array);
	}
	(length = null), (idx = null);
	return result;
}
export function findLast<T>(array: Array<T>, predicate: (item: T) => T): T | undefined {
	let len = array.length;
	for (; len--; ) {
		if (predicate(array[len])) {
			return array[len];
		}
	}
	return undefined;
}

export function iter<T>(array: ArrayLike<T>, cb: VoidCallback<T>): void {
	for (let idx = 0; idx < array.length; idx++) {
		cb(array[idx], idx, array);
	}
}

export function map<T, U>(array: ArrayLike<T>, cb: ItemCallback<T, U>): U[] {
	const newArray: U[] = Array(array.length);
	for (let idx = 0; idx < array.length; idx++) {
		newArray[idx] = cb(array[idx], idx, array);
	}
	return newArray;
}

export function filterMap<T, U>(array: Array<T>, cb: ItemCallback<T, U>, predicate: (item: U) => item is U): U[];
export function filterMap<T, U>(array: Array<T>, cb: ItemCallback<T, U>, predicate: (item: U) => boolean): U[];
export function filterMap<T, U>(array: Array<T>, cb: ItemCallback<T, U>, predicate: (item: U) => unknown): U[] {
	const result: U[] = [];
	for (let idx = 0; idx < array.length; idx++) {
		const res = cb(array[idx], idx, array);
		if (predicate(res)) {
			result.push(res);
		}
	}
	return result as U[];
}
export function filter<T, S>(array: Array<T>, predicate: (item: Maybe<T>) => boolean): T[] {
	let idx = -1,
		curPos = 0;
	const result: T[] = [],
		length = array.length;
	for (; ++idx < length; ) {
		if (predicate(array[idx])) {
			result[curPos] = array[idx] as unknown as T;
			curPos++;
		}
	}
	return result as T[];
}

// export function splice<T>(array: Array<T>, spliceIndex: number, itemsToRemove: number, items: unknown): Maybe<T[]> {
export function splice<T>(
	array: Array<T>,
	spliceIndex: number,
	itemsToRemove: number,
	...items: unknown[]
): Maybe<T[]> {
	const deleted = array.slice(spliceIndex, spliceIndex + itemsToRemove);
	let inserted: Array<unknown> = [];
	if (!items) {
		inserted = [...array.slice(0, spliceIndex), ...array.slice(spliceIndex + itemsToRemove)];
	}
	inserted = [...array.slice(0, spliceIndex), ...items, ...array.slice(spliceIndex + itemsToRemove)];
	array.length = 0;
	// eslint-disable-next-line prefer-spread
	array.push.apply(array, inserted);
	return deleted;
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

export function every<T, S extends T>(array: Array<T>, predicate: (item: T) => boolean): boolean {
	let idx = -1;
	const length = array.length;
	for (; ++idx < length; ) {
		if (!!predicate(array[idx]) === false) {
			return false;
		}
	}
	return true;
}
