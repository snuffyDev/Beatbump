import { buildAPIRequest } from "$api/request";
import { parseCarouselItem } from "$lib/parsers/innertube/carousel";

import type { Dict } from "$lib/types/utilities";
import { filterMap } from "$lib/utils";
import { isArrayAndReturn } from "$lib/utils/isArray";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams;

	let ctoken = query.get("ctoken") || "";
	let itct = query.get("itct") || "";
	const params = decodeURIComponent(query.get("params") || "");
	itct = decodeURIComponent(itct);
	ctoken = decodeURIComponent(ctoken);
	const visitorData = query.get("visitorData") || "";
	// console.log(visitorData);
	const browseId = "FEmusic_home";

	const data = await buildAPIRequest("home", {
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
		params: { params: params, browseId: ctoken === "" ? browseId : "" },
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
			if ("musicCarouselShelfRenderer" in item) return parseCarouselItem(item);
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

	const chips = isArrayAndReturn(sectionListRenderer?.header?.chipCloudRenderer?.chips, (item) =>
		item.map((item) => {
			const chipCloudChipRenderer = item?.chipCloudChipRenderer;
			const text = chipCloudChipRenderer?.text?.runs[0]?.text;
			const browseEndpoint = chipCloudChipRenderer.navigationEndpoint?.browseEndpoint;
			const ctoken = chipCloudChipRenderer?.clickTrackingParams;
			return {
				text,
				browseEndpoint,
				ctoken,
			};
		}),
	);
	const carouselItems = filterMap(
		_contents,
		(item) => {
			if ("musicCarouselShelfRenderer" in item) {
				return parseCarouselItem(item);
			}
			if ("musicImmersiveCarouselShelfRenderer" in item) {
				headerThumbnail =
					item.musicImmersiveCarouselShelfRenderer.backgroundImage?.simpleVideoThumbnailRenderer?.thumbnail
						?.thumbnails || [];
				return parseCarouselItem(item);
			}
		},
		Boolean,
	);

	return json({
		carousels: carouselItems,
		headerThumbnail,
		chips: chips ?? [],
		visitorData: _visitorData,
		continuations: nextContinuationData,
	});
}
