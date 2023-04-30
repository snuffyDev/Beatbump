import { buildAPIRequest } from "$api/request";

import { error, type RequestHandler, json } from "@sveltejs/kit";
import { parseCarouselItem } from "$lib/parsers/innertube/carousel";

/**
 * @root "/"
 * @description Returns the Trending page for Beatbump.
 * @endpoint trending.json
 * @method GET
 * @returns {{carouselItems: ICarousel[]}}
 */
export const GET: RequestHandler = async () => {
	let carouselItems = [];

	const response = await buildAPIRequest("home", {
		context: { client: { clientName: "WEB_REMIX", clientVersion: "1.20220404.01.00" } },
		params: { browseId: "FEmusic_explore" },
		headers: null,
	}).then((res) => {
		if (!res.ok) {
			throw error(res.status, res.statusText);
		}
		return res.json();
	});

	const data = await response;

	const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer
		?.contents as any[];

	/// Get only the musicCarouselShelfRenderer's

	carouselItems = contents.filter((item) => "musicCarouselShelfRenderer" in item).map(parseCarouselItem);

	return json({ carouselItems, data });
};
