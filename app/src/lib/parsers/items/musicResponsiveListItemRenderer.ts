import type { Thumbnail } from "$lib/types";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import { subtitle, thumbnailTransformer } from "../utils.parsers";
import type { IMusicResponsiveListItemRenderer, PurpleRun } from "$lib/types/internals";

export function MusicResponsiveListItemRenderer(
	ctx: { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer },
	playlistSetVideoId?: boolean,
	playlistId?: string,
	type: string | undefined = undefined,
): IListItemRenderer {
	const thumbnails = ctx.musicResponsiveListItemRenderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
	for (let idx = 0; idx < thumbnails.length; idx++) {
		const item = thumbnails[idx];
		const newThumbnail = thumbnailTransformer(item.url);
		Object.assign(thumbnails[idx], newThumbnail);
	}
	const item = ctx.musicResponsiveListItemRenderer;
	const flexColumns = Array.isArray(item.flexColumns) && item.flexColumns;
	const subtitleRuns = flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs;
	const flexCol0 = flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0] || ({} as PurpleRun);
	const subtitles = Array.isArray(subtitleRuns) && subtitle(subtitleRuns);

	const Item: IListItemRenderer = {
		subtitle: subtitles,
		artistInfo: {
			artist: [subtitles[0]],
		},
		explicit: "badges" in item ? true : false,
		title: flexCol0.text,
		aspectRatio: item.flexColumnDisplayStyle,
		musicVideoType:
			flexCol0.navigationEndpoint?.watchEndpoint?.watchEndpointMusicConfig?.musicVideoType ??
			flexCol0.navigationEndpoint?.watchEndpoint?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig
				?.musicVideoType,
		videoId: flexCol0.navigationEndpoint?.watchEndpoint?.videoId || "",
		playlistId: flexCol0.navigationEndpoint?.watchEndpoint?.playlistId
			? flexCol0?.navigationEndpoint?.watchEndpoint?.playlistId
			: item.menu?.menuRenderer.items[0].menuNavigationItemRenderer?.navigationEndpoint?.watchEndpoint?.playlistId
			? item.menu?.menuRenderer?.items[0]?.menuNavigationItemRenderer.navigationEndpoint?.watchEndpoint?.playlistId
			: item?.watchEndpoint,
		thumbnails: thumbnails as (Thumbnail & { placeholder: string })[],
		length:
			"fixedColumns" in item && item.fixedColumns[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.length
				? item.fixedColumns[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs[0]?.text
				: undefined,
		type: type,
		playerParams:
			flexCol0?.navigationEndpoint?.watchEndpoint?.playerParams || flexCol0?.navigationEndpoint?.watchEndpoint?.params,
		clickTrackingParams:
			item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint
				?.clickTrackingParams,
		loggingContext:
			item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint
				?.watchEndpoint?.loggingContext,
	};
	if (Item !== undefined && playlistSetVideoId) {
		Object.assign(Item, {
			playlistSetVideoId:
				item.playlistSetVideoId ||
				item.overlay?.musicItemThumbnailOverlayRenderer.content?.musicPlayButtonRenderer?.playNavigationEndpoint
					?.watchEndpoint?.playlistSetVideoId,
			playlistId,
		});
	}
	if (Array.isArray(Item.subtitle) && Item.subtitle[0].text === "Artist") {
		Object.assign(Item, {
			artistInfo: {
				artist: [
					{
						pageType:
							item.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
								?.browseEndpointContextMusicConfig?.pageType,
						browseId: item?.navigationEndpoint?.browseEndpoint?.browseId,
					},
				],
			},
		});
	}

	Object.assign(Item, {});
	return Item;
}
