import type { JSON } from "$lib/types";

export type EventType = string;
export type EventCallback<T = unknown> = (payload?: T) => void;
export type EventListeners<
	Events extends Record<string, unknown>,
	Name extends keyof Events = keyof Events & string,
> = Map<Name, EventCallback<Events[Name]>[]>;
type KeyOf<T> = keyof T & string;

export interface IEventEmitter<T> {
	dispatch<Name extends KeyOf<T> = KeyOf<T>>(type: Name, args?: T[Name]): void;
	off<Name extends KeyOf<T> = KeyOf<T>>(type: Name, cb: EventCallback<T[Name]>): void;
	on<Name extends KeyOf<T> = KeyOf<T>>(type: Name, cb: EventCallback<T[Name]>): void;
}

export class EventEmitter<Events extends Record<string, any> = any> implements IEventEmitter<Events> {
	private __target: object;
	private _eventQueue = new WeakMap<object, EventListeners<any>>();

	constructor(target: object) {
		this.__target = target;
	}

	dispatch<Name extends KeyOf<Events> = KeyOf<Events>>(type: Name, args?: Events[Name]): void {
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
		if (this._eventQueue !== null) this._eventQueue.delete(this.__target);
		this._eventQueue = null;
	}

	public off<Name extends KeyOf<Events> = KeyOf<Events>>(type: Name, cb: EventCallback<Events[Name]>): void {
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

	public on<Name extends KeyOf<Events> = KeyOf<Events>>(type: Name, cb: EventCallback<Events[Name]>): void {
		if (!this.__target) return;
		const queue = this._eventQueue.get(this.__target) ?? (new Map() as EventListeners<any>);

		const listeners = queue.get(type) ?? [];
		queue.set(type, listeners.concat(cb));

		this._eventQueue.set(this.__target, queue);
	}

	public once<Name extends KeyOf<Events> = KeyOf<Events>>(name: Name, cb: EventCallback<Events[Name]>) {
		if (!this.__target) return;

		const doOnce = (data: Events[Name]) => {
			this.off(name, doOnce);
			cb(data);
		};

		this.on(name, doOnce);
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
