const BaseContext = {
	context: {
		client: {
			clientName: 'WEB_REMIX',
			clientVersion: '0.1'
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
		utcOffsetMinutes: -new Date().getTimezoneOffset()
	}
}
export default BaseContext
