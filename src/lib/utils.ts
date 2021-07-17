/* eslint-disable @typescript-eslint/no-explicit-any */
import { sort } from "./endpoints/playerUtils";
import { searchManager, updateTrack } from "./stores/stores";

// General data endpoint
export const getData = (
	songTitle: string,
	filter?: string,
	endpoint?: string,
	browseId?: any,
	pt?: undefined,
	ctoken?: undefined,
	index?: undefined
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
// Moods and Genres for trending page
export const moodsAndGenres = (browseId: any) => {
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

			contents.forEach((e: any[]) => {
				let section: any[];
				e = [e];
				section = [
					...e.map(({ gridRenderer }) => {
						let items = [];
						let header =
							gridRenderer.header.gridHeaderRenderer.title.runs[0].text;
						items = gridRenderer.items.map(
							(i: { musicNavigationButtonRenderer: any }) => {
								const { musicNavigationButtonRenderer } = i;
								let text =
									musicNavigationButtonRenderer.buttonText.runs[0].text;
								let color: number =
									musicNavigationButtonRenderer.solid.leftStripeColor;
								let colorCode = argbToRGB(color);
								function argbToRGB(color: number) {
									return ("00000000" + (color & 0xffffff).toString(16)).slice(
										-6
									);
								}

								return {
									text: text,
									colorCode: `#${colorCode}`,
									clickCommand: musicNavigationButtonRenderer.clickCommand,
								};
							}
						);
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
export function transform(arr: any[]) {
	if (!Array.isArray(arr)) {
		return (arr = [arr]);
	}
}
// Shuffle array possitions
export function shuffle(array: any[]) {
	array.sort(() => Math.random() - 0.5);
}
// TODO: use this -- formats seconds to MM:SS
function format(seconds: string | number) {
	if (isNaN(seconds)) return "...";

	const minutes = Math.floor(seconds / 60);
	seconds = Math.floor(seconds % 60);
	if (seconds < 10) seconds = "0" + seconds;

	return `${minutes}:${seconds}`;
}
// adds song to queue
export const addToQueue = async (videoId: any) => {
	let url = `/api/player.json${videoId ? `?videoId=${videoId}` : ""}`;
	const data = await fetch(url, { headers: { accept: "application/json" } })
		.then((json) => json.json())
		.catch((err) => console.log(err));
	let length = format(data.videoDetails.lengthSeconds);
	return length;
};
// get the next songs in autoplayback
export const getNext = async (
	index: string | number | boolean,
	params: string,
	videoId: any,
	playlistId: string | number | boolean,
	ctoken: string
) => {
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
	const url = `/api/player.json${videoId ? `?videoId=${videoId}` : ""}${
		playlistId ? `?list=${playlistId}` : ""
	}`;

	const res = await fetch(url).then((data) => data.json());
	const formats = sort(res);
	const parsedURL = formats[0].url;
	updateTrack.set(parsedURL);

	return parsedURL;
};
// parse array object input for child

export const pb = (input: any, query: string, justOne = false) => {
	const iterate = (x: string | any[], y: string | number) => {
		let r = [];

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
