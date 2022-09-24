/* eslint-disable @typescript-eslint/no-inferrable-types */
import { browser } from "$app/environment";
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
import { Mutex, EventEmitter } from "$lib/utils/sync";
import { WritableStore } from "./utils/stores";
import { getSrc, type ResponseBody } from "./utils/utils";
import type HLS from "hls.js";
import { settings } from "./stores";
import type { StreamType } from "$stores/settings";
import { tick } from "svelte";

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

interface AudioPlayerEvents {
	"update:stream_type": { type: StreamType };
	play: SrcDict;
	playing: undefined;
}

const e: AudioPlayerEvents = {};

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
	private _player: HTMLAudioElement = undefined;
	private _remainingTime: number = 0;
	private _repeat: "track" | "playlist" | "off" = "off";
	playerType: "NATIVE" | "HLS.JS" | "UNSUPPORTED" = undefined;
	private _src: WritableStore<string> = new WritableStore("");
	private _worksWithHLSjs = new WritableStore(false);
	private _streamType: "HTTP" | "HLS";
	private currentSessionList = () => get(SessionListService);

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
		this._isWebkit = /i(Phone|Pad|Pod)/i.test(navigator.userAgent);

		this._player = new Audio();
		// const setup = async () => {
		// 	if (browser) {
		// 		const module = await import("dashjs");

		// 		this._DashModule = module;

		// 		this._DashJS = module.MediaPlayer().create();
		// 		this._DashJS.initialize(this._player, "", true);
		// 	}
		// };
		// setup();

		this._player.volume = 0.5;
		this._player.autoplay = true;
		this._player.preload = "metadata";

		this._durationUnsubscriber = this._durationStore.subscribe((value) => {
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

		const sessionList = this.currentSessionList();
		const canAllPlay = groupSession.allCanPlay();
		let position = sessionList.position;

		if (this._repeat === "playlist" && sessionList.position === sessionList.mix.length - 1) {
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
			if (position === sessionList.mix.length - 1) updateGroupPosition("->", position - 1);
			else updateGroupPosition("->", position - 1);
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

		this._paused.set(true);
		this._player.pause();
	}

	public play(event: Nullable<Event> = null): void {
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
					// this._player.load();
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
	}

	public previous(broadcast = false): void {
		const position = this.currentSessionList().position;
		if (position === 0) {
			Logger.log("There's nothing that way!");
			return;
		}
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
			this._player.currentTime = time;
		}
		this._currentTimeStore.set(time);
	}

	public skip(): void {
		this.currentTimeStore.set((this._player.duration - 1) * 2);
	}

	public updateSrc(dict: SrcDict | Promise<SrcDict>): void {
		if (dict instanceof Promise) {
			dict.then((result) => {
				this.__srcUrl = result?.original_url;
				this._src.set(result?.url);
			});
			return;
		}

		this.__srcUrl = dict?.url;
		this._src.set(this.__srcUrl);
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
				ctoken: sessionList.continuation,
				clickTrackingParams: sessionList.clickTrackingParams,
				key: position,
			});
		}

		try {
			this.__tick = false;
			const response = await this.getTrackSrc(position, shouldAutoplay).then((value) => {
				function hasProperty(input: unknown): input is ResponseBody {
					return (input as ResponseBody).url !== undefined;
				}

				if (hasProperty(value)) return value;
			});
			return response;
		} catch (error) {
			// this.getTrackSrc(position + 1);
		}
	}

	private getTrackSrc(position: number, shouldAutoplay = true): Promise<true | void | ResponseBody> {
		const sessionList = this.currentSessionList();
		return getSrc(sessionList.mix[position].videoId, sessionList.mix[position].playlistId, null, shouldAutoplay)
			.then(({ body, error }) => {
				if (error === true) {
					// this.next();
					this.skip();
					return error;
				}
				return body;
			})
			.catch((err: MediaError & Error) => {
				if (err.message.includes("The play() request was interrupted")) return;
				notify(`${err.name}: ${err.message}`, "error");
				return;
			});
	}

	private async handleAutoSuggestion(position: number): Promise<ResponseBody> {
		await SessionListService.getMoreLikeThis({ playlistId: this.currentSessionList().currentMixId });
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
		this.__tick = false;
	}
	private async onEnded() {
		if (this._repeat === "track") return;
		const currentList = this.currentSessionList();
		const isLastSong = currentList.position === currentList.mix.length - 1;
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

		this._player.addEventListener("timeupdate", async () => {
			this._currentTimeStore.set(this._player.currentTime);
			this._durationStore.set(this._isWebkit && !this.isHLSPlayer ? this._player.duration / 2 : this._player.duration);

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

			if (this._isWebkit && this.isHLSPlayer === false && this._currentTime >= this._duration - 2) {
				this.next();
			}
		});

		this._player.addEventListener("ended", async () => this.onEnded());
	}

	// #endregion Private Methods (5)
}

export const AudioPlayer = new BaseAudioPlayer();

/** Updates the current track for the audio player */
export function updatePlayerSrc({ original_url, url }: SrcDict): void {
	AudioPlayer.updateSrc({ original_url, url });
}
