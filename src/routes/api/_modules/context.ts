const Base = {
	context: {
		client: {
			clientName: "WEB_REMIX",
			clientVersion: "1.20211025.00.00",
			visitorData: "CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D"
		},
		user: {
			lockedSafetyMode: false
		},
		capabilities: {},
		request: {
			internalExperimentFlags: [
				{
					key: "force_music_enable_outertube_tastebuilder_browse",
					value: "true"
				},
				{
					key: "force_music_enable_outertube_playlist_detail_browse",
					value: "true"
				},
				{
					key: "force_music_enable_outertube_search_suggestions",
					value: "true"
				}
			],
			sessionIndex: {}
		},
		utcOffsetMinutes: -new Date().getTimezoneOffset()
	}
};
const Player = {
	context: {
		client: {
			// originalUrl: `https://music.youtube.com/watch?v=${videoId}&list=${playlistId}`,
			hl: "en",
			clientName: "ANDROID",
			clientVersion: "16.02"
		},
		user: {
			lockedSafetyMode: false
		},
		captionParams: {},
		params: "igMDCNgE"
	}
};

const context = { Base, Player };
context.Base;
export default {
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	player: (videoId: string, playlistId?: string) => ({
		videoId: videoId ?? null,
		context: {
			...Player.context
		},
		playlistId: playlistId ?? null
	}),
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	base: (browseId?: string, type?: string) => {
		if (type) {
			return {
				context: { ...Base.context },
				browseId: browseId ?? null,
				browseEndpointContextSupportedConfigs: {
					browseEndpointContextMusicConfig: {
						pageType: "MUSIC_PAGE_TYPE_" + type.toUpperCase()
					}
				}
			};
		} else {
			return { context: { ...Base.context }, browseId: browseId ?? null };
		}
	}
};
