import { error, json as json$1 } from "@sveltejs/kit";

import {
	parseCarouselItem,
	parseGridRendererSection,
	type GridOrCarousel,
} from "$lib/parsers/innertube/parseSectionObject.js";
import type { ParsedCarousel } from "../../api/_lib/models/Carousel";
import type { ParsedGrid } from "../../api/_lib/models/Grid";
import { buildAPIRequest } from "../../api/_lib/request";

export type ExploreSlugResponse = Awaited<
	ReturnType<Awaited<ReturnType<typeof GET>>["json"]>
>;

/**
 * @type {import('./$types').PageServerLoad}
 */
export const GET = async ({
	params,
}): Promise<
	IResponse<{ header: string; items: (ParsedCarousel | ParsedGrid)[] }>
> => {
	const { slug } = params;
	const response = await buildAPIRequest("browse", {
		context: {
			client: { clientName: "WEB_REMIX", clientVersion: "1.20230501.01.00" },
		},
		headers: null,
		params: { browseId: "FEmusic_moods_and_genres_category", params: slug },
	});
	if (!response) throw error(500, "Failed to fetch");
	const data = await response.json();
	const {
		header: {
			musicHeaderRenderer: {
				title: { runs: [{ text = "" } = {}] = [] } = {},
			} = {},
		} = {},
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: { sectionListRenderer: { contents = [] } = {} } = {},
						} = {},
					} = {},
				] = [],
			} = {},
		} = {},
	} = await data;

	const toParse: [
		type: "carousel" | "grid",
		data: GridOrCarousel<"grid"> | GridOrCarousel<"carousel">,
	][] = [];
	const responseItems: Promise<ParsedCarousel | ParsedGrid>[] = [];

	for (let index = 0; index < contents.length; index++) {
		const element = { ...contents[index] };

		element?.musicCarouselShelfRenderer && toParse.push(["carousel", element]);
		element?.gridRenderer && toParse.push(["grid", element]);
	}

	for (const [type, data] of toParse) {
		if (type === "grid") {
			responseItems.push(
				parseGridRendererSection(data as GridOrCarousel<"grid">),
			);
		}
		if ("musicCarouselShelfRenderer" in data) {
			responseItems.push(parseCarouselItem(data as GridOrCarousel<"carousel">));
		}
	}
	const items = await Promise.all(responseItems);
	return json$1({ header: text, items }) as IResponse<{
		header: string;
		items: (ParsedCarousel | ParsedGrid)[];
	}>;
};
