import type { Artist, NextContinuationData, Thumbnail } from '$lib/types'
import type { IPlaylistItem, PlaylistData } from '$lib/types/playlist'
import { pb } from '$lib/utils'

function parseTrack(contents = [], playlistId?): Array<IPlaylistItem> {
	const Tracks = contents.map(
		({ musicResponsiveListItemRenderer = {} } = {}) => {
			const length = pb(
				musicResponsiveListItemRenderer,
				'fixedColumns:0:musicResponsiveListItemFixedColumnRenderer:text:runs:0:text',
				true
			)
			const flexColumns = pb(
				musicResponsiveListItemRenderer,
				'flexColumns',
				true
			)

			const artistEndpoint = pb(
				flexColumns,
				'musicResponsiveListItemFlexColumnRenderer:1:text:runs:0',
				true
			)
			const titleBody = pb(
				flexColumns,
				'musicResponsiveListItemFlexColumnRenderer:0:text:runs:0',
				true
			)
			let videoId = undefined
			let playerParams = undefined
			if (
				!musicResponsiveListItemRenderer.playlistItemData &&
				!musicResponsiveListItemRenderer?.navigationEndpoint?.watchEndpoint
					?.videoId
			)
				return
			if (musicResponsiveListItemRenderer?.playlistItemData) {
				videoId = musicResponsiveListItemRenderer?.playlistItemData.videoId
			} else {
				videoId = titleBody?.navigationEndpoint?.watchEndpoint?.videoId
					? titleBody?.navigationEndpoint?.watchEndpoint?.videoId
					: undefined
			}
			playerParams = titleBody?.navigationEndpoint?.watchEndpoint?.playerParams
				? titleBody?.navigationEndpoint?.watchEndpoint?.playerParams
				: undefined

			const title = titleBody.text
			// console.log(artistEndpoint);
			const artistInfo: Artist = {
				artist: artistEndpoint.text,
				browseId: artistEndpoint?.navigationEndpoint?.browseEndpoint?.browseId
			}
			const thumbnail: Thumbnail = pb(
				musicResponsiveListItemRenderer,
				'thumbnail:musicThumbnailRenderer:thumbnail:thumbnails',
				true
			)
			return {
				length,
				videoId: videoId ? videoId : undefined,
				playlistId: playlistId,

				playlistSetVideoId:
					musicResponsiveListItemRenderer.playlistItemData.playlistSetVideoId ||
					musicResponsiveListItemRenderer.overlay
						.musicItemThumbnailOverlayRenderer.content.musicPlayButtonRenderer
						.playNavigationEndpoint.watchEndpoint.playlistSetVideoId,
				thumbnail,
				playerParams:
					musicResponsiveListItemRenderer?.flexColumns[0]
						?.musicResponsiveListItemFlexColumnRenderer.text.runs[0]
						.navigationEndpoint.watchEndpoint.playerParams || 'iAQB',
				title,
				artistInfo
			}
		}
	)
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

	const Tracks = parseTrack(contents, playlistId).filter((e) => {
		return e != null
	})
	// console.log('TRACKS: ' + Tracks)
	return {
		data,
		continuations: cont,
		tracks: Tracks,
		header: parseHeader
	}
}
