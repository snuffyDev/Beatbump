import { buildRequest } from "$api/request";
import { error } from "@sveltejs/kit";
import { ArtistPageParser } from "$lib/parsers/artist";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const response = await buildRequest("artist", {
		context: { client: { clientName: "WEB_REMIX", clientVersion: "1.20220404.01.00" } },
		params: {
			browseId: params.slug,
			browseEndpointContextMusicConfig: { browseEndpointContextMusicConfig: { pageType: "MUSIC_PAGE_TYPE_ARTIST" } },
		},
	});
	const data = await response.json();
	if (!response.ok) throw error(500, response.statusText);
	const page = parseResponse(data);

	return page;
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
