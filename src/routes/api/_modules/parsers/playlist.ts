import { MusicResponsiveListItemRenderer } from '$lib/parsers'
import type { Artist, Item, NextContinuationData, Thumbnail } from '$lib/types'
import type { IPlaylistItem, PlaylistData } from '$lib/types/playlist'
import { pb } from '$lib/utils'

function parseTrack(contents = [], playlistId?): Array<Item> {
	const Tracks = contents.map((item) => {
		if (!item) {
			return null
		}
		return MusicResponsiveListItemRenderer(item, true, playlistId)
	})
	return Tracks
}

export const parsePlaylist = async (data): Promise<PlaylistData> => {
	let {
		header: { musicDetailHeaderRenderer = {} } = {},
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: {
								// eslint-disable-next-line prefer-const
								sectionListRenderer,
								sectionListRenderer: {
									// eslint-disable-next-line prefer-const
									contents: [
										{
											musicPlaylistShelfRenderer: {
												contents = [],
												playlistId = ''
											} = {}
										}
									] = [],
									continuations = []
								} = {}
							} = {}
						} = {}
					} = {}
				] = []
			} = {}
		} = {}
	} = data

	// console.log(musicDetailHeaderRenderer)
	const cont: NextContinuationData = continuations
		? continuations[0]?.nextContinuationData
		: ''
	musicDetailHeaderRenderer = [musicDetailHeaderRenderer]
	const parseHeader = musicDetailHeaderRenderer.map(
		({
			description = {},
			subtitle = {},
			thumbnail = {},
			secondSubtitle = {},
			title = {}
		}) => {
			// eslint-disable-next-line prefer-const
			//
			// let {
			// 	description = {},
			// 	subtitle = {},
			// 	thumbnail = {},
			// 	secondSubtitle = {},
			// 	title = {}
			// } = musicDetailHeaderRenderer
			// console.log(description, subtitle, thumbnail, secondSubtitle, title)
			const subtitles = pb(subtitle, 'runs:text', false)
			const desc = pb(description, 'runs:0:text', false)
			const _title = pb(title, 'runs:0:text', false)
			secondSubtitle = pb(secondSubtitle, 'runs:text', false)
			return {
				data,
				description: desc,
				subtitles,
				thumbnails:
					thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails ||
					null,
				playlistId: playlistId,
				secondSubtitle,
				title: _title || 'error'
			}
		}
	)[0]
	// const [contents] = playlist;

	const tracks = parseTrack(contents, playlistId).filter((e) => {
		return e != null
	})
	// console.log('TRACKS: ' + Tracks)
	return {
		continuations: cont,
		tracks,
		header: parseHeader
	}
}
