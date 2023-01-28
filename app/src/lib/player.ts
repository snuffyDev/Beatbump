/* eslint-disable @typescript-eslint/no-inferrable-types */
import { browser, dev } from "$app/environment";
import { cubicOut } from "svelte/easing";
import { tweened } from "svelte/motion";
import type { Unsubscriber } from "svelte/store";
import { get } from "svelte/store";
import SessionListService, { type ISessionListProvider } from "./stores/list";
import { groupSession, type ConnectionState } from "./stores/sessions";
import { currentTitle } from "./stores/stores";
import type { Nullable } from "./types";
import { notify, type Maybe } from "./utils";
import { Logger } from "./utils/logger";
import { EventEmitter } from "$lib/utils/sync";
import { WritableStore } from "./utils/stores";
import { getSrc, type ResponseBody } from "./utils/utils";
import type HLS from "hls.js";
import { settings } from "./stores";
import type { StreamType } from "$stores/settings";
import { tick } from "svelte";
import { isSafari } from "./utils/browserDetection";

export interface IAudioPlayer {
	// #region Properties (6)

	currentTime: number;
	duration: number;
	durationStore: WritableStore<number>;
	paused: WritableStore<boolean>;
	player: HTMLAudioElement;
	src: WritableStore<string>;

	// #endregion Properties (6)

	// #region Public Methods (5)

	next(): Promise<void>;
	pause(): void;
	play(): void;
	previous(): void;
	updateTime(time: number): void;

	// #endregion Public Methods (5)
}

export type Callback<K extends keyof HTMLElementEventMap> = (this: HTMLElement, event: HTMLElementEventMap[K]) => void;

export type Listeners = Map<string, Callback<keyof HTMLElementEventMap>[]>;

export interface IEventHandler {
	// #region Public Methods (1)

	onEvent<K extends keyof HTMLElementEventMap>(type: K, cb: Callback<K>): void;

	// #endregion Public Methods (1)
}

type SrcDict = { original_url: string; url: string };

// AudioPlayer Class Events
const events: Map<string, { cb: Callback<keyof HTMLElementEventMap>; options?: AddEventListenerOptions | boolean }> =
	new Map();

const setPosition = () => {
	if ("mediaSession" in navigator) {
		navigator.mediaSession.setPositionState({
			duration: AudioPlayer.isWebkit ? AudioPlayer.duration / 2 : AudioPlayer.duration,
			position: AudioPlayer.currentTime,
		});
	}
};

function metaDataHandler(sessionList: Maybe<ISessionListProvider>) {
	if (!sessionList) sessionList = get(SessionListService);
	if ("mediaSession" in navigator) {
		const position = sessionList.position;
		const currentTrack = sessionList.mix[position];
		navigator.mediaSession.metadata = new MediaMetadata({
			title: currentTrack?.title,
			artist: currentTrack?.artistInfo?.artist[0].text || null,
			album: currentTrack?.album?.title ?? undefined,
			artwork: [
				{
					src: currentTrack?.thumbnails[currentTrack?.thumbnails.length - 1].url,
					sizes: `${currentTrack?.thumbnails[currentTrack?.thumbnails.length - 1].width}x${
						currentTrack?.thumbnails[currentTrack?.thumbnails.length - 1].height
					}`,
					type: "image/jpeg",
				},
			],
		});
		navigator.mediaSession.setActionHandler("play", () => {
			AudioPlayer.play();
		});
		navigator.mediaSession.setActionHandler("pause", () => AudioPlayer.pause());
		navigator.mediaSession.setActionHandler("seekto", (session) => {
			if (session.fastSeek && "fastSeek" in AudioPlayer.player) {
				AudioPlayer.player.fastSeek(session.seekTime);
				setPosition();
				return;
			}
			AudioPlayer.seek(session.seekTime);

			setPosition();
		});
		navigator.mediaSession.setActionHandler("previoustrack", () => AudioPlayer.previous());
		navigator.mediaSession.setActionHandler("nexttrack", () => AudioPlayer.next());
	}
}

