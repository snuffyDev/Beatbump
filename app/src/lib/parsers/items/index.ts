import type { Song, Thumbnail } from "$lib/types";
import type {
	IMusicResponsiveListItemRenderer,
	IMusicTwoRowItemRenderer,
	PurpleRun,
	SubtitleRun,
} from "$lib/types/innertube/internals";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { IPlaylistPanelVideoRenderer } from "$lib/types/playlistPanelVideoRenderer";
import { map } from "$lib/utils";
import { proxyUrls } from "$lib/utils/thumbnailProxyUrl";
import { subtitle, thumbnailTransformer } from "../utils.parsers";

export { MusicResponsiveListItemRenderer } from "./musicResponsiveListItemRenderer";
export { MusicTwoRowItemRenderer } from "./musicTwoRowItemRenderer";
export { PlaylistPanelVideoRenderer } from "./playlistPanelVideoRenderer";

export class ItemBuilder {
	private proxy: boolean;
	private handleProxy: ReturnType<typeof proxyUrls> | undefined = undefined;
	private origin: string;
	constructor({ proxy = true, origin }: { proxy: boolean; origin: string }) {
		this.proxy = proxy;
		this.origin = origin;

		if (this.proxy) {
			this.handleProxy = proxyUrls(this.origin);
		}
	}

	async MusicResponsiveListItemRenderer(
		ctx: { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer },
		params: {
			playlistSetVideoId?: boolean;
			playlistId?: string;
			type?: string | undefined;
		} = {},
	): Promise<IListItemRenderer> {
		const { playlistSetVideoId, playlistId, type } = params;

		const item = ctx.musicResponsiveListItemRenderer;
		const thumbnails = (
			item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
		).map((thumbnail) => {
			const parsed = {
				...thumbnail,
				...thumbnailTransformer(thumbnail.url),
			};
			return this.handleProxy ? this.handleProxy(parsed) : parsed;
		});

		const flexColumns = Array.isArray(item.flexColumns) ? item.flexColumns : [];
		const subtitleRuns =
			flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs;
		const flexCol0 =
			flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text
				?.runs?.[0] || ({} as PurpleRun);
		const subtitles = Array.isArray(subtitleRuns) ? subtitle(subtitleRuns) : [];
		const isNavigationItem = item.navigationEndpoint?.browseEndpoint;
		const Item: IListItemRenderer = Object.create(null);
		Object.assign(Item, {
			subtitle: subtitles,
			artistInfo: {
				artist: [subtitles[0]],
			},
			explicit: "badges" in item,
			title: flexCol0.text,
			aspectRatio: item.flexColumnDisplayStyle,
			musicVideoType:
				flexCol0.navigationEndpoint?.watchEndpoint?.watchEndpointMusicConfig
					?.musicVideoType ??
				flexCol0.navigationEndpoint?.watchEndpoint
					?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig
					?.musicVideoType,
			videoId:
				flexCol0.navigationEndpoint?.watchEndpoint?.videoId ??
				item.navigationEndpoint?.watchEndpoint?.videoId ??
				undefined,
			playlistId: flexCol0.navigationEndpoint?.watchEndpoint?.playlistId
				? flexCol0?.navigationEndpoint?.watchEndpoint?.playlistId
				: item.menu?.menuRenderer.items[0].menuNavigationItemRenderer
						?.navigationEndpoint?.watchEndpoint?.playlistId
				? item.menu?.menuRenderer?.items[0]?.menuNavigationItemRenderer
						.navigationEndpoint?.watchEndpoint?.playlistId
				: item?.watchEndpoint?.playlistId
				? item?.watchEndpoint?.playlistId
				: item.navigationEndpoint?.watchEndpoint?.playlistId,
			thumbnails: thumbnails as (Thumbnail & { placeholder: string })[],
			length:
				"fixedColumns" in item &&
				item.fixedColumns[0]?.musicResponsiveListItemFixedColumnRenderer?.text
					?.runs?.length
					? item.fixedColumns[0]?.musicResponsiveListItemFixedColumnRenderer
							?.text?.runs[0]?.text
					: undefined,
			type: type,
			params:
				item.overlay?.musicItemThumbnailOverlayRenderer?.content
					?.musicPlayButtonRenderer?.playNavigationEndpoint
					?.watchPlaylistEndpoint?.params ?? undefined,
			playerParams:
				flexCol0?.navigationEndpoint?.watchEndpoint?.playerParams ||
				flexCol0?.navigationEndpoint?.watchEndpoint?.params,
			clickTrackingParams:
				item.overlay?.musicItemThumbnailOverlayRenderer?.content
					?.musicPlayButtonRenderer?.playNavigationEndpoint
					?.clickTrackingParams ||
				flexCol0?.navigationEndpoint?.clickTrackingParams,
			loggingContext:
				item.overlay?.musicItemThumbnailOverlayRenderer?.content
					?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint
					?.loggingContext ??
				item.navigationEndpoint?.watchEndpoint?.loggingContext,
		});
		if (isNavigationItem)
			Item.endpoint = {
				browseId: isNavigationItem.browseId,
				pageType:
					isNavigationItem.browseEndpointContextSupportedConfigs
						.browseEndpointContextMusicConfig.pageType,
			};
		if (Item !== undefined && playlistSetVideoId) {
			Object.assign(Item, {
				playlistSetVideoId:
					item?.playlistSetVideoId ||
					item.overlay?.musicItemThumbnailOverlayRenderer.content
						?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint
						?.playlistSetVideoId,
				playlistId,
			});
		}
		if (Array.isArray(Item.subtitle) && Item.subtitle[0]?.text === "Artist") {
			Object.assign(Item, {
				artistInfo: {
					artist: [
						{
							pageType:
								item.navigationEndpoint?.browseEndpoint
									?.browseEndpointContextSupportedConfigs
									?.browseEndpointContextMusicConfig?.pageType,
							browseId: item?.navigationEndpoint?.browseEndpoint?.browseId,
						},
					],
				},
			});
		}

		return Item;
	}

