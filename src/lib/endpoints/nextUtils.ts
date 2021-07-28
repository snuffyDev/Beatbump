import { pb } from '$lib/utils'
export function parseContents(
	contents,
	continuation,
	clickTrackingParams,
	current
) {
	try {
		if (contents) {
			let arr = []
			let currentMix = current.playlistId
			arr.push(
				...contents.filter((i) => {
					if (
						Object.prototype.hasOwnProperty.call(
							i,
							'playlistPanelVideoRenderer'
						)
					)
						return i.playlistPanelVideoRenderer
				})
			)
			if (arr.length !== 0) {
				const results = arr.map(({ playlistPanelVideoRenderer: item } = {}) => {
					const metaPath = item.navigationEndpoint?.watchEndpoint
					const title = item.title.runs[0].text
					const artist = item.shortBylineText.runs[0].text
					const mix =
						item.menu.menuRenderer.items[0].menuNavigationItemRenderer
							?.navigationEndpoint?.watchEndpoint.playlistId
					let menu = pb(item, 'menu:menuRenderer', false)
					if (!Array.isArray(menu)) {
						menu = [menu]
					}
					let longText = [...item.longBylineText.runs]
					let album = longText.reverse().slice(-3)
					album = album[0]
					let temp = []
					let browseId =
						item?.longBylineText?.runs[0]?.navigationEndpoint?.browseEndpoint
							?.browseId
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
						videoId: metaPath.videoId,
						hash:
							Math.random().toString(36).substring(2, 15) +
							Math.random().toString(36).substring(2, 15),
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
		}
	} catch (error) {
		console.log(error)
		return {
			error: new Error('error in parsing data')
		}
	}
}
