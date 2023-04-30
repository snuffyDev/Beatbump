import { json as json$1 } from "@sveltejs/kit";

import { buildAPIRequest } from "$api/request";
import type { ParsedCarousel } from "$api/models/Carousel";
import type { ParsedGrid } from "$api/models/Grid";
import { parseCarouselItem, parseGridItem, type GridOrCarousel } from "$lib/parsers/innertube/parseSectionObject.js";

export type ExploreSlugResponse = Awaited<ReturnType<Awaited<ReturnType<typeof GET>>["json"]>>;

export const GET = async ({
	params,
}): Promise<IResponse<{ header: string; items: (ParsedCarousel | ParsedGrid)[] }>> => {
	const { slug } = params;
	const response = await buildAPIRequest("browse", {
		context: { client: { clientName: "WEB_REMIX", clientVersion: "1.20220404.01.00" } },
		params: { browseId: "FEmusic_moods_and_genres_category", params: slug },
	});

	const data = await response.json();
	const {
		header: { musicHeaderRenderer: { title: { runs: [{ text = "" } = {}] = [] } = {} } = {} } = {},
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [{ tabRenderer: { content: { sectionListRenderer: { contents = [] } = {} } = {} } = {} } = {}] = [],
			} = {},
		} = {},
	} = await data;

	const toParse: [type: "carousel" | "grid", data: GridOrCarousel<"grid"> | GridOrCarousel<"carousel">][] = [];
	const responseItems: (ParsedCarousel | ParsedGrid)[] = [];

	for (let index = 0; index < contents.length; index++) {
		const element = { ...contents[index] };

		element?.musicCarouselShelfRenderer && toParse.push(["carousel", element]);
		element?.gridRenderer && toParse.push(["grid", element]);
	}

	for (const [type, data] of toParse) {
		if (type === "grid") {
			responseItems.push(parseGridItem(data as GridOrCarousel<"grid">));
		}
		if ("musicCarouselShelfRenderer" in data) {
			responseItems.push(parseCarouselItem(data as GridOrCarousel<"carousel">));
		}
	}

	return json$1({ header: text, items: responseItems }) as IResponse<{
		header: string;
		items: (ParsedCarousel | ParsedGrid)[];
	}>;
};
