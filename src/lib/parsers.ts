import type { CarouselItem } from './types'

export function parseNextItem(item, length) {
	item = [item]
	const result = item.map((item) => {
		const title = item.title
		if (item?.subtitle) {
			return {
				title: title,
				artistInfo: {
					pageType: 'MUSIC_PAGE_TYPE_ARTIST',
					artist: item.subtitle[0].text,
					browseId: item.subtitle[0].browseId
				},
				videoId: item.videoId,
				autoMixList: item.playlistId,
				thumbnail: item.thumbnails[0].url,
				length: length
			}
		}
		return {
			title: title,
			artistInfo: {
				pageType: 'MUSIC_PAGE_TYPE_ARTIST',
				artist: item.artistInfo.artist[0],
				browseId: item.artistInfo.browseId
			},
			videoId: item.videoId,
			autoMixList: item.playlistId,
			thumbnail: item.thumbnails[0].url,
			length: length
		}
	})
	console.log(result)
	return result[0]
}

export const MusicTwoRowItemRenderer = (ctx: any): CarouselItem => {
	const Item: CarouselItem = {
		title: ctx.musicTwoRowItemRenderer.title.runs[0].text,
		thumbnails:
			ctx.musicTwoRowItemRenderer.thumbnailRenderer.musicThumbnailRenderer
				.thumbnail.thumbnails,
		aspectRatio: ctx.musicTwoRowItemRenderer.aspectRatio,
		videoId:
			ctx.musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.videoId,
		playlistId: ctx.musicTwoRowItemRenderer.navigationEndpoint.watchEndpoint
			?.playlistId
			? ctx.musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint
					?.playlistId
			: ctx.musicTwoRowItemRenderer?.thumbnailOverlay
					?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
					?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
			  ctx.musicTwoRowItemRenderer?.overlay?.musicItemThumbnailOverlayRenderer
					?.content?.musicPlayButtonRenderer?.playNavigationEndpoint
					?.watchPlaylistEndpoint?.playlistId,
		endpoint: ctx.musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint
			? {
					browseId:
						ctx.musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint
							?.browseId || undefined,
					pageType:
						ctx.musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint
							?.browseEndpointContextSupportedConfigs
							?.browseEndpointContextMusicConfig?.pageType || undefined
			  }
			: undefined,

		subtitle: ctx?.musicTwoRowItemRenderer?.subtitle?.runs
	}
	return Item
}

export const MusicResponsiveListItemRenderer = (ctx: any): CarouselItem => {
	const Item: CarouselItem = {
		subtitle: [
			...ctx.musicResponsiveListItemRenderer.flexColumns[1]
				.musicResponsiveListItemFlexColumnRenderer.text.runs
		],
		artistInfo: {
			artist:
				ctx.musicResponsiveListItemRenderer.flexColumns[1]
					.musicResponsiveListItemFlexColumnRenderer.text.runs[0].text
		},
		explicit: ctx?.badges ? ctx?.badges : false,
		title:
			ctx.musicResponsiveListItemRenderer.flexColumns[0]
				.musicResponsiveListItemFlexColumnRenderer.text.runs[0].text,
		aspectRatio: ctx.musicResponsiveListItemRenderer.flexColumnDisplayStyle,
		videoId:
			ctx.musicResponsiveListItemRenderer.flexColumns[0]
				.musicResponsiveListItemFlexColumnRenderer.text.runs[0]
				?.navigationEndpoint?.watchEndpoint?.videoId || '',
		playlistId: ctx.musicResponsiveListItemRenderer.menu.menuRenderer.items[0]
			.menuNavigationItemRenderer?.navigationEndpoint?.watchEndpoint?.playlistId
			? ctx.musicResponsiveListItemRenderer.menu.menuRenderer.items[0]
					.menuNavigationItemRenderer.navigationEndpoint.watchEndpoint
					.playlistId
			: ctx?.navigationEndpoint?.watchEndpoint,
		thumbnails:
			ctx.musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer
				.thumbnail.thumbnails
	}
	return Item
}

export const MoodsAndGenresItem = (ctx: any) => {
	const Item = {
		text: ctx.musicNavigationButtonRenderer?.buttonText.runs[0].text,
		color: (
			'00000000' +
			(
				ctx.musicNavigationButtonRenderer?.solid.leftStripeColor & 0xffffff
			).toString(16)
		).slice(-6),
		endpoint: {
			params:
				ctx.musicNavigationButtonRenderer?.clickCommand.browseEndpoint.params,
			browseId:
				ctx.musicNavigationButtonRenderer?.clickCommand.browseEndpoint.browseId
		}
	}
	return Item
}
