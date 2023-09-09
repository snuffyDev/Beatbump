import type { Item } from "$lib/types";
import type { Nullable } from "$lib/types/utilities";
import type { ResponseBody } from "$lib/utils/utils";
import type { Writable } from "svelte/store";

export interface ISessionListProvider {
	clickTrackingParams: Nullable<string>;
	continuation: string;
	currentMixId: string;
	currentMixType: "playlist" | "auto" | "local" | null;
	mix: Array<Item>;
	position: number;
	related?: {
		browseId: string;
		browseEndpointContextSupportedConfigs: {
			browseEndpointContextMusicConfig: {
				pageType: "MUSIC_PAGE_TYPE_TRACK_RELATED";
			};
		};
	} | null;
	visitorData: null | string;
}

export interface ISessionListService {
	/** Getter for clickTrackingParams */
	clickTrackingParams: string;
	/** Getter for continuation */
	continuation: string;
	/** Getter for currentMixId */
	currentMixId: string;
	/** Getter for mix */
	mix: Array<Item>;
	/** Getter for queue position */
	position: number;
	set: Writable<ISessionListProvider>["set"];
	subscribe: Writable<ISessionListProvider>["subscribe"];

	/**
	 * Fetches a set of similar songs and appends them to the current
	 * automix session
	 */
	getMoreLikeThis(args?: { playlistId?: Nullable<string> }): Promise<void>;
	/** Continues current automix session by fetching the next batch of songs */
	getSessionContinuation(args: {
		itct: string;
		videoId: string;
		playlistId: string;
		ctoken: string;
		clickTrackingParams: string;
		loggingContext?: { vssLoggingContext: { serializedContextData: string } };
		key: number;
	}): Promise<ResponseBody>;
	/** Initialize a new automix session */
	initAutoMixSession(args: {
		videoId?: string;
		playlistId?: string;
		keyId?: number;
		playlistSetVideoId?: string;
		loggingContext?: Nullable<{
			vssLoggingContext?: { serializedContextData: string };
		}>;
		clickTracking?: string;
		config?: { playerParams?: string; type?: string };
	}): Promise<void>;
	/** Initializes a new playlist session */
	initPlaylistSession(args: {
		playlistId: string;
		index: number;
		clickTrackingParams?: string;
		params?: string | undefined;
		videoId?: string;
		visitorData?: string;
		playlistSetVideoId?: string;
	}): Promise<{
		body: ResponseBody;
		error?: boolean | undefined;
	} | null>;
	lockedSet(_mix: ISessionListProvider): Promise<ISessionListProvider>;
	removeTrack(index: number): void;
	setMix(mix: Item[], type?: "auto" | "playlist" | "local"): void;
	/** Sets the item passed to the function to play next */
	setTrackWillPlayNext(item: Item, key: number): Promise<void>;
	shuffle(index: number, preserveBeforeActive?: boolean): void;
	shuffleRandom(items: Array<Item>): void;
	toJSON(): string;
	updatePosition(direction: "next" | "back" | number): Promise<number>;
}