export const updateGroupState = (opts: { client: string; state: ConnectionState }): void =>
	groupSession.sendGroupState(opts);
export const updateGroupPosition = (dir: "<-" | "->" | undefined, position: number): void =>
	groupSession.send("PATCH", "state.update.position", { dir, position }, groupSession.client);

// Helper to generate a fallback URL if the current src fails to play
function createFallbackUrl(currentUrl: string) {
	if (typeof currentUrl !== "string")
		throw Error(`Expected parameter 'currentUrl' to be a string, received ${currentUrl}`);
	const srcUrl = new URL(currentUrl);

	if (!srcUrl.hostname.includes("googlevideo.com")) return currentUrl;

	// example: [ rr4---sn-p5ql61yl , googlevideo , com ]
	const [subdomain, domain, ext] = srcUrl.hostname.split(".");

	const fvip = srcUrl.searchParams.get("fvip");
	// comma-separated list of fallback server hosts
	const mn = srcUrl.searchParams.get("mn");

	let [preDashes, postDashes] = subdomain.split("---");
	// step 1: replace digits in first part of subdomain with fvip
	preDashes = preDashes.replace(/\d/g, fvip);

	// step 2: use one of the fallback server names found in mn
	postDashes = mn.split(",")[1];

	/**  */
	srcUrl.hostname = `${`${preDashes}---${postDashes}`}.${domain}.${ext}`;

	return srcUrl.toString();
}

interface AudioPlayerEvents {
	"update:stream_type": { type: StreamType };
	play: SrcDict;
	playing: undefined;
}

function isResponseBody(input: unknown): input is ResponseBody {
	return (input as ResponseBody).url !== undefined;
}
class BaseAudioPlayer extends EventEmitter<AudioPlayerEvents> implements IAudioPlayer, IEventHandler {
	// #region Properties (21)

	private _HLS: HLS;
	private _HLSModule: typeof HLS;
	// private _DashModule: typeof DashJS;
	// private _DashJS: DashJS.MediaPlayerClass;
	private _isDisposed = false;
	private __srcUrl: string;
	/** Prevents the player from calling `this.next()` again
	 *  until the previous invocation has finished.
	 */
	private __tick: boolean = false;
	private __unsubscriber: Unsubscriber;
	private _currentTime: number = 0;
	private _currentTimeStore: WritableStore<number> = new WritableStore(0);
	private _currentTimeUnsubscriber: Unsubscriber;
	private _duration: number = 50;
	private _durationStore: WritableStore<number> = new WritableStore(50);
	private _durationUnsubscriber: Unsubscriber;
	private _hasNextSrc: boolean = false;
	private _initialized = false;
	private _isWebkit: boolean = false;
	private _nextTrackURL: ResponseBody;
	private _paused: WritableStore<boolean> = new WritableStore(true);
	private _player!: HTMLAudioElement;
	private _remainingTime: number = 0;
	private _repeat: "track" | "playlist" | "off" = "off";
	playerType: "NATIVE" | "HLS.JS" | "UNSUPPORTED" = undefined;
	private _src: WritableStore<string> = new WritableStore("");
	private _worksWithHLSjs = new WritableStore(false);
	private _streamType: "HTTP" | "HLS";
	private currentSessionList = () => get(SessionListService);
	private errorCount = -1;
	private isHLSPlayer = false;

	public progress = tweened(0, {
		duration: this._duration,
		easing: cubicOut,
	});

	// #endregion Properties (21)

	// #region Constructors (1)

