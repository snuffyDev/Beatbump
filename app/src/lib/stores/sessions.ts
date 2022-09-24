import { browser } from "$app/environment";
import type { Item, JSON, Nullable } from "$lib/types";
import { every, filter, iter } from "$lib/utils/collections";
import { Logger } from "$lib/utils/logger";
import { WritableStore } from "$lib/utils/stores";
import { generateId } from "$lib/utils/strings/id";
import type Peer from "peerjs";
import type { DataConnection } from "peerjs";
import SessionListService, { type ISessionListProvider } from "./list";

import { AudioPlayer } from "$lib/player";
import { EventEmitter, Mutex } from "$lib/utils/sync";
import { getSrc, notify } from "$lib/utils/utils";
import { get } from "svelte/store";

type BaseKind = "action" | "state" | "status";
type Kind =
	| BaseKind
	| "state.set.mix"
	| "state.update.allCanPlay"
	| "state.update.mix"
	| "state.update.continuation"
	| "state.update.position"
	| "action.mix.init";
type Command = "SEND" | "GET" | "CONNECT" | "DISCONNECT" | "CONFIG" | "PUT" | "PATCH";
type Status = "OK" | "ERROR";

/// Client Types
export type ConnectionState = {
	finished?: boolean;
	paused?: boolean;
	playing?: boolean;
	stalled?: boolean;
	pos?: number;
};
export type ConnectionStates = {
	[key: string]: ConnectionState;
};
type ClientID = string;
type Permissions = {
	modifyQueue: boolean;
	skipGlobal: boolean;
	playPauseGlobal: boolean;
};
interface Client {
	// #region Properties (3)

	clientId: ClientID;
	displayName: string;
	role: "host" | "guest";

	// #endregion Properties (3)
}
interface ConnectedClient extends Client {
	// #region Properties (1)

	permissions: Permissions;

	// #endregion Properties (1)
}
export interface Settings {
	// #region Properties (1)

	forceSync: boolean;

	// #endregion Properties (1)
}

interface Message {
	// #region Properties (4)

	command: Command;
	data: JSON;
	metadata: Client;
	type: Kind;

	// #endregion Properties (4)
}

/// Store Types
interface GroupSessionController {
	// #region Public Methods (6)

	/** Connect to a group session as a guest */
	connect(id: string): void;
	/** Disconnects from a group session */
	disconnect(): void;
	/** Initiates a new WebRTC client */
	init(displayName: string): void;
	/** Process data received from connected clients */
	process(data: string): unknown;
	/** Send a command to connected clients */
	send(command: Command, type: Kind, data: JSON, metadata?: Client): void;
	/** Send client state to other clients in session */
	sendGroupState(clientState: { client: string; state: ConnectionState }): void;

	// #endregion Public Methods (6)
}

interface GroupSessionModel {
	// #region Properties (5)

	client: Client;
	connection?: DataConnection;
	connections: DataConnection[];
	rtc?: Peer;
	settings: Settings;

	// #endregion Properties (5)
}

export class GroupSession extends EventEmitter implements GroupSessionController, GroupSessionModel {
	// #region Properties (15)

	private _allCanPlay = false;
	private _client: Client;
	private _connection: DataConnection;
	private _connectionStates: WritableStore<ConnectionStates> = new WritableStore({});
	private _connections: DataConnection[] = [];
	private _hasActiveSession = false;
	private _history: WritableStore<Message[]> = new WritableStore([]);
	private _initialized = false;
	private _once = false;
	private _peerIds: Set<ClientID> = new Set<ClientID>([]);
	private _peerJs: typeof Peer;
	private _rtc: Peer;
	private _settings: Settings;
	private _type: "host" | "guest";
	private _unsubscriber: () => void;
	private _lock: Mutex;
	// #endregion Properties (15)

	// #region Constructors (1)

