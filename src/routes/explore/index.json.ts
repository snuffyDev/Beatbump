export async function get({ query }) {
	const browseId = query.get('browseId')
	// console.log(endpoint)

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/browse?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
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
						pageType: 'MUSIC_PAGE_TYPE_ARTIST'
					}
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

	// if (!response.ok) {
	// 	// NOT res.status >= 200 && res.status < 300
	// 	return { status: response.status, body: response.statusText }
	// }
	const data = await response.json()

	const {
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
	} = await data

	const sections = contents.map(({ gridRenderer = {} }) => {
		const { items = [], header = {} } = gridRenderer
		const section = items.map(({ musicNavigationButtonRenderer = {} }) => ({
			text: musicNavigationButtonRenderer.buttonText.runs[0].text,
			color: `#${(
				'00000000' +
				(
					musicNavigationButtonRenderer.solid.leftStripeColor & 0xffffff
				).toString(16)
			).slice(-6)}`,
			endpoint: {
				params:
					musicNavigationButtonRenderer.clickCommand.browseEndpoint.params,
				browseId:
					musicNavigationButtonRenderer.clickCommand.browseEndpoint.browseId
			}
		}))
		return { section, title: header.gridHeaderRenderer.title.runs[0].text }
		// const section = [
		// 	...e.map(({ gridRenderer = [] }) => {
		// 		let items = []
		// 		let header = gridRenderer.header?.gridHeaderRenderer.title.runs[0].text
		// 		items = gridRenderer?.items?.map(
		// 			(i: { musicNavigationButtonRenderer: any }) => {
		// 				const { musicNavigationButtonRenderer } = i
		// 				let text = musicNavigationButtonRenderer.buttonText.runs[0].text
		// 				let color: number =
		// 					musicNavigationButtonRenderer.solid.leftStripeColor
		// 				let colorCode = argbToRGB(color)
		// 				function argbToRGB(color: number) {
		// 					return ('00000000' + (color & 0xffffff).toString(16)).slice(-6)
		// 				}

		// 				return {
		// 					text: text,
		// 					colorCode: `#${colorCode}`,
		// 					clickCommand: musicNavigationButtonRenderer.clickCommand
		// 				}
		// 			}
		// 		)
		// 		return {
		// 			header: header,
		// 			items: items
		// 		}
		// 	})
		// ]
	})
	return {
		status: 200,
		body: JSON.stringify(sections)
	}
}
