import type { Artist, Thumbnail } from '$lib/types'
import type { NextContinuationData } from '$lib/types'
import type { IPlaylistItem } from '$lib/types/playlist'
import { pb } from '$lib/utils'

export async function get({ query }: { query: URLSearchParams }) {
	const browseId = query.get('list') || ''
	const itct = query.get('itct') || ''
	const ctoken = query.get('ctoken') || ''
	const referrer = query.get('ref') || ''

	console.log(browseId, ctoken)

	if (ctoken == '') {
		const response = await fetch(
			'https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
			{
				method: 'POST',
				body: JSON.stringify({
					context: {
						client: {
							clientName: 'WEB_REMIX',
							clientVersion: '0.1'
						},

						user: {
							enableSafetyMode: false
						}
					},
					browseId: `${browseId}`,
					browseEndpointContextMusicConfig: {
						pageType: 'MUSIC_PAGE_TYPE_PLAYLIST'
					}
				}),
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					Origin: 'https://music.youtube.com',
					referer:
						'https://music.youtube.com/playlist?list=' + referrer || browseId
				}
			}
		)
		if (!response.ok) {
			return { status: response.status, body: response.statusText }
		}
		const data = await response.json()
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
										contents: [{ musicPlaylistShelfRenderer = {} }] = []
									} = {}
								} = {}
							} = {}
						} = {}
					] = []
				} = {}
			} = {}
		} = data

		const {
			contents: [{ musicPlaylistShelfRenderer: { contents = [] } = {} }] = [],
			continuations
		} = await sectionListRenderer
		console.log(musicDetailHeaderRenderer)
		const cont: NextContinuationData = continuations
			? continuations[0]?.nextContinuationData
			: ''
		musicDetailHeaderRenderer = [musicDetailHeaderRenderer]
		const parseHeader = musicDetailHeaderRenderer.map((header) => {
			// eslint-disable-next-line prefer-const
			let { description, subtitle, thumbnail, secondSubtitle, title } = header
			// console.log(description, subtitle, thumbnail, secondSubtitle, title)
			const subtitles: string = pb(subtitle, 'runs:text', false)
			description = description?.runs[0]?.text
				? description?.runs[0]?.text
				: undefined

			secondSubtitle = pb(secondSubtitle, 'runs:text', false)
			return {
				data,
				description,
				subtitles,
				thumbnails:
					thumbnail['croppedSquareThumbnailRenderer']['thumbnail'][
						'thumbnails'
					],
				playlistId: musicPlaylistShelfRenderer?.playlistId,
				secondSubtitle,
				title: title.runs[0].text
			}
		})[0]
		// const [contents] = playlist;

		const Tracks = parseTrack(
			contents,
			musicPlaylistShelfRenderer?.playlistId
		).filter((e) => {
			return e != null
		})
		return {
			status: 200,
			body: {
				data,
				continuations: cont,
				tracks: Tracks,
				header: parseHeader,
				musicDetailHeaderRenderer
			}
		}
	}
	if (ctoken !== '') {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/browse?ctoken=${ctoken}` +
				`&continuation=${ctoken}&type=next&itct=${itct}&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
			{
				method: 'POST',
				body: JSON.stringify({
					context: {
						client: {
							clientName: 'WEB_REMIX',
							clientVersion: '0.1',

							user: {
								enableSafetyMode: false
							}
						}
					}
				}),
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					Origin: 'https://music.youtube.com',
					referer:
						'https://music.youtube.com/playlist?list=' + referrer.slice(2) ||
						browseId
				}
			}
		)
		if (!response.ok) {
			return { status: response.status, body: response.statusText }
		}

		const data = await response.json()
		const {
			continuationContents: {
				musicPlaylistShelfContinuation: {
					contents = [],
					continuations = []
				} = {}
			} = {}
		} = await data
		// console.log(data, contents, continuations)
		const cont: NextContinuationData =
			continuations[0]?.nextContinuationData.length > 0
				? continuations[0]?.nextContinuationData
				: null
		const Tracks = parseTrack(contents)
		console.log(referrer.slice(1))
		return {
			status: 200,
			body: {
				continuations: cont,
				data,
				tracks: Tracks
			}
		}
	}
}

function parseTrack(contents = [], playlistId?): Array<IPlaylistItem> {
	const Tracks = contents.map(({ musicResponsiveListItemRenderer } = {}) => {
		const length = pb(
			musicResponsiveListItemRenderer,
			'fixedColumns:0:musicResponsiveListItemFixedColumnRenderer:text:runs:0:text',
			true
		)
		const flexColumns = pb(musicResponsiveListItemRenderer, 'flexColumns', true)

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
	})
	return Tracks
}