	constructor() {
		super({});
		if (!browser) return;
		if ("window" in globalThis.self === false) return;
		this._isWebkit = isSafari;
		// Logger.log(`[LOG:PLAYER:Init]: Mobile Apple Device?`, this._isWebkit);

		this._player = new Audio();
		// Logger.log(`[LOG:PLAYER:Init]: Initializing Audio Player`, true);

		// const setup = async () => {
		// 	if (browser) {
		// 		const module = await import("dashjs");

		// 		this._DashModule = module;

		// 		this._DashJS = module.MediaPlayer().create();
		// 		this._DashJS.initialize(this._player, "", true);
		// 	}
		// };
		// setup();

		if (dev) {
			window["__player"] = this.player;
		}
		this._player.volume = 0.5;
		this._player.autoplay = true;
		this._player.preload = "metadata";

		this._durationUnsubscriber = this._durationStore.subscribe((value) => {
			// Logger.log(`[LOG:PLAYER:Update]: Duration: `, value);

			this._duration = value;
			// notify(`${this._duration}`, "error");]
		});
		this._currentTimeUnsubscriber = this._currentTimeStore.subscribe((value) => {
			this._currentTime = value;
		});
		this.setup();
	}

	// #endregion Constructors (1)

	// #region Public Accessors (12)

	public get currentTime(): number {
		if (browser !== true && this._player) return;
		return this._player.currentTime ?? this._currentTime;
	}

	public get currentTimeStore(): WritableStore<number> {
		if (!browser && !this._player) return;
		return this._currentTimeStore;
	}

	public get duration(): number {
		if (!browser && !this._player) return;
		return this._duration;
	}

	public get durationStore(): WritableStore<number> {
		if (!browser && !this._player) return;
		return this._durationStore;
	}

	public set isSeeking(value: boolean) {
		this.isSeeking = value;
	}

	public get isWebkit(): boolean {
		return this._isWebkit;
	}

	public get paused(): WritableStore<boolean> {
		return this._paused;
	}

	public get player(): HTMLAudioElement {
		return this._player;
	}

	public get seeking() {
		return this.isSeeking;
	}

	public get src(): WritableStore<string> {
		return this._src;
	}

	public set time(time: number) {
		this._currentTimeStore.set(time);
	}

	public set volume(volume: number) {
		if (!this._player && !browser) return;
		this._player.volume = volume;
	}

	// #endregion Public Accessors (12)

	// #region Private Accessors (1)

	private get hasFinishedPlayback(): boolean {
		// Logger.log(`[LOG:PLAYER:State]: Has Finished Playback?`, this._player.currentTime >= this._player.duration);
		// Logger.log(`[LOG:PLAYER:State]: Current Duration: `, this._player.duration);
		return this._player.currentTime >= this._player.duration;
	}

	// #endregion Private Accessors (1)

	// #region Public Methods (10)

	public override dispose(): void {
		if (!browser) return;
		if (this._isDisposed) return;
		for (const [name, obj] of events.entries()) {
			if (obj["options"]) {
				this._player.removeEventListener(name, obj.cb, obj?.options);
				events.delete(name);
			} else {
				this._player.removeEventListener(name, obj.cb);
				events.delete(name);
			}
		}
		this._currentTimeUnsubscriber();
		this._durationUnsubscriber();
		this.__unsubscriber();
		super.dispose();
	}

	public async next(userInitiated = false, broadcast = false): Promise<void> {
		if (this._repeat === "track" && userInitiated === false) return;
		if (this.__tick === true) return;
		this.__tick = true;
		// Logger.log(`[LOG:PLAYER:Next]: Loading next track`, { repeat: this._repeat });

		const sessionList = this.currentSessionList();
		const canAllPlay = groupSession.allCanPlay();
		let position = sessionList.position;

		if (this._repeat === "playlist" && sessionList.position === sessionList.mix.length - 1) {
			// Logger.log(`[LOG:PLAYER:Next]: Repeating song: `, { repeat: this._repeat });
			this.handleRepeat(sessionList);
			this.__tick = false;
			return;
		}

		/**
		 *  if both `userInitiated` and `broadcast` are true, it means
		 *  a group session is available and to update it & local state
		 *
		 * 	otherwise, just update position as normal
		 * */

		if (userInitiated === true && broadcast === true) {
			position = SessionListService.updatePosition("next");
			if (position === sessionList.mix.length - 1) {
				updateGroupPosition("->", position - 1);
			} else {
				updateGroupPosition("->", position - 1);
			}
		} else {
			position = SessionListService.updatePosition("next");
		}
		/// Reset the 'allCanPlay' State for this client (if in group session)
		if (canAllPlay && canAllPlay.length) {
			canAllPlay[1]();
		}
		const response = await this.getNextSongInQueue(position);
		if (response === null) {
			console.error("RESPONSE ERROR", new Error(`[err] ${response}`));
			return;
		}
		this.updateSrc(response);
		this.__tick = false;
	}

