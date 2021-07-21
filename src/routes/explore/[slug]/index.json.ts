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

	let {
		header,
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: {
								sectionListRenderer: { contents }
							}
						}
					}
				]
			}
		}
	} = await response.json()
	console.log(contents, header)
	// const sections = contents.map(({ gridRenderer = {} }) => {
	// 	const { items = [], header = {} } = gridRenderer
	// 	const section = items.map(({ musicTwoRowItemRenderer = {} }) => ({
	// 		text: musicNavigationButtonRenderer.buttonText.runs[0].text,
	// 		color: `#${(
	// 			'00000000' +
	// 			(
	// 				musicNavigationButtonRenderer.solid.leftStripeColor & 0xffffff
	// 			).toString(16)
	// 		).slice(-6)}`,
	// 		endpoint: {
	// 			params:
	// 				musicNavigationButtonRenderer.clickCommand.browseEndpoint.params,
	// 			browseId:
	// 				musicNavigationButtonRenderer.clickCommand.browseEndpoint.browseId
	// 		}
	// 	}))
	// 	return { section, title: header.gridHeaderRenderer.title.runs[0].text }
	// })
	return {
		body: { header, contents },
		status: 200
	}
}
