import type { Song } from "$lib/types";
import type { IPlaylistPanelVideoRenderer } from "../types/playlistPanelVideoRenderer";
import { PlaylistPanelVideoRenderer } from "../parsers";
import { findAll, map } from "$lib/utils/collections";

type PanelAlias = { playlistPanelVideoRenderer: IPlaylistPanelVideoRenderer };

export function parseContents(
	contents: Array<Song | PanelAlias> = [],
	continuation: string,
	clickTrackingParams: string,
	current: any
): {
	results: Array<Song | PanelAlias>;
	continuation: string;
	clickTrackingParams: string;
	currentMixId: string;
} {
	const currentMix = current.playlistId;
	return {
		currentMixId: currentMix,
		continuation: continuation,
		clickTrackingParams: clickTrackingParams,
		results: findAll(
			map(
				contents,
				(item) =>
					Object.prototype.hasOwnProperty.call(
						item,
						"playlistPanelVideoRenderer"
					) &&
					(PlaylistPanelVideoRenderer(
						item["playlistPanelVideoRenderer"]
					) as Song)
			),
			(item) => item
		)
	};
}
