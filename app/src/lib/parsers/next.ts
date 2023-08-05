import type { Item, Song } from "$lib/types";
import type { IPlaylistPanelVideoRenderer } from "../types/playlistPanelVideoRenderer";
import { PlaylistPanelVideoRenderer } from "./items/playlistPanelVideoRenderer";

type PanelAlias = { playlistPanelVideoRenderer: IPlaylistPanelVideoRenderer };

function parseItem(item: Song) {
	if ("playlistPanelVideoRenderer" in item) {
		return PlaylistPanelVideoRenderer(
			item["playlistPanelVideoRenderer"] as IPlaylistPanelVideoRenderer,
		) as Promise<Item>;
	}
}

export async function parseContents(
	contents: Array<Song | PanelAlias> = [],
	continuation: string,
	clickTrackingParams: string,
	current: any,
	visitorData: string,
): Promise<{
	results: Array<Item>;
	continuation: string;
	clickTrackingParams: string;
	currentMixId: string;
	visitorData: string;
}> {
	const currentMix = current.playlistId;
	return {
		currentMixId: currentMix,
		continuation: continuation,
		clickTrackingParams: clickTrackingParams,
		visitorData: visitorData ? visitorData : "",
		results: (
			await Promise.all(
				contents.map((item) =>
					parseItem(item as never)?.then((item) => {
						if (item) {
							if (!item.playlistId) item.playlistId = currentMix;
							return item;
						}
						return null;
					}),
				),
			)
		).filter(Boolean) as Array<Item>,
	};
}
