/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { NextContinuationData, RequestParams } from "$lib/types";
import { queryParams } from "$lib/utils";
import type { EndpointOutput } from "@sveltejs/kit";

export const sendRequest = async (
	body: any,
	params: RequestParams
): Promise<Record<string, any>> => {
	const headers = new Headers({
		Accept: "*/*",
		"Accept-Language": "en-US,en;q=0.5",
		"Content-Type": "application/json",
		"X-Goog-AuthUser": "0",
		Origin: "https://music.youtube.com",
		"x-origin": "https://music.youtube.com",

		"X-Goog-Visitor-Id": "CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D"
	});
	if (params.type == "playlist" && params.continuation && params.playlistId) {
		headers.append(
			"referer",
			"https://music.youtube.com/playlist?list=" + params.playlistId.slice(2)
		);
	}
	if (params.endpoint == "player") {
		headers.delete("User-Agent");
		headers.delete("X-Goog-Visitor-Id");
		headers.delete("X-Goog-AuthUser");
	}
	const init = {
		method: "POST",
		headers: headers,
		body: JSON.stringify(body)
	};
	// console.log(init)
	let addQueryParams;
	if (params.continuation) {
		let continuation:
			| { ctoken: string; continuation: string; itct: string; type?: string }
			| NextContinuationData = params.continuation;
		continuation = {
			ctoken: continuation.continuation,
			continuation: continuation.continuation,
			itct: continuation.clickTrackingParams,
			type: "next"
		};
		addQueryParams = queryParams(continuation);
	}
	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/${
			params.endpoint
		}?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30${`&${addQueryParams}`}${
			params.endpoint !== "player" ? `&alt=json` : " "
		}`,
		init
	);
	const data = await response.json();

	// if (!response.ok) {
	// 	return { status: response.status, body: response.statusText }
	// }

	return data;
};
