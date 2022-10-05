import { error, json as json$1 } from "@sveltejs/kit";
import { MusicResponsiveListItemRenderer, MusicTwoRowItemRenderer } from "$lib/parsers";
import type { Item, Song } from "$lib/types";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { RequestHandler } from "@sveltejs/kit";
import { buildRequest } from "$api/request";
type ResponseBody = {
	browseId: string;
	params: string;
	pageType: string;
};
export const GET: RequestHandler = async ({ url }) => {
	try {
		const carousels: { header?: { text?: string }; items?: (ICarouselTwoRowItem | IListItemRenderer)[] }[] = [];
		const description: { header?: string; description?: string } = {};
		const browseId = url.searchParams.get("browseId");

		const response = await buildRequest("related", {
			context: { client: { clientName: "WEB_REMIX", clientVersion: "1.20220404.01.00" } },
			params: {
				browseId: browseId,
				params: undefined,
				browseEndpointContextMusicConfig: {
					browseEndpointContextMusicConfig: { pageType: "MUSIC_PAGE_TYPE_TRACK_RELATED" },
				},
			},
		});
		const data = await response.json();
		const contents = Array.isArray(data?.contents?.sectionListRenderer?.contents)
			? (data?.contents?.sectionListRenderer?.contents as Array<any>)
			: [];
		let pos = contents.length;
		// Loop over the sections
		while (--pos > -1) {
			const section = contents[pos];
			if (section?.musicCarouselShelfRenderer) {
				const carousel: { header?: { text: string }; items?: Item[] } = {};
				const items = [];
				let idx = section?.musicCarouselShelfRenderer?.contents?.length;

				// Loop over the carousel items
				while (--idx > -1) {
					const item = section?.musicCarouselShelfRenderer?.contents[idx];
					if (item?.musicTwoRowItemRenderer) {
						items.unshift(MusicTwoRowItemRenderer(item));
					}
					if (item?.musicResponsiveListItemRenderer) {
						items.unshift(MusicResponsiveListItemRenderer(item));
					}
				}
				carousel.items = items;
				carousel.header = {
					text: section?.musicCarouselShelfRenderer?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs[0]
						?.text,
				};
				carousels.push(carousel);
			}
			// Description shelf parsing
			if (section?.musicDescriptionShelfRenderer) {
				description.header = section?.musicDescriptionShelfRenderer?.header?.runs[0]?.text;
				description.description = section?.musicDescriptionShelfRenderer?.description?.runs[0]?.text;
			}
		}
		return json$1({
			carousels,
			description,
		});
	} catch (err) {
		console.error(err);

		throw error(500, err);
	}
};
