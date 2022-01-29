import type { Item, Song, Thumbnail } from './types';
import type { ICarouselTwoRowItem } from './types/musicCarouselTwoRowItem';
import type { IListItemRenderer } from './types/musicListItemRenderer';
import type { IPlaylistPanelVideoRenderer } from './types/playlistPanelVideoRenderer';

type JSON =
	| string
	| number
	| boolean
	| null
	| JSON[]
	| Record<string, { [key: string]: string; value: string }>
	| { [key: string]: JSON };
function thumbnailTransformer(url) {
	let output = {
		placeholder: '',
		url: ''
	};
	if (!url.includes('lh3.googleusercontent.com')) {
		const split_url: string = url.split('?');
		const webp_url = split_url[0];
		output.url = webp_url;
		output.placeholder = webp_url?.replace('sddefault', 'default');
		// console.log(output.placeholder, output.url, webp_url)
	} else {
		const webp_url: string = url?.replace('-rj', '-rw');
		output.url = webp_url;
		output.placeholder = webp_url?.replace(
			/(=w(\d+)-h(\d+))/gm,

			'=w1-h1-p-fSoften=50,50,05'
		);
	}
	return output;
}
export function parseNextItem(item, length): Array<Item> {
	item = [item];
	const result = item.map((item) => {
		const title = item.title;
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
				thumbnails: item.thumbnails,
				length: length
			};
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
			thumbnails: item.thumbnails,
			length: length
		};
	});
	// console.log(result)
	return result[0];
}

export const MusicTwoRowItemRenderer = (ctx: {
	musicTwoRowItemRenderer;
}): ICarouselTwoRowItem => {
	let {
		musicTwoRowItemRenderer: {
			thumbnailRenderer: {
				musicThumbnailRenderer: { thumbnail: { thumbnails = [] } = {} } = {}
			} = {}
		} = {}
	} = ctx;
	for (let index = 0; index < thumbnails.length; index++) {
		const thumbnail = thumbnails[index];

		const { url, placeholder } = thumbnailTransformer(thumbnail.url);
		thumbnails[index] = {
			...thumbnail,
			url,
			original_url: thumbnail?.url,
			placeholder
		};
	}

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

		subtitle:
			ctx?.musicTwoRowItemRenderer?.subtitle?.runs &&
			ctx?.musicTwoRowItemRenderer?.subtitle?.runs.length !== 0 &&
			[...ctx?.musicTwoRowItemRenderer?.subtitle?.runs].map((item) => {
				if (
					item?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType.includes(
						'ARTIST'
					)
				) {
					return {
						text: item.text,
						browseId: item.navigationEndpoint?.browseEndpoint?.browseId,
						pageType:
							item.navigationEndpoint?.browseEndpoint
								?.browseEndpointContextSupportedConfigs
								?.browseEndpointContextMusicConfig?.pageType
					};
				}
				return { ...item };
			})
	};

	return Item;
};