	public onEvent<K extends keyof HTMLElementEventMap>(
		type: K,
		cb: Callback<K>,
		options: AddEventListenerOptions | boolean = {},
	): void {
		this._player.addEventListener(type, cb, options);
		events.set(type, { cb, options });
	}

	public pause(): void {
		if ("mediaSession" in navigator) {
			navigator.mediaSession.playbackState = "paused";
		}
		// Logger.log(`[LOG:PLAYER:State]: Paused: `, true);

		this._paused.set(true);
		this._player.pause();
	}

	public play(event: Nullable<Event> = null): void {
		try {
			if ("mediaSession" in navigator) {
				navigator.mediaSession.playbackState = "playing";
			}

			// Logger.log(`[LOG:PLAYER:State]: Start Playback: `, true);
			if (groupSession.initialized === true && groupSession.hasActiveSession === true) {
				updateGroupState({
					client: groupSession.client.clientId,
					state: {
						finished: this.hasFinishedPlayback,
						paused: false,
						playing: true,
						pos: this.currentSessionList().position,
						stalled: !!this._player.error,
					} as ConnectionState,
				});
			}
			const canPlay = this._player.play();

			if (canPlay !== undefined) {
				canPlay
					.then(() => {
						this._player.play();
						this._paused.set(false);
					})
					.catch((err: MediaError & Error) => {
						notify(`${err.name}: ${err.message}`, "error");
						return;
					});
			} else {
				this._paused.set(false);
				this.player.play();
			}
			this._player.defaultMuted = false;
		} catch (err) {
			notify(`Error starting playback. You can find this error in the console logs as [playback-error]`, "error");
			console.error(`[playback-error] `, err);
		}
	}

	public previous(broadcast = false): void {
		const position = this.currentSessionList().position;
		if (position === 0) {
			Logger.log("There's nothing that way!");
			return;
		}
		// Logger.log(`[LOG:PLAYER:Previous]: Loading previous track `, position - 1);
		if (broadcast === true) updateGroupPosition("<-", position);
		SessionListService.updatePosition("back");
		this.getTrackSrc(position - 1);
	}

	public seek(time: number) {
		if ("fastSeek" in this._player) {
			this._player.fastSeek(time);
			return;
		}
		if (this.isHLSPlayer) {
			this._HLS.media.currentTime = time;
		} else {
			this.player.currentTime = time;
		}
		this._currentTimeStore.set(time);
	}

	public skip(): void {
		this.currentTimeStore.set((this._player.duration - 1) * 2);
	}

	public updateSrc(dict: SrcDict | Promise<SrcDict>): void {
		// Logger.log(`[LOG:PLAYER:Stream]: Updating Player Source: `, dict);

		if (dict instanceof Promise) {
			dict.then((result) => {
				this.__srcUrl = result?.original_url;
				this._src.set(result?.url);
				// Logger.log(`[LOG:PLAYER:Stream]: Sucessfully Set Source: `, dict);
			});
			return;
		}

		// Logger.log(`[LOG:PLAYER:Stream]: Sucessfully Set Source: `, dict);
		this.__srcUrl = dict?.url;
		this._src.set(dict?.url);
	}

	public updateTime(time: number): void {
		this._currentTimeStore.set(time);
	}

