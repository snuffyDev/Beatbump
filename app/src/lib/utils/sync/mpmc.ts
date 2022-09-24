export type Result<T> = T;
export type SyncResult<T> = T | Error;
export type Receiver<T> = {
	get state(): State;

	subscribe: (cb: Subscriber<T>) => Result<() => void>;

	/**
	 * @description Returns a new `Sender`
	 */
	/**
	 * @description Closes the channel for all senders and receivers.
	 */
	close: () => void;
};

export type Sender<T> = {
	get state(): State;
	send: (data: T) => void;
	/**
	 * @description Returns a new `Sender`
	 */
	clone: () => Sender<T>;
	/**
	 * @description Closes the channel for all senders and receivers.
	 */
	close: () => void;
};
type State = "OPEN" | "CLOSED";

type Unsubscriber = () => void;
type Subscriber<T> = (value: T | State) => Unsubscriber;
type SubscribeFn<T> = (callback: Subscriber<T>) => Result<Unsubscriber>;

/**
 * Creates a new 'Multi-Producer/Multi-Consumer' FIFO channel.
 *
 * `sender` can be cloned multiple times and will only ever send to the receiver
 * returned from invoking this function.
 *
 * `receiver` can be subscribed to from
 * multiple locations.
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

			// Clean up subscribers before clearing
			for (const callback of subscribers.values()) {
				const unsubFn = callback("CLOSED");
				if (typeof unsubFn === "function") {
					unsubFn();
				}
			}
			subscribers.clear();
		};
		const subscribe: SubscribeFn<T> = (cb) => {
			try {
				if (state === "CLOSED") {
					throw new Error("Cannot subscribe to a closed channel");
				}
				subscribers.add(cb);
				return () => {
					subscribers.delete(cb);
					if (subscribers.size === 0) {
						subscribers = null;
					}
				};
			} catch (err) {
				console.error(err);
			}
		};

		return {
			get state() {
				return state;
			},
			close,
			subscribe,
		};
	}

	function _sender() {
		const close = () => {
			try {
				if (state === "CLOSED") {
					throw new Error("Cannot close an already closed channel!");
				}

				// Clean-up subscribers, notify of channel closure,
				// and run any returned functions
				for (const callback of subscribers.values()) {
					const unsubFn = callback("CLOSED");
					if (typeof unsubFn === "function") {
						unsubFn();
					}
				}

				subscribers.clear();

				state = "CLOSED";

				subscribers.clear();
				return state;
			} catch (err) {
				console.error(err);
			}
		};
		return {
			get state() {
				return state;
			},
			close,
			send: (data: T) => {
				P;
				try {
					if (state === "CLOSED") {
						throw new Error("Cannot send on a closed channel!");
					}
					for (const callback of subscribers.values()) {
						callback(data);
					}
					return;
				} catch (err) {
					console.error(err);
				}
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
