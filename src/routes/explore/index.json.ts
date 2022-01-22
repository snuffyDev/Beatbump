import type { RequestHandler } from '@sveltejs/kit'
import BaseContext from '../api/_modules/context'

export const get: RequestHandler = async ({ url }) => {
	const query = url.searchParams
	const browseId = query.get('browseId')

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
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

	const contents =
		data.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
			?.content?.sectionListRenderer?.contents
	let sections = []
	for (let index = 0; index < contents.length; index++) {
		const { gridRenderer } = contents[index]
		const { items = [], header = {} } = gridRenderer

		for (let i = 0; i < items.length; i++) {
			const item = items[i]?.musicNavigationButtonRenderer
			items[i] = {
				text: item?.buttonText?.runs[0]?.text,
				color: `#${(
					'00000000' + (item?.solid?.leftStripeColor & 0xffffff).toString(16)
				).slice(-6)}`,
				endpoint: {
					params: item?.clickCommand?.browseEndpoint?.params,
					browseId: item?.clickCommand?.browseEndpoint?.browseId
				}
			}
		}
		sections = [
			...sections,
			{
				section: [...items],
				title: header?.gridHeaderRenderer?.title?.runs[0]?.text
			}
		]
	}

	return {
		status: 200,
		body: JSON.stringify(sections)
	}
}
