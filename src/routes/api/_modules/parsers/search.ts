/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// import BaseContext from '$api/_modules/contexts/context'
import { MusicResponsiveListItemRenderer } from "$lib/parsers";

import type { Artist, NextContinuationData, Song } from "$lib/types";
import type { PlaylistSearch } from "$lib/types/playlist";
import { pb } from "$lib/utils";
import type { EndpointOutput } from "@sveltejs/kit";
interface SearchOutput extends EndpointOutput {
	contents?: Song | PlaylistSearch;
	didYouMean?: { term: string; endpoint: { query; params } };
	continuation?: NextContinuationData;
}
export async function get({ query }): Promise<SearchOutput> {
	let q = query.get("q");
	q = decodeURIComponent(q);
	const filter = query.get("filter") || "";
	const videoId = query.get("videoId") || "";
	const itct = query.get("itct") || "";
	const playlistId = query.get("playlistId") || "";
	const ctoken = query.get("ctoken") || "";
	const browseId = query.get("browseId") || "";

	const pageType = query.get("pt") || "";

	const response = await fetch(
		`https://music.youtube.com/youtubei/v1/search?key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30&prettyPrint=false${
			ctoken !== "" ? "" : `&sp=EgWKAQIIAWoKEAMQBBAKEAkQBQ%3D%3D`
		}${
			ctoken !== ""
				? `&ctoken=${ctoken}&continuation=${ctoken}&itct=${itct}&type='next'`
				: ""
		}`,
		{
			method: "POST",
			body: JSON.stringify({
				context: {
					client: {
						clientName: "WEB_REMIX",
						clientVersion: "0.1"
					},
					capabilities: {},
					request: {
						internalExperimentFlags: [
							{
								key: "force_music_enable_outertube_tastebuilder_browse",
								value: "true"
							},
							{
								key: "force_music_enable_outertube_playlist_detail_browse",
								value: "true"
							},
							{
								key: "force_music_enable_outertube_search_suggestions",
								value: "true"
							}
						],
						sessionIndex: {}
					},
					user: {
						lockedSafetyMode: false
					}
				},
				browseEndpointContextMusicConfig: {
					browseEndpointContextMusicConfig: {
						pageType: `${pageType}`
					}
				},
				browseId: `${browseId}`,

				isAudioOnly: true,
				query: `${q}`,

				params: filter !== "" ? `${filter}` : "",
				videoId: `${videoId}`,
				playlistId: `${playlistId}`
			}),
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				Origin: "https://music.youtube.com",
				"User-Agent":
					"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
			}
		}
	);

	if (!response.ok) {
		return { status: response.status, body: response.statusText };
	}
	const data = await response.json();
	let {
		continuationContents,
		contents: {
			tabbedSearchResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: {
								sectionListRenderer: {
									contents: [{ musicShelfRenderer } = {}] = [],
									contents = []
								} = {}
							} = {}
						} = {}
					} = {}
				] = []
			} = {}
		} = {}
	} = data;
	if (Object.prototype.hasOwnProperty.call(data, "continuationContents")) {
		return {
			status: 200,
			body: parseSearchResult(continuationContents, true, filter)
		};
	} else {
		return {
			status: 200,
			body: parseSearchResult(contents, false, filter)
		};
	}
}
// Parse the playlist results for search.
const parsePlaylist = (contents): PlaylistSearch[] => {
	return contents.map(({ musicResponsiveListItemRenderer }) => {
		const thumbnails =
			musicResponsiveListItemRenderer.thumbnail.musicThumbnailRenderer.thumbnail
				.thumbnails;
		const browseId =
			musicResponsiveListItemRenderer.navigationEndpoint.browseEndpoint
				.browseId;
		const title =
			musicResponsiveListItemRenderer.flexColumns[0]
				.musicResponsiveListItemFlexColumnRenderer.text.runs[0].text;
		const flexColumns = pb(
			musicResponsiveListItemRenderer,
			"musicResponsiveListItemFlexColumnRenderer",
			true
		);
		let metaData = pb(flexColumns[1], "runs:text", true);
		metaData = metaData.join("");

		return {
			thumbnails: thumbnails,
			browseId: browseId,
			metaData: metaData,
			playlistId:
				musicResponsiveListItemRenderer.menu?.menuRenderer?.items[0]
					?.menuNavigationItemRenderer?.navigationEndpoint
					?.watchPlaylistEndpoint?.playlistId,
			title: title,
			type: "playlist"
		};
	});
};

