/* eslint-disable no-inner-declarations */
import { parseContents } from "$lib/endpoints/nextUtils";

import type { EndpointOutput, RequestHandler } from "@sveltejs/kit";

// import NextParser from "/nextUtils";

export const get: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	const params = query.get("params") || undefined;
	const itct = query.get("itct") || "";
	const videoId = query.get("videoId") || "";
	const playlistId = query.get("playlistId") || "";
	const ctoken = query.get("ctoken") || undefined;
	const clickTracking = query.get("clickParams") || undefined;
	const setVideoId = query.get("setVideoId") || undefined;
	const type = query.get("configType") || undefined;
	// console.log(params)
	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/next?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30&prettyPrint=false`,
		{
			method: "POST",
			body: JSON.stringify({
				context: {
					client: {
						clientName: "WEB_REMIX",
						clientVersion: "0.1",
						visitorData: "CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D"
					},
					user: {
						lockedSafetyMode: false
					}

				},
				continuation: `${ctoken}`,
				isAudioOnly: true,
				enablePersistentPlaylistPanel: true,
				params: `${params ? encodeURIComponent(params) : itct}`,
				tunerSettingValue: "AUTOMIX_SETTING_NORMAL",
				videoId: `${videoId}`,
				playlistSetVideoId: setVideoId,
				playlistId: `${playlistId}`,
				watchEndpointMusicConfig: {
					hasPersistentPlaylistPanel: true,
					musicVideoType: type ? type : "MUSIC_VIDEO_TYPE_ATV"
				}
			}),
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"user-agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Edg/97.0.1072.62",
				"x-origin": "https://music.youtube.com",

				"X-Goog-Visitor-Id": "CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D",

				Origin: "https://music.youtube.com"
			}
		}
	);
	if (!response.ok) {
		// NOT res.status >= 200 && res.status < 300
		return { status: response.status, body: response.statusText };
	}
	const data = await response.json();

	/* For when you are NOT listening to a song.
	 ********************************************/
	if (!ctoken) {
		return {
			status: 200,
			body: parseNextBody(data),
			headers: { "Content-Type": "application/json" }
		};
	}
	return {
		status: 200,
		body: parseNextBodyContinuation(data),
		headers: { "Content-Type": "application/json" }
	};
};

function parseNextBody(data) {
	const contents =
		Array.isArray(
			data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
				?.watchNextTabbedResultsRenderer?.tabs[0].tabRenderer?.content
				?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents
		) &&
		(data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
			?.watchNextTabbedResultsRenderer?.tabs[0].tabRenderer?.content
			?.musicQueueRenderer?.content?.playlistPanelRenderer
			?.contents as Array<any>);
	const clickTrackingParams =
			data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
				?.watchNextTabbedResultsRenderer?.tabs[0]?.tabRenderer?.content
				?.musicQueueRenderer?.content?.playlistPanelRenderer?.continuations[0]
				?.nextRadioContinuationData?.clickTrackingParams,
		continuation =
			data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer
				?.watchNextTabbedResultsRenderer?.tabs[0]?.tabRenderer?.content
				?.musicQueueRenderer?.content?.playlistPanelRenderer?.continuations[0]
				?.nextRadioContinuationData?.continuation;
	const watchEndpoint = data?.currentVideoEndpoint?.watchEndpoint;

	const parsed = parseContents(
		contents,
		continuation,
		clickTrackingParams,
		watchEndpoint ? watchEndpoint : ""
	);
	return parsed;
}

function parseNextBodyContinuation(data) {
	/*
	 * This is for when you are already listening to a song
	 * !params above looks for the ITCT as a check.
	 **************************************/
	const {
		continuationContents: {
			playlistPanelContinuation: {
				contents = [],
				continuations: [
					{
						nextRadioContinuationData: {
							clickTrackingParams = "",
							continuation = ""
						} = {}
					} = {}
				] = [],
				...rest
			} = {}
		} = {}
	} = data;
	// return { body: { rest, contents, continuation, data, clickTrackingParams } }
	const parsed = parseContents(
		contents,
		continuation,
		clickTrackingParams,
		rest
	);
	// console.log(parsed)
	return parsed;
}
