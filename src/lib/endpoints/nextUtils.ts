import type { Song } from '$lib/types';
import type { IPlaylistPanelVideoRenderer } from '../types/playlistPanelVideoRenderer';
import { PlaylistPanelVideoRenderer } from '../parsers';

export function parseContents(
	contents = [],
	continuation,
	clickTrackingParams,
	current
) {
	if (contents) {
		let arr: Array<{
			playlistPanelVideoRenderer?: IPlaylistPanelVideoRenderer;
		}> = [];
		const currentMix = current.playlistId;

		let idx = contents.length;
		while (idx > -1) {
			const playlistItem = contents[idx];
			if (playlistItem?.playlistPanelVideoRenderer) {
				arr = [
					PlaylistPanelVideoRenderer(playlistItem.playlistPanelVideoRenderer),
					...arr
				];
			}
			idx--;
		}
		if (arr.length !== 0) {
			return {
				currentMixId: currentMix,
				continuation: continuation,
				clickTrackingParams: clickTrackingParams,
				results: arr
				// data: contents
			};
		}
	}
	return new Error('Error parsing tracks');
}