	public repeat(state: "off" | "track" | "playlist") {
		if (state === "track") {
			this._player.loop = true;
		} else this._player.loop = false;

		this._repeat = state;
	}
	// #endregion Public Methods (10)

	// #region Private Methods (5)
	private async loadHLSModule() {
		return import("hls.js").then((module) => {
			return module.default;
		});
	}

	private handleError() {
		if (++this.errorCount > 2) {
			this.errorCount = 0;
			this.updateSrc({ original_url: createFallbackUrl(this.player.src), url: createFallbackUrl(this.player.src) });
		}
	}

	private async createHLSPlayer(source?: string) {
		if (this.playerType === "NATIVE") return;
		if (!this._HLSModule) this._HLSModule = await this.loadHLSModule();
		if (this._HLSModule.isSupported() !== true) return;
		if (this._HLS) this._HLS.destroy();

		this._HLS = new this._HLSModule({
			lowLatencyMode: true,
			enableWorker: true,

			backBufferLength: 90,
		});

		this._HLS.attachMedia(this._player);

		this._HLS.on(this._HLSModule.Events.MEDIA_ATTACHED, () => {
			this._HLS.loadSource(source);
		});

		this._HLS.on(this._HLSModule.Events.ERROR, (event, data) => {
			const type = data.type;
			switch (type) {
				case this._HLSModule.ErrorTypes.MEDIA_ERROR:
					this._HLS.recoverMediaError();
					break;
				case this._HLSModule.ErrorTypes.NETWORK_ERROR:
					this._HLS.startLoad();
					break;
				default:
			}
		});
	}

	private async getNextSongInQueue(position: number, shouldAutoplay = true): Promise<Nullable<ResponseBody>> {
		// Logger.log(`[LOG:PLAYER:Queue]: Start Fetching Next Song: `, { position, shouldAutoplay });
		const sessionList = this.currentSessionList();

		if (position >= sessionList.mix.length - 1) {
			if (groupSession.initialized && groupSession.hasActiveSession && groupSession.client.role !== "host") {
				const response = await this.getTrackSrc(position, shouldAutoplay);
				return response as ResponseBody;
			}

			/// Check if track is a single or if there's no continuation set
			if (sessionList.currentMixType !== "playlist" && !sessionList.continuation && !sessionList.clickTrackingParams) {
				const response = await this.handleAutoSuggestion(sessionList.position);
				return response;
			}

			/// If track has continuation (automix), get next section of queue list
			return SessionListService.getSessionContinuation({
				itct: sessionList.mix[position]?.itct,
				videoId: sessionList.mix[position]?.videoId,
				playlistId: sessionList.currentMixId,
				loggingContext: sessionList.mix[position].loggingContext,
				ctoken: sessionList.continuation,
				clickTrackingParams: sessionList.clickTrackingParams,
				key: position,
			});
		}

		try {
			this.__tick = false;
			const response = await this.getTrackSrc(position, shouldAutoplay).then((value) => {
				// Logger.log(`[LOG:PLAYER:Queue]: Got Next Track Source: `, { value });
				if (isResponseBody(value)) return value;
			});
			return response;
		} catch (error) {
			// this.getTrackSrc(position + 1);
		}
	}

	private getTrackSrc(position: number, shouldAutoplay = true): Promise<true | void | ResponseBody> {
		const sessionList = this.currentSessionList();
		// Logger.log(`[LOG:PLAYER:Stream]: Fetching next track source: `,{ {position, shouldAutoplay});
		return getSrc(sessionList.mix[position].videoId, sessionList.mix[position].playlistId, null, shouldAutoplay)
			.then(({ body, error }) => {
				if (error === true) {
					// this.next();
					this.skip();

					// Logger.err(`[LOG:PLAYER:Stream]: Error fetching next track source: `, {
					// 	position,
					// 	shouldAutoplay,
					// 	error,
					// 	body,
					// });
					return error;
				}
				// Logger.err(`[LOG:PLAYER:Stream]: Successfully fetched next track source: `, {
				// 	position,
				// 	shouldAutoplay,
				// 	error,
				// 	body,
				// });
				return body;
			})
			.catch((err: MediaError & Error) => {
				if (err.message.includes("The play() request was interrupted")) return;
				notify(`${err.name}: ${err.message}`, "error");
				return;
			});
	}

