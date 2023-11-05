/* eslint-disable @typescript-eslint/no-inferrable-types */
import { browser } from "$app/environment";
import { SessionListService } from "$stores/list/sessionList";
import type { UserSettings } from "$stores/settings";
import Hls from "hls.js";
import { tick } from "svelte";
import { tweened } from "svelte/motion";
import { writable } from "svelte/store";
import { APIClient } from "./api";
import { sort, type PlayerFormats } from "./parsers/player";
import { settings, type ISessionListProvider } from "./stores";
import { groupSession, type ConnectionState } from "./stores/sessions";
import { syncTabs } from "./tabSync";
import type { Dict } from "./types/utilities";
import { WritableStore, notify, type ResponseBody } from "./utils";
import { isAppleMobileDevice } from "./utils/browserDetection";
import { objectKeys } from "./utils/collections/objects";
import { setWorkerInterval } from "./utils/workerTimeout";

let userSettings: UserSettings | undefined = undefined;

export type Callback<K extends keyof HTMLElementEventMap> = (
	this: HTMLElement,
	event: HTMLElementEventMap[K],
) => void;

export type Listeners = Map<string, Callback<keyof HTMLElementEventMap>[]>;

export interface IEventHandler {
	onEvent<K extends keyof HTMLElementEventMap>(type: K, cb: Callback<K>): void;
}

type SrcDict = { original_url: string; url: string; video_url?: string };

interface AudioPlayerEvents {
	play: unknown;
	"update:stream_type": { type: "HLS" | "HTTP" };
}

const setPosition = (currentTime: number, duration: number) => {
	if ("mediaSession" in navigator) {
		console.log({ currentTime, duration });
		navigator.mediaSession.setPositionState({
			duration: duration,
			position: currentTime,
		});
	}
};

function metaDataHandler({
	currentTime,
	duration,
	sessionList,
}: {
	currentTime: number;
	duration: number;
	sessionList: ISessionListProvider;
}) {
	if ("mediaSession" in navigator) {
		const position = sessionList.position;
		const currentTrack = sessionList.mix[position];

		const artwork = currentTrack?.thumbnails;

		console.debug({ currentTrack, position, mix: sessionList.mix });

		if (!currentTrack) return console.debug("no current track");
		navigator.mediaSession.metadata = new MediaMetadata({
			title: currentTrack?.title,
			artist: currentTrack?.artistInfo?.artist?.[0]?.text || "",
			album: currentTrack?.album?.title ?? undefined,
			artwork: artwork.reverse().map(({ url, width, height }) => ({
				src: url,
				sizes: `${width}x${height}`,
				type: "image/jpeg",
			})),
		});
		console.log({ metadata: navigator.mediaSession.metadata });
		navigator.mediaSession.setActionHandler("play", () => {
			AudioPlayer.play();
		});
		navigator.mediaSession.setActionHandler("pause", () => AudioPlayer.pause());
		navigator.mediaSession.setActionHandler("seekto", (session) => {
			if (session.fastSeek && "fastSeek" in AudioPlayer) {
				session.seekTime && AudioPlayer.fastSeek(session.seekTime);
				setPosition(
					session.seekTime ?? AudioPlayer.currentTime,
					AudioPlayer.duration,
				);
				return;
			}
			session.seekTime && AudioPlayer.seek(session.seekTime);

			setPosition(
				session.seekTime ?? AudioPlayer.currentTime,
				AudioPlayer.duration,
			);
		});
		navigator.mediaSession.setActionHandler("previoustrack", () =>
			SessionListService.previous(),
		);
		navigator.mediaSession.setActionHandler("nexttrack", () =>
			SessionListService.next(),
		);
		setPosition(currentTime, duration);
	}
}

export const updateGroupState = (opts: {
	client: string;
	state: ConnectionState;
}): void => groupSession.sendGroupState(opts);

