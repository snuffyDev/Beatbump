import BaseContext from '$lib/context'
import {
	MoodsAndGenresItem,
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from '$lib/parsers'

import type { CarouselHeader, CarouselItem } from '$lib/types'
import type { EndpointParams } from '$lib/types/internals'

export async function get({ query }: EndpointParams): Promise<EndpointOutput> {
	const endpoint = query.get('q') || ''
	const browseId = 'FEmusic_explore'
	const carouselItems = []
	// console.time('test')
	// fetch data using Base Context
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
		return { status: response.status, body: response.statusText }
	}

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
	} = await response.json()
	carouselItems.push(
		...contents.filter((contents) => {
			if (contents.musicCarouselShelfRenderer)
				return contents.musicCarouselShelfRenderer
		})
	)
	// const body = c
	// if (body.length !== 0)
	return {
		body: carouselItems.map(({ musicCarouselShelfRenderer }) => {
			// console.timeEnd('test')
			return parseCarousel({ musicCarouselShelfRenderer })
		})
	}
}

function parseHeader(header: any[]): CarouselHeader[] {
	return header.map(({ musicCarouselShelfBasicHeaderRenderer } = {}) => ({
		title: musicCarouselShelfBasicHeaderRenderer['title']['runs'][0].text,
		browseId:
			musicCarouselShelfBasicHeaderRenderer.moreContentButton.buttonRenderer
				.navigationEndpoint.browseEndpoint.browseId
	}))
}

function parseBody(contents): CarouselItem[] {
	return contents.map(({ ...r }) => {
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
}
function parseCarousel({ musicCarouselShelfRenderer }) {
	return {
		header: parseHeader([musicCarouselShelfRenderer.header])[0],
		results: parseBody(musicCarouselShelfRenderer.contents)
	}
}