	private async handleAutoSuggestion(position: number): Promise<ResponseBody> {
		const list = this.currentSessionList();

		await SessionListService.getMoreLikeThis({ playlistId: list.currentMixId });
		return this.getTrackSrc(position).then((value) => {
			function hasProperty(input: unknown): input is ResponseBody {
				return (input as ResponseBody).url !== undefined;
			}

			if (hasProperty(value)) return value;
		});
	}

	private async handleRepeat(currentList: ISessionListProvider) {
		if (currentList.position === currentList.mix.length - 1) {
			SessionListService.updatePosition(1);
			await tick();
			this.previous(false);
		}
		// Logger.err(`[LOG:PLAYER:State]: Repeating: `, true);
		this.__tick = false;
	}

	private async onEnded() {
		if (this._repeat === "track") return;
		const currentList = this.currentSessionList();
		const isLastSong = currentList.position === currentList.mix.length - 1;
		// Logger.err(`[LOG:PLAYER:Stream]: Track ended: `, true);
		if (this._repeat === "playlist" && isLastSong) {
			await this.handleRepeat(currentList);
			return;
		}

		if (isLastSong) {
			this.next();
			return;
		}
		if (groupSession.initialized) {
			Promise.resolve(
				updateGroupState({
					client: groupSession.client.clientId,
					state: {
						finished: this.hasFinishedPlayback,
						paused: true,
						playing: false,
						pos: this.currentSessionList().position,
						stalled: !!this._player.error,
					} as ConnectionState,
				}),
			).then(() => {
				const [allCanPlay, fn] = groupSession.allCanPlay();
				if (allCanPlay) {
					fn();
				}
			});
			return;
		}

		if (this._hasNextSrc === true && this._nextTrackURL && this._nextTrackURL?.url) {
			SessionListService.updatePosition("next");
			this.updateSrc(this._nextTrackURL);
		} else {
			const position = SessionListService.updatePosition("next");

			this.getNextSongInQueue(position, false).then((value) => {
				this._nextTrackURL = value;
				this.updateSrc(value);
				return value;
			});
		}

		this._hasNextSrc = false;
		this._nextTrackURL = null;
	}

	private async canUseHLSjs() {
		const streamSetting = get(settings)?.playback?.Stream === "HLS";
		if (streamSetting === true) this._streamType = "HLS";
		else this._streamType = "HTTP";
		if (this.isWebkit && streamSetting) {
			this.isHLSPlayer = true;

			return "NATIVE";
		}
		if (streamSetting) {
			if (!this._HLSModule) this._HLSModule = await this.loadHLSModule();
			if (this._HLSModule.isSupported()) {
				this.isHLSPlayer = true;
				return "HLS.JS";
			}
		}
		this.isHLSPlayer = false;
		return "UNSUPPORTED";
	}

