import BaseContext from '$api/_modules/context'
import {
	MoodsAndGenresItem,
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from '$lib/parsers'

import type { CarouselHeader, CarouselItem } from '$lib/types'
import type { EndpointOutput } from '@sveltejs/kit'
interface Response extends EndpointOutput {
	body?: string | Record<string, any>
	error?: Error
}
export async function get({ query, headers }): Promise<Response> {
	let headerThumbnail
	const decode = decodeURIComponent
	let ctoken = query.get('ctoken') || ''
	let itct = query.get('itct') || ''
	itct = decode(itct)
	ctoken = decode(ctoken)
	const browseId = 'FEmusic_home'
	const carouselItems = []

	const pushItems = (contents = []) => {
		carouselItems.push(
			...contents.filter((contents) => {
				if (contents?.musicCarouselShelfRenderer) {
					return contents.musicCarouselShelfRenderer
				}
				if (contents?.musicImmersiveCarouselShelfRenderer) {
					return contents.musicImmersiveCarouselShelfRenderer
				}
			})
		)
	}
	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/browse${
			itct !== ''
				? `?ctoken=${ctoken}&continuation=${ctoken}&type=next&itct=${itct}&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`
				: '?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30'
		}`,
		{
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
						enableSafetyMode: false
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
		}
	)

	if (!response.ok) {
		return { status: response.status, body: response.statusText }
	}
	const data = await response.json()
	if (!ctoken) {
		let {
			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: {
									sectionListRenderer: {
										contents = [],
										continuations: [{ nextContinuationData = {} } = {}] = []
									} = {}
								} = {}
							} = {}
						} = {}
					] = []
				} = {}
			} = {}
		} = data

		let continuations = nextContinuationData
		pushItems(contents)

		const resBody = carouselItems.map((carousel) => {
			return parseCarousel(carousel)
		})
		if (resBody) {
			return {
				body: {
					carousels: resBody,
					headerThumbnail:
						carouselItems[0]?.musicImmersiveCarouselShelfRenderer
							?.backgroundImage?.simpleVideoThumbnailRenderer?.thumbnail
							?.thumbnails,
					continuations

					// data
				},
				status: 200
			}
		}
		return {
			error: new Error()
		}
	} else {
		const {
			continuationContents = {},
			continuationContents: {
				sectionListContinuation: {
					contents = [],
					continuations: [{ nextContinuationData = {} } = {}] = []
				} = {}
			} = {}
		} = data

		let continuations = nextContinuationData
		pushItems(contents)
		const resBody = carouselItems.map((carousel) => {
			return parseCarousel(carousel)
		})
		if (resBody) {
			return {
				body: {
					carousels: resBody,

					continuations
				},
				status: 200
			}
		}
	}
}

function parseHeader(header: any[]): CarouselHeader[] {
	return header.map(({ musicCarouselShelfBasicHeaderRenderer } = {}) => {
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
	})
}

function parseBody(contents): CarouselItem[] {
	return contents.map(({ ...r }) => {
		if (r.musicTwoRowItemRenderer) {
			return MusicTwoRowItemRenderer(r)
		}
		if (r.musicResponsiveListItemRenderer) {
			return MusicResponsiveListItemRenderer(r)
		}
		if (r.musicNavigationButtonRenderer) {
			return MoodsAndGenresItem(r)
		}
		throw new Error("Unable to parse items, can't find " + `${r}`)
	})
}

function parseCarousel(carousel: {
	musicImmersiveCarouselShelfRenderer?: Record<string, any>
	musicCarouselShelfRenderer?: Record<string, any>
}) {
	if (carousel?.musicImmersiveCarouselShelfRenderer) {
		headerThumbnail =
			carousel.musicImmersiveCarouselShelfRenderer?.backgroundImage
				?.simpleVideoThumbnailRenderer?.thumbnail?.thumbnails
	}
	return {
		header: parseHeader([
			carousel.musicCarouselShelfRenderer?.header ??
				carousel.musicImmersiveCarouselShelfRenderer?.header
		])[0],
		results: parseBody(
			carousel.musicCarouselShelfRenderer?.contents ??
				carousel.musicImmersiveCarouselShelfRenderer?.contents
		)
	}
}
