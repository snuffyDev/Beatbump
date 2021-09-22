import BaseContext from '../api/_modules/context'

export async function get({ query }) {
	const browseId = query.get('browseId')

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/browse?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
		{
			method: 'POST',
			body: JSON.stringify({
				...BaseContext.base(browseId)

				// browseId: `${browseId}`
			}),
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				Origin: 'https://music.youtube.com',
				'User-Agent':
					'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
			}
		}
	)

	const data = await response.json()

	const {
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
		const section = items.map(({ musicNavigationButtonRenderer = {} }) => ({
			text: musicNavigationButtonRenderer.buttonText.runs[0].text,
			color: `#${(
				'00000000' +
				(
					musicNavigationButtonRenderer.solid.leftStripeColor & 0xffffff
				).toString(16)
			).slice(-6)}`,
			endpoint: {
				params:
					musicNavigationButtonRenderer.clickCommand.browseEndpoint.params,
				browseId:
					musicNavigationButtonRenderer.clickCommand.browseEndpoint.browseId
			}
		}))
		return { section, title: header.gridHeaderRenderer.title.runs[0].text }
	})
	return {
		status: 200,
		body: JSON.stringify(sections)
	}
}