	constructor() {
		super({});
		this._lock = new Mutex();

		// Import PeerJS here since importing it normally would
		// crash during SSR
		if (browser) {
			import("peerjs").then((module) => {
				this._peerJs = module.default;
			});
		}

		// Listen to the connectionStates store for
		// keeping accurate track of state
		this._unsubscriber = this._connectionStates.subscribe(async (value) => {
			const entries = Object.values(value);

			if (
				!this._once &&
				!this._allCanPlay &&
				entries.length !== 0 &&
				every(entries, (item) => item?.finished === true) === true
			) {
				this._once = true;
				this._allCanPlay = true;

				await AudioPlayer.next(true, false);

				setTimeout(() => (this._once = false), 25);
			}
		});
	}

	// #endregion Constructors (1)

	// #region Public Accessors (9)

	public get client(): Client {
		return this._client;
	}

	public get connection(): DataConnection {
		return this._connection;
	}

	public get connections(): DataConnection[] {
		return this._connections;
	}

	public get hasActiveSession(): boolean {
		return this._hasActiveSession;
	}

	public get history(): WritableStore<Message[]> {
		return this._history;
	}

	public get initialized(): boolean {
		return this._initialized;
	}

	public get rtc(): Peer {
		return this._rtc;
	}

	public get settings(): Settings {
		return this._settings;
	}

	public get type(): "host" | "guest" {
		return this._type;
	}

	// #endregion Public Accessors (9)

	// #region Public Methods (13)

	public async addToQueue(item: Item, position: number): Promise<void> {
		if (!this.initialized && !this.hasActiveSession) return;

		await this._lock.do(() => {
			SessionListService.setTrackWillPlayNext(item, position).then(() => {
				this.send("PUT", "state.update.mix", SessionListService.toJSON(), this.client);
			});
		});
	}

	public allCanPlay(): [boolean, () => void] {
		return [
			this._allCanPlay,
			() => {
				this._once = false;
				this._allCanPlay = false;
			},
		];
	}

	public connect(id: string): void {
		if (!this._rtc) return;
		if (this._peerIds.has(id)) return notify(`Already connected to peer ${id}!`, "error");

		// Connect to the session host, store this connection
		if (!this._hasActiveSession) this._hasActiveSession = true;

		const connection = this._rtc.connect(id, {
			metadata: {
				clientId: this.client.clientId,
				displayName: this.client.displayName,
				permissions: {},
				role: "guest",
			} as ConnectedClient,
			serialization: "binary",
		});

		this._peerIds.add(id);
		this._connections.push(connection);

		this.listenToConnection(connection);

		connection.on("open", () => {
			Logger.debug(`Established connection to ${id}`);
			notify(`Connected to ${connection.peer}`, "success");
		});
		connection.on("close", () => {
			this.disconnect();
		});
	}

	public disconnect(): void {
		this._peerIds.clear();

		if (this.type === "guest") {
			this._connection.close();
			this._rtc.destroy();
		}

		iter(this._connections, (connection) => {
			connection.close();
		});

		this._rtc.destroy();
		this._unsubscriber();
		this._hasActiveSession = false;
		this._initialized = false;
		this._connectionStates.set(null);
	}

	public expAutoMix(items: ISessionListProvider): void {
		this.send("PUT", "state.set.mix", JSON.stringify(items), this.client);
	}

	public init(displayName: string, type?: "host" | "guest", settings: Settings = { forceSync: true }): void {
		if (this.initialized) return;

		this._initialized = true;
		this._settings = settings;

		const clientId = "bbgs_" + generateId(9, "alternative");

		this._client = {
			clientId: clientId,
			displayName: displayName,
			role: type || "guest",
		};
		this._rtc = new this._peerJs(clientId);

		if (!this._hasActiveSession) this._hasActiveSession = true;
		this._connectionStates.update((u) => ({
			...u,
			[this._client.clientId]: { finished: false, paused: false, playing: false, pos: 0, stalled: false },
		}));

		this._rtc.on("open", (id) => {
			Logger.debug(`Opened RTC Session: ${id}`);
			if (type === "host") {
				this.initSession();
			}
			this.dispatch("init");
		});
	}