export const updateGroupPosition = (
	dir: "<-" | "->" | undefined,
	position: number,
): void =>
	groupSession.send(
		"PATCH",
		"state.update.position",
		{ dir, position } as never,
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

const loadAndAttachHLS = async () => {
	const hls = await import("hls.js");
	const Hls = hls.default;
	if (Hls.isSupported() === false) return null;
	const hlsjsConfig = {
		lowLatencyMode: true,
		enableWorker: true,

		backBufferLength: 90,
	};
	return new Hls(hlsjsConfig);
};

const loadVideo = (player: HTMLVideoElement) => {
	return new Promise((resolve, reject) => {
		player.onloadeddata = () => {
			resolve(player);
		};
		player.onerror = (e) => {
			reject(e);
		};

		player.load();
	});
};

const getPlayerVolumeFromLS = (player: WritableStore<number>) => {
	const storedLevel = localStorage.getItem("volume");
	const setDefaultVolume = () => {
		localStorage.setItem("volume", "0.5");
		player.set(0.5);
	};

	if (storedLevel !== null) {
		try {
			player.set(+storedLevel);
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
	private _volumeStore = new WritableStore<number>(0);
	private _paused = writable(true);
	private _progress = tweened<number>(0);
	private _mode = new WritableStore<"audio" | "video">("audio");
	private _leechInterval: ReturnType<typeof setWorkerInterval> | null = null;
	private _taskQueue: [
		name: keyof AudioPlayerImpl,
		args: [...rest: unknown[]],
	][] = [];
	private hls: Hls | undefined;
	private _videoUrl = new WritableStore<string | undefined>(undefined);
	private audioNodeListeners: Record<string, () => void> = {};
	private invalidationTimer: ReturnType<typeof setTimeout> | null = null;
	private nextSrc: { stale: boolean; url: string | undefined } = {
		stale: false,
		url: "",
	};
	public async setType(type: "HLS" | "HTTP") {
		if (!this.player) {
			this.createAudioNode();
			window["_player"] = this.player;
		}
		// console.log(type);
		if (type === "HLS") {
			this.playerKind = Hls.isSupported() ? "hls" : "html5";
			if (this.playerKind !== "hls") return;
			if (!this.hls) {
				// console.log("loadHLS");
				await this.loadHLS();
			}
		}
		if (type === "HTTP") {
			this.playerKind = "html5";
			if (this.hls) {
				this.hls.destroy();
			}
		}
	}
	private declare player: HTMLAudioElement;
	private declare videoPlayer: HTMLVideoElement | undefined;
	private _repeat: string = "off";
	private playerKind: "hls" | "html5" = "html5";
	private declare unsubscriber: () => void;
	constructor() {
		super();
		if (browser) {
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
	}

	public get currentTimeStore() {
		return this._currentTimeStore;
	}
	public get currentTime() {
		return this._currentTimeStore.value;
	}

	public get mode() {
		return this._mode;
	}

	public get videoUrlStore() {
		return this._videoUrl;
	}

	public get videoNode() {
		return this.videoPlayer;
	}
	public set videoNode(node: HTMLVideoElement | undefined) {
		this.videoPlayer = node;
		if (this.videoPlayer && this._videoUrl.value) {
			this.videoPlayer.src = this._videoUrl.value;
			this.videoPlayer.load();
			this.videoPlayer.currentTime = this.currentTime;
			this.videoPlayer.play();
		}
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

	public get volume() {
		return this._volumeStore;
	}

	public setVolume(value: number) {
		if (!this.player) return;
		this._volumeStore.set(value);
	}

	public dispose() {
		const keys = objectKeys(this.audioNodeListeners);
		for (const key of keys) {
			const callback = this.audioNodeListeners[key];
			this.player.removeEventListener(key, callback);
		}
	}

	public pause() {
		syncTabs.playback({
			state: "pause",
			currentTime: this.currentTime,
			duration: this.duration,
		});
		if (this._leechInterval) {
			this._leechInterval.clear()?.then(() => {
				this._leechInterval = null;
			});
			return;
		} else {
			if (!this.player) {
				this.addTaskToTaskQueue("pause");
				return;
			}
			this.paused.set(true);
			this.player.pause();
		}
	}

	public play() {
		this.paused.set(false);
		if (!this.player) {
			this.addTaskToTaskQueue("play");
			return;
		}
		syncTabs.playback({
			state: "play",
			currentTime: this.currentTime,
			duration: this.duration,
		});
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

	/** Used when sync'ing a 'leech' tab */
	public async fakePlay(currentTime: number, duration: number) {
		if (this._leechInterval) await this._leechInterval.clear();
		this._paused.set(false);
		this._currentTimeStore.set(currentTime);
		this._durationStore.set(duration);

		this._leechInterval = setWorkerInterval(() => {
			this._currentTimeStore.set(this._currentTimeStore.value + 1);
		}, 1000);
	}

	public async updateSrc({
		url,
		videoUrl,
	}: {
		videoUrl?: string;
		url: string;
	}) {
		if (url === undefined) return;

		if (videoUrl && this.videoPlayer) {
			this.videoPlayer.src = videoUrl;
		}
		this._videoUrl.set(videoUrl);
		if (this.playerKind === "hls") {
			this.loadHLS(url);
		} else {
			this.player.src = url;
		}

		this.nextSrc.url = undefined;
		this.setStaleTimeout();
	}

	private addTaskToTaskQueue(name: keyof AudioPlayerImpl, ...args: unknown[]) {
		this._taskQueue.push([name, args]);
	}

	private async loadHLS(source?: string) {
		if (this.hls) this.hls.destroy();
		const hls = await loadAndAttachHLS();
		if (!hls) return;
		this.hls = hls;

		this.hls.attachMedia(this.player);

		this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
			this.hls?.loadSource(source || this.player.src);
		});

		this.hls.on(Hls.Events.ERROR, (_event, data) => {
			const type = data.type;
			switch (type) {
				case Hls.ErrorTypes.MEDIA_ERROR:
					this.hls?.recoverMediaError();
					break;
				case Hls.ErrorTypes.NETWORK_ERROR:
					this.hls?.startLoad();
					break;
				default:
			}
		});
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
			await SessionListService.previous();
			return true;
		} else if (this._repeat === "track") {
			return false;
		}
	}

	private createAudioNode() {
		let locked = false;
		this.player = new Audio();
		this.player.autoplay = true;

		getPlayerVolumeFromLS(this._volumeStore);

		const modeSubscription = this._mode.subscribe(async (value) => {
			await tick();
			if (value === "audio") {
				if (this.videoPlayer) {
					this.videoPlayer.pause();
					this.videoPlayer.autoplay = false;
				}
			} else {
				if (this.videoPlayer) {
					await tick();
					this.videoPlayer.autoplay = true;
					await this.videoPlayer.play();
					this.videoPlayer.currentTime = this.player.currentTime;
				}
			}
		});
		const volumeSubscription = this._volumeStore.subscribe((value) => {
			this.player.volume = value;
			localStorage.setItem("volume", value.toString());
		});

		window.addEventListener("pagehide", ({ persisted }) => {
			if (persisted) return;
			this?.dispose?.();
			volumeSubscription();
			modeSubscription();
			this.player.remove();
			this.videoPlayer?.remove();
		});

		this.onEvent("loadedmetadata", async () => {
			this._paused.set(false);
			if (this.videoNode)
				await loadVideo(this.videoNode).then(async () => {
					await tick();
					if (this.videoNode)
						this.videoNode.currentTime = this.player.currentTime;
				});

			await this.videoPlayer?.play();
			await tick();
			groupSession.resetAllCanPlay();

			this.setStaleTimeout();
			this.nextSrc.url = undefined;
			this._currentTimeStore.set(this.player.currentTime);

			const duration = isAppleMobileDevice
				? this.player.duration / 2
				: this.player.duration;
			this._durationStore.set(duration);

			if (syncTabs.role === "host") {
				syncTabs.updatePosition(SessionListService.position);
				syncTabs.playback({
					state: "play",
					currentTime: this.currentTime,
					duration: this.duration,
				});
			}

			metaDataHandler({
				duration: this.player.duration,
				currentTime: this.player.currentTime,
				sessionList: SessionListService.$.value,
			});
		});

		this.onEvent("play", () => {
			this._paused.set(false);
			this.play();
		});

		this.onEvent("seeked", () => {
			if (this.videoPlayer && this._mode.value === "video") {
				this.videoPlayer.currentTime = this.player.currentTime;
			}
		});

		this.onEvent("timeupdate", async () => {
			this._currentTimeStore.set(this.player.currentTime);
			const duration = isAppleMobileDevice
				? this.player.duration / 2
				: this.player.duration;

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
					console.log({ nextSrc: this.nextSrc });
					return await SessionListService.next(this.nextSrc.url).finally(() => {
						locked = false; // Unlock this 'if' block when finished
						this.nextSrc.url = undefined; // Set to undefined since e 'used' the value
					});
				} finally {
					locked = false;
					this.nextSrc.url = undefined; // Set to undefined since e 'used' the value
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

		this.on("update:stream_type", async ({ type }) => {
			console.log("update:stream_type", type);
			this.setType(type);
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
export function updatePlayerSrc({ url, video_url }: SrcDict): void {
	AudioPlayer.updateSrc({ url, videoUrl: video_url });
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
		const res = (await APIClient.player({
			videoId,
			playerParams: params,
			playlistId,
		})) as Dict<Record<string, string>>;
		if (
			res &&
			!res?.streamingData &&
			res?.playabilityStatus?.status === "UNPLAYABLE"
		) {
			return handleError();
		}
		const formats = sort({
			data: res,
			dash: false,
			$proxySettings: userSettings?.network || settings.value()["network"],
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
		updatePlayerSrc({
			video_url: formats.video,
			original_url: format.original_url,
			url: format.url,
		});
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

if (browser && globalThis.self.name !== "IDB" && settings) {
	settings.subscribe((value) => {
		userSettings = value;
		if (userSettings?.playback?.Stream) {
			AudioPlayer.setType(userSettings.playback.Stream);
		}
	});
}