	async MusicTwoRowItemRenderer(ctx: {
		musicTwoRowItemRenderer: IMusicTwoRowItemRenderer & unknown;
	}): Promise<ICarouselTwoRowItem> {
		const musicTwoRowItemRenderer = ctx.musicTwoRowItemRenderer;
		const thumbnails = (
			musicTwoRowItemRenderer.thumbnailRenderer?.musicThumbnailRenderer
				?.thumbnail?.thumbnails || []
		).map((thumbnail) => {
			const parsed = {
				...thumbnail,
				...thumbnailTransformer(thumbnail.url),
			};
			return this.handleProxy ? this.handleProxy(parsed) : parsed;
		});

		const playlistIdShort =
			musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.playlistId;
		const playlistId =
			playlistIdShort ??
			musicTwoRowItemRenderer.thumbnailOverlay
				?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
				?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId ??
			musicTwoRowItemRenderer.overlay?.musicItemThumbnailOverlayRenderer
				?.content?.musicPlayButtonRenderer?.playNavigationEndpoint
				?.watchPlaylistEndpoint?.playlistId;

		const Item: ICarouselTwoRowItem = {
			title: musicTwoRowItemRenderer["title"]["runs"][0].text,
			thumbnails,
			aspectRatio: musicTwoRowItemRenderer.aspectRatio,
			videoId:
				musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.videoId,
			playlistId,
			musicVideoType:
				musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint
					?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig
					?.musicVideoType,
			playerParams:
				musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.params,
			endpoint: musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint
				? {
						browseId:
							musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint
								?.browseId || undefined,
						pageType:
							musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint
								?.browseEndpointContextSupportedConfigs
								?.browseEndpointContextMusicConfig?.pageType || undefined,
				  }
				: null,
			subtitle: Array.isArray(
				musicTwoRowItemRenderer.subtitle?.runs as Array<SubtitleRun>,
			)
				? subtitle(musicTwoRowItemRenderer.subtitle.runs)
				: [],
		};

		return Item;
	}

