import { pb } from '$lib/utils'
export function parseContents(
	contents,
	continuation,
	clickTrackingParams,
	current
) {
	if (contents) {
		let arr = []
		let currentMix = current.playlistId
		contents.forEach((d) => {
			if (Object.prototype.hasOwnProperty.call(d, 'playlistPanelVideoRenderer')) {
				arr.push(d.playlistPanelVideoRenderer)
			}

			if (Object.prototype.hasOwnProperty.call(d, 'musicTwoRowItemRenderer')) {
				arr.push(d.musicTwoRowItemRenderer)
			}
			if (Object.prototype.hasOwnProperty.call(d, 'musicResponsiveListItemRenderer')) {
				arr.push(d.musicResponsiveListItemRenderer)
			}
		})
		if (arr.length !== 0) {
			const results = arr.map((item) => {
				const metaPath = item.navigationEndpoint.watchEndpoint
				const title = item.title.runs[0].text
				const artist = item.shortBylineText.runs[0].text
				const mix =
					item.menu.menuRenderer.items[0].menuNavigationItemRenderer
						.navigationEndpoint.watchEndpoint.playlistId
				let menu = pb(item, 'menu:menuRenderer', false)
				if (!Array.isArray(menu)) {
					menu = [menu]
				}
				let temp = []
				let browseId =
					item?.longBylineText?.runs[0]?.navigationEndpoint?.browseEndpoint
						?.browseId
				menu.forEach((l) => {
					let [navigationEndpoint] = temp

					if (Object.prototype.hasOwnProperty.call(l, 'menuNavigationItemRenderer')) {
						temp.push(l.menuNavigationItemRenderer)
					}
					if (
						temp.length !== 0 &&
						Object.prototype.hasOwnProperty.call(navigationEndpoint, 'browseEndpoint')
					) {
						menu.push(navigationEndpoint.browseEndpoint)
					}
					return menu
				})

				return {
					index: metaPath.index,
					itct: metaPath.params,
					title: title,
					artistInfo: {
						pageType: 'MUSIC_PAGE_TYPE_ARTIST',
						artist: artist,
						browseId: browseId
					},
					videoId: metaPath.videoId,
					autoMixList: mix,
					thumbnail: item.thumbnail.thumbnails[0].url,
					length: item.lengthText.runs[0].text
				}
			})
			return {
				currentMixId: currentMix,
				continuation: continuation,
				results: results
			}
		}
	} else {
		return {
			error: new Error("error in parsing data")
		}
	}
}