	public process(rawData: string): Promise<Message> {
		if (typeof rawData !== "string") return;
		const { command, data, metadata, type } = JSON.parse(rawData) as Message;

		if (metadata.clientId === this.client.clientId) return;

		// Logger.debug([`Processing Message`, command, data, metadata, type]);
		return this._lock.do(() => {
			/** Get a user-defined track  */
			if (command === "GET" && type === "action.mix.init") {
				SessionListService.initAutoMixSession({ videoId: data as string });
			}
			/** Handle setting configuration command */
			if (command === "CONFIG") {
				this._settings = data as unknown as Settings;
			}

			if (command === "PUT") {
				/** Initial SessionListService received from host */
				if (type === "state.set.mix") {
					try {
						const list = JSON.parse(data as string) as ISessionListProvider;

						SessionListService.set(list);

						getSrc(list.mix[list.position].videoId, list.mix[list.position].playlistId).then((body) => {
							AudioPlayer.updateSrc(body.body);
							AudioPlayer.play();
						});
					} catch (err) {
						if (err.message) {
							const pos = parseInt((err.message as string).match(/\d+$/g).at(0));
							err.message.includes("position")
								? console.log((data as string).slice(0, pos), (data as string).slice(pos))
								: console.error(err);
						}
					}
				}
				/** Receive the list with the continuation data */
				if (type === "state.update.continuation") {
					const list = JSON.parse(data as string) as ISessionListProvider;
					if (!list.mix && !list.mix.length) throw new Error("Provided SessionList is not valid!", {});
					new Promise<ISessionListProvider>((resolve) => {
						setTimeout(() => {
							resolve(SessionListService.lockedSet(list));
						});
					}).then((list) => {
						SessionListService.updatePosition(list.position - 1);
						AudioPlayer.next(true, false);
					});
				}
				/** Any other mix updates */
				if (command === "PUT" && type === "state.update.mix") {
					try {
						const list = JSON.parse(data as string) as ISessionListProvider;
						if (!list.mix && !list.mix.length) throw new Error("Provided SessionList is not valid!", {});
						SessionListService.set(list);
					} catch (error) {
						console.error();
					}
				}
			}

			/** Modify already existing state */
			if (command === "PATCH") {
				/** Gets the next or previous track */
				if (type === "state.update.position") {
					const { dir = undefined, position = 0 }: { dir: "<-" | "->" | undefined; position: number } = data as {
						dir: "<-" | "->" | undefined;
						position: number;
					};
					SessionListService.updatePosition(position === 0 ? 0 : position);
					if (typeof dir === "undefined") {
						AudioPlayer.skip();
					}
					if (dir === "<-") {
						AudioPlayer.previous(false);
					} else if (dir === "->") {
						AudioPlayer.next(true, false);
					}
				}
				/** Updates the playback state for the connected client */
				if (type === "state") {
					this._connectionStates.update((u) => ({ ...u, [data["client"]]: data["state"] }));
				}
			}
			return { command, data, metadata, type };
		});
	}

	public send(command: Command, type: Kind, data: JSON, metadata?: Client): void {
		if (!this._initialized) return;
		iter(this._connections, (conn) => {
			// TODO! figure out if this check is valiid or not
			if (this.client.clientId === conn.peer) return;
			if (metadata.clientId === conn.peer) return;
			conn.send(
				JSON.stringify({
					command,
					type,
					data,
					metadata: this.client,
				} as Message),
				true,
			);
		});
	}

	public sendGroupState(clientState: { client: string; state: ConnectionState }): void {
		this._connectionStates.update((u) => ({ ...u, [this.client.clientId]: clientState["state"] }));

		this.send("PATCH", "state", clientState, this.client);
	}

