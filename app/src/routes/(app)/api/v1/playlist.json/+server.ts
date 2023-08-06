import { ItemBuilder } from "$lib/parsers";

import type { NextContinuationData, Thumbnail } from "$lib/types";

import { parseCarousel } from "$lib/parsers/innertube/carousel";
import type { ITwoRowItemRenderer } from "$lib/types/musicCarouselTwoRowItem";
import type { IListItemRenderer } from "$lib/types/musicListItemRenderer";
import { objectKeys } from "$lib/utils/collections/objects";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import type { PlaylistEndpointContinuation } from "../../_lib/_base";
import { buildAPIRequest } from "../../_lib/request";
import { parseParams } from "../../_lib/utils";

export type PlaylistHeader = {
	title: string;
	subtitle: string[];
	description: string;
	secondSubtitle: string[];
	thumbnails: Thumbnail[];
	playlistId: string;
};
export interface PlaylistResponseBody {
	header: PlaylistHeader;
	carouselContinuations?: NextContinuationData;
	continuations?: NextContinuationData;
	tracks: IListItemRenderer[];
	visitorData?: string;
}

export type PlaylistSchema = {
	itct?: string;
	list?: string;
	ctoken?: string;
	ref?: string;
	visitorData?: string;
};

const parser = parseParams<PlaylistSchema>([
	"list",
	"ctoken",
	"itct",
	"ref",
	"visitorData",
]);

