import { pb } from '$lib/utils'
import type { EndpointOutput } from '@sveltejs/kit'

export async function get({ query }): Promise<EndpointOutput> {
	const endpoint = query.get('q') || ''
	const browseId = 'FEmusic_explore'
	let carouselItems = []

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/${endpoint}?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
		{
			method: 'POST',
			body: JSON.stringify({
				context: {
					client: {
						clientName: 'WEB_REMIX',
						clientVersion: '0.1',
						deviceMake: 'google',
						platform: 'DESKTOP',
						deviceModel: 'bot',
						experimentIds: [],
						experimentsToken: '',
						osName: 'Googlebot',
						osVersion: '2.1',
						locationInfo: {
							locationPermissionAuthorizationStatus:
								'LOCATION_PERMISSION_AUTHORIZATION_STATUS_UNSUPPORTED'
						},
						musicAppInfo: {
							musicActivityMasterSwitch:
								'MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE',
							musicLocationMasterSwitch:
								'MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE',
							pwaInstallabilityStatus: 'PWA_INSTALLABILITY_STATUS_UNKNOWN'
						},
						utcOffsetMinutes: -new Date().getTimezoneOffset()
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
					},
					user: {
						enableSafetyMode: false
					},
					activePlayers: {}
				},
				browseEndpointContextMusicConfig: {
					browseEndpointContextMusicConfig: {
						pageType: ''
					}
				},
				browseId: `${browseId}`,

				isAudioOnly: true,
				query: '',

				params: '',
				videoId: '',
				playlistId: ''
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
								sectionListRenderer: { contents }
							}
						}
					}
				]
			}
		}
	} = await response.json()

	contents.forEach((content) => {
		if (content.hasOwnProperty('musicCarouselShelfRenderer')) {
			carouselItems.push(content)
		}
	})

	carouselItems = carouselItems.map(({ musicCarouselShelfRenderer }) => {
		let ctx = musicCarouselShelfRenderer
		let { header, contents } = ctx
		header = [header]
		header = header.map(({ musicCarouselShelfBasicHeaderRenderer }) => {
			let h = musicCarouselShelfBasicHeaderRenderer
			return {
				title: pb(h, 'title:runs:text', true),
				browseId: pb(
					h,
					'moreContentButton:buttonRenderer:navigationEndpoint:browseEndpoint:browseId',
					true
				)
			}
		})[0]

		let results = []

		contents.map((r: []) => {
			let type = Object.getOwnPropertyNames(r).toString()
			type result = {
				title: string
				artist?: string
				endpoint?: { browseId: string; pageType: string }
				videoId: string
				playlistId: string
				params?: string
				thumbnails: []
				subtitle?: {}[]
			}
			type moodsAndGenres = {
				text: string
				color: string
				endpoint: {
					browseId: string
					params: string
				}
			}

			let result: result | moodsAndGenres

			switch (type) {
				case 'musicTwoRowItemRenderer':
					result = {
						title: r.musicTwoRowItemRenderer.title.runs[0].text,
						thumbnails:
							r.musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer
								.thumbnail.thumbnails,
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
					// case "musicNavigationButtonRenderer":
					// 	// console.log('nav')
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
			results.push(result)
		})
		return {
			header: header,
			results
		}
	})
	return {
		body: carouselItems,
		status: 200
	}
}
