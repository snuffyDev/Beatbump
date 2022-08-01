/* eslint-disable no-inner-declarations */
import { parseContents } from "$lib/parsers/next";

import type { EndpointOutput, RequestHandler } from "@sveltejs/kit";
import { buildRequest } from "./_api/request";

// import NextParser from "/nextUtils";
/** @type {import('.svelte-kit/types/src/routes/api/next.json').RequestHandler} */
export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	const params = query.get("params") || undefined;
	const visitorData = query.get("visitorData") || "CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D";
	const itct = query.get("itct") || "";
	const videoId = query.get("videoId") || "";
	const playlistId = query.get("playlistId") || "";
	const ctoken = query.get("ctoken") || undefined;
	const idx = parseInt(query.get("index")) || 0;
	const clickTracking = query.get("clickParams") || undefined;
	const setVideoId = query.get("playlistSetVideoId") || undefined;
	const type = query.get("configType") || undefined;
	const response = await buildRequest("next", {
		context: {
			clickTracking: {
				clickTrackingParams: clickTracking ? decodeURIComponent(decodeURIComponent(clickTracking)) : undefined,
			},
			client: { clientName: "WEB_REMIX", clientVersion: "1.20220404.01.00", visitorData },
		},
		params: {
			continuation: ctoken,
			videoId,
			index: idx,
			playlistSetVideoId: setVideoId,
			playlistId,
			params: params ? params : itct,
		},
	});

	if (!response.ok) {
		// NOT res.status >= 200 && res.status < 300
		// return { status: response.status, body: response.statusText };
		return { headers: response.headers, body: response.statusText };
	}
	const data = await response.json();

	/* For when you are NOT listening to a song.
	 ********************************************/
	if (!ctoken) {
		return parseNextBody(data);
	}
	return {
		status: 200,
		body: parseNextBodyContinuation(data),
		headers: { "Content-Type": "application/json" },
	};
};

function parseNextBody(data) {
	try {
		const related =
			data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs &&
			data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs[2]
				?.tabRenderer?.endpoint?.browseEndpoint;
		const contents =
			Array.isArray(
				data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer
					?.tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents,
			) &&
			(data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer
				?.tabs[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents as Array<any>);
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
		return { body: { ...parsed, related, data }, status: 200 };
	} catch (err) {
		console.error(err);
		console.error(data);
		return { body: data, status: 201 };
		// throw new Error(err);
	}
}

function parseNextBodyContinuation(data) {
	/*
	 * This is for when you are already listening to a song
	 * !params above looks for the ITCT as a check.
	 **************************************/
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
	// return { body: { rest, contents, continuation, data, clickTrackingParams } }
	const clickTrackingParams =
		contents[contents.length - 1]?.playlistPanelVideoRenderer?.navigationEndpoint?.clickTrackingParams;

	const visitorData = responseContext?.visitorData;
	const parsed = parseContents(contents, continuation, clickTrackingParams, rest, visitorData);
	// console.log(parsed)
	return parsed;
}
