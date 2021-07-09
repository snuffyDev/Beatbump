import { sort } from "./endpoints/playerUtils";
import { parseSearchResult } from "./parsers";
import { searchManager, updateTrack } from "./stores/stores";

// General data endpoint
export const getData = (
	songTitle,
	filter?,
	endpoint?,
	browseId?,
	pt?,
	ctoken?,
	index?
) => {
	return fetch(
		`/api/main.json?q=${songTitle}
			${filter ? `&params=${filter}` : ""}${endpoint ? `&endpoint=${endpoint}` : ""}
			${browseId ? `&browseId=${browseId}` : ""}
			${pt ? `&pt=${pt}` : ""}
			${ctoken ? `&ctoken=${ctoken}` : ""} 
			${index ? `&index=${index}` : ""}`,

		{
			headers: { accept: "application/json" },
		}
	)
		.then((data) => {
			return data.json();
		})
		.catch((err) => console.log(err));
};
// Parse search results
export const searchTracks = async (
	songTitle,
	filter,
	browseId?,
	ctoken?,
	i?
) => {
	let resHandler;
	let contents;
	if (ctoken) {
		return await fetch(
			`/api/search.json?q=${songTitle ? songTitle : ""}${
				filter ? `&params=${filter}` : ""
			}${ctoken ? `&ctoken=${ctoken}` : ""}${i ? `&index=${i}` : ""}`
		)
			.then((data) => data.json())
			.then((res) => {
				console.log(res.contents);
				searchManager.update((u) => [...u, ...res.contents]);
				return res;
			});
		let res = resHandler.json();

		contents = "continuationContents";
		return { ...res };
	} else {
		return await fetch(
			`/api/search.json?q=${songTitle ? songTitle : ""}${
				filter ? `&params=${filter}` : ""
			}`
		)
			.then((data) => data.json())
			.then((res) => {
				console.log(res.contents);
				searchManager.reset();
				searchManager.set([...res.contents]);
				return res;
			})
			.catch((err) => console.log(err));
	}

	// console.log(data);
};

