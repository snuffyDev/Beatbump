import type { Thumbnail } from "$lib/types";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import { map, filterMap, iter } from "$lib/utils";
import { thumbnailTransformer } from "../utils.parsers";
import type { IMusicResponsiveListItemRenderer } from "$lib/types/internals";
export function MusicResponsiveListItemRenderer(
	ctx: { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer },
	playlistSetVideoId?: boolean,
	playlistId?: string,
	type?: string,
): IListItemRenderer {
	let { thumbnail: { musicThumbnailRenderer: { thumbnail: { thumbnails = [] } = {} } = {} } = {} } =
		ctx.musicResponsiveListItemRenderer;
	thumbnails = map(thumbnails as Thumbnail[], (item) => {
		const { url, placeholder } = thumbnailTransformer(item.url);
		Object.assign(item, { url, placeholder });
		return item;
	});
	const item = ctx.musicResponsiveListItemRenderer;
	const flexColumns = Array.isArray(item.flexColumns) && item.flexColumns;
	const subtitles =
		Array.isArray(flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs) &&
		(() => {
			let arr: any[] = [];
			let length = flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.length;
			for (; length--; ) {
				arr[length] =
					flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[length]?.navigationEndpoint !==
					undefined
						? {
								text: flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[length].text,
								browseId:
									flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[length].navigationEndpoint
										?.browseEndpoint?.browseId,
								pageType:
									flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[length]?.navigationEndpoint
										?.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType,
						  }
						: flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[length];
			}
			return arr;
		})();
	const Item: IListItemRenderer = {
		subtitle: subtitles,
		artistInfo: {
			artist: [subtitles[0]],
		},
		explicit: item.badges ? true : false,
		title: flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.text,
		aspectRatio: item.flexColumnDisplayStyle,
		playerParams:
			flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.navigationEndpoint?.watchEndpoint
				?.playerParams,
		musicVideoType:
			flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.navigationEndpoint?.watchEndpoint
				?.watchEndpointMusicConfig?.musicVideoType,
		videoId:
			flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.navigationEndpoint?.watchEndpoint
				?.videoId || "",
		playlistId: flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.navigationEndpoint
			?.watchEndpoint?.playlistId
			? flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.navigationEndpoint?.watchEndpoint
					?.playlistId
			: item.menu?.menuRenderer.items[0].menuNavigationItemRenderer?.navigationEndpoint?.watchEndpoint?.playlistId
			? item.menu?.menuRenderer?.items[0]?.menuNavigationItemRenderer.navigationEndpoint?.watchEndpoint?.playlistId
			: item?.watchEndpoint,
		thumbnails: thumbnails as (Thumbnail & { placeholder: string })[],
		length:
			item?.fixedColumns && item.fixedColumns[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.length
				? item.fixedColumns[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs[0]?.text
				: undefined,
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

	Object.assign(Item, {
		musicVideoType:
			flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.navigationEndpoint?.watchEndpoint
				?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig?.musicVideoType,
		type: type !== undefined ? type : "",
		playerParams:
			flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer.text?.runs[0]?.navigationEndpoint?.watchEndpoint
				?.playerParams ||
			flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs[0]?.navigationEndpoint?.watchEndpoint
				?.params,
	});
	return Item;
}
