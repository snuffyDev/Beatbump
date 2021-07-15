/* eslint-disable no-inner-declarations */
import { parseContents } from "$lib/endpoints/nextUtils";

// import NextParser from "/nextUtils";

export async function get({ query }) {
	const i = query.get("index");
	const params = query.get("params");
	const video_id = query.get("videoId");
	const playlist_id = query.get("playlistId");
	const ctoken = query.get("ctoken");

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/next?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,
		{
			method: "POST",
			body: JSON.stringify({
				context: {
					client: {
						clientName: "WEB_REMIX",
						clientVersion: "0.1",
					},

					user: {
						enableSafetyMode: false,
					},
				},
				continuation: `${ctoken}`,
				isAudioOnly: true,
				enablePersistentPlaylistPanel: true,
				index: `${i}`,
				params: `${params}`,
				tunerSettingValue: "AUTOMIX_SETTING_NORMAL",
				videoId: `${video_id}`,
				playlistId: `${playlist_id}`,
				watchEndpointMusicConfig: {
					hasPersistentPlaylistPanel: true,
					musicVideoType: "MUSIC_VIDEO_TYPE_ATV",
				},
			}),
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Origin: "https://music.youtube.com",
			},
			// referrer: `https://music.youtube.com/watch?v=${videoId}&list=${playlistId}`,
		}
	);
	if (!response.ok) {
		// NOT res.status >= 200 && res.status < 300
		return { statusCode: response.status, body: response.statusText };
	}
	const data = await response.json();
	if (!params) {
		let {
			contents: {
				singleColumnMusicWatchNextResultsRenderer: {
					tabbedRenderer: {
						watchNextTabbedResultsRenderer: {
							tabs: [
								{
									tabRenderer: {
										content: {
											musicQueueRenderer: {
												content: {
													playlistPanelRenderer: {
														contents,
														continuations: [{ ...rest }],
													},
												},
											},
										},
									},
								},
							],
						},
					},
				},
			},
			currentVideoEndpoint: { watchEndpoint },
		} = data;
		let { clickTrackingParams, continuation } = rest;
		async function parser(
			contents,
			continuation,
			clickTrackingParams,
			watchEndpoint?
		) {
			const parsed = parseContents(
				contents,
				continuation,
				clickTrackingParams,
				watchEndpoint ? watchEndpoint : ""
			);

			return parsed;
		}

		return {
			statusCode: 200,
			body: JSON.stringify(
				await parser(contents, continuation, clickTrackingParams, watchEndpoint)
			),
		};
	}
	let watchEndpoint;
	let {
		continuationContents: {
			playlistPanelContinuation: {
				contents,
				continuations: [
					{
						nextRadioContinuationData: { clickTrackingParams, continuation },
					},
				],
				playlistId,
				...rest
			} = watchEndpoint,
		},
	} = data;
	async function parser(contents, continuation, clickTrackingParams, rest) {
		const parsed = parseContents(
			contents,
			continuation,
			clickTrackingParams,
			rest
		);
		return parsed;
	}
	return {
		statusCode: 200,
		body: JSON.stringify(
			await parser(contents, continuation, clickTrackingParams, rest)
		),
	};
}

// output to netlify function log
//     console.log(error)
//     return {
//         statusCode: 500,
//         // Could be a custom message or object i.e. JSON.stringify(err)
//         body: JSON.stringify({ msg: error.message })
//     }
// }
