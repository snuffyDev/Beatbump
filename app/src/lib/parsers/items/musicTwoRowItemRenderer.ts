import type { IMusicTwoRowItemRenderer, SubtitleRun } from "$lib/types/internals";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import { thumbnailTransformer } from "../utils.parsers";

export const MusicTwoRowItemRenderer = (ctx: {
	musicTwoRowItemRenderer: IMusicTwoRowItemRenderer & unknown;
}): ICarouselTwoRowItem => {
	const musicTwoRowItemRenderer = ctx.musicTwoRowItemRenderer;
	const thumbnails = musicTwoRowItemRenderer?.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];

	for (let idx = 0; idx < thumbnails.length; idx++) {
		const item = thumbnails[idx];
		const newThumbnail = thumbnailTransformer(item.url);
		Object.assign(thumbnails[idx], newThumbnail);
	}

	const playlistIdShort = musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.playlistId;
	const playlistId =
		playlistIdShort ??
		musicTwoRowItemRenderer.thumbnailOverlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
			?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId ??
		musicTwoRowItemRenderer.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
			?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId;

	const Item: ICarouselTwoRowItem = {
		title: musicTwoRowItemRenderer["title"]["runs"][0].text,
		thumbnails,
		aspectRatio: musicTwoRowItemRenderer.aspectRatio,
		videoId: musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.videoId,
		playlistId,
		musicVideoType:
			musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.watchEndpointMusicSupportedConfigs
				?.watchEndpointMusicConfig?.musicVideoType,
		playerParams: musicTwoRowItemRenderer.navigationEndpoint?.watchEndpoint?.params,
		endpoint: musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint
			? {
					browseId: musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint?.browseId || undefined,
					pageType:
						musicTwoRowItemRenderer.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
							?.browseEndpointContextMusicConfig?.pageType || undefined,
			  }
			: undefined,

		subtitle:
			(musicTwoRowItemRenderer.subtitle?.runs as Array<SubtitleRun>) &&
			musicTwoRowItemRenderer.subtitle?.runs?.length !== 0 &&
			(() => {
				const items = musicTwoRowItemRenderer.subtitle?.runs as any[];
				for (let idx = 0; idx < items.length; idx++) {
					const item = items[idx];
					if (
						item?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType.includes(
							"ARTIST",
						)
					) {
						items[idx] = {
							text: item.text,
							browseId: item.navigationEndpoint?.browseEndpoint?.browseId,
							pageType:
								item.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
									?.browseEndpointContextMusicConfig?.pageType,
						};
					}
				}
				return items as any[];
			})(),
	};

	return Item;
};
