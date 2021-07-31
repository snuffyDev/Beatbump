import {
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from '$lib/parsers'

export const parseArtistPage = (header, items) => {
	// console.log(items)
	header = [header]
	const parsedHeader = header.map((h) => {
		const name = h?.title.runs[0].text
		let description
		const thumbnail = h?.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails
		const mixInfo =
			h?.startRadioButton.buttonRenderer.navigationEndpoint
				.watchPlaylistEndpoint
		if (h?.description) {
			description = h?.description.runs[0].text
		} else {
			description = ''
		}
		return {
			name: name,
			thumbnails: thumbnail,
			mixInfo: mixInfo,
			description: description
		}
	})
	let songs
	let carouselItems = []

	items.map((i) => {
		if (i?.musicShelfRenderer) {
			songs = parseSongs(i?.musicShelfRenderer?.contents)
			// console.log(songs)
		}
		if (i?.musicCarouselShelfRenderer) {
			carouselItems = [
				...carouselItems,
				parseCarouselItem(i?.musicCarouselShelfRenderer.contents, [
					i?.musicCarouselShelfRenderer.header
						?.musicCarouselShelfBasicHeaderRenderer
				])
			]
		}
	})
	// console.log(`items`, carouselItems)
	return { ...parsedHeader, songs, carouselItems }
}

function parseSongs(items) {
	let results = []
	let explicit
	results = [
		...items.map((song) => {
			const Item = MusicResponsiveListItemRenderer(song)
			return Item
		})
	]
	return results
}

function parseCarouselItem(items, header = []) {
	// console.log(items, header)
	// console.log(items)
	const contents = items.map((item) => {
		// console.log(ctx, ctx?.musicTwoRowItemRenderer)\
		const Item = MusicTwoRowItemRenderer(item)
		if (Item.playlistId !== undefined || Item.playlistId !== null) {
			return Item
		} else {
			return Item
		}
	})
	// console.log(contents)
	const head = header.map((i) => {
		const title = i?.title?.runs[0].text
		const endpoint = i?.title?.runs[0].navigationEndpoint
		const moreButton = i.moreContentButton?.buttonRenderer?.navigationEndpoint
		if (endpoint) {
			return {
				title,
				itct: endpoint?.clickTrackingParams,
				browseId: endpoint?.browseEndpoint.browseId,
				params: endpoint?.browseEndpoint.params
			}
		} else {
			return { title }
		}
	})
	// console.log(head)
	return { header: head[0], contents }
}
