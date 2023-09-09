import { browser } from "$app/environment";
import { SessionListService } from "$stores/list/sessionList";
import { tweened } from "svelte/motion";
import { writable } from "svelte/store";
import { isAppleMobileDevice } from "./utils/browserDetection";
import type Hls from "hls.js";

type EventCallbackFn<T> = (data: T) => void;

class EventEmitter<Events extends Record<string, any>> {
	private listeners: Map<
		keyof Events,
		EventCallbackFn<Events[keyof Events] & string>[]
	> = new Map();
	constructor() {
		//
	}

	on<Key extends keyof Events = keyof Events & string>(
		name: Key,
		callback: EventCallbackFn<Events[Key]>,
	) {
		const listeners = this.listeners.get(name) ?? [];
		listeners.push(callback);
		this.listeners.set(name, listeners);
	}

	off<Key extends keyof Events = keyof Events & string>(
		name: Key,
		callback: EventCallbackFn<Events[Key]>,
	) {
		const listeners = this.listeners.get(name) ?? [];
		const index = listeners.indexOf(callback);

		if (index > 0) {
			listeners.splice(index, 1);
		}
		this.listeners.set(name, listeners);
	}

	dispatch<Key extends keyof Events = keyof Events & string>(
		name: Key,
		data: Events[Key],
	) {
		const listeners = this.listeners.get(name) ?? [];

		for (const cb of listeners) {
			cb?.(data);
		}
	}
}

const getPlayerVolumeFromLS = (player: HTMLAudioElement) => {
	const storedLevel = localStorage.getItem("volume");
	const setDefaultVolume = () => localStorage.setItem("volume", "0.5");
	if (storedLevel !== null) {
		try {
			player.volume = parseInt(storedLevel);
		} catch {
			setDefaultVolume();
		}
	} else {
		setDefaultVolume();
	}
};
interface AudioPlayerEvents {
	play: unknown;
	"update:stream_type": { type: "HLS" | "HTTP" };
}
// create an audio player that has the ability to switch between HTML5 Audio and HLS.js
// it should also be able to switch between the two on the fly
// and it should also handle the logic for prefetching the next track, the state of the player, etc.
class AudioSourceNode {
    private declare playerNode: HTMLAudioElement;
    private declare hls: Hls;

    private handlers: Map<string, EventCallbackFn<AudioPlayerEvents[keyof AudioPlayerEvents]>> = new Map();

    constructor() {
        if (!browser) return;
        
        const onUserInteractionCallback = () => {
            if (!this.playerNode) {
                this.setup();
            }
        }

        document.body.addEventListener("click", onUserInteractionCallback)
    }

    private onPlayerEvent(name: keyof HTMLMediaElementEventMap, callback: () => void) {
        if (!this.playerNode) this.setup();

        this.handlers.set(name, callback);
        this.playerNode.addEventListener(name, callback);
    }

    private removePlayerEvent(name: keyof HTMLMediaElementEventMap) {
        if (!this.playerNode) return;

        const handler = this.handlers.get(name);
        if (handler) {
            this.handlers.delete(name)
            this.playerNode.removeEventListener(name, handler);
        }
    }


    private setup() {
        this.playerNode = new Audio();
        getPlayerVolumeFromLS(this.playerNode);
        
        this.onPlayerEvent("play", () => {
            

}

class AudioPlayerImpl extends EventEmitter<{ c: string }> {
	private declare player: HTMLAudioElement;
	private audioNodeListeners: Record<string, () => void> = {};
	private nextSrc: { stale: boolean; url: string } = { stale: false, url: "" };
	private invalidationTimer: ReturnType<typeof setTimeout> | null = null;

	private _currentTimeStore = writable<number>(0);
	private _paused = writable(false);
	public get paused() {
		return this._paused;
	}
	public get currentTimeStore() {
		return this._currentTimeStore;
	}
	public set currentTimeStore(value) {
		this._currentTimeStore = value;
	}
	private _durationStore = writable<number>(0);
	public get durationStore() {
		return this._durationStore;
	}
	public get subscribe() {
		if (!this.$)
			return () => {
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				return () => {};
			};
		return this.$.subscribe;
	}
	private _progress = tweened<number>(0);
	public get progress() {
		return this._progress;
	}
	public set progress(value) {
		this._progress = value;
	}

	public setNextTrackPrefetchedUrl(trackUrl: string) {
		if (this.invalidationTimer) clearTimeout(this.invalidationTimer);

		const remainingTime = this.player.duration - this.player.currentTime;
		const halfwayTime = this.player.duration / 2;

		const timeoutDuration = Math.max(halfwayTime - remainingTime / 2, 0);
		this.invalidationTimer = setTimeout(() => {
			this.nextSrc.stale = true;
		}, timeoutDuration);
		this.nextSrc.url = trackUrl;
		this.nextSrc.stale = false;
	}

	public updateSrc({
		original_url,
		url,
	}: {
		original_url: string;
		url: string;
	}) {
		this.player.src = original_url;
	}
	constructor() {
		super();
		if (!browser) return;
		const onUserInteractionCallback = () => {
			if (!this.player) {
				this.createAudioNode();
			}
		};

		document.body.addEventListener("click", onUserInteractionCallback, {
			capture: true,
			once: true,
		});
	}
	public play() {
		const promise = this.player.play();
		if (promise) {
			promise
				.then(() => {
					this.player.play();
				})
				.catch((e) => console.error("ERROR", e));
		}
	}

	public pause() {
		this.player.pause();
	}

	private createAudioNode() {
		this.player = new Audio();
		this.player.autoplay = true;
		getPlayerVolumeFromLS(this.player);

		this.onEvent("timeupdate", async () => {
			this._currentTimeStore.set(this.player.currentTime);
			this._durationStore.set(
				isAppleMobileDevice ? this.player.duration / 2 : this.player.duration,
			);

			if (this.nextSrc.stale) {
				console.log("prefetching next track");
				await SessionListService.prefetchNextTrack();
			}
		});

		this.onEvent("play", () => {
			this._paused.set(true);
			const promise = this.player.play();
			if (promise) {
				promise
					.then(() => {
						this.player.play();
					})
					.catch((e) => console.error("ERROR", e));
			}
		});
	}
	private onEvent(name: keyof HTMLMediaElementEventMap, callback: () => void) {
		if (!this.player) this.createAudioNode();
		this.audioNodeListeners[name] = callback;
		this.player.addEventListener(name, callback);
	}
	public dispose() {
		for (const key in this.audioNodeListeners) {
			const callback = this.audioNodeListeners[key];
			this.player.removeEventListener(key, callback);
		}
	}
}

export const AudioPlayer = new AudioPlayerImpl();

export function updatePlayerSrc({ original_url, url }: SrcDict): void {
	AudioPlayer.updateSrc({ original_url, url });
}
