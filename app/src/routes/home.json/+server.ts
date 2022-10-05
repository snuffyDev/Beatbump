import { buildRequest } from "$api/request";
import { MoodsAndGenresItem, MusicResponsiveListItemRenderer, MusicTwoRowItemRenderer } from "$lib/parsers";

import type { CarouselHeader } from "$lib/types";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { Dict } from "$lib/types/utilities";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams;

	let ctoken = query.get("ctoken") || "";
	let itct = query.get("itct") || "";
	itct = decodeURIComponent(itct);
	ctoken = decodeURIComponent(ctoken);
	const visitorData = query.get("visitorData") || "";
	// console.log(visitorData);
	const browseId = "FEmusic_home";
	const carouselItems = [];

	const response = await buildRequest("home", {
		context: {
			client: {
				visitorData: `${visitorData}`,
				clientName: "WEB_REMIX",
				clientVersion: "1.20220404.01.00",
				hl: "en",
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36 Edg/95.0.1020.40,gzip(gfe)",
			},
		},
		params: { browseId: ctoken === "" ? browseId : "" },
		continuation: ctoken !== "" && {
			ctoken,
			continuation: ctoken,
			type: "next",
			itct,
		},
	});

	if (!response.ok) {
		throw error(response.status, response.statusText);
	}

	const data = await response.json();
	const _visitorData = data.responseContext?.visitorData;
	if (ctoken === "") {
		const result = baseResponse(data, _visitorData);

		return result;
	}
	const sectionListContinuation = data?.continuationContents?.sectionListContinuation;
	const contents = sectionListContinuation?.contents;
	const nextContinuationData = Array.isArray(sectionListContinuation?.continuations)
		? sectionListContinuation?.continuations[0]?.nextContinuationData
		: {};

	let idx = contents.length;
	while (--idx > -1) {
		const item = contents[idx];
		if ("musicCarouselShelfRenderer" in item) {
			carouselItems.unshift(parseCarousel(item));
		}
	}

	return new Response(
		JSON.stringify({
			carousels: carouselItems,
			continuations: nextContinuationData,
		}),
	);
};

function baseResponse(data: Dict<any>, _visitorData: string) {
	const carouselItems = [];
	let headerThumbnail = [];
	const sectionListRenderer =
		data.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer;
	const _contents = sectionListRenderer?.contents || [];
	const nextContinuationData = sectionListRenderer.continuations[0]?.nextContinuationData;
	const length = _contents.length;
	let idx = -1;
	while (++idx < length) {
		const item = _contents[idx] ?? {};
		if ("musicCarouselShelfRenderer" in item) {
			const carousel = parseCarousel(item);
			carouselItems[idx] = carousel;
		}
		if ("musicImmersiveCarouselShelfRenderer" in item) {
			headerThumbnail =
				item.musicImmersiveCarouselShelfRenderer.backgroundImage?.simpleVideoThumbnailRenderer?.thumbnail?.thumbnails ||
				[];
			carouselItems[idx] = parseCarousel(item);
		}
	}
	// '';
	return json({
		carousels: carouselItems,
		headerThumbnail,
		visitorData: _visitorData,
		continuations: nextContinuationData,
	});
}

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

function parseBody(contents: Array<any> = []):
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
	const items: unknown[] = [];
	let idx = -1;
	const length = contents.length;

	while (++idx < length) {
		const item = contents[idx] || {};
		if ("musicTwoRowItemRenderer" in item) {
			items[idx] = MusicTwoRowItemRenderer(item);
		}
		if ("musicResponsiveListItemRenderer" in item) {
			items[idx] = MusicResponsiveListItemRenderer(item);
		}
		if ("musicNavigationButtonRenderer" in item) {
			items[idx] = MoodsAndGenresItem(item);
		}
	}

	return items as any[];
}

function parseCarousel({
	musicImmersiveCarouselShelfRenderer,
	musicCarouselShelfRenderer,
}: {
	musicImmersiveCarouselShelfRenderer?: Record<string, any>;
	musicCarouselShelfRenderer?: Record<string, any>;
}) {
	const carousel = musicCarouselShelfRenderer ?? musicImmersiveCarouselShelfRenderer;
	const header = parseHeader(carousel?.header);
	const items = parseBody(carousel?.contents);
	return { header, items };
}
