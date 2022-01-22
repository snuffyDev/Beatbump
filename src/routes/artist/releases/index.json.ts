import { MusicTwoRowItemRenderer } from '$lib/parsers'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async ({ url }) => {
	const query = url.searchParams

	const browseId = query.get('browseId') || ''
	const params = query.get('params')
	const itct = query.get('itct') || ''
	// console.log(visitorID)

	const response = await fetch(
		'https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
		{
			headers: {
				Accept: '*/*',
				'Accept-Language': 'en-US,en;q=0.5',
				'Content-Type': 'application/json',
				'X-Goog-AuthUser': '0',
				'x-origin': 'https://music.youtube.com',

				'X-Goog-Visitor-Id': 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D',
				'x-youtube-client-name': '67',
				'x-youtube-client-version': '1.20210901.00.00',
				'x-youtube-device':
					'cbr=Edge+Chromium&cbrver=93.0.961.38&ceng=WebKit&cengver=537.36&cos=Windows&cosver=10.0&cplatform=DESKTOP&cyear=2011',
				'x-youtube-page-label': 'youtube.music.web.client_20210901_00_RC00',
				'x-youtube-time-zone': 'America/New_York',
				origin: 'https://music.youtube.com',
				'x-youtube-utc-offset': '-240',
				referrer: 'https://music.youtube.com/channel/' + browseId,
				referer: 'https://music.youtube.com/channel/' + browseId
			},

			body: JSON.stringify({
				context: {
					client: {
						clientName: 'WEB_REMIX',
						clientVersion: '1.20210901.00.00',
						hl: 'en',
						gl: 'US',
						experimentIds: [],
						experimentsToken: '',
						browserName: 'Edge Chromium',
						browserVersion: '93.0.961.38',
						osName: 'Windows',
						osVersion: '10.0',
						platform: 'DESKTOP',
						utcOffsetMinutes: -240,
						visitorData: 'CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D',
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
						}
					},
					capabilities: {},
					request: { internalExperimentFlags: [] },
					clickTracking: {
						clickTrackingParams: `${itct}`
					},
					activePlayers: {},
					user: { lockedSafetyMode: false }
				},
				browseId: browseId,
				params: params
			}),
			method: 'POST'
			// credentials: 'include'
		}
	)
	const data = await response.json()
	const { header, contents } = await data
	// console.log(encodeURIComponent(params), decodeURIComponent(itct), itct)
	if (!response.ok) {
		return { status: response.status, body: response.statusText }
	}

	const grid: {
		items: any[]
		header: { gridHeaderRenderer: { title: { runs: [{ text: string }] } } }
	} =
		contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content
			?.sectionListRenderer?.contents[0]?.gridRenderer
	const items = [
		...grid.items.map((data) => {
			if (data.musicTwoRowItemRenderer) {
				const parsed = MusicTwoRowItemRenderer(data)
				return {
					...parsed
				}
			}
			// console.log(data)
		})
	]

	const head = {
		artist: header?.musicHeaderRenderer?.title?.runs[0]?.text,
		type: grid.header.gridHeaderRenderer.title.runs[0].text
	}

	return {
		body: { header: head, contents: [...items] },
		status: 200
	}
}
