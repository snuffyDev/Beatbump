type destructure = {
	contents: {
		singleColumnBrowseResultsRenderer: {
			tabs: [
				{
					tabRenderer: {
						content?: { sectionListRenderer: { contents?: [] } }
					}
				}
			]
		}
	}
}
export async function get({ params }) {
	const { slug } = params

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/browse?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
		{
			method: 'POST',
			body: JSON.stringify({
				context: {
					client: {
						clientName: 'WEB_REMIX',
						clientVersion: '0.1'
					},

					user: {
						enableSafetyMode: false
					}
				},
				params: `${slug}`,
				browseId: 'FEmusic_moods_and_genres_category'
			}),
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				Origin: 'https://music.youtube.com'
			}
		}
	)

	const data = await response.json()
	let {
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
	const sections = contents.map(({ gridRenderer = {} }) => {
		const { items = [], header = {} } = gridRenderer
		const section = items.map(({ musicTwoRowItemRenderer = {} }) => ({
			thumbnail:
				musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer
					.thumbnail.thumbnails[0].url,
			title: musicTwoRowItemRenderer.title.runs[0].text,
			subtitles: musicTwoRowItemRenderer.subtitle.runs,
			browseId:
				musicTwoRowItemRenderer.navigationEndpoint.browseEndpoint.browseId,
			shuffle:
				musicTwoRowItemRenderer.menu.menuRenderer.items[0]
					.menuNavigationItemRenderer.navigationEndpoint.watchPlaylistEndpoint
					.playlistId
		}))
		return { section, title: header.gridHeaderRenderer.title.runs[0].text }
	})
	return {
		body: sections,
		status: 200
	}
}
