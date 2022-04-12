import BaseContext from "$api/_modules/context";
import {
	MoodsAndGenresItem,
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from "$lib/parsers";

import type { CarouselHeader, CarouselItem } from "$lib/types";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import { map } from "$lib/utils/collections/array";
import type { RequestHandler } from "@sveltejs/kit";

export const get: RequestHandler = async ({ url }) => {
	// console.time("start");
	const query = url.searchParams;
	const endpoint = query.get("q") || "";
	const browseId = "FEmusic_explore";
	let carouselItems = [];
	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/${endpoint}?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30&prettyPrint=false`,
		{
			method: "POST",
			body: JSON.stringify(BaseContext.base(browseId)),

			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Origin: "https://music.youtube.com",
				"User-Agent":
					"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
			}
		}
	);

	if (!response.ok) {
		return { status: response.status, body: response.statusText };
	}

	const data = await response.json();

	const contents =
		data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
			?.content?.sectionListRenderer?.contents;
	let index = contents.length;
	for (; index--; ) {
		if (contents[index]?.musicCarouselShelfRenderer) {
			carouselItems.push(contents[index]);
		}
	}
	carouselItems = map(carouselItems, (item, index) =>
		parseCarousel({
			musicCarouselShelfRenderer: item.musicCarouselShelfRenderer
		})
	);
	return {
		body: JSON.stringify({ carouselItems, data }),
		status: 200
	};
};

function parseHeader({
	musicCarouselShelfBasicHeaderRenderer
}): CarouselHeader {
	if (musicCarouselShelfBasicHeaderRenderer) {
		let subheading, browseId;
		if (musicCarouselShelfBasicHeaderRenderer?.strapline?.runs[0]?.text) {
			subheading =
				musicCarouselShelfBasicHeaderRenderer["strapline"]["runs"][0].text;
		}
		if (
			musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer
				?.navigationEndpoint?.browseEndpoint?.browseId
		) {
			browseId =
				musicCarouselShelfBasicHeaderRenderer?.moreContentButton?.buttonRenderer
					?.navigationEndpoint?.browseEndpoint?.browseId;
		}
		return {
			title: musicCarouselShelfBasicHeaderRenderer["title"]["runs"][0].text,
			subheading,
			browseId
		};
	}
}

function parseBody(
	contents: Record<string, any> = []
):
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
	let items: unknown[] = [];
	let index = contents.length;
	for (; index--; ) {
		if (contents[-1 - index + contents.length].musicTwoRowItemRenderer) {
			items[-1 - index + contents.length] = MusicTwoRowItemRenderer(
				contents[-1 - index + contents.length]
			);
			// items = [MusicTwoRowItemRenderer(contents[index]), ...items];
		}
		if (
			contents[-1 - index + contents.length].musicResponsiveListItemRenderer
		) {
			items[-1 - index + contents.length] = MusicResponsiveListItemRenderer(
				contents[-1 - index + contents.length]
			);
			// items = [MusicResponsiveListItemRenderer(contents[index]), ...items];
		}
		if (contents[-1 - index + contents.length].musicNavigationButtonRenderer) {
			items[-1 - index + contents.length] = MoodsAndGenresItem(
				contents[-1 - index + contents.length]
			);
			// items = [MoodsAndGenresItem(contents[index]), ...items];
		}
	}
	return items;
}

function parseCarousel(carousel: {
	musicImmersiveCarouselShelfRenderer?: Record<string, any>;
	musicCarouselShelfRenderer?: Record<string, any>;
}) {
	return {
		header: parseHeader(
			carousel?.musicCarouselShelfRenderer?.header ??
				carousel.musicImmersiveCarouselShelfRenderer?.header
		),
		results: parseBody(
			carousel?.musicCarouselShelfRenderer?.contents ??
				carousel.musicImmersiveCarouselShelfRenderer?.contents
		)
	};
}