	private async setup() {
		if (!browser) return;

		this.playerType = await this.canUseHLSjs();

		this.__unsubscriber = this._src.subscribe(async (value) => {
			if (this.playerType === "HLS.JS" && !this._HLSModule) this._HLSModule = await this.loadHLSModule();

			if (this.isHLSPlayer && this.playerType === "HLS.JS") {
				this.createHLSPlayer(value);
			} else {
				if (this._HLS) {
					this._HLS.destroy();
				}
				this._player.src = value;
				this._player.load();
			}
		});

		// Setup event listeners
		this.on("play", async (args) => {
			if (!this._initialized) {
				await this.updateSrc(args[0]);
				// this._player.load();
				this._player.autoplay = true;
				this.play();
			}
		});

		this.on("update:stream_type", async ({ type }) => {
			if (type === "HLS") {
				this.playerType = await this.canUseHLSjs();
				if (this.playerType !== "HLS.JS") return;
				if (!this._HLSModule) {
					this._HLSModule = await this.loadHLSModule();
				}
				if (this._HLSModule.isSupported()) {
					this.isHLSPlayer = true;
				}
			}
			if (type === "HTTP") {
				this._streamType = "HTTP";
				this.isHLSPlayer = false;
				if (this.isHLSPlayer) {
					if (this._HLS) this._HLS.destroy();
				}
			}
		});

		this.onEvent("play", async () => {
			try {
				if ("mediaSession" in navigator) {
					navigator.mediaSession.playbackState = "playing";
				}

				if (groupSession.initialized === true && groupSession.hasActiveSession === true) {
					updateGroupState({
						client: groupSession.client.clientId,
						state: {
							finished: this.hasFinishedPlayback,
							paused: false,
							playing: true,
							pos: this.currentSessionList().position,
							stalled: !!this._player.error,
						} as ConnectionState,
					});
				}
				const canPlay = this._player.play();

				if (canPlay !== undefined) {
					canPlay
						.then(() => {
							this._player.play();
							this._paused.set(false);
						})
						.catch((err: MediaError & Error) => {
							notify(`${err.name}: ${err.message}`, "error");
							return;
						});
				} else {
					this._paused.set(false);
					this.player.play();
				}
			} catch (err) {
				this.handleError();
				notify(`Error: ${err}`, "error");
			}
		});

		this.onEvent("pause", () => this.pause());

		this.onEvent("seeked", () => {
			if (!this._src.value) {
				return;
			}
			this.play();
		});

		this.onEvent("loadedmetadata", () => {
			this.__tick = false;

			this._hasNextSrc = false;
			this._nextTrackURL = null;
			this._durationStore.set(this._player.duration);
			const sessionList = get(SessionListService);
			currentTitle.set(sessionList.mix[sessionList.position]?.title);

			window.bbPlayer = {
				src: this.__srcUrl,
				duration: this.duration,
				title: sessionList.mix[sessionList.position]?.title,
			};
			metaDataHandler(sessionList);
			this.dispatch("playing");
		});

		this.onEvent("timeupdate", async () => {
			this._currentTimeStore.set(this._player.currentTime);
			this._durationStore.set(this._isWebkit && !this.isHLSPlayer ? this._player.duration / 2 : this._player.duration);
			// console.log(this._isWebkit, this);
			if (
				!this._hasNextSrc && this.isWebkit && !this.isHLSPlayer
					? this._player.currentTime * 2 >= this._player.duration / 4
					: this._player.currentTime >= this._player.duration / 2
			) {
				if (this._hasNextSrc === true) return;
				this.getNextSongInQueue(this.currentSessionList().position + 1, false).then((value) => {
					this._nextTrackURL = value;
				});
				this._hasNextSrc = true;
			}

			this.progress.set(this._isWebkit && !this.isHLSPlayer ? this._player.currentTime * 2 : this._player.currentTime);

			/* This checks if the user is on an iOS device
				 due to the length of a song being doubled on iOS,
				 we have to cut the time in half. Doesn't effect other devices.
			*/

			if (this._isWebkit && this.isHLSPlayer === false && this._currentTime >= this._duration) {
				this.onEnded();
			}
		});

		this.onEvent("ended", async () => this.onEnded());

		this.onEvent("error", (event) => {
			if (this._player.error.message.includes("Empty src") || !this._player.error.message) return;

			console.error(this._player.error);
			this.handleError();
		});
	}

	// #endregion Private Methods (5)
}

export const AudioPlayer = new BaseAudioPlayer();

/** Updates the current track for the audio player */
export function updatePlayerSrc({ original_url, url }: SrcDict): void {
	AudioPlayer.updateSrc({ original_url, url });
}
