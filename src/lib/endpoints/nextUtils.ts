import type { Song } from '$lib/types'
import type { IPlaylistPanelVideoRenderer } from '../types/playlistPanelVideoRenderer'
import { PlaylistPanelVideoRenderer } from '../parsers'

export function parseContents(
	contents = [],
	continuation,
	clickTrackingParams,
	current
) {
	if (contents) {
		// console.log(contents, current)
		const arr: Array<{
			playlistPanelVideoRenderer: IPlaylistPanelVideoRenderer
		}> = []
		const currentMix = current.playlistId
		arr.push(
			...contents.filter((i) => {
				if (
					Object.prototype.hasOwnProperty.call(i, 'playlistPanelVideoRenderer')
				)
					return i
			})
		)
		if (arr.length !== 0) {
			const results = arr.map(
				({ playlistPanelVideoRenderer }): Song =>
					PlaylistPanelVideoRenderer(playlistPanelVideoRenderer)
			)

			return {
				currentMixId: currentMix,
				continuation: continuation,
				clickTrackingParams: clickTrackingParams,
				results: results,
				data: contents
			}
		}
	}
}
