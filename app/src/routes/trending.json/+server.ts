/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildAPIRequest } from "$api/request";

import { parseCarouselItem } from "$lib/parsers/innertube/carousel";
import { error, json, type RequestHandler } from "@sveltejs/kit";

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
		context: {
			client: { clientName: "WEB_REMIX", clientVersion: "1.20230501.01.00" },
		},
		params: { browseId: "FEmusic_explore" },
		headers: null,
	}).then((res) => {
		if (!res || !res.ok) {
			throw error(res?.status || 500, res?.statusText || "Failed to fetch");
		}
		return res.json();
	});

	const data = await response;

	const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer
		?.contents as any[];

	/// Get only the musicCarouselShelfRenderer's

	carouselItems = await Promise.all(
		contents.filter((item) => "musicCarouselShelfRenderer" in item).map(parseCarouselItem),
	);

	return json({ carouselItems, data });
};
