import { derived, type Readable, type Unsubscriber } from "svelte/store";
import { iter, splice } from "./collections";
import { noop } from "./noop";

export class ReadableStore<T> {
	protected _value: T;
	protected observers: ((value: T, oldValue?: T) => void)[];

	constructor(value: T) {
		this._value = value;
		this.observers = [];
		this.subscribe = this.subscribe.bind(this);
		this.notifyObservers = this.notifyObservers.bind(this);
	}

	public get value(): T {
		return this._value;
	}

	public subscribe(observerFunc: (value: T, oldValue?: T) => void): () => void {
		this.observers.push(observerFunc);
		observerFunc(this.value);
		return () => {
			splice(this.observers, this.observers.indexOf(observerFunc), 1);
		};
	}

	protected notifyObservers(oldValue?: T): void {
		iter(this.observers, (observer) => {
			observer(this.value, oldValue);
		});
	}
}

export class WritableStore<T = unknown> extends ReadableStore<T> {
	constructor(value: T) {
		super(value);

		this.set = this.set.bind(this);
		this.update = this.update.bind(this);
		this.subscribe = this.subscribe.bind(this);
	}

	public get value(): T {
		return this._value;
	}

	// Setting the value works with reactive systems
	public set value(value: T) {
		if (this._value != value) {
			const oldValue = this._value;
			this._value = value;
			this.onValueChanged(oldValue);
		}
	}

	public set(value: T): void {
		this.value = value;
	}

	public async updateAsync(updater: (value: T) => Promise<T>): Promise<void> {
		this.value = await updater(this.value);
	}

	public update(updater: (value: T) => T): void {
		this.value = updater(this.value);
	}

	protected onValueChanged(oldValue?: T): void {
		this.notifyObservers(oldValue);
	}
}
type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;
/** One or more values from `Readable` stores. */
type StoresValues<T> = T extends Readable<infer U>
	? U
	: {
			[K in keyof T]: T[K] extends Readable<infer U> ? U : never;
	  };
const _derived = (<S extends Stores, T>(
	stores: S,
	fn: (values: StoresValues<S>, set: (value: T) => void) => Unsubscriber | void,
	init?: T,
) => {
	let state = init;
	const single = !Array.isArray(stores);
	const auto = fn.length < 2;

	let cleanup = noop;
	const { subscribe } = derived<S, T>(
		stores,
		(values, set) => {
			state = values;
			const result = fn(values, set);
			if (auto) {
				set(result as T);
			} else {
				cleanup = typeof result === "function" ? result : noop;
				return cleanup;
			}
		},
		init,
	);
	return {
		subscribe,
		get value() {
			return state;
		},
	};
}) satisfies typeof derived;

export { _derived as derived };
