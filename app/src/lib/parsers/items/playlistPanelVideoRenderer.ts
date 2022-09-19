import type { Song } from "$lib/types";
import type { IPlaylistPanelVideoRenderer } from "$lib/types/playlistPanelVideoRenderer";
import { map } from "$lib/utils";

export function PlaylistPanelVideoRenderer(ctx: IPlaylistPanelVideoRenderer): Song {
	// console.log(ctx.menu.menuRenderer.items);
	const Item = {
		subtitle: map(ctx?.shortBylineText?.runs, (item, idx) => {
			if (ctx?.longBylineText?.runs[idx]?.navigationEndpoint !== undefined) {
				return {
					text: item.text,
					browseId: ctx?.longBylineText.runs[idx].navigationEndpoint?.browseEndpoint?.browseId,
					pageType:
						ctx.longBylineText.runs[idx]?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
							?.browseEndpointContextMusicConfig?.pageType,
				};
			} else return item;
		}),
		thumbnails: ctx?.thumbnail?.thumbnails || [],
		artistInfo: {
			artist: [
				{
					text: ctx?.longBylineText?.runs[0]?.text,
					browseId: ctx?.longBylineText?.runs[0]?.navigationEndpoint?.browseEndpoint?.browseId,
					pageType:
						ctx?.longBylineText?.runs[0]?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
							?.browseEndpointContextMusicConfig?.pageType,
				},
			],
		},
		videoId: ctx?.navigationEndpoint?.watchEndpoint?.videoId,
		playlistId: ctx?.navigationEndpoint?.watchEndpoint?.playlistId,
		playlistSetVideoId:
			(ctx?.navigationEndpoint?.watchEndpoint?.playlistSetVideoId ?? ctx?.playlistSetVideoId) || undefined,
		playerParams: ctx?.navigationEndpoint?.watchEndpoint?.playerParams,
		itct: ctx?.navigationEndpoint?.watchEndpoint?.params,
		index: ctx?.navigationEndpoint?.watchEndpoint?.index,
		title: ctx?.title?.runs[0]?.text,
		autoMixList:
			ctx?.menu?.menuRenderer?.items[0]?.menuNavigationItemRenderer?.navigationEndpoint?.watchEndpoint?.playlistId,
		length: ctx?.lengthText?.runs[0]?.text,
		album: map(
			ctx?.menu?.menuRenderer?.items.filter(
				(item) =>
					item?.menuNavigationItemRenderer && item?.menuNavigationItemRenderer?.icon?.iconType.includes("ALBUM"),
			) ?? [],
			(item) => {
				if (!item) return;
				const i = item?.menuNavigationItemRenderer;
				return {
					title: Array.isArray(ctx?.longBylineText?.runs)
						? ctx?.longBylineText?.runs[ctx?.longBylineText?.runs?.length - 3]?.text
						: i?.text?.runs[0]?.text,
					browseId: i?.navigationEndpoint?.browseEndpoint?.browseId,
					pageType:
						i?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
							?.browseEndpointContextMusicConfig?.pageType,
				};
			},
		)[0],
	};
	return Item;
}
