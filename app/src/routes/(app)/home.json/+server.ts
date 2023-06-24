/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseCarousel } from "$lib/parsers/innertube/carousel";
import { buildAPIRequest } from "../api/_lib/request";

import { ItemBuilder } from "$lib/parsers";
import { extractPrefsFromLocals } from "$lib/server/locals";
import { proxyUrls } from "$lib/server/thumbnailProxyUrl";
import type { Thumbnail } from "$lib/types";
import type { Dict } from "$lib/types/utilities";
import { filterMapAsync } from "$lib/utils/collections/array";
import { isArrayAndReturn } from "$lib/utils/isArray";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, locals }) => {
	const { proxy, restricted } = extractPrefsFromLocals(locals);
	const query = url.searchParams;
	const itemBuilder = new ItemBuilder({ proxy, origin: url.origin });

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
				clientVersion: "1.20230501.01.00",
				hl: "en",
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36 Edg/95.0.1020.40,gzip(gfe)",
			},
			user: { lockedSafetyMode: restricted },
		},
		headers: null,
		params: { params: params, browseId: ctoken === "" ? browseId : "" },
		continuation:
			ctoken !== ""
				? {
						ctoken,
						continuation: ctoken,
						type: "next",
						itct,
				  }
				: null,
	})
		.then((response) => {
			if (!response) throw Error("Failed to send request");
			if (!response.ok) {
				throw Error(response.statusText);
			}
			return response.json();
		})
		.catch((reason) => {
			throw error(500, reason as string);
		});

	const _visitorData = data.responseContext?.visitorData;

	if (ctoken === "") {
		const result = await baseResponse(data, _visitorData, itemBuilder, {
			origin: url.origin,
			proxy,
		});

		return result;
	}

	const sectionListContinuation =
		data.continuationContents?.sectionListContinuation;
	const contents: any[] = sectionListContinuation.contents;

	const nextContinuationData = Array.isArray(
		sectionListContinuation?.continuations,
	)
		? sectionListContinuation.continuations[0]?.nextContinuationData
		: {};

	const carouselItems = await filterMapAsync(
		contents,
		async (item) => {
			if ("musicCarouselShelfRenderer" in item) {
				return parseCarousel(item, itemBuilder);
			}
			return Promise.resolve();
		},
		Boolean,
	);

	return json({
		carousels: carouselItems,
		continuations: nextContinuationData,
	});
};

async function baseResponse(
	data: Dict<any>,
	_visitorData: string,
	itemBuilder: ItemBuilder,
	{ origin, proxy }: { origin: string; proxy: boolean },
) {
	let headerThumbnail =
		(data.background?.musicThumbnailRenderer?.thumbnail
			?.thumbnails as Thumbnail[]) ?? [];

	const sectionListRenderer =
		data.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
			?.content?.sectionListRenderer;

	const _contents: any[] = sectionListRenderer.contents || [];
	const nextContinuationData =
		sectionListRenderer.continuations[0]?.nextContinuationData;
	const handleProxy = proxyUrls(origin);
	const chips = isArrayAndReturn(
		sectionListRenderer?.header?.chipCloudRenderer?.chips,
		(item) =>
			item.map((item) => {
				if (!(typeof item === "object") || item == null) return;

				const chipCloudChipRenderer =
					"chipCloudChipRenderer" in item &&
					typeof item?.chipCloudChipRenderer === "object" &&
					(item?.chipCloudChipRenderer as any);
				if (!chipCloudChipRenderer) return;
				const text =
					"text" in chipCloudChipRenderer &&
					typeof chipCloudChipRenderer.text === "object" &&
					chipCloudChipRenderer.text != null &&
					"runs" in chipCloudChipRenderer.text &&
					(chipCloudChipRenderer?.text?.runs as any[])?.[0]?.text;
				const browseEndpoint = (
					chipCloudChipRenderer?.navigationEndpoint as any
				)?.browseEndpoint;
				const ctoken = chipCloudChipRenderer?.clickTrackingParams;
				return {
					text,
					browseEndpoint,
					ctoken,
				};
			}),
	);
	const carouselItems = await filterMapAsync(
		_contents,
		async (item) => {
			if ("musicCarouselShelfRenderer" in item) {
				return await parseCarousel(item, itemBuilder);
			}
			if ("musicImmersiveCarouselShelfRenderer" in item) {
				headerThumbnail =
					(
						item.musicImmersiveCarouselShelfRenderer.backgroundImage
							?.simpleVideoThumbnailRenderer?.thumbnail
							?.thumbnails as Thumbnail[]
					).map((t) => {
						if (proxy) {
							handleProxy(t);
						}
						return t;
					}) || [];
				return parseCarousel(item, itemBuilder);
			}
			return Promise.resolve();
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
