// import type {PlaylistItem, Menu, Thumbnail} from '$lib/types';
import type { PlaylistItem, Menu } from '$lib/types/playlist'
export async function get({ query, headers }) {
	// if (headers.origin !== "https://beatbump.ml/") { return { status: 400, body: JSON.stringify('CORS error!') } }
	const playlistId = query.get('playlistId') || ''
	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/music/get_queue?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
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
		const data = await response.json()
		const { queueDatas } = await data

		const q = queueDatas.map(
			({ content: { playlistPanelVideoRenderer } }): PlaylistItem => {
				const { ctx } = playlistPanelVideoRenderer
				const length = playlistPanelVideoRenderer?.lengthText?.runs[0].text
				const artistInfo = {
					artist: playlistPanelVideoRenderer?.longBylineText?.runs[0]?.text,
					browseId:
						playlistPanelVideoRenderer?.longBylineText?.runs[0]
							?.navigationEndpoint?.browseEndpoint?.browseId
				}
				const thumbnails =
					playlistPanelVideoRenderer?.thumbnail?.thumbnails[0]?.url
				const title = playlistPanelVideoRenderer?.title?.runs[0]?.text
				const { videoId, playlistId } = {
					...playlistPanelVideoRenderer?.navigationEndpoint?.watchEndpoint
				}
				return {
					length,
					title,
					thumbnail: thumbnails,
					artistInfo,
					videoId,
					playlistId
				}
			}
		)

		return {
			status: 200,
			body: JSON.stringify(q)
		}
	} catch (error) {
		// output to netlify function log
		console.log(error)
		return {
			status: 500,
			// Could be a custom message or object i.e. JSON.stringify(err)
			body: JSON.stringify({ msg: error.message })
		}
	}
}
