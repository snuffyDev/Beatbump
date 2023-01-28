import { buildRequest } from "$api/request";
import { MoodsAndGenresItem, MusicResponsiveListItemRenderer, MusicTwoRowItemRenderer } from "$lib/parsers";

import type { CarouselHeader } from "$lib/types";
import type { IMusicResponsiveListItemRenderer, IMusicTwoRowItemRenderer } from "$lib/types/innertube/internals";
import type { ButtonRenderer } from "$lib/types/innertube/musicCarouselShelfRenderer";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import type { Dict } from "$lib/types/utilities";
import { filterMap } from "$lib/utils";
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

	const data = await buildRequest("home", {
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
		headers: null,
		params: { browseId: ctoken === "" ? browseId : "" },
		continuation: ctoken !== "" && {
			ctoken,
			continuation: ctoken,
			type: "next",
			itct,
		},
	}).then((response) => {
		if (!response.ok) {
			throw error(response.status, response.statusText);
		}
		return response.json();
	});

	const _visitorData = data.responseContext?.visitorData;

	if (ctoken === "") {
		const result = baseResponse(data, _visitorData);

		return result;
	}

	const sectionListContinuation = data.continuationContents?.sectionListContinuation;
	const contents: any[] = sectionListContinuation.contents;

	const nextContinuationData = Array.isArray(sectionListContinuation?.continuations)
		? sectionListContinuation.continuations[0]?.nextContinuationData
		: {};

	const carouselItems = filterMap(
		contents,
		(item) => {
			if ("musicCarouselShelfRenderer" in item) return parseCarousel(item);
		},
		Boolean,
	);

	return json({
		carousels: carouselItems,
		continuations: nextContinuationData,
	});
};

function baseResponse(data: Dict<any>, _visitorData: string) {
	let headerThumbnail = data.background?.musicThumbnailRenderer?.thumbnail?.thumbnails ?? [];

	const sectionListRenderer =
		data.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer;

	const _contents: any[] = sectionListRenderer.contents || [];
	const nextContinuationData = sectionListRenderer.continuations[0]?.nextContinuationData;

	const carouselItems = filterMap(
		_contents,
		(item) => {
			if ("musicCarouselShelfRenderer" in item) {
				return parseCarousel(item);
			}
			if ("musicImmersiveCarouselShelfRenderer" in item) {
				headerThumbnail =
					item.musicImmersiveCarouselShelfRenderer.backgroundImage?.simpleVideoThumbnailRenderer?.thumbnail
						?.thumbnails || [];
				return parseCarousel(item);
			}
		},
		Boolean,
	);

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

function parseBody(
	contents:
		| { musicNavigationButtonRenderer: ButtonRenderer }[]
		| { musicTwoRowItemRenderer: IMusicTwoRowItemRenderer }[]
		| { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer }[]
		| any[] = [],
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
	const items: any[] = contents.map((item) => {
		if ("musicTwoRowItemRenderer" in item) {
			return MusicTwoRowItemRenderer(item as { musicTwoRowItemRenderer: IMusicTwoRowItemRenderer });
		}
		if ("musicResponsiveListItemRenderer" in item) {
			return MusicResponsiveListItemRenderer(
				item as { musicResponsiveListItemRenderer: IMusicResponsiveListItemRenderer },
			);
		}
		if ("musicNavigationButtonRenderer" in item) {
			return MoodsAndGenresItem(item);
		}
	});

	return items;
}

function parseCarousel(data: {
	musicImmersiveCarouselShelfRenderer?: Record<string, any>;
	musicCarouselShelfRenderer?: Record<string, any>;
}) {
	const carousel = data?.musicCarouselShelfRenderer ?? data?.musicImmersiveCarouselShelfRenderer;
	const header = parseHeader(carousel?.header);
	const items = parseBody(carousel?.contents);
	return { header, items };
}
