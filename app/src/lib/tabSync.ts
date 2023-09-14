import SessionListService from "$stores/list/sessionList";
import type { ISessionListProvider } from "./stores";

class TypedBroadcastChannel<
	T extends Record<string, Record<"request" | "response", any>>,
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
	kind: "request" | "response";
}

interface ConnectionRequest extends BaseSyncMessage {
	type: "connect";
}

interface ConnectionResponse extends BaseSyncMessage {
	type: "connect";
	sessionList: ISessionListProvider;
	requestId: string;
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

type SyncEvents = {
	connect: {
		request: ConnectionRequest;
		response: ConnectionResponse;
	};
	updatePosition: {
		request: UpdatePositionRequest;
		response: UpdatePositionResponse;
	};
	disconnect: {
		request: DisconnectRequest;
		response: DisconnectResponse;
	};
	updateSessionList: {
		request: UpdateSessionListRequest;
		response: UpdateSessionListResponse;
	};
};

class Protocol {
	private readonly handlers: Map<
		keyof SyncEvents,
		((message: SyncEvents[keyof SyncEvents]["response"]) => void)[]
	> = new Map();
	private readonly channel: TypedBroadcastChannel<SyncEvents>;
	constructor(private id: string) {
		this.channel = new TypedBroadcastChannel("syncTab");

		this.channel.addEventListener("message", (event) => {
			if (event.data?.id == this.id) return;
			this.onMessage(event.data as never);
		});
	}

	private onMessage = (message: SyncEvents[keyof SyncEvents]["response"]) => {
		const handlers = this.handlers.get(message.type) || [];
		for (const handler of handlers) {
			handler(message);
		}
	};

	public register = <K extends keyof SyncEvents>(
		event: K,
		callback: (message: SyncEvents[K]["response"]) => void,
	) => {
		const existing = this.handlers.get(event) || [];
		existing.push(callback);
		this.handlers.set(event, existing);
		return () => {
			this.handlers
				.get(event)
				?.splice(this.handlers.get(event)?.indexOf(callback) || 0, 1);
		};
	};

	public send<K extends keyof SyncEvents>(
		event: K,
		message: SyncEvents[K]["response"],
	): void;
	public send<K extends keyof SyncEvents>(
		event: K,
		message: SyncEvents[K]["request"],
	) {
		this.channel.postMessage({ ...message, id: this.id });
	}

	dispose() {
		this.channel.close();
		this.handlers.clear();
	}
}

class SyncTabs {
	private readonly protocol: Protocol;
	constructor(private readonly id: string) {
		this.protocol = new Protocol(this.id);

		this.protocol.register("connect", (message) => {
			console.log("connect", message);
			if (message.kind === "response" && message.requestId === this.id) {
				SessionListService.$.set(message.sessionList);
			} else if (message.kind === "request") {
				this.protocol.send("connect", {
					id: this.id,
					timestamp: Date.now(),
					type: "connect",
					kind: "response",
					requestId: message.id,
					sessionList: SessionListService.$.value,
				});
			}
		});

		this.protocol.register("updatePosition", (message) => {
			if (message.kind === "request") {
				SessionListService.updatePosition(message.position);
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

	public connect = () => {
		this.protocol.send("connect", {
			id: this.id,
			timestamp: Date.now(),
			type: "connect",
			kind: "request",
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
		this.protocol.dispose();
	}
}

export const syncTabs = new SyncTabs(crypto.randomUUID());
