import {
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from '$lib/parsers'

import type {
	Artist,
	CarouselHeader,
	CarouselItem,
	Item,
	Thumbnail
} from '$lib/types'
import type { NextContinuationData } from '$lib/types'
import type { IListItemRenderer } from '$lib/types/musicListItemRenderer'
export async function get({ query }: { query: URLSearchParams }) {
	const browseId = query.get('list') || ''
	const itct = query.get('itct') || ''
	const ctoken = query.get('ctoken') || ''
	const referrer = query.get('ref') || ''

	// console.log(browseId, ctoken)

	if (ctoken !== '') {
		return await getPlaylistContinuation(browseId, referrer, ctoken, itct)
	}
	return await getPlaylist(browseId, referrer)
}
async function getPlaylistContinuation(browseId, referrer, ctoken, itct) {
	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/browse?ctoken=${ctoken}` +
			`&continuation=${ctoken}&type=next&itct=${itct}&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
		{
			method: 'POST',
			body: JSON.stringify({
				context: {
					client: {
						clientName: 'WEB_REMIX',
						clientVersion: '1.20211025.00.00',
						visitorData: 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D'
					},
					user: {
						enableSafetyMode: false
					}
				}
			}),
			headers: {
				'Content-Type': 'application/json; charset=utf-8',

				'X-Goog-AuthUser': '0',
				Origin: 'https://music.youtube.com',
				'x-origin': 'https://music.youtube.com',

				'X-Goog-Visitor-Id': 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D',
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
			musicPlaylistShelfContinuation: { contents = [], continuations = [] } = {}
		} = {}
	} = await data
	// console.log(data, contents, continuations)
	let Tracks = []
	let Carousel
	const cont: NextContinuationData = continuations
		? continuations[0]?.nextContinuationData
		: null
	if (
		data?.continuationContents?.sectionListContinuation?.contents[0]
			?.musicCarouselShelfRenderer
	) {
		Carousel = parseCarousel({
			musicCarouselShelfRenderer:
				data?.continuationContents?.sectionListContinuation?.contents[0]
					?.musicCarouselShelfRenderer
		})
		// console.log(Carousel, contents[0])
		// console.log(referrer.slice(1))
	} else {
		Tracks = parseTrack(contents, referrer.slice(2))
	}
	return {
		status: 200,
		body: {
			continuations: cont,
			data,
			tracks: Tracks.length !== 0 && Tracks,
			carousel: Carousel
		}
	}
}
async function getPlaylist(browseId, referrer) {
	const response = await fetch(
		'https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
		{
			method: 'POST',
			body: JSON.stringify({
				context: {
					client: {
						clientName: 'WEB_REMIX',
						clientVersion: '1.20211025.00.00',
						visitorData: 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D'
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

				'X-Goog-AuthUser': '0',
				Origin: 'https://music.youtube.com',
				'x-origin': 'https://music.youtube.com',
				'X-Goog-Visitor-Id': 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D',
				referer:
					'https://music.youtube.com/playlist?list=' + referrer || browseId
			}
		}
	)
	if (!response.ok) {
		return { status: response.status, body: response.statusText }
	}
	const data = await response.json()
	let { musicDetailHeaderRenderer = {} } = data?.header
	const {
		contents,
		playlistId,
		continuations
	} = data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents[0]?.musicPlaylistShelfRenderer
	const _continue =
		data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
			?.content?.sectionListRenderer?.continuations

	// console.log(musicDetailHeaderRenderer)
	const cont: NextContinuationData = !data?.contents
		?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content
		?.sectionListRenderer?.continuations[0]?.nextContinuationData
		? continuations[0]?.nextContinuationData
		: _continue[0]?.nextContinuationData
	// console.log(_continue)
	musicDetailHeaderRenderer = [musicDetailHeaderRenderer]
	const parseHeader = musicDetailHeaderRenderer.map(
		({
			description = {},
			subtitle = {},
			thumbnail = {},
			secondSubtitle = {},
			title = {}
		}) => {
			let subtitles = []
			let _secondSubtitle = []
			if (Array.isArray(subtitle?.runs) && subtitle?.runs.length !== 0) {
				for (const { text } of subtitle?.runs) {
					subtitles = [...subtitles, text]
				}
			}
			if (
				Array.isArray(secondSubtitle?.runs) &&
				secondSubtitle?.runs.length !== 0
			) {
				for (const { text } of secondSubtitle?.runs) {
					_secondSubtitle = [..._secondSubtitle, text]
				}
			}
			// const subtitles = [...subtitle?.runs]
			const desc = description?.runs[0]?.text
			const _title = title?.runs[0].text
			return {
				data,
				description: desc,
				subtitles,
				thumbnails:
					thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails ||
					null,
				playlistId: playlistId,
				secondSubtitle: _secondSubtitle,
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
		status: 200,
		body: {
			continuations: cont,
			tracks,
			data,
			header: parseHeader
		}
	}
}
function parseTrack(contents = [], playlistId?): Array<IListItemRenderer> {
	let Tracks = []
	for (let index = 0; index < contents.length; index++) {
		const element = contents[index]
		Tracks = [
			...Tracks,
			MusicResponsiveListItemRenderer(element, true, playlistId)
		]
	}
	return Tracks
}
function parseHeader(header: any[]): CarouselHeader[] {
	return header.map(({ musicCarouselShelfBasicHeaderRenderer } = {}) => ({
		title: musicCarouselShelfBasicHeaderRenderer['title']['runs'][0].text
	}))
}

function parseBody(contents): CarouselItem[] {
	return contents.map(({ ...r }) => {
		if (r.musicTwoRowItemRenderer) {
			return MusicTwoRowItemRenderer(r)
		}
		if (r.musicResponsiveListItemRenderer) {
			return MusicResponsiveListItemRenderer(r)
		}
		throw new Error("Unable to parse items, can't find " + `${r}`)
	})
}
function parseCarousel({ musicCarouselShelfRenderer }) {
	return {
		header: parseHeader([musicCarouselShelfRenderer.header])[0],
		results: parseBody(musicCarouselShelfRenderer.contents)
	}
}
