/* eslint-disable @typescript-eslint/ban-types */

import type { IObject, IMergedObject } from "$lib/types/utilities";
import { map } from "./array";

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

export function mergeDeep<Target extends Record<string, any>, Source extends Record<string, any>>(
	target: IObject<Target>,
	source: IObject<Source>,
): IMergedObject<Target, Source> {
	if ([typeof target, typeof source].some((t) => t !== "object"))
		throw new Error("Both provided parameters are not valid objects.");
	const obj: Record<string, unknown> = Object.assign({}, target);
	const keys: Array<string> = Object.keys(source);
	const length = keys.length;
	let idx = -1;
	for (; ++idx < length; ) {
		const key = keys[idx];
		if (Array.isArray(source[key]) && Array.isArray(target[key])) {
			obj[key] = [];
			(obj[key] as unknown[]).push(...(target[key] as any[]), ...(source[key] as any[]));
		} else if (typeof source[key] === "object" && typeof target[key] === "object" && key in source) {
			obj[key] = mergeDeep(source[key] as Record<string, unknown>, target[key] as Record<string, unknown>);
		} else {
			obj[key] = key in source ? source[key] : obj[key];
		}
	}
	return obj as IMergedObject<Target, Source>;
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
