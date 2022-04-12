/* eslint-disable @typescript-eslint/no-empty-function */
interface HTMLMediaElement {
	/** Gets or sets a value that indicates whether to start playing the media automatically. */
	autoplay: boolean;
	/** Gets a collection of buffered time ranges. */
	readonly buffered: TimeRanges;
	/** Gets or sets a flag that indicates whether the client provides a set of controls for the media (in case the developer does not include controls for the player). */
	controls: boolean;
	crossOrigin: string | null;
	/** Gets the address or URL of the current media resource that is selected by IHTMLMediaElement. */
	readonly currentSrc: string;
	/** Gets or sets the current playback position, in seconds. */
	currentTime: number;
	defaultMuted: boolean;
	/** Gets or sets the default playback rate when the user is not using fast forward or reverse for a video or audio resource. */
	defaultPlaybackRate: number;
	disableRemotePlayback: boolean;
	/** Returns the duration in seconds of the current media resource. A NaN value is returned if duration is not available, or Infinity if the media resource is streaming. */
	readonly duration: number;
	/** Gets information about whether the playback has ended or not. */
	readonly ended: boolean;
	/** Returns an object representing the current error state of the audio or video element. */
	readonly error: MediaError | null;
	/** Gets or sets a flag to specify whether playback should restart after it completes. */
	loop: boolean;
	/** Available only in secure contexts. */
	readonly mediaKeys: MediaKeys | null;
	/** Gets or sets a flag that indicates whether the audio (either audio or the audio track on video media) is muted. */
	muted: boolean;
	/** Gets the current network activity for the element. */
	readonly networkState: number;
	onencrypted:
		| ((this: HTMLMediaElement, ev: MediaEncryptedEvent) => any)
		| null;
	onwaitingforkey: ((this: HTMLMediaElement, ev: Event) => any) | null;
	/** Gets a flag that specifies whether playback is paused. */
	readonly paused: boolean;
	/** Gets or sets the current rate of speed for the media resource to play. This speed is expressed as a multiple of the normal speed of the media resource. */
	playbackRate: number;
	/** Gets TimeRanges for the current media resource that has been played. */
	readonly played: TimeRanges;
	/** Gets or sets a value indicating what data should be preloaded, if any. */
	preload: "none" | "metadata" | "auto" | "";
	readonly readyState: number;
	readonly remote: RemotePlayback;
	/** Returns a TimeRanges object that represents the ranges of the current media resource that can be seeked. */
	readonly seekable: TimeRanges;
	/** Gets a flag that indicates whether the client is currently moving to a new playback position in the media resource. */
	readonly seeking: boolean;
	/** The address or URL of the a media resource that is to be considered. */
	src: string;
	srcObject: MediaProvider | null;
	readonly textTracks: TextTrackList;
	/** Gets or sets the volume level for audio portions of the media element. */
	volume: number;
	addTextTrack(
		kind: TextTrackKind,
		label?: string,
		language?: string
	): TextTrack;
	/** Returns a string that specifies whether the client can play a given media resource type. */
	canPlayType(type: string): CanPlayTypeResult;
	fastSeek(time: number): void;
	/** Resets the audio or video object and loads a new media resource. */
	load(): void;
	/** Pauses the current playback and sets paused to TRUE. This can be used to test whether the media is playing or paused. You can also use the pause or play events to tell whether the media is playing or not. */
	pause(): void;
	/** Loads and starts playback of a media resource. */
	play(): Promise<void>;
	/** Available only in secure contexts. */
	setMediaKeys(mediaKeys: MediaKeys | null): Promise<void>;
	readonly HAVE_CURRENT_DATA: number;
	readonly HAVE_ENOUGH_DATA: number;
	readonly HAVE_FUTURE_DATA: number;
	readonly HAVE_METADATA: number;
	readonly HAVE_NOTHING: number;
	readonly NETWORK_EMPTY: number;
	readonly NETWORK_IDLE: number;
	readonly NETWORK_LOADING: number;
	readonly NETWORK_NO_SOURCE: number;
	addEventListener<K extends keyof HTMLMediaElementEventMap>(
		type: K,
		listener: (this: HTMLMediaElement, ev: HTMLMediaElementEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	): void;
	removeEventListener<K extends keyof HTMLMediaElementEventMap>(
		type: K,
		listener: (this: HTMLMediaElement, ev: HTMLMediaElementEventMap[K]) => any,
		options?: boolean | EventListenerOptions
	): void;
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions
	): void;
}
interface HTMLAudioElement extends HTMLMediaElement {
	addEventListener<K extends keyof HTMLMediaElementEventMap>(
		type: K,
		listener: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any,
		options?: boolean | AddEventListenerOptions
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	): void;
	removeEventListener<K extends keyof HTMLMediaElementEventMap>(
		type: K,
		listener: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any,
		options?: boolean | EventListenerOptions
	): void;
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions
	): void;
}

export type { HTMLAudioElement, HTMLMediaElement };
