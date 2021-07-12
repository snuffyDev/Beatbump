export async function get({ query }) {
	const videoId = query.get('videoId') || ''
	const playlistId = query.get('playlistId') || ''
	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/next?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,

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
					videoId: `${videoId}`,
					playlistId: `${playlistId}`
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
		// Start of Data Parsing
		const data = await response.json()
		const trimResponse = () => {
			// Use destructuring to get the contents of the playlistPanelRenderer
			let {
				contents: {
					singleColumnMusicWatchNextResultsRenderer: {
						tabbedRenderer: {
							watchNextTabbedResultsRenderer: {
								tabs: [
									{
										tabRenderer: {
											content: {
												musicQueueRenderer: {
													content: {
														playlistPanelRenderer: { ...rest }
													}
												}
											}
										}
									}
								]
							}
						}
					}
				}
			} = data

			let temp = []
			/* We require playlistPanelVideoRenderer as our only responses
               only one other response is automixPreviewVideoRenderer which is not going to be used*/
			rest.contents.forEach(({ playlistPanelVideoRenderer }) => {
				if (playlistPanelVideoRenderer) {
					temp.push(playlistPanelVideoRenderer)
				} else {
					return
				}
			})
			/*
                Map out each item in the list for the information that's going to be used
                by the automix and other components.
            */
			const response = temp.map((item) => {
				let title = item.title.runs[0].text
				let {
					videoId,
					playlistId,
					index,
					params
				} = item.navigationEndpoint.watchEndpoint
				let length = item.lengthText.runs[0].text
				let mixList =
					item.menu.menuRenderer.items[0].menuNavigationItemRenderer
						.navigationEndpoint.watchEndpoint.playlistId
				let browseId =
					item?.longBylineText?.runs[0]?.navigationEndpoint?.browseEndpoint
						?.browseId
				let thumbnail = item.thumbnail.thumbnails[0].url
				let artistInfo = {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: item.shortBylineText.runs[0].text,
					browseId:
						item.longBylineText.runs[0].navigationEndpoint.browseEndpoint
							.browseId
				}
				// let Obj = Object.fromEntries(results);
				return {
					index: index,
					itct: params,
					title,
					artistInfo,
					autoMixList: mixList,
					thumbnail,
					length,
					videoId,
					playlistId
				}
			})

			//console.log(temp);
			return response
		}
		const trim: [] = trimResponse()

		return {
			status: 200,
			body: JSON.stringify(trim)
		}
	} catch (error) {
		console.log(error)
		return {
			status: 500,
			// Could be a custom message or object i.e. JSON.stringify(err)
			body: JSON.stringify({ msg: error.message })
		}
	}
}
