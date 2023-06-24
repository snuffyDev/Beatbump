/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArtistPageParser } from "$lib/parsers/artist";
import { error } from "@sveltejs/kit";
import { buildAPIRequest } from "../../api/_lib/request";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const response = await buildAPIRequest("artist", {
		context: {
			client: { clientName: "WEB_REMIX", clientVersion: "1.20230501.01.00" },
		},
		headers: null,
		params: {
			browseId: params.slug,
			browseEndpointContextMusicConfig: {
				browseEndpointContextMusicConfig: {
					pageType: "MUSIC_PAGE_TYPE_ARTIST",
				},
			},
		},
	});
	if (!response) throw error(500, "Failed to fetch");
	const data = await response.json();
	if (!response.ok) throw error(500, response.statusText);
	const page = parseResponse(data);

	return Object.assign(page);
};
function parseResponse(data: {
	header: any;
	contents: {
		singleColumnBrowseResultsRenderer: {
			tabs: {
				tabRenderer: { content: { sectionListRenderer: { contents: any } } };
			}[];
		};
	};
	responseContext: { visitorData: string };
}) {
	const header = data?.header;
	const contents =
		data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
			?.content?.sectionListRenderer?.contents;
	const visitorData = data?.responseContext?.visitorData ?? "";
	return ArtistPageParser({
		header,
		items: contents,
		visitorData: visitorData ?? "",
	});
}
