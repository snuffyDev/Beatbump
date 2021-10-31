import { parseArtistPage } from '$lib/js/artistUtils'
import type { ICarousel } from '$lib/types'

const parse = (header, contents = []) => {
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

export const artistHandler = (data: Record<string, any>) => {
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
		data: parsed
	}
}
