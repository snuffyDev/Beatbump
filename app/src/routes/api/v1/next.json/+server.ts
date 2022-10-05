/* eslint-disable no-inner-declarations */
import { parseContents } from "$lib/parsers/next";

import { error, json } from "@sveltejs/kit";

import { buildRequest } from "$api/request";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	const params = query.get("params") || undefined;
	const visitorData = query.get("visitorData") || "CgtlV0xyWk92dWZ5Zyilgu6ZBg%3D%3D";
	const loggingContext = query.get("loggingContext") || "";
	const videoId = query.get("videoId") || "";
	const playlistId = query.get("playlistId") || "RDAMVM" + (videoId ?? "");
	const continuation = query.has("ctoken") ? decodeURIComponent(decodeURIComponent(query.get("ctoken"))) : undefined;
	const index = parseInt(query.get("index")) || undefined;
	const clickTracking = query.get("clickTracking") || undefined;
	const playlistSetVideoId = query.get("playlistSetVideoId") || undefined;

	const response = await buildRequest("next", {
		context: {
			clickTracking: {
				clickTrackingParams: clickTracking ? decodeURIComponent(decodeURIComponent(clickTracking)) : undefined,
			},
			client: { clientName: "WEB_REMIX", clientVersion: "1.20220404.01.00", visitorData },
		},
		params: {
			loggingContext: {
				vssLogingContext: {
					serializedContextData: loggingContext ?? undefined,
				},
			},
			enablePersistentPlaylistPanel: true,
			isAudioOnly: true,
			tunerSettingValue: "AUTOMIX_SETTING_NORMAL",
			continuation,
			videoId,
			index,
			playlistSetVideoId,
			playlistId,
			params: params ?? "",
		},
		headers: {},
	});
	if (!response.ok) {
		throw error(500, response.statusText);
	}

	const data = await response.json();

	/* For when you are NOT listening to a song.
	 ********************************************/
	if (!continuation) {
		const res = parseNextBody(data);

		return json(res);
	}

	return json(parseNextBodyContinuation(data));
};

function parseNextBody(data) {
	try {
		const tabs =
			data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs ||
			[];
		const related = Array.isArray(tabs) && tabs[2]?.tabRenderer?.endpoint?.browseEndpoint;
		const contents =
			Array.isArray(tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents) &&
			(tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents as Array<any>);
		const clickTrackingParams =
				(Array.isArray(contents) &&
					contents[contents.length - 1]?.playlistPanelVideoRenderer?.navigationEndpoint?.clickTrackingParams) ||
				null,
			continuation =
				(Array.isArray(
					data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer
						?.tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.continuations,
				) &&
					data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer
						?.tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.continuations[0]
						?.nextRadioContinuationData?.continuation) ||
				null;
		const watchEndpoint = data?.currentVideoEndpoint?.watchEndpoint;
		const visitorData = data?.responseContext?.visitorData;
		const parsed = parseContents(
			contents,
			continuation,
			clickTrackingParams,
			watchEndpoint ? watchEndpoint : "",
			visitorData,
		);
		// console.log(visitorData);
		return Object.assign(parsed, { related });
	} catch (err) {
		console.error(err);

		throw error(500, err);
	}
}

/*
 * This is for when you are already listening to a song
 **************************************/
function parseNextBodyContinuation(data) {
	const {
		responseContext = {},
		continuationContents: {
			playlistPanelContinuation: {
				contents = [],
				continuations: [{ nextRadioContinuationData: { continuation = "" } = {} } = {}] = [],
				...rest
			} = {},
		} = {},
	} = data;

	const clickTrackingParams = (contents as any[]).at(-1)?.playlistPanelVideoRenderer?.navigationEndpoint
		?.clickTrackingParams;

	const visitorData = responseContext?.visitorData;
	const parsed = parseContents(contents, continuation, clickTrackingParams, rest, visitorData);

	return parsed;
}
