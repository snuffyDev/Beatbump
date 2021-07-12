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
	console.log(formats);
	const parsedURL = formats[0].url;
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
