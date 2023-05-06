import { json as json$1 } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams;
	let q = query.get("q");
	q = decodeURIComponent(q);
	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/music/get_search_suggestions?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30&prettyPrint=false`,
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

				input: `${q}`,
			}),
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Origin: "https://music.youtube.com",
				"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
			},
		},
	);
	const data = await response.json();
	const { contents: [{ searchSuggestionsSectionRenderer: { contents = [] } = {} } = {}] = [] } = data;
	const results = contents.map(({ searchSuggestionRenderer }, i) => {
		return {
			query: searchSuggestionRenderer.navigationEndpoint.searchEndpoint.query,
			id: i,
		};
	});
	if (results) {
		return json$1(results);
	}
};
