import type { Maybe } from "$lib/utils/collections/array";

interface MutexEntry {
	resolve: (entry: [number, () => void]) => void;
	reject: (error: Error) => void;
}
export class Mutex {
	private _queue: MutexEntry[] = [];
	private _currentEntry: Maybe<() => void>;
	private _value = 1;
	constructor() {}
	get Locked() {
		return this._value <= 0;
	}
	private acquire(): Promise<[number, () => void]> {
		const locked = this.Locked;
		const entry = new Promise<[number, () => void]>((resolve, reject) => {
			this._queue.push({ resolve, reject });
		});
		if (!locked) this.dispatch();

		return entry;
	}
	private dispatch(): void {
		const entry = this._queue.shift();
		// console.log(entry);
		if (!entry) return;
		let released = false;
		this._currentEntry = () => {
			if (released) return;
			released = true;
			this._value++;
			this.dispatch();
		};
		entry.resolve([this._value--, this._currentEntry]);
	}
	public async do<T>(fn: ((value: number) => T) | ((value: number) => PromiseLike<T>)): Promise<T> {
		const [value, unlock] = await this.acquire();
		// console.log(unlock, this);
		try {
			return await fn(value);
		} finally {
			unlock();
		}
	}
}
