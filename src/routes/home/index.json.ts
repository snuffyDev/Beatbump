import { buildRequest } from "$api/_api/request";
import {
	MoodsAndGenresItem,
	MusicResponsiveListItemRenderer,
	MusicTwoRowItemRenderer
} from "$lib/parsers";

import type { CarouselHeader } from "$lib/types";
import type { ICarouselTwoRowItem } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import { iter, map } from "$lib/utils/collections/array";
import type { RequestHandler } from "@sveltejs/kit";
export const get: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	let ctoken = query.get("ctoken") || "";
	let itct = query.get("itct") || "";
	itct = decodeURIComponent(itct);
	ctoken = decodeURIComponent(ctoken);
	const visitorData = query.get("visitorData");
	const browseId = "FEmusic_home";
	let carouselItems = [];

	const response = await buildRequest("home", {
		context: {
			client: {
				visitorData,
				clientName: "WEB_REMIX",
				clientVersion: "1.20220404.01.00",
				hl: "en",
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36 Edg/95.0.1020.40,gzip(gfe)"
			}
		},
		params: { browseId: ctoken !== "" ? browseId : "" },
		continuation: ctoken !== "" && {
			ctoken,
			continuation: ctoken,
			type: "next",
			itct
		}
	});

	if (!response.ok) {
		return { status: response.status, body: response.statusText };
	}
	const data = await response.json();
	const _visitorData = data?.responseContext?.visitorData;
	if (!ctoken) {
		const _contents =
			data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
				?.content?.sectionListRenderer?.contents;
		const nextContinuationData =
			data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
				?.content?.sectionListRenderer?.continuations[0]?.nextContinuationData;
		let headerThumbnail;

		// let contentLength = contents.length;
		iter(_contents, (item, index) => {
			if (item?.musicCarouselShelfRenderer) {
				carouselItems[index] = parseCarousel(item);
			}
			if (item?.musicImmersiveCarouselShelfRenderer) {
				headerThumbnail = item?.musicImmersiveCarouselShelfRenderer?.backgroundImage?.simpleVideoThumbnailRenderer?.thumbnail?.thumbnails.slice(
					0
				);
				carouselItems[index] = parseCarousel(item);
			}
			// return undefined
		});
		// console.log(carouselItems)
		return {
			body: {
				carousels: carouselItems,
				headerThumbnail,
				visitorData: _visitorData,
				continuations: nextContinuationData
			},
			status: 200
		};
	} else {
		const {
			continuationContents: {
				sectionListContinuation: {
					contents = [],
					continuations: [{ nextContinuationData = {} } = {}] = []
				} = {}
			} = {}
		} = data;
		iter(contents, (item, index) => {
			if (item?.musicCarouselShelfRenderer) {
				carouselItems[index] = parseCarousel(item);
			}

			// return undefined
		});
		return {
			body: {
				carousels: carouselItems,
				continuations: nextContinuationData
			},
			status: 200
		};
	}
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
	const items: unknown[] = [];
	// let index = contents.length;
	iter(contents, (item, index) => {
		if (item?.musicTwoRowItemRenderer) {
			items[index] = MusicTwoRowItemRenderer(item);
		}
		if (item?.musicResponsiveListItemRenderer) {
			items[index] = MusicResponsiveListItemRenderer(item);
		}
		if (item?.musicNavigationButtonRenderer) {
			items[index] = MoodsAndGenresItem(item);
		}
	});
	return items;
}

function parseCarousel({
	musicImmersiveCarouselShelfRenderer,
	musicCarouselShelfRenderer
}: {
	musicImmersiveCarouselShelfRenderer?: Record<string, any>;
	musicCarouselShelfRenderer?: Record<string, any>;
}) {
	return {
		header: parseHeader(
			musicCarouselShelfRenderer?.header ??
				musicImmersiveCarouselShelfRenderer?.header
		),
		results: parseBody(
			musicCarouselShelfRenderer?.contents ??
				musicImmersiveCarouselShelfRenderer?.contents
		)
	};
}
