import type { Item } from "$lib/types";
import type { Nullable } from "$lib/types/utilities";
import type { Writable } from "svelte/store";

export interface ISessionListProvider {
	currentMixId: string;
	continuation: string;
	clickTrackingParams: string;
	mix: Array<Item>;
	position: number;
	currentMixType: "playlist" | "auto" | "local" | string;
}

export interface ISessionListService {
	subscribe: Writable<ISessionListProvider>["subscribe"];
	set: Writable<ISessionListProvider>["set"];
	lockedSet(_mix: ISessionListProvider): Promise<ISessionListProvider>;
	/** Initialize a new automix session */
	initAutoMixSession(args: {
		videoId?: string;
		playlistId?: string;
		keyId?: number;
		playlistSetVideoId?: string;
		clickTracking?: string;
		config?: { playerParams?: string; type?: string };
	}): Promise<void>;
	/** Initializes a new playlist session */
	initPlaylistSession(args: {
		playlistId: string;
		index?: number;
		params?: string | undefined;
	}): Promise<{ body: { original_url: string; url: string }; error?: boolean }>;

	/** Continues current automix session by fetching the next batch of songs */
	getSessionContinuation(args: {
		itct: string;
		videoId: string;
		playlistId: string;
		ctoken: string;
		clickTrackingParams: string;
		key: number;
	});

	/**
	 * Fetches a set of similar songs and appends them to the current
	 * automix session
	 */
	getMoreLikeThis(args?: { playlistId?: Nullable<string> }): Promise<void>;

	/** Sets the item passed to the function to play next */
	setTrackWillPlayNext(item: Item, key: number): Promise<void>;

	setMix(mix: Item[], type?: "auto" | "playlist" | "local"): void;

	removeTrack(index: number): void;

	shuffleRandom(items: Array<Item>): void;

	shuffle(index: number, preserveBeforeActive?: boolean): void;

	toJSON(): string;

	updatePosition(direction: "next" | "back" | number): number;
	/** Getter for queue position */
	position: number;
	/** Getter for mix */
	mix: Array<Item>;
	/** Getter for currentMixId */
	currentMixId: string;
	/** Getter for clickTrackingParams */
	clickTrackingParams: string;
	/** Getter for continuation */
	continuation: string;
}
