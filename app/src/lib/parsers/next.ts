import type { Item, Song } from "$lib/types";
import type { IPlaylistPanelVideoRenderer } from "../types/playlistPanelVideoRenderer";
import { PlaylistPanelVideoRenderer } from "./items/playlistPanelVideoRenderer";
import { filterMap } from "$lib/utils/collections";

type PanelAlias = { playlistPanelVideoRenderer: IPlaylistPanelVideoRenderer };

function parseItem(item: Song) {
	if ("playlistPanelVideoRenderer" in item) {
		return PlaylistPanelVideoRenderer(item["playlistPanelVideoRenderer"] as IPlaylistPanelVideoRenderer) as Item;
	}
}
function filterItem(item: Song | PanelAlias) {
	return !!item;
}
export function parseContents(
	contents: Array<Song | PanelAlias> = [],
	continuation: string,
	clickTrackingParams: string,
	current: any,
	visitorData: string,
): {
	results: Array<Item>;
	continuation: string;
	clickTrackingParams: string;
	currentMixId: string;
	visitorData: string;
} {
	const currentMix = current.playlistId;
	return {
		currentMixId: currentMix,
		continuation: continuation,
		clickTrackingParams: clickTrackingParams,
		visitorData,
		results: filterMap<Song | PanelAlias, Item>(contents, parseItem, filterItem),
	};
}
