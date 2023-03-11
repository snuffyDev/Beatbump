import { buildAPIRequest } from "$api/request";
import { MoodsAndGenresItem, MusicResponsiveListItemRenderer, MusicTwoRowItemRenderer } from "$lib/parsers";

import type { CarouselHeader } from "$lib/types";
import type { ICarouselTwoRowItem, ITwoRowItemRenderer } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import { error, type RequestHandler, json } from "@sveltejs/kit";
import type { IMusicResponsiveListItemRenderer, IMusicTwoRowItemRenderer } from "$lib/types/innertube/internals";

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

	carouselItems = contents
		.filter((item) => "musicCarouselShelfRenderer" in item)
		.map((shelf) => {
			return parseCarousel(shelf);
		});

	return json({ carouselItems });
};

function parseHeader({ musicCarouselShelfBasicHeaderRenderer }): CarouselHeader {
	if (musicCarouselShelfBasicHeaderRenderer) {
		let subheading, browseId;
		if (musicCarouselShelfBasicHeaderRenderer?.strapline?.runs[0]?.text) {
			subheading = musicCarouselShelfBasicHeaderRenderer["strapline"]["runs"][0].text;
		}
		if (
			musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer?.navigationEndpoint?.browseEndpoint
				?.browseId
		) {
			browseId =
				musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer?.navigationEndpoint?.browseEndpoint
					?.browseId;
		}
		return {
			title: musicCarouselShelfBasicHeaderRenderer["title"]["runs"][0].text,
			subheading,
			browseId,
		};
	}
}

type CarouselBody =
	| ICarouselTwoRowItem[]
	| IListItemRenderer[]
	| {
			text: any;
			color: string;
			endpoint: {
				params: any;
				browseId: any;
			};
	  }[];

function parseBody(
	contents: (
		| { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer }
		| { musicTwoRowItemRenderer: IMusicTwoRowItemRenderer }
		| {
				text: any;
				color: string;
				endpoint: {
					params: any;
					browseId: any;
				};
		  }
	)[] = [],
): CarouselBody {
	const items = contents.map((item) => {
		if ("musicTwoRowItemRenderer" in item) {
			return MusicTwoRowItemRenderer(item);
		}
		if ("musicResponsiveListItemRenderer" in item) {
			return MusicResponsiveListItemRenderer(item);
		}
		if ("musicNavigationButtonRenderer" in item) {
			return MoodsAndGenresItem(item);
		}
	});

	return items as any[];
}

function parseCarousel({ musicCarouselShelfRenderer }: { musicCarouselShelfRenderer?: Record<string, any> }) {
	return {
		header: parseHeader(musicCarouselShelfRenderer?.header),
		results: parseBody(musicCarouselShelfRenderer?.contents),
	};
}
