import type { Song } from "$lib/types";
import type { IPlaylistPanelVideoRenderer } from "../types/playlistPanelVideoRenderer";
import { PlaylistPanelVideoRenderer } from "../parsers";

type PanelAlias = { playlistPanelVideoRenderer: IPlaylistPanelVideoRenderer };

export function parseContents(
	contents: Array<Song | PanelAlias> = [],
	continuation: string,
	clickTrackingParams: string,
	current: any
): {
	results: Array<Song>;
	continuation: string;
	clickTrackingParams: string;
	currentMixId: string;
} {
	const currentMix = current.playlistId;
	let idx = contents.length;
	for (; idx--; ) {
		if (
			Object.prototype.hasOwnProperty.call(
				contents[idx],
				"playlistPanelVideoRenderer"
			)
		) {
			contents[idx] = PlaylistPanelVideoRenderer(
				contents[idx]["playlistPanelVideoRenderer"]
			) as Song;
		} else {
			contents[idx] = false;
		}
	}
	return {
		currentMixId: currentMix,
		continuation: continuation,
		clickTrackingParams: clickTrackingParams,
		results: contents.filter((v) => v) as Array<Song>
	};
}
