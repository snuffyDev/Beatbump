/* eslint-disable prefer-const */
export async function get({ params, query }) {
	const { slug } = params
	const ctx = query.get('params') || ''

	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/browse?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
			{
				method: 'POST',
				body: JSON.stringify({
					context: {
						// clickTracking: { clickTrackingParams: `${itct}` },
						client: {
							clientName: 'WEB_REMIX',
							clientVersion: '0.1'
						},

						user: {
							enableSafetyMode: false
						}
					},
					params: `${ctx}`,
					browseId: `${slug}`
				}),
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					Origin: 'https://music.youtube.com',
					Referer: 'https://music.youtube.com/channel/UCKIOM0Wi1qNV8HFLArK-uYQ'
				}
			}
		)

		const data = await response.json()
		console.log(data)
		let {
			header: {
				musicHeaderRenderer: {
					title: { runs: [{ text = '' } = {}] = [] } = {}
				} = {}
			} = {},
			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: { sectionListRenderer: { contents = [] } = {} } = {}
							} = {}
						} = {}
					] = []
				} = {}
			} = {}
		} = await data
		let type: string
		// console.log('contents:', contents)
		slug.includes('videos') ? (type = 'videos') : (type = 'albums')
		const sections = contents.map(({ gridRenderer = {} }) => {
			const { items = [] } = gridRenderer
			console.log(items)
			const section = items.map(({ musicTwoRowItemRenderer = {} }) => ({
				thumbnail:
					musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer
						.thumbnail.thumbnails[0].url,
				title: musicTwoRowItemRenderer.title.runs[0].text,
				subtitles: musicTwoRowItemRenderer.subtitle.runs,
				type: type,
				autoMixList:
					type == 'videos'
						? musicTwoRowItemRenderer.menu.menuRenderer.items[0]
								.menuNavigationItemRenderer.navigationEndpoint.watchEndpoint
								.playlistId
						: musicTwoRowItemRenderer.menu.menuRenderer.items[0]
								.menuNavigationItemRenderer.navigationEndpoint
								.watchPlaylistEndpoint.playlistId,
				videoId:
					musicTwoRowItemRenderer.menu.menuRenderer.items[0]
						.menuNavigationItemRenderer.navigationEndpoint?.watchEndpoint
						?.videoId,
				browseId:
					musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint.browseId ||
					null
				// browseEndpoint:
				// 	musicTwoRowItemRenderer.menu.menuRenderer.items[0]
				// 		.menuNavigationItemRenderer.navigationEndpoint.watchPlaylistEndpoint
				// 		.playlistId || null
			}))
			return { section }
		})

		// console.log(sections)
		return {
			body: { sections, header: text },
			status: 200
		}
	} catch (error) {
		return {
			status: 500,
			error: new Error(error)
		}
	}
}