const parseSong = (contents, type): Song[] => {
	return contents.map((s, i) => {
		let explicit;
		const { musicResponsiveListItemRenderer: ctx } = s;

		if (ctx?.badges) explicit = true;

		const params =
			ctx.menu?.menuRenderer?.items[0]?.menuNavigationItemRenderer
				?.navigationEndpoint.watchEndpoint?.params;

		const {
			runs: metaInfo = []
		} = ctx.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text;

		let albumInfo;
		if (type == "song") {
			const albumArr: [] =
				ctx.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs;
			const album: {
				text;
				navigationEndpoint: { browseEndpoint: { browseId } };
			}[] = albumArr.slice(2, 3);

			albumInfo = {
				browseId: album[0]?.navigationEndpoint?.browseEndpoint?.browseId,
				title: album[0]?.text
			};
		} else {
			albumInfo = null;
		}

		const length = metaInfo[metaInfo.length - 1];
		let artists = [];
		if (type !== "artist") {
			const artistsArr = metaInfo.reverse();
			artists = artistsArr.slice(4);
			if (artists.length > 1) {
				for (let i = 0; i < artists.length; i++) {
					artists.splice(i + 1, 1);
				}
			}
			artists.reverse();
		} else {
			artists = ctx.navigationEndpoint.browseEndpoint.browseId;
		}
		let browseId;
		if (
			ctx.menu?.menuRenderer?.items[5]?.menuNavigationItemRenderer
				?.navigationEndpoint?.browseEndpoint
		) {
			const menu = ctx.menu?.menuRenderer.items;
			const { musicNavigationItemRenderer: items = [] } = menu;

			if (items.length > 4) {
				browseId = items[3].navigationEndpoint.browseEndpoint.browseId;
			} else {
				browseId = undefined;
			}
		} else {
			browseId =
				ctx.flexColumns[1].musicResponsiveListItemFlexColumnRenderer?.text
					?.runs[0]?.navigationEndpoint?.browseEndpoint?.browseId;
		}
		const artist: Artist = {
			browseId: browseId,
			artist: artists
		};

		return {
			...MusicResponsiveListItemRenderer(s),
			album: albumInfo,
			explicit,
			type: type,
			params: params,
			length: length,
			index: i++
		};
	});
};

function parseSearchResult(data, cont, filter?) {
	/*
        data = response data
        cont = continuation
				*/

	let continuation;

	let didYouMean;
	let ctx;

	if (cont) {
		ctx = [data];
	} else {
		/*  Error Handling
            Message Renderer is for when something goes horribly wrong,
            itemSectionRenderer is for when there's an error
        */
		if (data[0]?.messageRenderer) return [];
		if (data[0]?.itemSectionRenderer) {
			if (data[0]?.itemSectionRenderer?.contents[0].messageRenderer)
				return { error: "No Results Found" };
			didYouMean = correctedQuery(
				data[0]?.itemSectionRenderer?.contents[0].didYouMeanRenderer
			);

			ctx = [data[1]];
		} else {
			ctx = [data[0]];
		}
	}
	// Safety net
	if (ctx?.itemSectionRenderer) {
		return [];
	}

	let results: Song[] | PlaylistSearch[] = [];

	ctx.map((c) => {
		let contents = [];
		if (cont) {
			const { musicShelfContinuation } = c;
			contents.push(musicShelfContinuation);
		} else {
			const { musicShelfRenderer } = c;
			contents.push(musicShelfRenderer);
		}
		/* Search for if the request is for Playlists
           If not, then parse song request.
        */
		filter = decodeURIComponent(filter);
		const paramList = [
			"EgWKAQIoAWoKEAMQBBAKEAUQCQ==",
			"EgeKAQQoADgBagwQDhAKEAkQAxAEEAU=",
			"EgeKAQQoAEABagwQDhAKEAkQAxAEEAU="
		];
		const videoParams = "EgWKAQIQAWoKEAMQBBAKEAUQCQ==";
		const artistParams = "EgWKAQIgAWoKEAMQBBAKEAkQBQ==";
		if (filter == "") {
		} else if (
			!paramList.includes(filter) &&
			!artistParams.includes(filter) &&
			!videoParams.includes(filter)
		) {
			const { contents: ctx } = contents[0];
			continuation = continuationCheck(contents[0]);

			results = parseSong(ctx, "song");
			return { results, continuation };
		} else if (videoParams == filter) {
			continuation = continuationCheck(contents[0]);

			const { contents: ctx } = contents[0];
			results = parseSong(ctx, "video");

			return { results, continuation };
		} else if (
			filter == artistParams ||
			filter == "EgWKAQIgAWoKEAMQBBAKEAkQBQ%3D%3D"
		) {
			continuation = continuationCheck(contents[0]);

			const { contents: ctx } = contents[0];
			results = parseSong(ctx, "artist");
		} else {
			continuation = continuationCheck(contents[0]);
			contents = contents[0]?.contents;
			results = parsePlaylist(contents);
			return { results, continuation };
		}
	});

	if (didYouMean !== undefined) {
		return {
			contents: results,
			didYouMean: didYouMean,
			continuation: continuation
		};
	}
	return { contents: results, continuation: continuation };
}
function continuationCheck(contents) {
	if (!Object.prototype.hasOwnProperty.call(contents, "continuations")) {
		return;
	}
	return { ...contents?.continuations[0].nextContinuationData };
}
/* Return the data for if there is a corrected query */
function correctedQuery(ctx) {
	const correctTerm = ctx?.correctedQuery?.runs[0].text;
	const correctedEndpoint = ctx?.correctedQueryEndpoint?.searchEndpoint;

	return {
		term: correctTerm,
		endpoint: correctedEndpoint
	};
}
