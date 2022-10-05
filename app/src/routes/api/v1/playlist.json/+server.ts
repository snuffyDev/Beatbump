import { MusicResponsiveListItemRenderer, MusicTwoRowItemRenderer } from "$lib/parsers";

import type { CarouselHeader, CarouselItem } from "$lib/types";
import type { NextContinuationData } from "$lib/types";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import { map } from "$lib/utils/collections";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { buildRequest } from "$api/request";
import type { PlaylistEndpointContinuation, PlaylistEndpointParams } from "$api/_base";
export const GET: RequestHandler = async ({ url }) => {
	try {
		const query = url.searchParams;
		const browseId = query.get("list") || "";
		const itct = query.get("itct") || "";
		const ctoken = query.get("ctoken") || "";
		const referrer = query.get("ref") || "";
		const visitorData = query.get("visitorData") || "";

		const params: PlaylistEndpointParams = {
			browseId,
		};
		if (ctoken !== "") {
			return getPlaylistContinuation(
				params,
				{ ctoken: decodeURIComponent(ctoken), continuation: decodeURIComponent(ctoken), itct, type: "next" },
				referrer.slice(2),
				visitorData,
			);
		}

		return getPlaylist(browseId, referrer);
	} catch (err) {
		return new Response(undefined, { status: 500, headers: { statusText: `${err}` } });
	}
};
async function getPlaylistContinuation(
	params: PlaylistEndpointParams,
	continuation: PlaylistEndpointContinuation,
	id?: string,
	visitorData?: string,
) {
	const response = await buildRequest("playlist", {
		context: {
			client: {
				clientName: "WEB_REMIX",
				clientVersion: "1.20220404.01.00",
				hl: "en",
				visitorData: visitorData,
				originalUrl: "https://music.youtube.com/playlist?list=" + id,
			},
		},
		headers: {
			referer: "https://music.youtube.com/playlist?list=" + id,
		},
		params: {},
		continuation,
	});
	if (!response.ok) {
		throw error(response.status, response.statusText);
	}

	const data = await response.json();
	const { continuationContents: { musicPlaylistShelfContinuation: { contents = [], continuations = [] } = {} } = {} } =
		await data;
	// console.log(data, contents, continuations)

	let tracks = [];
	let carousel;
	const cont: NextContinuationData = continuations.length !== 0 ? continuations[0]?.nextContinuationData : null;
	if (data?.continuationContents?.sectionListContinuation?.contents[0]?.musicCarouselShelfRenderer) {
		carousel = parseCarousel({
			musicCarouselShelfRenderer:
				data?.continuationContents?.sectionListContinuation?.contents[0]?.musicCarouselShelfRenderer,
		});
	} else {
		tracks = parseTrack(contents, id);
	}
	return json({
		continuations: cont,
		tracks: tracks.length !== 0 && tracks,
		carousel: carousel,
	});
}
async function getPlaylist(browseId, referrer) {
	const response = await fetch(
		"https://music.youtube.com/youtubei/v1/browse?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30&prettyPrint=false",
		{
			method: "POST",
			body: JSON.stringify({
				context: {
					client: {
						// clientName: 'WEB_REMIX',
						// clientVersion: '1.20211025.00.00',
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
						originalUrl: "https://music.youtube.com/playlist?list=" + browseId,
						visitorData: "CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D",
					},

					user: {
						lockedSafetyMode: false,
					},
				},
				browseId: `${browseId}`,
				browseEndpointContextMusicConfig: {
					pageType: "MUSIC_PAGE_TYPE_PLAYLIST",
				},
			}),
			headers: {
				"Content-Type": "application/json; charset=utf-8",

				"X-Goog-AuthUser": "0",
				Origin: "https://music.youtube.com",
				"x-origin": "https://music.youtube.com",
				"X-Goog-Visitor-Id": "CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D",

				"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
				referer: "https://music.youtube.com/playlist?list=" + referrer || browseId,
			},
		},
	);
	if (!response.ok) {
		return { status: response.status, body: response.statusText };
	}

	const data = await response.json();
	let musicDetailHeaderRenderer = {};
	if (Object.prototype.hasOwnProperty.call(data, "header")) {
		const { musicDetailHeaderRenderer: detailHeader = {} } = data?.header;
		musicDetailHeaderRenderer = detailHeader;
	}
	const visitorData = data?.responseContext?.visitorData;
	const contents =
			data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents[0]
				?.musicPlaylistShelfRenderer.contents,
		playlistId =
			data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents[0]
				?.musicPlaylistShelfRenderer.playlistId,
		continuations =
			data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents[0]
				?.musicPlaylistShelfRenderer?.continuations;
	const _carouselContinuation =
		data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer
			?.continuations || null;

	// console.log(musicDetailHeaderRenderer)
	const cont: NextContinuationData = data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content
		?.sectionListRenderer?.continuations
		? Array.isArray(continuations) && continuations[0]?.nextContinuationData
			? continuations[0]?.nextContinuationData
			: _carouselContinuation[0]?.nextContinuationData
		: null;

	const getHeader = () => {
		const createArray = (key) =>
			Array.isArray(musicDetailHeaderRenderer[key]["runs"]) &&
			(() => {
				let len = musicDetailHeaderRenderer[key]["runs"].length;
				const arr = [];
				for (const { text } of musicDetailHeaderRenderer[key]["runs"]) {
					arr.push(text);
				}
				return arr;
			})();
		const ALLOWED_KEYS = new Set(["subtitle", "secondSubtitle", "description", "thumbnail", "title"]);
		// const key_map = Object.keys(musicDetailHeaderRenderer);
		// let len = key_map.length;
		for (const key in musicDetailHeaderRenderer) {
			if (!ALLOWED_KEYS.has(key)) {
				delete musicDetailHeaderRenderer[key];
			}
			if (key === "subtitle" || key === "secondSubtitle") {
				musicDetailHeaderRenderer[key] = musicDetailHeaderRenderer[key]["runs"]["length"] !== 0 ? createArray(key) : [];
			}
			if (
				key === "description" &&
				Array.isArray(musicDetailHeaderRenderer[key]?.runs) &&
				musicDetailHeaderRenderer[key]?.runs.length !== 0
			) {
				musicDetailHeaderRenderer[key] = musicDetailHeaderRenderer[key].runs[0]?.text || undefined;
			}
			if (key === "thumbnail") {
				musicDetailHeaderRenderer[key + "s"] =
					musicDetailHeaderRenderer[key]?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails || null;
				delete musicDetailHeaderRenderer[key];
			}
			if (key === "title")
				musicDetailHeaderRenderer[key] = musicDetailHeaderRenderer[key]["runs"][0]["text"] || "Error";
		}
		musicDetailHeaderRenderer["playlistId"] = playlistId;
		ALLOWED_KEYS.clear();
	};
	getHeader();

	const tracks = parseTrack(contents, playlistId ?? browseId.slice(2));
	// console.timeEnd("playlist");
	return json({
		continuations: cont,
		tracks,
		visitorData,
		carouselContinuations: _carouselContinuation && _carouselContinuation[0].nextContinuationData,
		header: musicDetailHeaderRenderer,
	});
}
function parseTrack(contents = [], playlistId?: string): Array<IListItemRenderer> {
	let idx = contents.length;
	const tracks = Array(idx);
	while (--idx > -1) {
		tracks[idx] = MusicResponsiveListItemRenderer(contents[idx], true, playlistId) || undefined;
	}
	return tracks;
}
function parseHeader(header: any[]): CarouselHeader[] {
	return map(header, ({ musicCarouselShelfBasicHeaderRenderer } = {}) => ({
		title: musicCarouselShelfBasicHeaderRenderer["title"]["runs"][0].text,
	}));
}

function parseBody(contents = []): CarouselItem[] {
	const items = [];
	for (let idx = 0; idx < contents.length; idx++) {
		const item = contents[idx];
		if (item.musicTwoRowItemRenderer) items[idx] = MusicTwoRowItemRenderer(item);
		if (item.musicResponsiveListItemRenderer) items[idx] = MusicResponsiveListItemRenderer(item);
	}
	return items;
}
function parseCarousel({ musicCarouselShelfRenderer }) {
	return {
		header: parseHeader([musicCarouselShelfRenderer.header])[0],
		results: parseBody(musicCarouselShelfRenderer.contents),
	};
}
