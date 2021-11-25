import type { CarouselItem, Item } from './types'
import type {
	IMusicResponsiveListItemRenderer,
	IMusicTwoRowItemRenderer
} from './types/internals'
import type {
	ICarouselTwoRowItem,
	ITwoRowItemRenderer
} from './types/musicCarouselTwoRowItem'
import type { IListItemRenderer } from './types/musicListItemRenderer'

type JSON =
	| string
	| number
	| boolean
	| null
	| JSON[]
	| Record<string, { [key: string]: string; value: string }>
	| { [key: string]: JSON }

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
				artist: Array.isArray(item.artistInfo)
					? item.artistInfo.artist[0]
					: item.artistInfo.artist,
				browseId: item.artistInfo.browseId
			},
			videoId: item.videoId,
			autoMixList: item.playlistId,
			thumbnail: item.thumbnails ? item.thumbnails[0].url : item.thumbnail,
			length: length
		}
	})
	// console.log(result)
	return result[0]
}

export const MusicTwoRowItemRenderer = (ctx: {
	musicTwoRowItemRenderer
}): ICarouselTwoRowItem => {
	let {
		musicTwoRowItemRenderer: {
			thumbnailRenderer: {
				musicThumbnailRenderer: { thumbnail: { thumbnails = [] } = {} } = {}
			} = {}
		} = {}
	} = ctx

	thumbnails = thumbnails.map((d) => {
		const url: string = d?.url?.replace('-rj', '-rw')
		let placeholder = url
		placeholder = placeholder?.replace(
			/(=w(\d+)-h(\d+))/gm,

			'=w1-h1-p-fSoften=50,50,05'
		)
		return {
			...d,
			url: url,
			placeholder
		}
	})

	const Item: ICarouselTwoRowItem = {
		title: ctx['musicTwoRowItemRenderer']['title']['runs'][0].text,
		thumbnails,
		aspectRatio: ctx.musicTwoRowItemRenderer.aspectRatio,
		videoId:
			ctx.musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.videoId,
		playlistId: ctx.musicTwoRowItemRenderer?.navigationEndpoint?.watchEndpoint
			?.playlistId
			? ctx.musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint
					?.playlistId
			: ctx.musicTwoRowItemRenderer?.thumbnailOverlay
					?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
					?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
			  ctx.musicTwoRowItemRenderer?.overlay?.musicItemThumbnailOverlayRenderer
					?.content?.musicPlayButtonRenderer?.playNavigationEndpoint
					?.watchPlaylistEndpoint?.playlistId,
		musicVideoType:
			ctx.musicTwoRowItemRenderer?.navigationEndpoint?.watchEndpoint
				?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig
				?.musicVideoType,
		playerParams:
			ctx.musicTwoRowItemRenderer?.navigationEndpoint?.watchEndpoint?.params,
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

export const MusicResponsiveListItemRenderer = (
	ctx: { musicResponsiveListItemRenderer },
	playlistSetVideoId?: boolean,
	playlistId?: string
): IListItemRenderer => {
	let {
		thumbnail: {
			musicThumbnailRenderer: { thumbnail: { thumbnails = [] } = {} } = {}
		} = {}
	} = ctx?.musicResponsiveListItemRenderer
	thumbnails = thumbnails.map((d) => {
		let url: string = d?.url
		let placeholder = url
		placeholder = placeholder?.replace('sddefault', 'default')
		return {
			...d,
			url: url,
			placeholder
		}
	})

	let Item: IListItemRenderer = {
		subtitle: [
			...ctx.musicResponsiveListItemRenderer.flexColumns[1]
				.musicResponsiveListItemFlexColumnRenderer.text.runs
		],
		artistInfo: {
			artist: [
				{
					...ctx.musicResponsiveListItemRenderer.flexColumns[1]
						.musicResponsiveListItemFlexColumnRenderer.text.runs[0]
				}
			]
		},
		explicit: ctx?.musicResponsiveListItemRenderer.badges ? true : false,
		title:
			ctx.musicResponsiveListItemRenderer.flexColumns[0]
				.musicResponsiveListItemFlexColumnRenderer.text.runs[0].text,
		aspectRatio: ctx.musicResponsiveListItemRenderer.flexColumnDisplayStyle,
		playerParams:
			ctx.musicResponsiveListItemRenderer.flexColumns[0]
				.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.playerParams,
		musicVideoType:
			ctx.musicResponsiveListItemRenderer.flexColumns[0]
				.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.watchEndpointMusicConfig
				?.musicVideoType,
		videoId:
			ctx.musicResponsiveListItemRenderer.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.videoId || '',
		playlistId: ctx.musicResponsiveListItemRenderer?.menu?.menuRenderer.items[0]
			.menuNavigationItemRenderer?.navigationEndpoint?.watchEndpoint?.playlistId
			? ctx.musicResponsiveListItemRenderer?.menu?.menuRenderer.items[0]
					?.menuNavigationItemRenderer.navigationEndpoint?.watchEndpoint
					?.playlistId
			: ctx?.musicResponsiveListItemRenderer.navigationEndpoint?.watchEndpoint,
		thumbnails,
		length:
			ctx?.musicResponsiveListItemRenderer?.fixedColumns &&
			ctx?.musicResponsiveListItemRenderer?.fixedColumns[0]
				?.musicResponsiveListItemFixedColumnRenderer?.text?.runs.length
				? ctx?.musicResponsiveListItemRenderer?.fixedColumns[0]
						?.musicResponsiveListItemFixedColumnRenderer?.text?.runs[0]?.text
				: undefined
	}
	if (Item !== undefined && playlistSetVideoId) {
		Item = {
			...Item,
			playlistSetVideoId:
				ctx.musicResponsiveListItemRenderer.playlistItemData
					?.playlistSetVideoId ||
				ctx.musicResponsiveListItemRenderer?.overlay
					?.musicItemThumbnailOverlayRenderer.content?.musicPlayButtonRenderer
					?.playNavigationEndpoint?.watchEndpoint?.playlistSetVideoId
		}
		Item.playlistId = playlistId
	}
	Item = {
		...Item,
		musicVideoType:
			ctx.musicResponsiveListItemRenderer?.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.watchEndpointMusicSupportedConfigs
				?.watchEndpointMusicConfig?.musicVideoType
	}
	Item = {
		...Item,
		playerParams:
			ctx.musicResponsiveListItemRenderer?.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.playerParams ||
			ctx.musicResponsiveListItemRenderer?.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.params
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
