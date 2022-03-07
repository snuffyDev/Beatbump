import type { Song } from '$lib/types';
import type { IPlaylistPanelVideoRenderer } from '../types/playlistPanelVideoRenderer';
import { PlaylistPanelVideoRenderer } from '../parsers';

export function parseContents(
	contents = [],
	continuation,
	clickTrackingParams,
	current
) {
	let arr: Array<{
		playlistPanelVideoRenderer?: IPlaylistPanelVideoRenderer;
	}> = [];
	const currentMix = current.playlistId;
	// console.log(current, continuation, contents);
	// let idx = contents.length;
	for (let idx = 0; idx < contents.length; idx++) {
		const playlistItem = contents[idx];
		if (playlistItem?.playlistPanelVideoRenderer) {
			arr = [
				...arr,
				PlaylistPanelVideoRenderer(playlistItem.playlistPanelVideoRenderer)
			];
		}
	}
	return {
		currentMixId: currentMix,
		continuation: continuation,
		clickTrackingParams: clickTrackingParams,
		results: arr
		// data: contents
	};
	return new Error('Error parsing tracks');
}
