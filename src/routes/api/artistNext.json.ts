export async function get({ query }) {
	const videoId = query.get("videoId") || "";
	const playlistId = query.get("playlistId") || "";

	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/next?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30`,

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
								locationPermissionAuthorizationStatus:
									"LOCATION_PERMISSION_AUTHORIZATION_STATUS_UNSUPPORTED",
							},
							musicAppInfo: {
								musicActivityMasterSwitch:
									"MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE",
								musicLocationMasterSwitch:
									"MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE",
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
							enableSafetyMode: false,
						},
						activePlayers: {},
					},
					videoId: `${videoId}`,
					playlistId: `${playlistId}`,
				}),
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					Origin: "https://music.youtube.com",
					"User-Agent":
						"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
				},
			}
		);

		if (!response.ok) {
			// NOT res.status >= 200 && res.status < 300
			return { statusCode: response.status, body: response.statusText };
		}
		const data = await response.json();
		function parsedData() {
			console.log(data);
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
													content: { playlistPanelRenderer },
												},
											},
										},
									},
								],
							},
						},
					},
				},
			} = data;
			const convertArrayToObject = (array, key) => {
				const initialValue = {};
				return array.reduce((obj, item) => {
					return {
						...obj,
						[item[key]]: item,
					};
				}, initialValue);
			};
			playlistPanelRenderer = [playlistPanelRenderer];
			const response = playlistPanelRenderer.map((ctx) => {
				let items = ctx.contents;
				console.log(items);
				let contents = Object.fromEntries(items);
				return { ...items };
			});
			console.log(response);
			return response;
		}
		const d = parsedData();

		return {
			statusCode: 200,
			body: JSON.stringify(d),
		};
	} catch (error) {
		// output to netlify function log
		console.log(error);
		return {
			statusCode: 500,
			// Could be a custom message or object i.e. JSON.stringify(err)
			body: JSON.stringify({ msg: error.message }),
		};
	}
}
