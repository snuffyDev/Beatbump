import { ItemBuilder } from "$lib/parsers";
import type { CarouselHeader } from "$lib/types";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { RequestHandler } from "@sveltejs/kit";
import { error, json as json$1 } from "@sveltejs/kit";
import { buildAPIRequest } from "../../_lib/request";

export type RelatedEndpointResponse = {
	carousels: {
		header?: CarouselHeader;
		items?: (ICarouselTwoRowItem | IListItemRenderer)[];
	}[];
	description: {
		header?: string;
		description?: string;
	};
};
export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const carousels: {
			header?: CarouselHeader;
			items?: (ICarouselTwoRowItem | IListItemRenderer)[];
		}[] = [];
		const description: { header?: string; description?: string } = {};
		const browseId = url.searchParams.get("browseId");
		const itemBuilder = new ItemBuilder({
			proxy: locals.preferences["Proxy Thumbnails"],
			origin: url.origin,
		});
		const response = await buildAPIRequest("related", {
			context: {
				client: { clientName: "WEB_REMIX", clientVersion: "1.20230501.01.00" },
				user: {
					lockedSafetyMode: locals.preferences.Restricted,
				},
			},
			headers: null,
			params: {
				browseId: browseId,
				params: undefined,
				browseEndpointContextMusicConfig: {
					browseEndpointContextMusicConfig: {
						pageType: "MUSIC_PAGE_TYPE_TRACK_RELATED",
					},
				},
			},
		});
		if (!response) throw error(500, "Failed to fetch");
		const data = await response.json();
		const contents = Array.isArray(
			data?.contents?.sectionListRenderer?.contents,
		)
			? (data?.contents?.sectionListRenderer?.contents as Array<any>)
			: [];
		let pos = contents.length;
		// Loop over the sections
		while (--pos > -1) {
			const section = contents[pos];
			if (section?.musicCarouselShelfRenderer) {
				const carousel: {
					header?: CarouselHeader;
					items?: (ICarouselTwoRowItem | IListItemRenderer)[];
				} = {};
				let idx = section?.musicCarouselShelfRenderer?.contents?.length;
				const promises: Promise<ICarouselTwoRowItem | IListItemRenderer>[] = [];

				// Loop over the carousel items
				while (--idx > -1) {
					const item = section?.musicCarouselShelfRenderer?.contents[idx];
					if (item?.musicTwoRowItemRenderer) {
						promises.unshift(itemBuilder.MusicTwoRowItemRenderer(item));
					}
					if (item?.musicResponsiveListItemRenderer) {
						promises.unshift(itemBuilder.MusicResponsiveListItemRenderer(item));
					}
				}
				carousel.items = (await Promise.all(promises)) as (
					| ICarouselTwoRowItem
					| IListItemRenderer
				)[];
				carousel.header = {
					title:
						section?.musicCarouselShelfRenderer?.header
							?.musicCarouselShelfBasicHeaderRenderer?.title?.runs[0]?.text,
				};
				carousels.push(carousel);
			}
			// Description shelf parsing
			if (section?.musicDescriptionShelfRenderer) {
				description.header =
					section?.musicDescriptionShelfRenderer?.header?.runs[0]?.text;
				description.description =
					section?.musicDescriptionShelfRenderer?.description?.runs[0]?.text;
			}
		}
		return json$1({
			carousels,
			description,
		});
	} catch (err) {
		console.error(err);

		throw error(500, err as string);
	}
};