	async PlaylistPanelVideoRenderer(
		ctx: IPlaylistPanelVideoRenderer,
	): Promise<Song> {
		// console.log(ctx.menu.menuRenderer.items);
		const Item = {
			subtitle: map(ctx.shortBylineText?.runs, (item, idx) => {
				if (ctx.longBylineText?.runs[idx]?.navigationEndpoint !== undefined) {
					return {
						text: item.text,
						browseId:
							ctx.longBylineText.runs[idx].navigationEndpoint?.browseEndpoint
								?.browseId,
						pageType:
							ctx.longBylineText.runs[idx]?.navigationEndpoint?.browseEndpoint
								?.browseEndpointContextSupportedConfigs
								?.browseEndpointContextMusicConfig?.pageType,
					};
				} else return item;
			}),
			thumbnails: (ctx.thumbnail?.thumbnails || []).map((thumbnail) => {
				const parsed = {
					...thumbnail,
					...thumbnailTransformer(thumbnail.url),
				};
				return this.handleProxy ? this.handleProxy(parsed) : parsed;
			}),
			artistInfo: {
				artist: [
					{
						text: ctx.longBylineText?.runs[0]?.text,
						browseId:
							ctx.longBylineText?.runs[0]?.navigationEndpoint?.browseEndpoint
								?.browseId,
						pageType:
							ctx.longBylineText?.runs[0]?.navigationEndpoint?.browseEndpoint
								?.browseEndpointContextSupportedConfigs
								?.browseEndpointContextMusicConfig?.pageType,
					},
				],
			},
			videoId: ctx.navigationEndpoint?.watchEndpoint?.videoId,
			playlistId: ctx.navigationEndpoint?.watchEndpoint?.playlistId,
			playlistSetVideoId:
				(ctx.navigationEndpoint?.watchEndpoint?.playlistSetVideoId ??
					ctx.playlistSetVideoId) ||
				undefined,
			playerParams: ctx.navigationEndpoint?.watchEndpoint?.playerParams,
			itct: ctx.navigationEndpoint?.watchEndpoint?.params,
			index: ctx.navigationEndpoint?.watchEndpoint?.index,
			title: ctx.title?.runs[0]?.text,
			autoMixList:
				ctx.menu?.menuRenderer?.items[0]?.menuNavigationItemRenderer
					?.navigationEndpoint?.watchEndpoint?.playlistId,
			length: ctx.lengthText?.runs[0]?.text,
			clickTrackingParams: ctx.navigationEndpoint?.clickTrackingParams,
			album: map(
				ctx.menu?.menuRenderer?.items.filter(
					(item) =>
						item?.menuNavigationItemRenderer &&
						item?.menuNavigationItemRenderer?.icon?.iconType.includes("ALBUM"),
				) ?? [],
				(item) => {
					if (!item) return;
					const i = item?.menuNavigationItemRenderer;
					return {
						title: Array.isArray(ctx.longBylineText?.runs)
							? ctx.longBylineText?.runs[ctx.longBylineText?.runs?.length - 3]
									?.text
							: i?.text?.runs[0]?.text,
						browseId: i?.navigationEndpoint?.browseEndpoint?.browseId,
						pageType:
							i?.navigationEndpoint?.browseEndpoint
								?.browseEndpointContextSupportedConfigs
								?.browseEndpointContextMusicConfig?.pageType,
					};
				},
			)[0],
		};
		return Item;
	}

	handleGenericThumbnailItem(thumbnail: Thumbnail) {
		return this.handleProxy ? this.handleProxy(thumbnail) : thumbnail;
	}
}