// Get Trending page
export const getTrending = () => {
	let browseId = "FEmusic_explore";

	return getData("", "", "browse", browseId, "", "", "").then((data) => {
		let carouselItems = [];
		let resHeader = [];
		let results = [];

		let {
			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: {
									sectionListRenderer: { contents },
								},
							},
						},
					],
				},
			},
		} = data;
		contents.forEach((content) => {
			if (content.hasOwnProperty("musicCarouselShelfRenderer")) {
				carouselItems.push(content);
			}
		});
		carouselItems.map(({ musicCarouselShelfRenderer }) => {
			let ctx = musicCarouselShelfRenderer;
			let { header, contents } = ctx;
			header = transform(header);

			let head = [];

			resHeader = header.map(({ musicCarouselShelfBasicHeaderRenderer }) => {
				let h = musicCarouselShelfBasicHeaderRenderer;
				let title = pb(h, "title:runs:text", true);
				let browseId = pb(
					h,
					"moreContentButton:buttonRenderer:navigationEndpoint:browseEndpoint:browseId",
					true
				);
				return {
					title,
					browseId,
				};
			});

			contents.map((r) => {
				let type = Object.getOwnPropertyNames(r).toString();
				if (type == "musicNavigationButtonRenderer") {
					return;
				}
				interface result {
					title: string;
					artist: string;
					endpoint?: string;
					videoId: string;
					playlistId: string;
					params?: string;
					thumbnails: [];
					subtitle?: {}[];
				}
				let result: result;
				switch (type) {
					case "musicTwoRowItemRenderer":
						result = {
							title: r.musicTwoRowItemRenderer.title.runs[0].text,
							thumbnails:
								r.musicTwoRowItemRenderer.thumbnailRenderer
									.musicThumbnailRenderer.thumbnail.thumbnails,
							...r.musicTwoRowItemRenderer.navigationEndpoint.watchEndpoint,
							subtitle: [...r.musicTwoRowItemRenderer.subtitle.runs],
						};
						// console.log(result)

						break;
					case "musicResponsiveListItemRenderer":
						result = {
							subtitle: [
								...r.musicResponsiveListItemRenderer.flexColumns[1]
									.musicResponsiveListItemFlexColumnRenderer.text.runs,
							],
							title:
								r.musicResponsiveListItemRenderer.flexColumns[0]
									.musicResponsiveListItemFlexColumnRenderer.text.runs[0].text,
							...r.musicResponsiveListItemRenderer.flexColumns[0]
								.musicResponsiveListItemFlexColumnRenderer.text.runs[0]
								.navigationEndpoint.watchEndpoint,
							thumbnails:
								r.musicResponsiveListItemRenderer.thumbnail
									.musicThumbnailRenderer.thumbnail.thumbnails,
						};
						// console.log(result, 'musicResponse')
						break;
					case "musicNavigationButtonRenderer":
						// console.log('nav')
						break;
					default:
						break;
				}
				results.push(result);
			});
		});
		return {
			header: resHeader,
			results: carouselItems,
		};
	});
};
// TODO: Get playlist
export const getPlaylist = async (browseId) => {
	const res = await fetch(`/api/playlist.json?browseId=${browseId}`, {
		headers: { accept: "application/json" },
	});
	const data = await res.json();
	let {
		header,
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: {
								sectionListRenderer: {
									contents: [{ musicPlaylistShelfRenderer }],
								},
							},
						},
					},
				],
			},
		},
	} = await data;
	console.log(header, musicPlaylistShelfRenderer);
};
// Moods and Genres for trending page
export const moodsAndGenres = (browseId) => {
	return getData("", "", "browse", browseId).then(
		({
			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: {
									sectionListRenderer: { contents },
								},
							},
						},
					],
				},
			},
		}) => {
			let results = [];

			contents.forEach((e) => {
				let section;
				e = [e];
				section = [
					...e.map(({ gridRenderer }) => {
						let items = [];
						let header =
							gridRenderer.header.gridHeaderRenderer.title.runs[0].text;
						items = gridRenderer.items.map((i) => {
							const { musicNavigationButtonRenderer } = i;
							let text = musicNavigationButtonRenderer.buttonText.runs[0].text;
							let color: number =
								musicNavigationButtonRenderer.solid.leftStripeColor;
							let colorCode = argbToRGB(color);
							function argbToRGB(color) {
								return ("00000000" + (color & 0xffffff).toString(16)).slice(-6);
							}

							return {
								text: text,
								colorCode: `#${colorCode}`,
								clickCommand: musicNavigationButtonRenderer.clickCommand,
							};
						});
						return {
							header: header,
							items: [...items],
						};
					}),
				];
				results.push(section);
			});
			return results;
		}
	);
};
// Transform object to array
export function transform(arr) {
	if (!Array.isArray(arr)) {
		return (arr = [arr]);
	}
}
// Shuffle array possitions
export function shuffle(array) {
	array.sort(() => Math.random() - 0.5);
}
// TODO: use this -- formats seconds to MM:SS
function format(seconds) {
	if (isNaN(seconds)) return "...";

	const minutes = Math.floor(seconds / 60);
	seconds = Math.floor(seconds % 60);
	if (seconds < 10) seconds = "0" + seconds;

	return `${minutes}:${seconds}`;
}
// adds song to queue
export const addToQueue = async (videoId) => {
	let url = `/api/player.json${videoId ? `?videoId=${videoId}` : ""}`;
	const data = await fetch(url, { headers: { accept: "application/json" } })
		.then((json) => json.json())
		.catch((err) => console.log(err));
	let length = format(data.videoDetails.lengthSeconds);
	return length;
};
// get the next songs in autoplayback
export const getNext = async (index, params, videoId, playlistId, ctoken) => {
	return await fetch(
		"/api/next.json?playlistId=" +
			encodeURIComponent(playlistId) +
			`${videoId ? `&videoId=${videoId}` : ""}` +
			`${params ? `&params=${params}` : ""}` +
			`${ctoken ? `&ctoken=${ctoken}` : ""}` +
			"&index=" +
			encodeURIComponent(index),
		{
			headers: { accept: "application/json" },
		}
	)
		.then((json) => json.json())
		.catch((err) => console.log(err));
};
// Get source URLs
export const getSrc = async (videoId?: string, playlistId?: string) => {
	let url = `/api/player.json${videoId ? `?videoId=${videoId}` : ""}${
		playlistId ? `?list=${playlistId}` : ""
	}`;

	const res = await fetch(url).then((r) => r.json());
	const formats = await sort(res);

	const parsedURL = await formats[0].downloadURL();
	updateTrack.set(parsedURL);

	return parsedURL;
};
// parse array object input for child
export const pb = (input, query, justOne = false) => {
	const iterate = (x, y) => {
		var r = [];

		x.hasOwnProperty(y) && r.push(x[y]);
		if (justOne && x.hasOwnProperty(y)) {
			return r.shift();
		}

		if (x instanceof Array) {
			for (let i = 0; i < x.length; i++) {
				r = r.concat(iterate(x[i], y));
			}
		} else if (x instanceof Object) {
			const c = Object.keys(x);
			if (c.length > 0) {
				for (let i = 0; i < c.length; i++) {
					r = r.concat(iterate(x[c[i]], y));
				}
			}
		}
		return r.length == 1 ? r.shift() : r;
	};

	let d = query.split(":"),
		v = input;
	for (let i = 0; i < d.length; i++) {
		v = iterate(v, d[i]);
	}
	return v;
};
