import BaseContext from '$api/_modules/context'
import {
	MoodsAndGenresItem,
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from '$lib/parsers'

import type { CarouselHeader, CarouselItem } from '$lib/types'
import type { ICarouselTwoRowItem } from '$lib/types/musicCarouselTwoRowItem'
import type { IListItemRenderer } from '$lib/types/musicListItemRenderer'
import type { EndpointOutput, RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler<Record<string, any>> = async ({ query }) => {
	const endpoint = query.get('q') || ''
	const browseId = 'FEmusic_explore'
	let carouselItems = []
	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/${endpoint}?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
		{
			method: 'POST',
			body: JSON.stringify(BaseContext.base(browseId)),

			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				Origin: 'https://music.youtube.com',
				'User-Agent':
					'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
			}
		}
	)

	if (!response.ok) {
		return { status: response.status, body: response.statusText }
	}

	const data = await response.json()

	const contents =
		data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
			?.content?.sectionListRenderer?.contents
	for (let index = 0; index < contents.length; index++) {
		const element = { ...contents[index] }

		if (element?.musicCarouselShelfRenderer) {
			carouselItems = [...carouselItems, element]
		}
	}

	for (let index = 0; index < carouselItems.length; index++) {
		const element = carouselItems[index]
		carouselItems[index] = parseCarousel({
			musicCarouselShelfRenderer: element.musicCarouselShelfRenderer
		})
	}
	return {
		body: JSON.stringify(carouselItems),
		status: 200
	}
	return {
		error: new Error()
	}
}

function parseHeader({
	musicCarouselShelfBasicHeaderRenderer
}): CarouselHeader {
	if (musicCarouselShelfBasicHeaderRenderer) {
		let subheading, browseId
		if (musicCarouselShelfBasicHeaderRenderer?.strapline?.runs[0]?.text) {
			subheading =
				musicCarouselShelfBasicHeaderRenderer['strapline']['runs'][0].text
		}
		if (
			musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer
				?.navigationEndpoint?.browseEndpoint?.browseId
		) {
			browseId =
				musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer
					?.navigationEndpoint?.browseEndpoint?.browseId
		}
		return {
			title: musicCarouselShelfBasicHeaderRenderer['title']['runs'][0].text,
			subheading,
			browseId
		}
	}
}

function parseBody(
	contents = []
):
	| ICarouselTwoRowItem[]
	| IListItemRenderer[]
	| {
			text: any
			color: string
			endpoint: {
				params: any
				browseId: any
			}
	  }[] {
	let items = []
	for (let index = 0; index < contents.length; index++) {
		const element = contents[index]
		if (element.musicTwoRowItemRenderer) {
			items = [...items, MusicTwoRowItemRenderer(element)]
		}
		if (element.musicResponsiveListItemRenderer) {
			items = [...items, MusicResponsiveListItemRenderer(element)]
		}
		if (element.musicNavigationButtonRenderer) {
			items = [...items, MoodsAndGenresItem(element)]
		}
	}
	return items
}

function parseCarousel(carousel: {
	musicCarouselShelfRenderer?: Record<string, any>
}) {
	return {
		header: parseHeader(carousel.musicCarouselShelfRenderer?.header),
		results: parseBody(carousel.musicCarouselShelfRenderer?.contents)
	}
}