const ALLOWED_HEADER_KEYS = new Set([
	"subtitle",
	"secondSubtitle",
	"description",
	"thumbnail",
	"title",
]);

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const query = url.searchParams;
		const {
			list: browseId,
			itct,
			ctoken,
			ref: referrer = "",
			visitorData,
		} = parser(query.entries());
		const itemBuilder = new ItemBuilder({
			proxy: locals.preferences["Proxy Thumbnails"],
			origin: url.origin,
		});
		if (ctoken) {
			return await getPlaylistContinuation(itemBuilder, locals, {
				continuation: {
					...(ctoken && { ctoken: ctoken, continuation: ctoken }),
					...(itct && { itct }),
					type: "next",
				},

				id: referrer?.slice(2),
				visitorData: visitorData ?? "",
			});
		}
		if (!browseId) throw Error("Missing playlist browseId");
		return await getPlaylist(
			browseId ?? referrer,
			referrer ?? "",
			locals,
			itemBuilder,
		);
	} catch (err) {
		console.error(err);
		return new Response(err as string, {
			status: 500,
			headers: {
				statusText: `${err}`,
			},
		});
	}
};
async function getPlaylistContinuation(
	itemBuilder: ItemBuilder,
	locals: App.Locals,
	{
		continuation,
		id,
		visitorData,
	}: {
		continuation: PlaylistEndpointContinuation;
		id?: string;
		visitorData?: string;
	},
) {
	const response = await buildAPIRequest("playlist", {
		context: {
			client: {
				clientName: "WEB_REMIX",
				clientVersion: "1.20230501.01.00",
				hl: "en",
				visitorData: visitorData,
				originalUrl: "https://music.youtube.com/playlist?list=" + id,
			},
			user: {
				lockedSafetyMode: locals.preferences.Restricted,
			},
		},
		headers: {
			referer: "https://music.youtube.com/playlist?list=" + id,
		},
		params: {},
		continuation,
	});
	if (response === null)
		throw error(500, { message: "Error fetching playlist" });
	if (!response.ok) {
		throw error(response.status, response.statusText);
	}

	const data = await response.json();
	const {
		continuationContents: {
			musicPlaylistShelfContinuation: {
				contents = [],
				continuations = [],
			} = {},
		} = {},
	} = await data;

	let tracks: (IListItemRenderer | ITwoRowItemRenderer)[] = [];
	let carousel =
		data?.continuationContents?.sectionListContinuation?.contents[0];
	const cont: NextContinuationData =
		continuations.length !== 0 ? continuations[0]?.nextContinuationData : null;
	if (carousel) {
		carousel = await parseCarousel(
			data?.continuationContents?.sectionListContinuation?.contents[0],
			itemBuilder,
		);
	} else {
		tracks = await parseTrack(contents, id, itemBuilder);
	}

	return json({
		_original: data,
		continuations: cont,
		tracks: tracks.length !== 0 && tracks,
		carousel: carousel,
	});
}
async function getPlaylist(
	browseId: string,
	referrer: string,
	locals: App.Locals,
	itemBuilder: ItemBuilder,
) {
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
						originalUrl: "https://music.youtube.com/playlist?list=" + browseId,
						visitorData: "CgtQc1BrdVJNNVdNRSiImZ6KBg%3D%3D",
					},

					user: {
						lockedSafetyMode: locals.preferences.Restricted,
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

				"User-Agent":
					"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
				referer:
					"https://music.youtube.com/playlist?list=" + referrer || browseId,
			},
		},
	);
	if (!response.ok) {
		console.error(response.statusText);
		throw error(response.status, { message: response.statusText });
	}

	const data = await response.json();
	let musicDetailHeaderRenderer: Partial<Record<string, any>> = {};
	if ("header" in data) {
		const { musicDetailHeaderRenderer: detailHeader = {} } = data.header;
		musicDetailHeaderRenderer = detailHeader;
	}
	const visitorData = data.responseContext?.visitorData;

	const musicPlaylistShelfRenderer =
		data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
			?.content?.sectionListRenderer?.contents[0]?.musicPlaylistShelfRenderer;

	const contents = musicPlaylistShelfRenderer.contents;

	const playlistId = musicPlaylistShelfRenderer.playlistId;
	const continuations = musicPlaylistShelfRenderer?.continuations;

	const _carouselContinuation =
		data?.contents?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer
			?.content?.sectionListRenderer?.continuations || null;

	// console.log(musicDetailHeaderRenderer)
	const continuationData: NextContinuationData = data?.contents
		?.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content
		?.sectionListRenderer?.continuations
		? Array.isArray(continuations) && continuations[0]?.nextContinuationData
			? continuations[0]?.nextContinuationData
			: _carouselContinuation[0]?.nextContinuationData
		: null;

	const header = {
		subtitle: [] as string[],
		secondSubtitle: [] as string[],
		description: "",
		playlistId: "",
		thumbnails: [] as Thumbnail[],
		title: "",
	};
	const getHeader = () => {
		const createArray = (key: string) => {
			return Array.isArray(musicDetailHeaderRenderer[key]["runs"])
				? (
						musicDetailHeaderRenderer[key]?.runs as {
							text: string;
						}[]
				  ).map(({ text }) => text)
				: [];
		};

		for (const key of objectKeys(musicDetailHeaderRenderer)) {
			if (!ALLOWED_HEADER_KEYS.has(key)) {
				continue;
			}

			if (key === "subtitle" || key === "secondSubtitle") {
				header[key] =
					musicDetailHeaderRenderer[key]["runs"]["length"] !== 0
						? createArray(key)
						: ([] as string[]);
			}

			const item = musicDetailHeaderRenderer[key] as Record<string, unknown>;
			if (
				key === "description" &&
				"runs" in item &&
				Array.isArray(item.runs) &&
				item.runs.length !== 0
			) {
				header[key] = item.runs[0]?.text || undefined;
			}
			if (key === "thumbnail") {
				const croppedSquareThumbnail = (
					item?.croppedSquareThumbnailRenderer as Record<string, unknown>
				)?.thumbnail;

				if (
					croppedSquareThumbnail != null &&
					typeof croppedSquareThumbnail === "object" &&
					"thumbnails" in croppedSquareThumbnail
				) {
					header[(key + "s") as "thumbnails"] =
						(croppedSquareThumbnail.thumbnails || []) as Thumbnail[];
				}
			}
			if (key === "title")
				header[key] =
					musicDetailHeaderRenderer[key]["runs"][0]["text"] || "[ Unknown ]";
		}
		header["playlistId"] = playlistId;
	};
	getHeader();

	const tracks = await parseTrack(
		contents,
		playlistId ?? browseId.slice(2),
		itemBuilder,
	);
	// console.timeEnd("playlist");
	const obj = {
		_original: data,
		continuations: continuationData,
		tracks,
		visitorData,
		carouselContinuations:
			_carouselContinuation && _carouselContinuation[0].nextContinuationData,
		header,
	};
	return json(obj);
}
async function parseTrack(
	contents = [],
	playlistId: string | undefined,
	itemBuilder: ItemBuilder,
): Promise<IListItemRenderer[]> {
	// let idx = contents.length;

	const items = (
		await Promise.all(
			contents.map((track) =>
				itemBuilder.MusicResponsiveListItemRenderer(track, {
					playlistSetVideoId: true,
					playlistId: playlistId || undefined,
				}),
			),
		)
	).filter((track) => track && track.videoId);
	return items;
}