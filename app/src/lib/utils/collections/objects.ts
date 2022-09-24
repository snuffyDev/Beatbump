/* eslint-disable @typescript-eslint/ban-types */

import { map, reduce } from "./array";

type IObject<T> = {
	[Property in keyof T]: T[Property];
};

type IsObject<T> = T extends object ? (T extends any[] ? false : true) : false;

type IMergedObject<T, U> = IsObject<T> & IsObject<U> extends true
	? {
			[K in keyof T]: K extends keyof U ? IMergedObject<T[K], U[K]> : T[K];
	  } & U
	: U;

type VoidCallback<T extends IObject<T>, K extends keyof T> = (item: [string, T[K]], index: number, object: T) => void;

/**
 * Runs a function for each property of an object.
 * @param object source object to iterate over
 * @param cb callback that runs on each property
 */
export function iterObj<T extends IObject<T>, K extends keyof T>(object: T, cb: VoidCallback<T, K>): void {
	if (object instanceof Object === false) throw new Error("Provided parameter `object` is not a valid object.");
	const keys: Array<string> = Object.keys(object);
	const length = keys.length;

	let idx = -1;
	for (; ++idx < length; ) {
		cb.apply(this, [[keys[idx], object[keys[idx]]] as [string, T[K]], idx, object]);
	}
}
/**
 * Performs a shallow copy of `source` object into `target` object.
 * This function will overwrite any
 * @param target target object to copy to
 * @param source source object to copy from
 * @returns {object} merged object
 */
export function mergeObjects<Target, Source>(target: Target, source: Source): IMergedObject<Target, Source> {
	const keys: Array<string> = Object.keys(source);
	const length = keys.length;
	let idx = -1;
	for (; ++idx < length; ) {
		const key = keys[idx];
		target[key] = source[key];
		if (target[key] === undefined) delete target[key];
	}
	return target as IMergedObject<Target, Source>;
}

export function mergeObjectsRec<Target, Source>(target: Target, source: Source): IMergedObject<Target, Source> {
	const iter = (a, b) => {
		const keys: Array<string> = Object.keys(b);
		const length = keys.length;
		let idx = -1;
		for (; ++idx < length; ) {
			const key = keys[idx];
			if (b[key] instanceof Array && (a[key] as []) instanceof Array) {
				// eslint-disable-next-line prefer-spread
				a[key].push.apply(a[key], b[key]);
			} else if (b[key] instanceof Object && Object.prototype.hasOwnProperty.call(a, key)) {
				a[key] = iter(b[key], a[key]);
			} else {
				a[key] = b[key];
				if (!a[key]) delete a[key];
			}
		}
		return a;
	};
	return iter(target, source);
}

export function sortObj<T extends IObject<T>>(object: T) {
	return Object.keys(object)
		.sort()
		.reduce((acc, key) => {
			if (Array.isArray(object[key])) {
				acc[key] = map(object[key], sortObj);
			} else if (typeof object[key] === "object") {
				acc[key] = sortObj(object[key]);
			} else {
				acc[key] = object[key];
			}
			return acc;
		}, {} as IObject<T>);
}
