import type { Thumbnail } from "$lib/types";
import type { IMusicTwoRowItemRenderer, SubtitleRun } from "$lib/types/internals";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import { map } from "$lib/utils";
import { thumbnailTransformer } from "../utils.parsers";

export const MusicTwoRowItemRenderer = (ctx: {
	musicTwoRowItemRenderer: IMusicTwoRowItemRenderer & unknown;
}): ICarouselTwoRowItem => {
	let {
		musicTwoRowItemRenderer: {
			thumbnailRenderer: { musicThumbnailRenderer: { thumbnail: { thumbnails = [] } = {} } = {} } = {},
		} = {},
	} = ctx;
	thumbnails = map(thumbnails as Thumbnail[], (item, idx, arr) => {
		const { url, placeholder } = thumbnailTransformer(item.url);
		Object.assign(item, { url, placeholder });
		return item;
	});

	const Item: ICarouselTwoRowItem = {
		title: ctx["musicTwoRowItemRenderer"]["title"]["runs"][0].text,
		thumbnails,
		aspectRatio: ctx.musicTwoRowItemRenderer.aspectRatio,
		videoId: ctx.musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.videoId,
		playlistId: ctx.musicTwoRowItemRenderer?.navigationEndpoint?.watchEndpoint?.playlistId
			? ctx.musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.playlistId
			: ctx.musicTwoRowItemRenderer?.thumbnailOverlay?.musicItemThumbnailOverlayRenderer?.content
					?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId ||
			  ctx.musicTwoRowItemRenderer?.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
					?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId,
		musicVideoType:
			ctx.musicTwoRowItemRenderer?.navigationEndpoint?.watchEndpoint?.watchEndpointMusicSupportedConfigs
				?.watchEndpointMusicConfig?.musicVideoType,
		playerParams: ctx.musicTwoRowItemRenderer?.navigationEndpoint?.watchEndpoint?.params,
		endpoint: ctx.musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint
			? {
					browseId: ctx.musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint?.browseId || undefined,
					pageType:
						ctx.musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
							?.browseEndpointContextMusicConfig?.pageType || undefined,
			  }
			: undefined,

		subtitle:
			(ctx?.musicTwoRowItemRenderer?.subtitle?.runs as Array<SubtitleRun>) &&
			ctx?.musicTwoRowItemRenderer?.subtitle?.runs?.length !== 0 &&
			map(ctx?.musicTwoRowItemRenderer?.subtitle?.runs, (item: SubtitleRun) => {
				if (
					item?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType.includes(
						"ARTIST",
					)
				) {
					return {
						text: item.text,
						browseId: item.navigationEndpoint?.browseEndpoint?.browseId,
						pageType:
							item.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
								?.browseEndpointContextMusicConfig?.pageType,
					};
				}
				return item;
			}),
	};

	return Item;
};
