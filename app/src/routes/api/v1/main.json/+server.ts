import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams; // if (headers.origin !== 'https://beatbump.ml/') {
	// 	return { status: 403, body: JSON.stringify('CORS error!') }
	// }

	const browseId = query.get("browseId");
	// console.log(endpoint)

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30&prettyPrint=false`,
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
				browseEndpointContextMusicConfig: {
					browseEndpointContextMusicConfig: {
						pageType: "MUSIC_PAGE_TYPE_ARTIST",
					},
				},
				browseId: `${browseId}`,
			}),
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Origin: "https://music.youtube.com",
				"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
			},
		},
	);

	// if (!response.ok) {
	// 	// NOT res.status >= 200 && res.status < 300
	// 	return { status: response.status, body: response.statusText }
	// }
	const data = await response.json();

	return new Response(JSON.stringify(data));
};
