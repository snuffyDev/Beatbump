import type { JSON } from "$lib/types";

export type EventType = string;
export type EventCallback<T = unknown> = (payload?: T | T[]) => void;
export type EventListeners<
	Events extends Record<string, unknown>,
	Name extends keyof Events = keyof Events & string,
> = Map<Name, EventCallback<Events[Name]>[]>;

export interface IEventEmitter {
	dispatch<T>(type: EventType, ...args: T[]): void;
	off(type: EventType, cb: EventCallback): void;
	on(type: EventType, cb: EventCallback): void;
}

export class EventEmitter implements IEventEmitter {
	private __target: object;
	private _eventQueue = new WeakMap<object, EventListeners<any>>();

	constructor(target: object) {
		this.__target = target;
	}

	dispatch<Events extends Record<string, unknown> = any, Name extends keyof Events = keyof Events>(
		type: string,
		...args: any[]
	): void {
		const queue = this._eventQueue.get(this.__target);

		if (!queue) {
			return;
		}

		const listeners = queue.get(type);

		if (!listeners) return;

		const length = listeners.length;
		let idx = -1;

		for (; ++idx < length; ) {
			listeners[idx](args);
		}
	}

	public dispose(): void {
		this._eventQueue.delete({});
		this._eventQueue = null;
	}

	public off(type?: string, cb?: EventCallback): void {
		const listeners = this._eventQueue.get(this.__target);
		if (!listeners) return;
		if (type === undefined) {
			listeners.clear();
			// console.log(this._eventQueue, listeners);
			return;
		}
		if (cb === undefined) {
			listeners.delete(type);
			// console.log(this._eventQueue, listeners);
			return;
		}
	}

	public on<T extends any = any[] & any>(type: string, cb: EventCallback<T>): void {
		if (!this.__target) return;
		const queue = this._eventQueue.get(this.__target) ?? (new Map() as EventListeners<any>);

		const listeners = queue.get(type) ?? [];
		queue.set(type, listeners.concat(cb));
		// console.log(listeners instanceof Array, listeners);
		this._eventQueue.set(this.__target, queue);
	}

	public once<Events extends Record<string, unknown> = any, Type extends keyof Events = keyof Events>(
		name: Type,
		cb: EventCallback<Events[Type]>,
	) {
		if (!this.__target) return;
		const doOnce = (data: Events[Type]) => {
			this.off(name as string, doOnce);
			cb(data);
		};
		this.on(name as string, doOnce);
	}
}

export const Messenger = new EventEmitter({});

export const messenger = (function () {
	return {
		send(to: string, data: JSON) {
			Messenger.dispatch(to, data);
		},
		listen(to: string, cb: EventCallback) {
			Messenger.on(to, cb);
		},
		dispose() {
			Messenger.dispose();
		},
		off(name: string, cb?: EventCallback) {
			Messenger.off(name, cb);
		},
	};
})();
