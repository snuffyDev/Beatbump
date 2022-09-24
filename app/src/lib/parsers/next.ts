import type { Song } from "$lib/types";
import type { IPlaylistPanelVideoRenderer } from "../types/playlistPanelVideoRenderer";
import { PlaylistPanelVideoRenderer } from "./items/playlistPanelVideoRenderer";
import { filterMap } from "$lib/utils/collections";

type PanelAlias = { playlistPanelVideoRenderer: IPlaylistPanelVideoRenderer };

function parseItem(item: Song | PanelAlias) {
	if ((item as Record<string, any>)?.playlistPanelVideoRenderer) {
		return PlaylistPanelVideoRenderer(item["playlistPanelVideoRenderer"]) as Song;
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
	results: Array<Song | PanelAlias>;
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
		results: filterMap(contents, parseItem, filterItem),
	};
}
