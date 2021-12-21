import type { NavigationEndpoint } from '$lib/types'

export type sections = [
	{
		section: [
			{
				type: string
				thumbnail: string
				title: string
				browseId: string
				videoId?: string
				autoMixList?: string
				subtitles: [{ text: string; navigationEndpoint: NavigationEndpoint }]
			}
		]
	}
]
