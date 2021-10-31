import { pb } from '$lib/utils'
export function parseContents(
	contents = [],
	continuation,
	clickTrackingParams,
	current
) {
	if (contents) {
		// console.log(contents, current)
		let arr = []
		let currentMix = current.playlistId
		arr.push(
			...contents.filter((i) => {
				if (
					Object.prototype.hasOwnProperty.call(i, 'playlistPanelVideoRenderer')
				)
					return i.playlistPanelVideoRenderer
			})
		)
		if (arr.length !== 0) {
			const results = arr.map(({ playlistPanelVideoRenderer } = {}) => {
				const metaPath =
					playlistPanelVideoRenderer.navigationEndpoint?.watchEndpoint
				const title = playlistPanelVideoRenderer.title.runs[0].text
				const artist = playlistPanelVideoRenderer.shortBylineText.runs[0].text
				const mix =
					playlistPanelVideoRenderer.menu.menuRenderer.items[0]
						.menuNavigationItemRenderer?.navigationEndpoint?.watchEndpoint
						.playlistId
				const playlistSetVideoId = playlistPanelVideoRenderer?.playlistSetVideoId
					? playlistPanelVideoRenderer.playlistSetVideoId
					: ''
				let menu = pb(playlistPanelVideoRenderer, 'menu:menuRenderer', false)
				if (!Array.isArray(menu)) {
					menu = [menu]
				}
				let longText = [...playlistPanelVideoRenderer.longBylineText.runs]
				let album = longText.reverse().slice(-3)
				album = album[0]
				let temp = []
				let browseId =
					playlistPanelVideoRenderer?.longBylineText?.runs[0]
						?.navigationEndpoint?.browseEndpoint?.browseId
				menu.forEach((l) => {
					let [navigationEndpoint] = temp

					if (
						Object.prototype.hasOwnProperty.call(
							l,
							'menuNavigationItemRenderer'
						)
					) {
						temp.push(l.menuNavigationItemRenderer)
					}
					if (
						temp.length !== 0 &&
						Object.prototype.hasOwnProperty.call(
							navigationEndpoint,
							'browseEndpoint'
						)
					) {
						menu.push(navigationEndpoint.browseEndpoint)
					}
					return menu
				})

				return {
					index: metaPath.index,
					itct: metaPath.params,
					album: album,
					title: title,
					artistInfo: {
						pageType: 'MUSIC_PAGE_TYPE_ARTIST',
						artist: artist,
						browseId: browseId
					},
					playlistSetVideoId,
					videoId: metaPath.videoId,
					hash:
						Math.random().toString(36).substring(2, 15) +
						Math.random().toString(36).substring(2, 15),
					autoMixList: mix,
					thumbnail: playlistPanelVideoRenderer.thumbnail.thumbnails[0].url,
					length: playlistPanelVideoRenderer.lengthText.runs[0].text
				}
			})

			return {
				currentMixId: currentMix,
				continuation: continuation,
				clickTrackingParams: clickTrackingParams,
				results: results
			}
		}
	}
}
