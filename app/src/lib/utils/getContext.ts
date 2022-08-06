import { getContext, hasContext, setContext } from "svelte";
import type { Dict } from "../types/utilities";
import type { Maybe } from "./collections/array";

export interface IContext<T> {
	key: string | Dict<unknown>;

	get(): Maybe<T>;
	has(): boolean;
	set(value: Maybe<T>): void;
}

export function makeContext<T>(key: string | Dict<unknown>): IContext<T> {
	return {
		key,
		get() {
			return getContext(key);
		},
		has() {
			return hasContext(key);
		},

		set(value) {
			setContext(key, value);
		},
	};
}
