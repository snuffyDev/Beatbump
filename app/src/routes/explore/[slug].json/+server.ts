import { json as json$1 } from "@sveltejs/kit";

import { buildRequest } from "$api/request";
import { MusicResponsiveListItemRenderer, MusicTwoRowItemRenderer } from "$lib/parsers";
import type { CarouselHeader, CarouselItem } from "$lib/types";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, params }) => {
	const { slug } = params;
	const response = await buildRequest("browse", {
		context: { client: { clientName: "WEB_REMIX", clientVersion: "1.20220404.01.00" } },
		params: { browseId: "FEmusic_moods_and_genres_category", params: slug },
	});

	const data = await response.json();
	let {
		header: { musicHeaderRenderer: { title: { runs: [{ text = "" } = {}] = [] } = {} } = {} } = {},
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [{ tabRenderer: { content: { sectionListRenderer: { contents = [] } = {} } = {} } = {} } = {}] = [],
			} = {},
		} = {},
	} = await data;
	let carousels = [];
	let grids = [];
	let sections: Array<{
		header?: Record<string, any>;
		section?: any[];
		type?: "grids";
	}> = [];
	for (let index = 0; index < contents.length; index++) {
		const element = { ...contents[index] };

		element?.musicCarouselShelfRenderer && carousels.push(element);
		element?.gridRenderer && grids.push(element);
	}
	if (carousels.length !== 0) {
		sections = carousels.map(({ musicCarouselShelfRenderer }, i) => parseCarousel({ musicCarouselShelfRenderer }));
		if (sections.length !== 0) {
			return json$1({ sections, header: text, type: "carousel" });
			return new Response(
				JSON.stringify({
					sections,
					header: text,
					type: "carousel",
				}),
			);
		}
	} else {
		sections = grids.map(({ gridRenderer = {} }) => {
			const { items = [], header = {} } = gridRenderer;
			const section = items.map((ctx) => MusicTwoRowItemRenderer(ctx));
			return {
				section,
				title: header?.gridHeaderRenderer?.title?.runs[0]?.text,
			};
		});
		return json$1({
			sections,
			header: text,
			type: "grid",
		});
	}
};
function parseHeader(header: any[]): CarouselHeader[] {
	return header.map(({ musicCarouselShelfBasicHeaderRenderer } = {}) => ({
		title: musicCarouselShelfBasicHeaderRenderer["title"]["runs"][0].text,
		browseId:
			musicCarouselShelfBasicHeaderRenderer.moreContentButton.buttonRenderer.navigationEndpoint.browseEndpoint.browseId,
	}));
}

function parseBody(contents): CarouselItem[] {
	return contents.map(({ ...r }) => {
		if (r.musicTwoRowItemRenderer) {
			return MusicTwoRowItemRenderer(r);
		}
		if (r.musicResponsiveListItemRenderer) {
			return MusicResponsiveListItemRenderer(r);
		}

		throw new Error("Unable to parse items, can't find " + `${r}`);
	});
}
function parseCarousel({ musicCarouselShelfRenderer }) {
	return {
		header: parseHeader([musicCarouselShelfRenderer.header])[0],
		results: parseBody(musicCarouselShelfRenderer.contents),
	};
}
