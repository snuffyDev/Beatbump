import { browser } from "$app/environment";
import SessionListService from "$stores/list/sessionList";
import { AudioPlayer } from "./player";
import type { ISessionListProvider } from "./stores";
import { generateId } from "./utils";

const _syncTabs = (() => {
	if (!browser) return;

	class TypedBroadcastChannel<
		T extends Record<
			string,
			Record<"request" | "response" | "notification", any>
		>,
	> extends BroadcastChannel {
		constructor(name: string) {
			super(name);
		}
		postMessage<T>(message: T) {
			super.postMessage(message);
		}
		onmessage: (<K>(message: K) => void) | null = null;

		override addEventListener<
			K extends keyof BroadcastChannelEventMap,
			E extends keyof T,
		>(
			event: K,
			callback:
				| ((message: MessageEvent<T[E][keyof T[E]]>) => void)
				| EventListenerObject,
			options?: boolean | AddEventListenerOptions,
		): void {
			super.addEventListener("message", callback as never, options);
		}
	}

	interface BaseSyncMessage {
		id: string;
		timestamp: number;
		type: string;
		kind: "request" | "response" | "notification";
	}

	interface ConnectionRequest extends BaseSyncMessage {
		type: "connect";
	}

	interface ConnectionResponse extends BaseSyncMessage {
		type: "connect";
		sessionList: ISessionListProvider;
		requestId: string;
		connections: number;
		role: "host" | "leech";
	}

	interface UpdatePositionRequest extends BaseSyncMessage {
		type: "updatePosition";
		position: number;
	}

	interface UpdatePositionResponse extends BaseSyncMessage {
		type: "updatePosition";
		position: number;
		requestId: string;
	}

	interface DisconnectRequest extends BaseSyncMessage {
		type: "disconnect";
	}

	interface DisconnectResponse extends BaseSyncMessage {
		type: "disconnect";
		requestId: string;
	}

	interface UpdateSessionListRequest extends BaseSyncMessage {
		type: "updateSessionList";
		sessionList: ISessionListProvider;
	}

	interface UpdateSessionListResponse extends BaseSyncMessage {
		type: "updateSessionList";
		requestId: string;
	}

	interface PlaybackRequest extends BaseSyncMessage {
		type: "playback";
		kind: "notification";
		state: "play" | "pause";
		duration: number;
		currentTime: number;
	}

	type SyncEvents = {
		connect: {
			notification: never;
			request: ConnectionRequest;
			response: ConnectionResponse;
		};
		updatePosition: {
			notification: never;
			request: UpdatePositionRequest;
			response: UpdatePositionResponse;
		};
		disconnect: {
			notification: never;
			request: DisconnectRequest;
			response: DisconnectResponse;
		};
		updateSessionList: {
			notification: never;
			request: UpdateSessionListRequest;
			response: UpdateSessionListResponse;
		};
		playback: {
			notification: PlaybackRequest;
			response: PlaybackRequest;
			request: PlaybackRequest;
		};
	};

	class Protocol {
		private readonly handlers: Map<
			keyof SyncEvents,
			((
				message: SyncEvents[keyof SyncEvents]["notification"] extends never
					? SyncEvents[keyof SyncEvents]["response"]
					: SyncEvents[keyof SyncEvents]["notification"],
			) => void)[]
		> = new Map();
		private readonly channel: TypedBroadcastChannel<SyncEvents>;
		constructor(private id: string) {
			this.channel = new TypedBroadcastChannel("syncTab");

			this.channel.addEventListener("message", (event) => {
				if (event.data?.id == this.id) return;
				this.onMessage(event.data as never);
			});
		}

		private onMessage = (
			message: SyncEvents[keyof SyncEvents][keyof SyncEvents[keyof SyncEvents]],
		) => {
			const handlers = this.handlers.get(message.type) || [];
			for (const handler of handlers) {
				handler(message as never);
			}
		};

		public register<K extends keyof SyncEvents>(
			event: K,
			callback: (
				message: SyncEvents[K]["notification"] extends undefined
					? SyncEvents[K]["response"]
					: SyncEvents[K]["notification"],
			) => void,
		): () => void;
		public register<K extends keyof SyncEvents>(
			event: K,
			callback: (
				message: SyncEvents[K]["response"] | SyncEvents[K]["notification"],
			) => void,
		): () => void {
			const existing = this.handlers.get(event) || [];
			existing.push(callback);
			this.handlers.set(event, existing);
			return () => {
				this.handlers
					.get(event)
					?.splice(this.handlers.get(event)?.indexOf(callback) || 0, 1);
			};
		}

		public send<
			K extends keyof SyncEvents,
			M extends SyncEvents[K]["response"],
		>(event: K, message: M): void;
		public send<K extends keyof SyncEvents, M extends SyncEvents[K]["request"]>(
			event: K,
			message: SyncEvents[K]["request"],
		): void;
		public send<
			K extends keyof SyncEvents,
			M extends SyncEvents[K]["response"] | SyncEvents[K]["request"],
		>(event: K, message: M) {
			this.channel.postMessage({ ...message, id: this.id });
		}

		dispose() {
			this.channel.close();
			this.handlers.clear();
		}
	}

	class SyncTabs {
		private readonly protocol: Protocol;
		/** Connection count excludes the connecting client, aka this class instance
		 *  ```
		 *  Tab A connects: TabA.connectionCount = 0;
		 *  Tab B connects: TabA.connectionCount = 1; TabB.connectionCount = 1;
		 *  Tab A disconnects: TabB.connectionCount = 0;
		 *  Tab C connects: TabB.connectionCount = 1; TabC.connectionCount = 1;
		 *  Tab D connects: TabB.connectionCount = 2; TabC.connectionCount = 2; TabD.connectionCount = 2;
		 *  Tab B disconnects: TabC.connectionCount = 1; TabD.connectionCount = 1;
		 * ```
		 *
		 *
		 */
		private connectionCount = 0;
		private _role: "host" | "leech" = "host";
		constructor(private readonly id: string) {
			this.protocol = new Protocol(this.id);

			this.protocol.register("connect", (message) => {
				console.log("connect", message);
				if (message.kind === "response" && message.requestId === this.id) {
					this.connectionCount = message.connections;
					this._role = message.role;
					SessionListService.$.set(message.sessionList);
				} else if (message.kind === "request") {
					if (this._role === "host") {
						this.protocol.send("connect", {
							id: this.id,
							timestamp: Date.now(),
							type: "connect",
							kind: "response",
							requestId: message.id,
							sessionList: SessionListService.$.value,
							role: "leech",
							connections: ++this.connectionCount,
						});
						this.protocol.send("playback", {
							id: this.id,
							timestamp: Date.now(),
							type: "playback",
							kind: "notification",
							state: "play",
							duration: AudioPlayer.duration,
							currentTime: AudioPlayer.currentTime,
						});
					}
				}
			});

			this.protocol.register("updatePosition", (message) => {
				if (message.kind === "request") {
					SessionListService.updatePosition(message.position);
				}
			});

			this.protocol.register("playback", (message) => {
				if (message.kind === "notification") {
					if (message.state === "play")
						AudioPlayer.fakePlay(message.currentTime, message.duration);
					if (message.state === "pause") AudioPlayer.pause();
				}
			});

			this.protocol.register("disconnect", (message) => {
				console.log("disconnect", message);
			});

			this.protocol.register("updateSessionList", (message) => {
				console.log("updateSessionList", message);
				if (message.kind === "request" && message.requestId === this.id) {
					SessionListService.$.set(
						(message as unknown as UpdateSessionListRequest).sessionList,
					);
				} else if (message.kind === "request") {
					this.protocol.send("updateSessionList", {
						id: this.id,
						timestamp: Date.now(),
						type: "updateSessionList",
						kind: "response",
						requestId: message.id,
						sessionList: SessionListService.$.value,
					});
				}
			});
		}

		public get role() {
			return this._role;
		}

		public connect = () => {
			this.protocol.send("connect", {
				id: this.id,
				timestamp: Date.now(),
				type: "connect",
				kind: "request",
			});
		};

		public playback = ({
			state,
			duration,
			currentTime,
		}: {
			state: "play" | "pause";
			duration: number;
			currentTime: number;
		}) => {
			this.protocol.send("playback", {
				id: this.id,
				timestamp: Date.now(),
				type: "playback",
				kind: "notification",
				state,
				duration,
				currentTime,
			});
		};

		public updatePosition = (position: number) => {
			this.protocol.send("updatePosition", {
				id: this.id,
				timestamp: Date.now(),
				type: "updatePosition",
				position,
				kind: "request",
			});
		};

		public disconnect = () => {
			this.protocol.send("disconnect", {
				id: this.id,
				timestamp: Date.now(),
				type: "disconnect",
				kind: "request",
			});
		};

		public updateSessionList = (sessionList: ISessionListProvider) => {
			this.protocol.send("updateSessionList", {
				id: this.id,
				timestamp: Date.now(),
				type: "updateSessionList",
				kind: "request",
				sessionList,
			});
		};

		dispose() {
			this.protocol?.dispose?.();
		}
	}

	return new SyncTabs(generateId(16));
})();

export const syncTabs = _syncTabs as NonNullable<typeof _syncTabs>;
