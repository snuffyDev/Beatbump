const getCfgID = async (browseId?: string) => {
	const response = await fetch('https://music.youtube.com', {
		headers: {
			'User-agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 Edg/93.0.961.38'
		}
	})

	const text = await response.text()

	const match = text.match(/ytcfg\.set(?:\(\{(.*)\}\)\w*)/gm)
	const line = match[0].trim()
	const json = JSON.parse(line.substring(line.indexOf('{'), line.length - 1))
	return json.VISITOR_DATA
}
export const get = async ({ query }) => {
	let browseId = query.get('browseId') || ''
	let params = query.get('params')
	let itct = query.get('itct') || ''
	const visitorID = await getCfgID()
	// console.log(visitorID)
	if (visitorID) {
		const response = await fetch(
			'https://music.youtube.com/youtubei/v1/browse?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30',
			{
				headers: {
					accept: '*/*',
					'accept-language': 'en-US,en;q=0.9',
					'content-type': 'application/json',
					'sec-ch-ua':
						'"Microsoft Edge";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
					'sec-ch-ua-arch': '"x86"',
					'sec-ch-ua-full-version': '"93.0.961.38"',
					'sec-ch-ua-mobile': '?0',
					'sec-ch-ua-model': '',
					'sec-ch-ua-platform': '"Windows"',
					'sec-ch-ua-platform-version': '"10.0.0"',
					'sec-fetch-dest': 'empty',
					'sec-fetch-mode': 'cors',
					'sec-fetch-site': 'same-origin',
					'x-goog-visitor-id': visitorID,
					'x-youtube-client-name': '67',
					'x-youtube-client-version': '1.20210901.00.00',
					'x-youtube-device':
						'cbr=Edge+Chromium&cbrver=93.0.961.38&ceng=WebKit&cengver=537.36&cos=Windows&cosver=10.0&cplatform=DESKTOP&cyear=2011',
					'x-youtube-page-cl': '394186624',
					'x-youtube-page-label': 'youtube.music.web.client_20210901_00_RC00',
					'x-youtube-time-zone': 'America/New_York',
					origin: 'https://music.youtube.com',
					'x-youtube-utc-offset': '-240'
				},
				referrer: 'https://music.youtube.com/browse/UCxzL25HvnUMzzExb96868Cw',
				referrerPolicy: 'strict-origin-when-cross-origin',
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
						user: { enableSafetyMode: false }
					},
					browseId: 'UCxzL25HvnUMzzExb96868Cw',
					params: `${decodeURIComponent(params)}`
				}),
				method: 'POST',
				mode: 'cors'
				// credentials: 'include'
			}
		)
		const data = await response.json()
		const { header, contents } = await data
		console.log(encodeURIComponent(params), decodeURIComponent(itct), itct)
		if (!response.ok) {
			return { status: response.status, body: response.statusText }
		}

		return {
			body: { header, contents },
			status: 200
		}
	}
}
