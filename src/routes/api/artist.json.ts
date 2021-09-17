import BaseContext from '$lib/context'
import { parseArtistPage } from '$lib/js/artistUtils'
import type { ICarousel } from '$lib/types'
import type { EndpointOutput } from '@sveltejs/kit'

export async function get({
	query
}: {
	query: URLSearchParams
}): Promise<EndpointOutput> {
	const browseId = query.get('browseId')
	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/browse?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
			{
				method: 'POST',
				body: JSON.stringify({
					...BaseContext,
					browseEndpointContextMusicConfig: {
						browseEndpointContextMusicConfig: {
							pageType: 'MUSIC_PAGE_TYPE_ARTIST'
						}
					},
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
		const data = await response.json()
		const {
			header,

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
		} = data

		const parsed = parse(header, contents)

		return {
			status: 200,
			body: {
				...parsed[0],
				contents
			}
		}
	} catch (err) {
		console.log(err)
		throw new Error(err)
	}
}

function parse(header, contents) {
	const carouselItems: ICarousel[] | null = []
	const thumbnail = []
	let description = ''
	let items = []
	const headerContent = []
	const newData = [
		parseArtistPage(header?.musicImmersiveHeaderRenderer, contents)
	]
	return newData.map((d) => {
		carouselItems.push(...d.carouselItems)
		headerContent.push(d[0])
		if (d[0]) {
			d[0].thumbnails?.forEach((h) => {
				thumbnail.push(h)
			})
		}
		if (d?.songs) {
			items = [...d.songs]
		} else {
			items = undefined
		}
		description = d[0].description

		return {
			header: headerContent[0],
			songs: items,
			thumbnail,
			carousels: carouselItems,
			description
		}
	})
}
