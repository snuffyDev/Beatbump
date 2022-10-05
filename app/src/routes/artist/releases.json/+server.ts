import { json as json$1 } from "@sveltejs/kit";

import { MusicTwoRowItemRenderer } from "$lib/parsers";
import { iter } from "$lib/utils/collections";
import type { RequestHandler } from "./$types";
export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams;

	const browseId = query.get("browseId") || "";
	const params = query.get("params");
	const itct = query.get("itct") || "";
	const visitorData = query.get("visitorData");
	const json = {
		context: {
			client: {
				hl: "en",
				gl: "US",
				deviceMake: "",
				deviceModel: "",
				visitorData: encodeURIComponent(visitorData),
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36",
				clientName: "WEB_REMIX",
				clientVersion: "1.20220328.01.00",
				osName: "Windows",
				osVersion: "10.0",
				// originalUrl: "https://music.youtube.com/channel/" + browseId,
				platform: "DESKTOP",
				clientFormFactor: "UNKNOWN_FORM_FACTOR",
				userInterfaceTheme: "USER_INTERFACE_THEME_DARK",
				timeZone: "America/New_York",
				browserName: "Edge Chromium",
				browserVersion: "100.0.4896.36",
				screenWidthPoints: 1920,
				screenHeightPoints: 961,
				screenPixelDensity: 1,
				screenDensityFloat: 1,
				utcOffsetMinutes: -new Date().getTimezoneOffset(),
				musicAppInfo: {
					pwaInstallabilityStatus: "PWA_INSTALLABILITY_STATUS_CAN_BE_INSTALLED",
					webDisplayMode: "WEB_DISPLAY_MODE_BROWSER",
					storeDigitalGoodsApiSupportStatus: {
						playStoreDigitalGoodsApiSupportStatus: "DIGITAL_GOODS_API_SUPPORT_STATUS_UNSUPPORTED",
					},
					musicActivityMasterSwitch: "MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE",
					musicLocationMasterSwitch: "MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE",
				},
			},
			user: {
				lockedSafetyMode: false,
			},
			request: {
				useSsl: true,
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
				consistencyTokenJars: [],
			},
			clickTracking: {
				clickTrackingParams: decodeURIComponent(itct),
			},
		},
		browseId: browseId,
		params: encodeURIComponent(params),
	};

	const response = await fetch(
		"https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30&prettyPrint=false",
		{
			headers: {
				Host: "music.youtube.com",
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36 Edg/100.0.1185.36",
				"Content-Type": "application/json",
				"x-origin": "https://music.youtube.com",
				"x-goog-visitor-id": encodeURIComponent(visitorData),
				referer: "https://music.youtube.com/" + browseId,

				Origin: "https://music.youtube.com",
			},
			body: JSON.stringify(json),
			method: "POST",
		},
	);

	const data = await response.json();

	const header = data?.header;
	const contents = data?.contents;
	if (!response.ok) {
		throw new Error(
			"@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)",
		);
		// Suggestion (check for correctness before using):
		// return new Response(response.statusText, { status: response.status });
		return { status: response.status, body: response.statusText };
	}

	const grid: {
		items: any[];
		header: { gridHeaderRenderer: { title: { runs: [{ text: string }] } } };
	} =
		contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents[0]
			?.gridRenderer;

	const items = [];

	iter(grid?.items, (item) => {
		if (item?.musicTwoRowItemRenderer) {
			items.push(MusicTwoRowItemRenderer(item));
		}
	});

	const head = {
		artist: header?.musicHeaderRenderer?.title?.runs[0]?.text,
		type: grid?.header?.gridHeaderRenderer?.title.runs[0].text,
	};

	return json$1({ header: head, contents: items });
};
