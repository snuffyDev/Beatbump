/* eslint-disable @typescript-eslint/no-inferrable-types */
import { browser } from "$app/environment";
import { SessionListService } from "$stores/list/sessionList";
import type { UserSettings } from "$stores/settings";
import { tweened } from "svelte/motion";
import { writable } from "svelte/store";
import { sort, type PlayerFormats } from "./parsers/player";
import { settings } from "./stores";
import { groupSession, type ConnectionState } from "./stores/sessions";
import type { JSON } from "./types";
import { WritableStore, notify, type ResponseBody } from "./utils";
import { isAppleMobileDevice } from "./utils/browserDetection";

let userSettings: UserSettings | undefined = undefined;

if (browser && globalThis.self.name !== "IDB" && settings) {
	settings.subscribe((value) => {
		userSettings = value;
	});
}

export type Callback<K extends keyof HTMLElementEventMap> = (
	this: HTMLElement,
	event: HTMLElementEventMap[K],
) => void;

export type Listeners = Map<string, Callback<keyof HTMLElementEventMap>[]>;

export interface IEventHandler {
	onEvent<K extends keyof HTMLElementEventMap>(type: K, cb: Callback<K>): void;
}

type SrcDict = { original_url: string; url: string };

interface AudioPlayerEvents {
	play: unknown;
}
const setPosition = () => {
	if ("mediaSession" in navigator) {
		navigator.mediaSession.setPositionState({
			duration: isAppleMobileDevice
				? AudioPlayer.duration / 2
				: AudioPlayer.duration,
			position: AudioPlayer.currentTime,
		});
	}
};

