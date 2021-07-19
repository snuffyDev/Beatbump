import { pb } from "$lib/utils";

export async function get({ query }) {
	const q = query.get("q") || "";
	const filter = query.get("filter") || "";
	const endpoint = query.get("endpoint") || "";
	const videoId = query.get("videoId") || "";
	const itct = query.get("itct") || "";
	const playlistId = query.get("playlistId") || "";
	const ctoken = query.get("ctoken") || "";
	const browseId = query.get("browseId") || "";
	// console.log(endpoint)
	const pageType = query.get("pt") || "";
	const index = query.get("index") || "";

	const gl = query.get("gl") || "";

	try {
		const response = await fetch(
			`https://music.youtube.com/youtubei/v1/search?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30${
				ctoken !== "" ? "" : `&sp=EgWKAQIIAWoKEAoQAxAEEAUQCQ%3D%3D`
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
					browseEndpointContextMusicConfig: {
						browseEndpointContextMusicConfig: {
							pageType: `${pageType}`,
						},
					},
					browseId: `${browseId}`,

					isAudioOnly: true,
					query: `${q}`,

					params: `${filter}`,
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
			return { status: response.status, body: response.statusText };
		}
		const data = await response.json();

		let contents;
		if (data.hasOwnProperty("continuationContents")) {
			contents = data.continuationContents;
			let results = await parseSearchResult(contents, true, filter);

			// console.log(`contents: `, results);
			return {
				status: 200,
				body: JSON.stringify(results),
			};
		} else {
			let {
				contents: {
					sectionListRenderer: {
						contents: [...rest],
					},
				},
			} = data;

			let results = await parseSearchResult(rest, false, filter);
			if (results?.error) {
				console.log(results?.error);
				return { error: results?.error };
			}

			return {
				status: 200,
				body: JSON.stringify(results),
			};
			return results;
		}
	} catch (error) {
		// output to netlify function log
		console.log(error);
		return {
			status: 500,
			// Could be a custom message or object i.e. JSON.stringify(err)
			body: JSON.stringify({ msg: error.message }),
		};
	}
}

function parseSearchResult(data, cont, filter?) {
	/*
        data = response data
        cont = continuation
    */

	let continuation;

	let didYouMean;
	let ctx;

	if (cont) {
		// if has continuation, context = data
		ctx = [data];
	} else {
		/*  Error Handling
            Message Renderer is for when something goes horribly wrong,
            itemSectionRenderer is for when there's an error
        */
		if (data[0].messageRenderer) return [];
		if (data[0].itemSectionRenderer) {
			if (data[0].itemSectionRenderer.contents[0].messageRenderer)
				return { error: "No Results Found" };
			didYouMean = correctedQuery(
				data[0].itemSectionRenderer.contents[0].didYouMeanRenderer
			);

			ctx = [data[1]];
		} else {
			ctx = [data[0]];
		}
	}
	// Safety net
	if (ctx.itemSectionRenderer) return [];

	let results = [];
	try {
		ctx.map(async (c) => {
			let contents = [];
			if (cont) {
				let { musicShelfContinuation } = c;
				contents = musicShelfContinuation;
			} else {
				let { musicShelfRenderer } = c;
				contents = musicShelfRenderer;
			}
			/* Search for if the request is for Playlists
           If not, then parse song request.
        */
			// filter = encodeURIComponent(filter);
			const paramList = [
				"EgWKAQIoAWoKEAMQBBAKEAUQCQ==",
				"EgeKAQQoADgBagwQDhAKEAkQAxAEEAU=",
				"EgeKAQQoAEABagwQDhAKEAkQAxAEEAU=",
			];

			if (!paramList.includes(filter)) {
				if (contents.hasOwnProperty("continuations")) {
					continuation = contents.continuations[0].nextContinuationData;
				}
				contents = contents.contents;
				results = parseSong(contents);
			} else {
				if (contents.hasOwnProperty("continuations")) {
					continuation = contents.continuations[0].nextContinuationData;
				}
				contents = contents.contents;
				results = parsePlaylist(contents);
			}
		});

		if (didYouMean !== undefined) {
			return {
				contents: results,
				didYouMean: didYouMean,
				continuation: false,
			};
		}
		return { contents: results, continuation: continuation };
	} catch (error) {
		return { status: 404 };
	}
}
/* Return the data for if there is a corrected query */
function correctedQuery(ctx) {
	let correctTerm = ctx.correctedQuery.runs[0].text;
	let correctedEndpoint = ctx.correctedQueryEndpoint.searchEndpoint;

	return {
		term: correctTerm,
		endpoint: correctedEndpoint,
	};
}

function parseSong(contents) {
	const type = "song";
	let results = [];

	contents.map(({ musicResponsiveListItemRenderer }) => {
		let d = musicResponsiveListItemRenderer;
		let explicit;
		if (d.hasOwnProperty("badges")) explicit = true;
		const flexColumns = pb(
			d,
			"musicResponsiveListItemFlexColumnRenderer",
			true
		);

		let thumbnails = d.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails;
		let title = pb(flexColumns[0], "runs:text", true);

		let browseId;
		if (
			d.menu.menuRenderer?.items[5]?.menuNavigationItemRenderer
				?.navigationEndpoint.browseEndpoint
		) {
			let menu = pb(d.menu.menuRenderer, "items", true);
			let items = pb(menu, "menuNavigationItemRenderer");
			// console.log(items);
			if (items.length > 4) {
				browseId = items[3].navigationEndpoint.browseEndpoint.browseId;
			} else {
				browseId = undefined;
			}
		} else {
			browseId =
				d.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text
					?.runs[0]?.navigationEndpoint?.browseEndpoint?.browseId;
		}
		let mixInfo =
			d.menu.menuRenderer.items[0].menuNavigationItemRenderer
				.navigationEndpoint;
		let { videoId = "", playlistId, params } = mixInfo.watchEndpoint;
		let metaInfo = pb(flexColumns[1], "runs:text", true);
		// console.log(metaInfo);
		let albumArr: any[] = flexColumns[1].text.runs;
		const album = albumArr.slice(2, 3);
		console.log(flexColumns[1]);
		console.log(album);
		const albumInfo = {
			browseId: album[0].navigationEndpoint?.browseEndpoint?.browseId,
			title: album[0].text,
		};

		// let album = {};
		let length = metaInfo[metaInfo.length - 1];

		let artistsArr = metaInfo.reverse();
		let artists = artistsArr.slice(4);
		if (artists.length > 1) {
			for (let i = 0; i < artists.length; i++) {
				artists.splice(i + 1, 1);
			}
		}
		artists.reverse();
		let artistInfo = {
			browseId: browseId,
			artists: artists,
		};
		// console.log(artists, artists)
		let result = {
			albumInfo,
			artistInfo: artistInfo,
			title: title,
			videoId: videoId,
			type: type,
			params: params,
			length: length,
			playlistId: playlistId,
			thumbnails: thumbnails,
			explicit: explicit,
			hash:
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15),
		};
		results.push(result);
	});
	return results;
}
// Parse the playlist results for search.
function parsePlaylist(contents) {
	let results = [];

	let type = "playlist";
	contents.map(({ musicResponsiveListItemRenderer }) => {
		const d = musicResponsiveListItemRenderer;
		let thumbnails = d.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails;
		let browseId = d.navigationEndpoint.browseEndpoint.browseId;
		let title =
			d.flexColumns[0].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
				.text;
		const flexColumns = pb(
			d,
			"musicResponsiveListItemFlexColumnRenderer",
			true
		);
		let metaData = pb(flexColumns[1], "runs:text", true);
		metaData = metaData.join("");

		const result: PlaylistSearch = {
			thumbnails: thumbnails,
			browseId: browseId,
			metaData: metaData,
			playlistId:
				d.menu.menuRenderer?.items[0]?.menuNavigationItemRenderer
					.navigationEndpoint.watchPlaylistEndpoint.playlistId,
			hash:
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15),
			title: title,
			type: type,
		};
		results.push(result);
	});
	return results;
}
