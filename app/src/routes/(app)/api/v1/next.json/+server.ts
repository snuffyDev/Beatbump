/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-inner-declarations */
import { parseContents } from "$lib/parsers/next";

import { error, json } from "@sveltejs/kit";

import { ItemBuilder } from "$lib/parsers";
import type { Item, Song } from "$lib/types";
import type { IPlaylistPanelVideoRenderer } from "$lib/types/playlistPanelVideoRenderer";
import type { Dict } from "$lib/types/utilities";
import { buildAPIRequest } from "../../_lib/request";
import { parseParams } from "../../_lib/utils";
import type { RequestHandler } from "./$types";

export type NextEndpointResponse = {
	results: Item[];
	continuation: string;
	clickTrackingParams: string;
	currentMixId: string;
	visitorData: string;
	related: {
		browseId: string;
		browseEndpointContextSupportedConfigs: {
			browseEndpointContextMusicConfig: {
				pageType: "MUSIC_PAGE_TYPE_TRACK_RELATED";
			};
		};
	};
};

export type NextSchema = {
	params?: string;
	visitorData: string;
	loggingContext?: string;
	videoId?: string;
	playlistId: string;
	continuation?: string;
	clickTracking?: string;
	playlistSetVideoId?: string;
};

const parser = parseParams<NextSchema>([
	"clickTracking",
	"continuation",
	"loggingContext",
	"params",
	"playlistId",
	"playlistSetVideoId",
	"videoId",
	"visitorData",
]);

export const GET: RequestHandler = async ({
	url,
	locals,
}): Promise<IResponse<NextEndpointResponse>> => {
	const query = url.searchParams;

	const {
		clickTracking,
		continuation,
		loggingContext,
		params,
		playlistId,
		playlistSetVideoId,
		videoId,
		visitorData = "CgtlV0xyWk92dWZ5Zyilgu6ZBg%3D%3D",
	} = parser(query.entries());

	const itemBuilder = new ItemBuilder({
		proxy: locals.preferences["Proxy Thumbnails"],
		origin: url.origin,
	});
	const response = await buildAPIRequest("next", {
		context: {
			clickTracking: {
				...(clickTracking && {
					clickTrackingParams: clickTracking,
				}),
			},
			client: {
				clientName: "WEB_REMIX",
				clientVersion: "1.20230501.01.00",
				visitorData: visitorData ? visitorData : undefined,
			},
			user: {
				lockedSafetyMode: !!locals.preferences.Restricted,
			},
		},
		params: {
			...(loggingContext && {
				loggingContext: {
					vssLogingContext: {
						serializedContextData: loggingContext ?? undefined,
					},
				},
			}),
			enablePersistentPlaylistPanel: true,
			isAudioOnly: true,
			tunerSettingValue: "AUTOMIX_SETTING_NORMAL",
			...(continuation && { continuation: decodeURIComponent(continuation) }),
			...(videoId && { videoId }),
			...(playlistSetVideoId && { playlistSetVideoId }),
			...(playlistId && { playlistId }),
			...(params && { params: params ?? "" }),
		},
		headers: {},
	})
		.then((response) => {
			if (!response) throw Error("Failed to send 'next' request");
			if (!response.ok) {
				throw Error(response.statusText);
			}
			return response.json();
		})
		.catch((reason) => {
			console.error(reason);
			throw error(500, reason);
		});

	/* For when you are NOT listening to a song.
	 ********************************************/
	if (!continuation) {
		try {
			const res = await parseNextBody(itemBuilder, response);

			return json(Object.assign({}, res, { response }));
		} catch (err) {
			console.error(err);
			return json({ response, err });
		}
	}

	return json(
		Object.assign({}, await parseNextBodyContinuation(response), { response }),
	);
};

function parseItem(builder: ItemBuilder, item: Song) {
	if ("playlistPanelVideoRenderer" in item) {
		return builder.PlaylistPanelVideoRenderer(
			item["playlistPanelVideoRenderer"] as IPlaylistPanelVideoRenderer,
		) as Promise<Item>;
	}
}

async function parseNextBody(itemBuilder: ItemBuilder, data: Dict<any>) {
	try {
		const tabs =
			data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
				?.watchNextTabbedResultsRenderer?.tabs || [];
		const related =
			Array.isArray(tabs) && tabs[2]?.tabRenderer?.endpoint?.browseEndpoint;
		const contents = Array.isArray(
			tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content
				?.playlistPanelRenderer?.contents,
		)
			? tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content
					?.playlistPanelRenderer?.contents
			: null;

		if (!contents) throw Error("Failed to locate `contents` object");

		const nextRadioContinuationData =
			Array.isArray(
				tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content
					?.playlistPanelRenderer?.continuations,
			) &&
			(tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content
				?.playlistPanelRenderer?.continuations[0]?.nextRadioContinuationData ||
				tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content
					?.playlistPanelRenderer?.continuations[0]?.nextContinuationData);
		const clickTrackingParams = nextRadioContinuationData?.clickTrackingParams;
		const continuation = nextRadioContinuationData?.continuation;
		const watchEndpoint = data?.currentVideoEndpoint?.watchEndpoint;
		const visitorData = data?.responseContext?.visitorData;

		const parsed = {
			results: (
				await Promise.all(
					(contents as Song[]).map((item) =>
						parseItem(itemBuilder, item as never)?.then((item) => {
							if (item) {
								if (!item.playlistId)
									item.playlistId = watchEndpoint?.playlistId;
								return item;
							}
							return null;
						}),
					),
				)
			).filter(Boolean) as Array<Item>,
			continuation,
			clickTrackingParams,
			currentMixId: watchEndpoint.playlistId,
			visitorData,
		};
		return { ...parsed, related };
	} catch (err) {
		console.error(err);
		throw error(500, err as string);
	}
}

/*
 * This is for when you are already listening to a song
 **************************************/
async function parseNextBodyContinuation(data: {
	contents?: any;
	responseContext?: any;
	continuationContents?: any;
}) {
	const {
		responseContext = {},
		continuationContents: {
			playlistPanelContinuation: {
				contents = [],
				continuations: [
					{
						nextRadioContinuationData: { continuation: continuation = "" } = {},
					} = {},
				] = [],
				currentIndex = 0,
				...rest
			} = {},
		} = {},
	} = data;

	const clickTrackingParams = (contents as any[]).at(-1)
		?.playlistPanelVideoRenderer?.navigationEndpoint?.clickTrackingParams;

	const visitorData = responseContext?.visitorData;
	const parsed = await parseContents(
		contents,
		continuation,
		clickTrackingParams,
		rest,
		visitorData,
	);

	const tabs =
		data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
			?.watchNextTabbedResultsRenderer?.tabs || [];

	const related =
		Array.isArray(tabs) && tabs[2]?.tabRenderer?.endpoint?.browseEndpoint;

	return Object.assign(parsed, { related, currentIndex });
}
