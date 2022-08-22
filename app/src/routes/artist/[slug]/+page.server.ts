import { buildRequest } from "../api/_api/request";
import type { RequestHandler } from "@sveltejs/kit";
import { ArtistPageParser } from "$lib/parsers/artist";
import type { JSONValue } from "@sveltejs/kit/types/private";

export const GET: RequestHandler = async ({ params }) => {
	const response = await buildRequest("artist", {
		context: { client: { clientName: "WEB_REMIX", clientVersion: "1.20220404.01.00" } },
		params: {
			browseId: params.slug,
			browseEndpointContextMusicConfig: { browseEndpointContextMusicConfig: { pageType: "MUSIC_PAGE_TYPE_ARTIST" } },
		},
	});
	const data = await response.json();
	if (!response.ok)
		return {
			status: 500,
			body: response.statusText,
		};
	const page = parseResponse(data);

	return {
		status: 200,
		headers: { "content-type": "application/json" },
		body: page as JSONValue,
	};
};
function parseResponse(data) {
	const header = data?.header;
	const contents =
		data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
	const visitorData = data?.responseContext?.visitorData ?? "";
	return ArtistPageParser({
		header,
		items: contents,
		visitorData: visitorData ?? "",
	});
}
