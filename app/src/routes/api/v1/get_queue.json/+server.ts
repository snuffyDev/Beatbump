import { PlaylistPanelVideoRenderer } from "$lib/parsers";
import type { Song } from "$lib/types";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	const playlistId = query.get("playlistId") || "";
	const _videoIds = query.get("videoIds") || "";
	const videoIds: string[] | undefined = _videoIds.length !== 0 ? _videoIds.split(",") : undefined;
	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/music/get_queue?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30&prettyPrint=false`,
		{
			method: "POST",
			body: JSON.stringify({
				context: {
					client: {
						clientName: "WEB_REMIX",
						clientVersion: "0.1",
						deviceMake: "google",
						platform: "DESKTOP",
						deviceModel: "bot",
						experimentIds: [],
						experimentsToken: "",
						osName: "Googlebot",
						osVersion: "2.1",
						locationInfo: {
							locationPermissionAuthorizationStatus: "LOCATION_PERMISSION_AUTHORIZATION_STATUS_UNSUPPORTED",
						},
						musicAppInfo: {
							musicActivityMasterSwitch: "MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE",
							musicLocationMasterSwitch: "MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE",
							pwaInstallabilityStatus: "PWA_INSTALLABILITY_STATUS_UNKNOWN",
						},
						utcOffsetMinutes: -new Date().getTimezoneOffset(),
					},
					capabilities: {},
					request: {
						internalExperimentFlags: [
							{
								key: "force_music_enable_outertube_tastebuilder_browse",
								value: "true",
							},
							{
								key: "force_music_enable_outertube_playlist_detail_browse",
								value: "true",
							},
							{
								key: "force_music_enable_outertube_search_suggestions",
								value: "true",
							},
						],
						sessionIndex: {},
					},
					user: {
						lockedSafetyMode: false,
					},
					activePlayers: {},
				},
				videoIds: videoIds,
				playlistId: `${playlistId}`,
			}),
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Origin: "https://music.youtube.com",
				"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
			},
		},
	);

	if (!response.ok) {
		// NOT res.status >= 200 && res.status < 300

		// Suggestion (check for correctness before using):
		return new Response(response.statusText, { status: response.status });
		// return { status: response.status, body: response.statusText };
	}
	const data = await response.json();
	const queueDatas: any[] = data?.queueDatas || [];
	// return {
	// 	body: JSON.stringify(queueDatas),
	// 	status: 200
	// };

	if (Array.isArray(queueDatas)) {
		const length = queueDatas.length;
		let idx = -1;
		while (++idx < length) {
			queueDatas[idx] = PlaylistPanelVideoRenderer(queueDatas[idx]?.content?.playlistPanelVideoRenderer);
		}
		//
		return new Response(JSON.stringify(queueDatas as Song[]), {
			headers: {
				"content-type": "application/json",
			},
		});
	}
};
