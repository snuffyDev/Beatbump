import { pb } from '$lib/utils'
import type { EndpointOutput } from '@sveltejs/kit'
type result = {
	title: string
	artist?: string
	endpoint?: { browseId: string; pageType: string }
	videoId: string
	playlistId: string
	params?: string
	thumbnails: []
	subtitle?: {}[]
	aspectRatio?: string
}
type moodsAndGenres = {
	text: string
	color: string
	endpoint: {
		browseId: string
		params: string
	}
}
export async function get({ query }): Promise<EndpointOutput> {
	console.time('timer')
	const endpoint = query.get('q') || ''
	const browseId = 'FEmusic_explore'
	let carouselItems = []
	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/${endpoint}?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
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
						},
						utcOffsetMinutes: -new Date().getTimezoneOffset()
					},

					browseId: `${browseId}`
				}),
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					Origin: 'https://music.youtube.com',
					'User-Agent':
						'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
				}
			}
		)

		if (!response.ok) {
			// NOT res.status >= 200 && res.status < 300
			return { status: response.status, body: response.statusText }
		}
		// const data = await response.json();
		let {
			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: {
									sectionListRenderer: { contents = [] }
								}
							}
						}
					]
				}
			}
		} = await response.json()

		carouselItems.push(
			...contents.filter((content) => {
				return content.musicCarouselShelfRenderer
			})
		)

		console.timeEnd('timer')
		return {
			body: carouselItems.map(({ musicCarouselShelfRenderer }) => {
				const { header, contents } = musicCarouselShelfRenderer
				// console.log(header)
				return {
					header: parseHeader([header])[0],
					results: parseBody(contents)
				}
			}),
			status: 200
		}
	} catch (error) {
		return {
			status: 500,
			body: error
		}
	}
}

function parseHeader(header: any[]) {
	return header.map(({ musicCarouselShelfBasicHeaderRenderer }) => ({
		title: musicCarouselShelfBasicHeaderRenderer['title']['runs'][0].text,
		browseId:
			musicCarouselShelfBasicHeaderRenderer.moreContentButton.buttonRenderer
				.navigationEndpoint.browseEndpoint.browseId
	}))
}

function parseBody(contents) {
	return [
		...contents.map((r: []) => {
			const type = Object.getOwnPropertyNames(r).toString()
			let result: result | moodsAndGenres

			switch (type) {
				case 'musicTwoRowItemRenderer':
					result = {
						title: r.musicTwoRowItemRenderer.title.runs[0].text,
						thumbnails:
							r.musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer
								.thumbnail.thumbnails,
						aspectRatio: r.musicTwoRowItemRenderer.aspectRatio,
						videoId:
							r.musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint
								?.videoId,
						playlistId:
							r.musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint
								?.playlistId,
						endpoint: {
							browseId:
								r.musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint
									?.browseId,
							pageType:
								r.musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint
									?.browseEndpointContextSupportedConfigs
									?.browseEndpointContextMusicConfig?.pageType
						},

						subtitle: [...r.musicTwoRowItemRenderer.subtitle.runs]
					}

					break
				case 'musicResponsiveListItemRenderer':
					result = {
						subtitle: [
							...r.musicResponsiveListItemRenderer.flexColumns[1]
								.musicResponsiveListItemFlexColumnRenderer.text.runs
						],
						title:
							r.musicResponsiveListItemRenderer.flexColumns[0]
								.musicResponsiveListItemFlexColumnRenderer.text.runs[0].text,
						videoId:
							r.musicResponsiveListItemRenderer.flexColumns[0]
								.musicResponsiveListItemFlexColumnRenderer.text.runs[0]
								.navigationEndpoint.watchEndpoint.videoId,
						playlistId:
							r.musicResponsiveListItemRenderer.menu.menuRenderer.items[0]
								.menuNavigationItemRenderer.navigationEndpoint.watchEndpoint
								.playlistId,
						thumbnails:
							r.musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer
								.thumbnail.thumbnails
					}
					// console.log(result, 'musicResponse')
					break
				case 'musicNavigationButtonRenderer':
					// console.log('nav')
					result = {
						text: r.musicNavigationButtonRenderer?.buttonText.runs[0].text,
						color: (
							'00000000' +
							(
								r.musicNavigationButtonRenderer?.solid.leftStripeColor &
								0xffffff
							).toString(16)
						).slice(-6),
						endpoint: {
							params:
								r.musicNavigationButtonRenderer?.clickCommand.browseEndpoint
									.params,
							browseId:
								r.musicNavigationButtonRenderer?.clickCommand.browseEndpoint
									.browseId
						}
					}
					break
				default:
					break
			}
			return result
		})
	]
}