function metaDataHandler() {
	if ("mediaSession" in navigator) {
		const position = SessionListService.position;
		const currentTrack = SessionListService.mix[position];
		navigator.mediaSession.metadata = new MediaMetadata({
			title: currentTrack?.title,
			artist: currentTrack?.artistInfo?.artist?.[0]?.text || "",
			album: currentTrack?.album?.title ?? undefined,
			artwork: [
				{
					src: currentTrack?.thumbnails[currentTrack?.thumbnails.length - 1]
						.url,
					sizes: `${
						currentTrack?.thumbnails[currentTrack?.thumbnails.length - 1].width
					}x${
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
			if (session.fastSeek && "fastSeek" in AudioPlayer) {
				session.seekTime && AudioPlayer.fastSeek(session.seekTime);
				setPosition();
				return;
			}
			session.seekTime && AudioPlayer.seek(session.seekTime);

			setPosition();
		});
		navigator.mediaSession.setActionHandler("previoustrack", () =>
			SessionListService.previous(),
		);
		navigator.mediaSession.setActionHandler("nexttrack", () =>
			SessionListService.next(),
		);
	}
}

// eslint-disable-next-line import/no-unused-modules
export const updateGroupState = (opts: {
	client: string;
	state: ConnectionState;
}): void => groupSession.sendGroupState(opts);

// eslint-disable-next-line import/no-unused-modules
export const updateGroupPosition = (
	dir: "<-" | "->" | undefined,
	position: number,
): void =>
	groupSession.send(
		"PATCH",
		"state.update.position",
		{ dir, position } as unknown as JSON,
		groupSession.client,
	);

// Helper to generate a fallback URL if the current src fails to play
function createFallbackUrl(currentUrl: string) {
	if (typeof currentUrl !== "string")
		throw Error(
			`Expected parameter 'currentUrl' to be a string, received ${currentUrl}`,
		);
	const srcUrl = new URL(currentUrl);

	if (!srcUrl.hostname.includes("googlevideo.com")) return currentUrl;

	// example: [ rr4---sn-p5ql61yl , googlevideo , com ]
	const [subdomain, domain, ext] = srcUrl.hostname.split(".");

	const fvip = srcUrl.searchParams.get("fvip") ?? "";
	// comma-separated list of fallback server hosts
	const mn = srcUrl.searchParams.get("mn") ?? "";

	let [preDashes, postDashes] = subdomain.split("---");
	// step 1: replace digits in first part of subdomain with fvip
	preDashes = preDashes.replace(/\d/g, fvip);

	// step 2: use one of the fallback server names found in mn
	postDashes = mn.split(",")[1];

	/**  */
	srcUrl.hostname = `${`${preDashes}---${postDashes}`}.${domain}.${ext}`;

	return srcUrl.toString();
}

type EventCallbackFn<T> = (data: T) => void;

class EventEmitter<Events> {
	private listeners: Map<
		keyof Events,
		EventCallbackFn<Events[keyof Events]>[]
	> = new Map();

	constructor() {
		//
	}

	dispatch<Key extends keyof Events = keyof Events>(
		name: Key,
		data: Events[Key],
	) {
		const listeners = this.listeners.get(name) ?? [];

		for (const cb of listeners) {
			cb?.(data);
		}
	}

	off<Key extends keyof Events = keyof Events>(
		name: Key,
		callback: EventCallbackFn<Events[Key]>,
	) {
		const listeners = this.listeners.get(name) ?? [];
		const index = listeners.indexOf(callback as never);

		if (index > 0) {
			listeners.splice(index, 1);
		}
		this.listeners.set(name, listeners);
	}

	on<Key extends keyof Events = keyof Events & string>(
		name: Key,
		callback: EventCallbackFn<Events[Key]>,
	) {
		const listeners = this.listeners.get(name) ?? [];
		listeners.push(callback as never);
		this.listeners.set(name, listeners);
	}
}

const getPlayerVolumeFromLS = (player: HTMLAudioElement) => {
	const storedLevel = localStorage.getItem("volume");
	const setDefaultVolume = () => {
		localStorage.setItem("volume", "0.5");
		player.volume = 0.5;
	};
	if (storedLevel !== null) {
		try {
			player.volume = +storedLevel;
		} catch {
			setDefaultVolume();
		}
	} else {
		setDefaultVolume();
	}
};
class AudioPlayerImpl extends EventEmitter<AudioPlayerEvents> {
	private _currentTimeStore = new WritableStore<number>(0);
	private _durationStore = new WritableStore<number>(0);
	private _paused = writable(true);
	private _progress = tweened<number>(0);
	private _taskQueue: [
		name: keyof AudioPlayerImpl,
		args: [...rest: unknown[]],
	][] = [];
	private audioNodeListeners: Record<string, () => void> = {};
	private invalidationTimer: ReturnType<typeof setTimeout> | null = null;
	private nextSrc: { stale: boolean; url: string | undefined } = {
		stale: false,
		url: "",
	};
	private declare player: HTMLAudioElement;
	private _repeat: string = "off";

	constructor() {
		super();
		if (!browser) return;
		const onUserInteractionCallback = () => {
			if (!this.player) {
				this.createAudioNode();
				window["_player"] = this.player;
			}
		};

		document.addEventListener("click", onUserInteractionCallback, {
			capture: true,
			once: true,
		});
	}

	public get currentTimeStore() {
		return this._currentTimeStore;
	}
	public get currentTime() {
		return this._currentTimeStore.value;
	}

	public repeat(state: "off" | "track" | "playlist") {
		if (state === "track") {
			this.player.loop = true;
		} else this.player.loop = false;

		this._repeat = state;
	}

	public get fastSeek() {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		return this.player
			? "fastSeek" in this.player
				? this.player.fastSeek
				: // eslint-disable-next-line @typescript-eslint/no-unused-vars
				  (_number: number) => {
						//
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
				  }
			: // eslint-disable-next-line @typescript-eslint/no-unused-vars
			  (_number: number) => {
					//
			  };
	}

	public get durationStore() {
		return this._durationStore;
	}

	public get duration() {
		return this._durationStore.value;
	}
	public get paused() {
		return this._paused;
	}

	public get progress() {
		return this._progress;
	}

	public set progress(value) {
		this._progress = value;
	}

	public get subscribe() {
		return () => {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			return () => {};
		};
	}

	public set volume(value: number) {
		if (!this.player) return;
		this.player.volume = value;
	}

	public dispose() {
		for (const key in this.audioNodeListeners) {
			const callback = this.audioNodeListeners[key];
			this.player.removeEventListener(key, callback);
		}
	}

	public pause() {
		if (!this.player) {
			this.addTaskToTaskQueue("pause");
			return;
		}
		this.paused.set(true);
		this.player.pause();
	}

	public play() {
		this.paused.set(false);
		if (!this.player) {
			this.addTaskToTaskQueue("play");
			return;
		}
		if (
			groupSession.initialized === true &&
			groupSession.hasActiveSession === true
		) {
			updateGroupState({
				client: groupSession.client.clientId,
				state: {
					finished: this.player.ended,
					paused: false,
					playing: true,
					pos: SessionListService.position,
					stalled: !!this.player.error,
				} as ConnectionState,
			});
		}
		const promise = this.player.play();
		if (promise) {
			promise
				.then(() => {
					this.player.play();
				})
				.catch((e) => console.error("ERROR", e));
		}
	}

	public seek(to: number) {
		if (to < this.durationStore.value / 2) this.setStaleTimeout();

		this.player.currentTime = to;
		this._progress.set(this.player.currentTime, { duration: 10 });
	}

	public setNextTrackPrefetchedUrl(trackUrl: string) {
		this.nextSrc.url = trackUrl;
		this.nextSrc.stale = false;
	}

	public updateSrc({ url }: { url: string }) {
		this.player.src = url;
	}

	private addTaskToTaskQueue(name: keyof AudioPlayerImpl, ...args: unknown[]) {
		this._taskQueue.push([name, args]);
	}
	private errorCount = 0;
	private handleError() {
		if (++this.errorCount > 2) {
			this.errorCount = 0;
			this.updateSrc({
				url: createFallbackUrl(this.player.src),
			});
		}
	}

	private async handleRepeat() {
		if (
			this._repeat === "playlist" &&
			SessionListService.$.value.position >=
				SessionListService.$.value.mix.length - 1
		) {
			await SessionListService.updatePosition(1);
			await SessionListService.previous(true);
			return true;
		} else if (this._repeat === "track") {
			return false;
		}
	}

	private createAudioNode() {
		let locked = false;
		this.player = new Audio();
		this.player.autoplay = true;
		getPlayerVolumeFromLS(this.player);
		const prefetchLock = (() => {
			let initial = this.player.src;
			let tick = 0;
			let promise: Promise<unknown> | undefined = Promise.resolve();
			const setPromiseAndReturn = (duration: number) => {
				promise = new Promise<void>((resolve) => {
					if (
						!tick &&
						this.nextSrc.stale &&
						this.player.currentTime >= duration / 2
					) {
						initial = this.player.src;
						tick += 1;
						if (this.nextSrc.stale)
							SessionListService.prefetchNextTrack().finally(() => {
								this.setStaleTimeout();
							});
					} else if (tick && this.player.src === initial) return false;
					else if (tick && this.player.src !== initial) {
						tick = 0;
						promise = undefined;
						this.nextSrc.url = undefined;

						return resolve(undefined as never);
					}
				});
				return promise;
			};
			return (duration: number) => {
				return !tick ? setPromiseAndReturn(duration) : promise;
			};
		})();

		// Dispatched on first autoplay
		this.on("play", () => {
			this.play();
		});

		this.onEvent("loadedmetadata", () => {
			this._paused.set(false);
			groupSession.resetAllCanPlay();

			this.setStaleTimeout();
			metaDataHandler();
		});

		this.onEvent("play", () => {
			this._paused.set(false);
			this.play();
		});

		this.onEvent("timeupdate", async () => {
			this._currentTimeStore.set(this.player.currentTime);
			const duration = isAppleMobileDevice
				? this.player.duration / 2
				: this.player.duration;
			this._durationStore.set(duration);

			// We're at the end - get the next track!
			if (this.player.currentTime >= duration - 0.1 && !locked) {
				try {
					if (this._repeat !== "off") {
						const allowContinuation = await this.handleRepeat();
						if (allowContinuation === false) {
							return;
						}
					}
					if (!locked) locked = true;

					if (groupSession.initialized) {
						return await Promise.resolve(
							updateGroupState({
								client: groupSession.client.clientId,
								state: {
									finished: true,
									paused: true,
									playing: false,
									pos: SessionListService.position,
									stalled: !!this.player.error,
								} as ConnectionState,
							}),
						).then(() => {
							const [allCanPlay, fn] = groupSession.allCanPlay();
							if (allCanPlay) {
								fn();
								locked = false;
							}
						});
					}
					if (groupSession.hasActiveSession && !groupSession.allCanPlay) return;
					return await SessionListService.next(this.nextSrc.url).finally(() => {
						locked = false; // Unlock this 'if' block when finished
						this.nextSrc.url = undefined; // Set to undefined since e 'used' the value
					});
				} finally {
					locked = false;
				}
			}
		});

		this.onEvent("error", () => {
			if (
				this.player?.error?.message.includes("Empty src") ||
				!this.player?.error?.message
			)
				return;

			console.error(this.player.error);
			this.handleError();
		});

		// If there's any actions (eg: set volume) that take place before
		// we're setup, they'll be put in the taskQueue - process them here
		if (this._taskQueue.length) {
			while (this._taskQueue.length) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const [name, args] = this._taskQueue.shift()!;
				const method = this[name];
				//@ts-expect-error It's fine
				if (typeof method === "function") method(...args);
			}
		}
	}
	private onEvent(name: keyof HTMLMediaElementEventMap, callback: () => void) {
		if (!this.player) this.createAudioNode();
		this.audioNodeListeners[name] = callback;
		this.player.addEventListener(name, callback);
	}

	private setStaleTimeout() {
		if (this.invalidationTimer) clearTimeout(this.invalidationTimer);

		const remainingTime = this.player.duration - this.player.currentTime;
		const halfwayTime = this.player.duration / 2;

		const timeoutDuration = Math.max(halfwayTime - remainingTime / 2, 0);
		this.invalidationTimer = setTimeout(() => {
			this.nextSrc.stale = true;
		}, timeoutDuration);
	}
}

export const AudioPlayer = new AudioPlayerImpl();

/** Updates the current track for the audio player */
export function updatePlayerSrc({ url }: SrcDict): void {
	AudioPlayer.updateSrc({ url });
}

// Get source URLs
export const getSrc = async (
	videoId?: string,
	playlistId?: string,
	params?: string,
	shouldAutoplay = true,
): Promise<
	| {
			body: ResponseBody | null;
			error: boolean;
	  }
	| undefined
> => {
	try {
		const res = await fetch(
			`/api/v1/player.json?videoId=${videoId}${
				playlistId ? `&playlistId=${playlistId}` : ""
			}${params ? `&playerParams=${params}` : ""}`,
		).then((res) => res.json());
		if (
			res &&
			!res?.streamingData &&
			res?.playabilityStatus.status === "UNPLAYABLE"
		) {
			return handleError();
		}
		const formats = sort({
			data: res,
			dash: false,
			proxyUrl: userSettings?.network["HLS Stream Proxy"] ?? "",
		});

		const src = setTrack(formats, shouldAutoplay);

		return src;
	} catch (err) {
		console.error(err);
		notify(err as string, "error");
	}
};

function setTrack(formats: PlayerFormats, shouldAutoplay: boolean) {
	let format = undefined;
	if (userSettings?.playback?.Stream === "HLS") {
		format = { original_url: formats?.hls || "", url: formats.hls || "" };
	} else {
		format = formats.streams?.[0];
	}
	if (format && shouldAutoplay)
		updatePlayerSrc({ original_url: format.original_url, url: format.url });
	return {
		body: format
			? { original_url: format.original_url, url: format.url }
			: null,
		error: false,
	};
}

function handleError() {
	console.log("error");

	notify(
		"An error occurred while initiating playback, skipping...",
		"error",
		"getNextTrack",
	);
	return {
		body: null,
		error: true,
	};
}
