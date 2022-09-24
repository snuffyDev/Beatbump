import type { Item } from "../types";

export function parseNextItem(item, length): Item {
	item = [item];
	const result = item.map((item) => {
		const title = item.title;
		if (item?.subtitle) {
			return {
				title: title,
				artistInfo: {
					pageType: "MUSIC_PAGE_TYPE_ARTIST",
					artist: item.subtitle[0].text,
					browseId: item.subtitle[0].browseId,
				},
				videoId: item.videoId,
				autoMixList: item.playlistId,
				thumbnails: item.thumbnails,
				length: length,
			};
		}
		return {
			title: title,
			artistInfo: {
				pageType: "MUSIC_PAGE_TYPE_ARTIST",
				artist: Array.isArray(item.artistInfo) ? item.artistInfo.artist[0] : item.artistInfo.artist,
				browseId: item.artistInfo.browseId,
			},
			videoId: item.videoId,
			autoMixList: item.playlistId,
			thumbnails: item.thumbnails,
			length: length,
		};
	});
	// console.log(result)
	return result[0];
}

export const MoodsAndGenresItem = (
	ctx: any,
): {
	text: any;
	color: string;
	endpoint: {
		params: any;
		browseId: any;
	};
} => {
	return {
		text: ctx.musicNavigationButtonRenderer?.buttonText.runs[0].text,
		color: ("00000000" + (ctx.musicNavigationButtonRenderer?.solid.leftStripeColor & 0xffffff).toString(16)).slice(-6),

		endpoint: {
			params: ctx.musicNavigationButtonRenderer?.clickCommand.browseEndpoint.params,
			browseId: ctx.musicNavigationButtonRenderer?.clickCommand.browseEndpoint.browseId,
		},
	};
};
