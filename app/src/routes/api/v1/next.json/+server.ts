/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-inner-declarations */
import { parseContents } from "$lib/parsers/next";

import { error, json } from "@sveltejs/kit";

import { buildAPIRequest } from "$api/request";
import { parseParams } from "$api/utils";
import type { Item } from "$lib/types";
import type { Dict } from "$lib/types/utilities";
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

type NextSchema = {
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

export const GET: RequestHandler = async ({ url }): Promise<IResponse<NextEndpointResponse>> => {
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
			throw error(500, reason);
		});

	/* For when you are NOT listening to a song.
	 ********************************************/
	if (!continuation) {
		const res = await parseNextBody(response);

		return json(Object.assign({}, res, { response }));
	}

	return json(Object.assign({}, await parseNextBodyContinuation(response), { response }));
};

async function parseNextBody(data: Dict<any>) {
	try {
		const tabs =
			("contents" in data &&
				typeof data?.contents === "object" &&
				data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer
					?.tabs) ||
			[];

		const related = Array.isArray(tabs) && tabs[2]?.tabRenderer?.endpoint?.browseEndpoint;
		const contents = Array.isArray(
			tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents,
		)
			? (tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents as Array<any>)
			: null;

		if (!contents) throw Error("Failed to locate `contents` object");

		const nextRadioContinuationData =
			Array.isArray(
				data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer
					?.tabs?.[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.continuations,
			) &&
			(data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer
				?.tabs?.[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.continuations[0]
				?.nextRadioContinuationData ??
				data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer
					?.tabs?.[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.continuations[0]
					?.nextContinuationData);

		const clickTrackingParams = nextRadioContinuationData?.clickTrackingParams;
		const continuation = nextRadioContinuationData?.continuation;
		null;
		const watchEndpoint = data?.currentVideoEndpoint?.watchEndpoint;
		const visitorData = data?.responseContext?.visitorData;

		const parsed = await parseContents(
			contents,
			continuation,
			clickTrackingParams,
			watchEndpoint ? watchEndpoint : "",
			visitorData,
		);

		return Object.assign(parsed, { related });
	} catch (err) {
		console.error(err);

		throw error(500, err as string);
	}
}

/*
 * This is for when you are already listening to a song
 **************************************/
async function parseNextBodyContinuation(data: { contents?: any; responseContext?: any; continuationContents?: any }) {
	const {
		responseContext = {},
		continuationContents: {
			playlistPanelContinuation: {
				contents = [],
				continuations: [
					{
						nextContinuationData: { continuation = "" } = {},
						nextRadioContinuationData: { continuation: continuation2 = "" } = {},
					} = {},
				] = [],
				currentIndex = 0,
				...rest
			} = {},
		} = {},
	} = data;

	const clickTrackingParams = (contents as any[]).at(-1)?.playlistPanelVideoRenderer?.navigationEndpoint
		?.clickTrackingParams;

	const visitorData = responseContext?.visitorData;
	const parsed = await parseContents(contents, continuation ?? continuation2, clickTrackingParams, rest, visitorData);

	const tabs =
		data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs ||
		[];

	const related = Array.isArray(tabs) && tabs[2]?.tabRenderer?.endpoint?.browseEndpoint;

	return Object.assign(parsed, { related, currentIndex });
}