	public setAutoMix(
		type: "automix" | "playlist",
		{ videoId = "", playlistId = "" }: { videoId?: string; playlistId?: string },
	): Status {
		return this.initializeHostPlayback("automix", { videoId, playlistId });
	}

	public setPlaylistMix(playlistId = ""): Status {
		return this.initializeHostPlayback("playlist", { playlistId });
	}

	public updateGuestContinuation(_mix: ISessionListProvider): void {
		this.send("PUT", "state.update.continuation", JSON.stringify(_mix), this._client);
	}

	public updateGuestTrackQueue(_mix: ISessionListProvider): void {
		// TODO! finish this
		this.send("PUT", "state.update.mix", JSON.stringify(_mix), this._client);

		// this.send('PATCH', 'state.update.position', JSON.stringify(_mix.position), this._client);
	}

	// #endregion Public Methods (13)

	// #region Private Methods (3)

	private initSession(): void {
		notify("Started Host Session", "success");
		this._connectionStates.update((u) => ({
			...u,
			[this.client.clientId]: { finished: false, paused: true, playing: false, pos: 0, stalled: false },
		}));

		// Listen for new connections from guest clients
		this._rtc.on("connection", (conn) => {
			// Push the incoming connection into connection pool
			this._connections.push(conn);

			this.listenToConnection(conn);
			Logger.debug(`Received connection`);

			// If the connection is open and ready,
			// send the inbound client the pool of connected clients
			conn.on("open", () => {
				this._peerIds.add(conn.peer);
				conn.send(
					JSON.stringify({
						data: this.settings as unknown,
						command: "CONFIG",
						metadata: this.client,
						type: "state",
					} as Message),
				);

				conn.send(
					JSON.stringify({
						data: [...this._peerIds.values()],
						command: "CONNECT",
						metadata: this.client,
						type: "action",
					} as Message),
				);
				get(SessionListService).mix.length &&
					conn.send(
						JSON.stringify({
							command: "PUT",
							type: "state.set.mix",
							data: SessionListService.toJSON(),
							metadata: this.client,
						} as Message),
						true,
					);
			});
		});
	}

	/// Client State Handling
	private initializeHostPlayback(
		kind: "automix" | "playlist",
		data: { videoId?: Nullable<string>; playlistId?: Nullable<string> } = { videoId: "", playlistId: "" },
	) {
		try {
			if (kind === "automix") {
				SessionListService.initAutoMixSession({
					videoId: data?.videoId as string,
					playlistId: data?.playlistId,
				}).then(() => {
					this.send("PUT", "state.set.mix", SessionListService.toJSON(), this.client);
				});
			} else if (kind === "playlist") {
				// Logger.debug(data);
				SessionListService.initPlaylistSession({ playlistId: data?.playlistId }).then(() => {
					this.send("PUT", "state.set.mix", SessionListService.toJSON(), this.client);
				});
			}
			return "OK";
		} catch (err) {
			console.error(err);
			return "ERROR";
		}
	}

	private listenToConnection(connection: DataConnection): void {
		connection.on("data", async (data) => {
			const processed = await this.process(data as string);
			if (processed.metadata.clientId === this.client.clientId) return;
			if (processed.command === "CONNECT" && Array.isArray(processed.data)) {
				const _ids = filter(processed.data as string[], (id) => id !== this.client.clientId);
				const ids = Object.keys(this._rtc.connections);
				iter(_ids, (item) => {
					if (!ids.includes(item)) {
						this.connect(item);
					}
				});
				return;
			}
			this.send(processed.command, processed.type, processed.data, processed.metadata);
		});

		connection.on("close", () => {
			this._connectionStates.update((u) => ({ ...u, [connection.peer]: null }));
		});
	}

	// #endregion Private Methods (3)
}

export const groupSession = new GroupSession();
