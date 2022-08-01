export type SyncResult<T> = T | Error;
export type Receiver<T> = {
	subscribe: (cb: Subscriber<T>) => SyncResult<() => void>;

	close: () => void;
};

export type Sender<T> = {
	send: (data: T) => void;
	clone: () => Sender<T>;
	close: () => void;
};
type State = "OPEN" | "CLOSED";

type Unsubscriber = () => void;
type Subscriber<T> = (value: T | State) => Unsubscriber | void;
type SubscribeFn<T> = (callback: Subscriber<T>) => SyncResult<Unsubscriber>;

/**
 * Creates a new 'Multi Producer/Multi Consumer' channel.
 *
 * `sender` can be cloned multiple times and will only ever send to the receiver
 * returned from invoking this function. `receiver` can be subscribed to from
 * multiple locations,
 *
 * @export
 * @template T
 * @return {*}  {[Sender<T>, Receiver<T>]}
 */
export function mpmc<T = unknown>(): [Sender<T>, Receiver<T>] {
	let subscribers = new Set<Subscriber<T>>([]);

	let state: State = "OPEN";

	const sender: Sender<T> = _sender();
	const receiver: Receiver<T> = _receiver();

	function _receiver() {
		const close = () => {
			if (state !== "CLOSED") {
				state = "CLOSED";
			}

			subscribers.clear();
		};
		const subscribe: SubscribeFn<T> = (cb) => {
			if (state === "CLOSED") {
				return new Error("Cannot subscribe to a closed channel");
			}
			subscribers.add(cb);
			return () => {
				subscribers.delete(cb);
				if (subscribers.size === 0) {
					subscribers = null;
				}
			};
		};

		return {
			close,
			subscribe,
		};
	}

	function _sender() {
		const close = () => {
			if (state === "CLOSED") return new Error("Cannot close an already closed channel!");

			for (const callback of subscribers.values()) {
				callback("CLOSED");
			}
			subscribers.clear();

			state = "CLOSED";

			subscribers.clear();
			return state;
		};
		return {
			close,
			send: (data: T) => {
				if (state === "CLOSED") return new Error("Cannot send on a closed channel!");
				for (const callback of subscribers.values()) {
					callback(data);
				}
				return;
			},
			clone: () => {
				return _sender();
			},
		};
	}
	return [sender, receiver];
}

const __globalChannel = mpmc();
export function globalChannel<T = unknown>(): [Sender<T>, Receiver<T>] {
	return __globalChannel as [Sender<T>, Receiver<T>];
}