export const MusicResponsiveListItemRenderer = (
	ctx: { musicResponsiveListItemRenderer },
	playlistSetVideoId?: boolean,
	playlistId?: string
): IListItemRenderer => {
	let {
		thumbnail: {
			musicThumbnailRenderer: { thumbnail: { thumbnails = [] } = {} } = {}
		} = {}
	} = ctx?.musicResponsiveListItemRenderer;
	for (let index = 0; index < thumbnails.length; index++) {
		const thumbnail = thumbnails[index] as Thumbnail;

		const { url, placeholder } = thumbnailTransformer(thumbnail.url);

		thumbnails[index] = {
			...thumbnail,
			url,
			original_url: thumbnail.url,
			placeholder
		};
	}

	let Item: IListItemRenderer = {
		subtitle: Array.isArray(
			ctx?.musicResponsiveListItemRenderer?.flexColumns[1]
				?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
		) && [
			...ctx?.musicResponsiveListItemRenderer?.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs.map(
				(item) => {
					if (
						item?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType.includes(
							'ARTIST'
						)
					) {
						return {
							text: item.text,
							browseId: item.navigationEndpoint?.browseEndpoint?.browseId,
							pageType:
								item.navigationEndpoint?.browseEndpoint
									?.browseEndpointContextSupportedConfigs
									?.browseEndpointContextMusicConfig?.pageType
						};
					}
					return { ...item };
				}
			)
		],
		artistInfo: {
			artist: Array.isArray(
				ctx?.musicResponsiveListItemRenderer?.flexColumns[1]
					?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
			) && [
				{
					text:
						ctx?.musicResponsiveListItemRenderer?.flexColumns[1]
							?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.text,
					browseId:
						ctx?.musicResponsiveListItemRenderer?.flexColumns[1]
							?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
							?.navigationEndpoint?.browseEndpoint?.browseId,

					pageType:
						ctx?.musicResponsiveListItemRenderer?.flexColumns[1]
							?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
							?.navigationEndpoint?.browseEndpoint
							?.browseEndpointContextSupportedConfigs
							?.browseEndpointContextMusicConfig?.pageType
				}
			]
		},
		explicit: ctx?.musicResponsiveListItemRenderer.badges ? true : false,
		title:
			ctx.musicResponsiveListItemRenderer?.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.text,
		aspectRatio: ctx.musicResponsiveListItemRenderer.flexColumnDisplayStyle,
		playerParams:
			ctx.musicResponsiveListItemRenderer.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.playerParams,
		musicVideoType:
			ctx.musicResponsiveListItemRenderer.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.watchEndpointMusicConfig
				?.musicVideoType,
		videoId:
			ctx.musicResponsiveListItemRenderer?.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.videoId || '',
		playlistId: ctx.musicResponsiveListItemRenderer?.menu?.menuRenderer.items[0]
			.menuNavigationItemRenderer?.navigationEndpoint?.watchEndpoint?.playlistId
			? ctx.musicResponsiveListItemRenderer?.menu?.menuRenderer?.items[0]
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
	};
	if (Item !== undefined && playlistSetVideoId) {
		Item = {
			...Item,
			playlistSetVideoId:
				ctx.musicResponsiveListItemRenderer.playlistItemData
					?.playlistSetVideoId ||
				ctx.musicResponsiveListItemRenderer?.overlay
					?.musicItemThumbnailOverlayRenderer.content?.musicPlayButtonRenderer
					?.playNavigationEndpoint?.watchEndpoint?.playlistSetVideoId
		};
		Item.playlistId = playlistId;
	}
	Item = {
		...Item,
		musicVideoType:
			ctx.musicResponsiveListItemRenderer?.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.watchEndpointMusicSupportedConfigs
				?.watchEndpointMusicConfig?.musicVideoType
	};
	Item = {
		...Item,
		playerParams:
			ctx.musicResponsiveListItemRenderer?.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.playerParams ||
			ctx.musicResponsiveListItemRenderer?.flexColumns[0]
				?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]
				?.navigationEndpoint?.watchEndpoint?.params
	};
	return Item;
};
export function PlaylistPanelVideoRenderer(
	ctx: IPlaylistPanelVideoRenderer
): Song {
	const Metadata = {
		videoId: ctx?.navigationEndpoint?.watchEndpoint?.videoId,
		playlistId: ctx?.navigationEndpoint?.watchEndpoint?.playlistId,
		playlistSetVideoId:
			ctx?.navigationEndpoint?.watchEndpoint?.playlistSetVideoId ?? undefined,
		playerParams: ctx?.navigationEndpoint?.watchEndpoint?.playerParams,
		itct: ctx?.navigationEndpoint?.watchEndpoint?.params,
		index: ctx?.navigationEndpoint?.watchEndpoint?.index
	};
	const Item: Song = {
		thumbnails: [...ctx?.thumbnail?.thumbnails],
		artistInfo: {
			artist: [
				{
					text: ctx?.longBylineText?.runs[0]?.text,
					browseId:
						ctx?.longBylineText?.runs[0]?.navigationEndpoint?.browseEndpoint
							?.browseId,
					pageType:
						ctx?.longBylineText?.runs[0]?.navigationEndpoint?.browseEndpoint
							?.browseEndpointContextSupportedConfigs
							?.browseEndpointContextMusicConfig?.pageType
				}
			]
		},
		...Metadata,
		title: ctx?.title?.runs[0]?.text,
		autoMixList:
			ctx?.menu?.menuRenderer?.items[0]?.menuNavigationItemRenderer
				?.navigationEndpoint?.watchEndpoint?.playlistId,
		length: ctx?.lengthText?.runs[0]?.text,
		album: ctx?.menu?.menuRenderer?.items
			?.filter((item) => {
				if (
					item?.menuNavigationItemRenderer &&
					item?.menuNavigationItemRenderer?.icon?.iconType?.includes('ALBUM')
				)
					return item;
			})
			?.map((item) => {
				const i = item?.menuNavigationItemRenderer;
				return {
					title:
						ctx?.longBylineText?.runs[ctx?.longBylineText?.runs?.length - 3]
							?.text ?? i?.text?.runs[0]?.text,
					browseId: i?.navigationEndpoint?.browseEndpoint?.browseId,
					pageType:
						i?.navigationEndpoint?.browseEndpoint
							?.browseEndpointContextSupportedConfigs
							?.browseEndpointContextMusicConfig?.pageType
				};
			})[0],
		hash:
			Math?.random()?.toString(36)?.substring(2, 15) +
			Math?.random()?.toString(36)?.substring(2, 15)
	};
	return Item;
}

export const MoodsAndGenresItem = (
	ctx: any
): {
	text: any;
	color: string;
	endpoint: {
		params: any;
		browseId: any;
	};
} => {
	// console.log(
	// 	ctx.musicNavigationButtonRenderer?.solid.leftStripeColor,
	// 	typeof ctx.musicNavigationButtonRenderer?.solid.leftStripeColor
	// )

	const Item = {
		text: ctx.musicNavigationButtonRenderer?.buttonText.runs[0].text,
		color: ctx.musicNavigationButtonRenderer?.solid.leftStripeColor
			.toString(16)
			.slice(2),
		endpoint: {
			params:
				ctx.musicNavigationButtonRenderer?.clickCommand.browseEndpoint.params,
			browseId:
				ctx.musicNavigationButtonRenderer?.clickCommand.browseEndpoint.browseId
		}
	};
	return Item;
};
