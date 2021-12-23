import {
	MoodsAndGenresItem,
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from '$lib/parsers'

import type { CarouselHeader } from '$lib/types'
import type { ICarouselTwoRowItem } from '$lib/types/musicCarouselTwoRowItem'
import type { IListItemRenderer } from '$lib/types/musicListItemRenderer'
import type { EndpointOutput } from '@sveltejs/kit'
interface Response extends EndpointOutput {
	body?: string | Record<string, any>
	error?: Error
}
export async function get({ query }): Promise<Response> {
	let ctoken = query.get('ctoken') || ''
	let itct = query.get('itct') || ''
	itct = decodeURIComponent(itct)
	ctoken = decodeURIComponent(ctoken)
	const browseId = 'FEmusic_home'
	let carouselItems = []
	const BASE_URL = 'https://music.youtube.com/youtubei/v1/browse'
	const params =
		itct !== ''
			? `?ctoken=${ctoken}&continuation=${ctoken}&type=next&itct=${itct}&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`
			: '?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30'
	const response = await fetch(BASE_URL + params, {
		headers: {
			accept: '*/*',
			'accept-language': 'en-US,en;q=0.9',
			'cache-control': 'no-cache',
			'content-type': 'application/json',
			pragma: 'no-cache',
			'sec-ch-ua':
				'"Microsoft Edge";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Windows"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'same-origin',
			'sec-fetch-site': 'same-origin',
			'x-goog-visitor-id': 'CgttaVFvdVdoLVdzSSiViqSMBg%3D%3D',
			'x-youtube-client-name': '67',
			'x-youtube-client-version': '1.20211101.00.00',
			Referer: 'https://music.youtube.com/',
			Origin: 'https://music.youtube.com',
			'x-origin': 'https://music.youtube.com',

			'Referrer-Policy': 'strict-origin-when-cross-origin'
		},
		body: JSON.stringify({
			browseId: ctoken !== '' ? browseId : '',

			context: {
				client: {
					clientName: 'WEB_REMIX',
					clientVersion: '1.20211025.00.00',
					visitorData: 'CgttaVFvdVdoLVdzSSiViqSMBg%3D%3D',
					originalUrl: 'https://music.youtube.com/',
					userAgent:
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36 Edg/95.0.1020.40,gzip(gfe)',
					utcOffsetMinutes: -new Date().getTimezoneOffset()
				},
				user: {
					lockedSafetyMode: false
				},
				capabilities: {},
				request: {
					internalExperimentFlags: [
						{
							key: 'force_music_enable_outertube_tastebuilder_browse',
							value: 'true'
						},
						{
							key: 'force_music_enable_outertube_playlist_detail_browse',
							value: 'true'
						},
						{
							key: 'force_music_enable_outertube_search_suggestions',
							value: 'true'
						}
					],
					sessionIndex: {}
				}
			}
		}),
		method: 'POST'
	})

	if (!response.ok) {
		return { status: response.status, body: response.statusText }
	}
	const data = await response.json()
	if (!ctoken) {
		const contents =
			data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
				?.content?.sectionListRenderer?.contents
		const nextContinuationData =
			data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
				?.content?.sectionListRenderer?.continuations[0]?.nextContinuationData
		let headerThumbnail
		for (let index = 0; index < contents.length; index++) {
			const element = contents[index]
			if (element?.musicCarouselShelfRenderer) {
				// console.log(element)
				carouselItems = [...carouselItems, parseCarousel({ ...element })]
			}
			if (element?.musicImmersiveCarouselShelfRenderer) {
				headerThumbnail = [
					...element.musicImmersiveCarouselShelfRenderer?.backgroundImage
						?.simpleVideoThumbnailRenderer?.thumbnail?.thumbnails
				].map((d) => {
					let url = d?.url?.replace('-rj', '-rw')
					return { ...d, url }
				})
				carouselItems = [...carouselItems, parseCarousel({ ...element })]
			}
		}
		return {
			body: {
				carousels: carouselItems,
				headerThumbnail,
				continuations: nextContinuationData
			},
			status: 200
		}
	} else {
		const {
			continuationContents: {
				sectionListContinuation: {
					contents = [],
					continuations: [{ nextContinuationData = {} } = {}] = []
				} = {}
			} = {}
		} = data
		for (let index = 0; index < contents.length; index++) {
			const element = contents[index]
			if (element?.musicCarouselShelfRenderer) {
				carouselItems = [...carouselItems, parseCarousel({ ...element })]
			}
		}

		return {
			body: {
				carousels: carouselItems,
				continuations: nextContinuationData
			},
			status: 200
		}
	}
}

function parseHeader({
	musicCarouselShelfBasicHeaderRenderer
}): CarouselHeader {
	if (musicCarouselShelfBasicHeaderRenderer) {
		let subheading, browseId
		if (musicCarouselShelfBasicHeaderRenderer?.strapline?.runs[0]?.text) {
			subheading =
				musicCarouselShelfBasicHeaderRenderer['strapline']['runs'][0].text
		}
		if (
			musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer
				?.navigationEndpoint?.browseEndpoint?.browseId
		) {
			browseId =
				musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer
					?.navigationEndpoint?.browseEndpoint?.browseId
		}
		return {
			title: musicCarouselShelfBasicHeaderRenderer['title']['runs'][0].text,
			subheading,
			browseId
		}
	}
}

function parseBody(
	contents = []
):
	| ICarouselTwoRowItem[]
	| IListItemRenderer[]
	| {
			text: any
			color: string
			endpoint: {
				params: any
				browseId: any
			}
	  }[] {
	let items = []
	for (let index = 0; index < contents.length; index++) {
		const element = contents[index]
		if (element.musicTwoRowItemRenderer) {
			items = [...items, MusicTwoRowItemRenderer(element)]
		}
		if (element.musicResponsiveListItemRenderer) {
			items = [...items, MusicResponsiveListItemRenderer(element)]
		}
		if (element.musicNavigationButtonRenderer) {
			items = [...items, MoodsAndGenresItem(element)]
		}
	}
	return items
}

function parseCarousel(carousel: {
	musicImmersiveCarouselShelfRenderer?: Record<string, any>
	musicCarouselShelfRenderer?: Record<string, any>
}) {
	return {
		header: parseHeader(
			carousel.musicCarouselShelfRenderer?.header ??
				carousel.musicImmersiveCarouselShelfRenderer?.header
		),
		results: parseBody(
			carousel.musicCarouselShelfRenderer?.contents ??
				carousel.musicImmersiveCarouselShelfRenderer?.contents
		)
	}
}
