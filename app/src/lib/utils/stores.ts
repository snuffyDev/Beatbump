import { iter, splice } from "./collections";

export class ReadableStore<T> {
	protected _value: T;
	protected observers: ((value: T, oldValue?: T) => void)[];

	constructor(value: T) {
		this._value = value;
		this.observers = [];
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

	public update(updater: (value: T) => T): void {
		this.value = updater(this.value);
	}

	protected onValueChanged(oldValue?: T): void {
		this.notifyObservers(oldValue);
	}
}
