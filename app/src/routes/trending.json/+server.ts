import { buildRequest } from "$api/_api/request";
import { MoodsAndGenresItem, MusicResponsiveListItemRenderer, MusicTwoRowItemRenderer } from "$lib/parsers";

import type { CarouselHeader } from "$lib/types";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { RequestHandler } from "@sveltejs/kit";
import { iter, map } from "$lib/utils/collections/array";

export const GET: RequestHandler = async () => {
	let carouselItems = [];

	const response = await buildRequest("home", {
		context: { client: { clientName: "WEB_REMIX", clientVersion: "1.20220404.01.00" } },
		params: { browseId: "FEmusic_explore" },
	});

	if (!response.ok) {
		return { status: response.status, body: response.statusText };
	}

	const data = await response.json();

	const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer
		?.contents as any[];
	/// Get only the musicCarouselShelfRenderer's
	let idx = contents.length;
	while (--idx > -1) {
		if ("musicCarouselShelfRenderer" in contents[idx]) carouselItems.unshift(contents[idx]);
	}
	/// Parse the carouselItems
	carouselItems = map(carouselItems, (item, index) =>
		parseCarousel({
			musicCarouselShelfRenderer: item.musicCarouselShelfRenderer,
		}),
	);
	// console.log(carouselItems[2].results[2]);
	return {
		body: JSON.stringify({ carouselItems }),
		status: 200,
	};
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

function parseBody(contents: Record<string, any>[] = []):
	| ICarouselTwoRowItem[]
	| IListItemRenderer[]
	| {
			text: any;
			color: string;
			endpoint: {
				params: any;
				browseId: any;
			};
	  }[] {
	const items: any[] = [];
	iter(contents as any[], (item, idx) => {
		if ("musicTwoRowItemRenderer" in item) {
			items[idx] = MusicTwoRowItemRenderer(item);
		}
		if ("musicResponsiveListItemRenderer" in item) {
			items[idx] = MusicResponsiveListItemRenderer(item);
		}
		if ("musicNavigationButtonRenderer" in item) {
			items[idx] = MoodsAndGenresItem(item);
		}
	});

	return items;
}

function parseCarousel(carousel: {
	musicImmersiveCarouselShelfRenderer?: Record<string, any>;
	musicCarouselShelfRenderer?: Record<string, any>;
}) {
	return {
		header: parseHeader(
			carousel?.musicCarouselShelfRenderer?.header ?? carousel.musicImmersiveCarouselShelfRenderer?.header,
		),
		results: parseBody(
			(Array.isArray(carousel?.musicCarouselShelfRenderer?.contents) &&
				carousel?.musicCarouselShelfRenderer?.contents) ??
				(Array.isArray(carousel.musicImmersiveCarouselShelfRenderer?.contents) &&
					carousel.musicImmersiveCarouselShelfRenderer?.contents),
		),
	};
}
