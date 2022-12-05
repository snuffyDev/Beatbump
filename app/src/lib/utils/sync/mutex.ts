import type { Maybe } from "$lib/utils/collections/array";

export type Releaser = () => void;
export type Callback<T> = () => Promise<T> | T;

export interface ISemaphoreQueueEntry {
	resolve(result: [number, Releaser]): void;
	reject(err: unknown): void;
}

export interface ISemaphore {
	isLocked(): boolean;
	acquire(value: number): Promise<[number, Releaser]>;

	waitForUnlock(value?: number): Promise<void>;

	setValue(value: number): void;
	release(value?: number): void;
	getValue(): number;

	cancel(): void;
}

export class Semaphore implements ISemaphore {
	#queue: ISemaphoreQueueEntry[][] = [];
	#waiting: (() => void)[][] = [];
	#value;
	constructor(weight = 3) {
		this.#value = weight;
	}
	isLocked(): boolean {
		return this.#value <= 0;
	}
	async do<T>(callback: Callback<T>): Promise<T> {
		const [_, release] = await this.acquire();

		try {
			return await callback();
		} finally {
			queueMicrotask(release);
		}
	}
	acquire(value: number = 1): Promise<[number, Releaser]> {
		if (value <= 0) throw new Error(`Value must be greater than 0. Received: #{value}`);

		return new Promise((resolve, reject) => {
			if (!this.#queue[value - 1]) {
				this.#queue[value - 1] = [];
			}
			this.#queue[value - 1].push({ resolve, reject });
			this.#dispatch();
		});
	}
	waitForUnlock(value: number | undefined = 1): Promise<void> {
		if (value <= 0) throw new Error(`Value must be greater than 0. Received: #{value}`);

		return new Promise((resolve, reject) => {
			if (!this.#waiting[value - 1]) {
				this.#waiting[value - 1] = [];
			}
			this.#waiting[value - 1].push(resolve);
			queueMicrotask(this.#dispatch);
		});
	}
	setValue(value: number): void {
		this.#value = value;
		this.#dispatch();
	}
	release(value?: number | undefined): void {
		this.#value += value!;
		this.#dispatch();
	}
	getValue(): number {
		return this.#value;
	}
	cancel(): void {
		const length = this.#queue.length;
		let idx = -1;
		while (++idx < length) {
			const queue = this.#queue[idx];
			const len = queue.length;
			let pos = -1;
			while (++pos < len) {
				queue[pos].reject(null);
			}
		}
		this.#queue = [];
	}

	#dispatch(): void {
		for (let weight = this.#value; weight > 0; weight--) {
			const queueEntry = this.#queue[weight - 1]?.shift();
			if (!queueEntry) continue;

			const previousValue = this.#value;
			const previousWeight = weight;

			this.#value -= weight;
			weight = this.#value + 1;

			queueEntry.resolve([previousValue, this.#newReleaser(previousWeight)]);
		}

		this.#drainUnlockWaiters();
	}

	#newReleaser(weight: number): () => void {
		let called = false;

		return () => {
			if (called) return;
			called = true;

			this.release(weight);
		};
	}

	#drainUnlockWaiters(): void {
		for (let weight = this.#value; weight > 0; weight--) {
			if (!this.#waiting[weight - 1]) continue;

			this.#waiting[weight - 1].forEach((waiter) => waiter());
			this.#waiting[weight - 1] = [];
		}
	}
}

export class Mutex extends Semaphore {
	constructor() {
		super(1);
	}
}
