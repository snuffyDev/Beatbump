import BaseContext from '$lib/context'
import {
	MoodsAndGenresItem,
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from '$lib/parsers'
import type { CarouselItem } from '$lib/types'
import type { EndpointOutput } from '@sveltejs/kit'

export async function get({ query }): Promise<EndpointOutput> {
	// console.time('timer')
	const endpoint = query.get('q') || ''
	const browseId = 'FEmusic_explore'
	let carouselItems = []
	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/${endpoint}?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
			{
				method: 'POST',
				body: JSON.stringify({
					...BaseContext,

					browseId: `${browseId}`
				}),
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					Origin: 'https://music.youtube.com',
					'User-Agent':
						'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
				}
			}
		)

		if (!response.ok) {
			// NOT res.status >= 200 && res.status < 300
			return { status: response.status, body: response.statusText }
		}
		// const data = await response.json();
		const {
			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: {
									sectionListRenderer: { contents = [] }
								}
							}
						}
					]
				}
			}
		} = await response.json()

		carouselItems.push(
			...contents.filter((content) => {
				return content.musicCarouselShelfRenderer
			})
		)

		return {
			body: await carouselItems.map(({ musicCarouselShelfRenderer }) => {
				// console.timeEnd('timer')
				return {
					header: parseHeader([musicCarouselShelfRenderer.header])[0],
					results: parseBody(musicCarouselShelfRenderer.contents)
				}
			}),
			status: 200
		}
	} catch (error) {
		return {
			status: 500,
			body: error
		}
	}
}

function parseHeader(header: any[]) {
	return header.map(({ musicCarouselShelfBasicHeaderRenderer }) => ({
		title: musicCarouselShelfBasicHeaderRenderer['title']['runs'][0].text,
		browseId:
			musicCarouselShelfBasicHeaderRenderer.moreContentButton.buttonRenderer
				.navigationEndpoint.browseEndpoint.browseId
	}))
}

function parseBody(contents): CarouselItem[] {
	return [
		...contents.map(({ ...r }) => {
			if (r.musicTwoRowItemRenderer) {
				return MusicTwoRowItemRenderer(r)
			}
			if (r.musicResponsiveListItemRenderer) {
				return MusicResponsiveListItemRenderer(r)
			}
			if (r.musicNavigationButtonRenderer) {
				return MoodsAndGenresItem(r)
			}
			throw new Error("Unable to parse items, can't find " + `${r}`)
		})
	]
}
