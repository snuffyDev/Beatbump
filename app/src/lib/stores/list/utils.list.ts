import { queryParams } from "$lib/utils";

/** Take an array, turn it into chunks[][] of size `chunk` */
export function split(arr, chunk) {
	const temp = [];
	let i = 0;

	while (i < arr.length) {
		temp.push(arr.slice(i, chunk + i));
		i += chunk;
	}

	return temp;
}

export function filterList(list) {
	return [...list].filter(
		(
			(set) => (f) =>
				!set.has(f.videoId) && set.add(f.videoId)
		)(new Set()),
	);
}

export function fetchNext({
	params = undefined,
	videoId = undefined,
	itct = undefined,
	playlistId = undefined,
	ctoken = undefined,
	playlistSetVideoId = undefined,
	clickTracking = undefined,
	visitorData = "",
	index = 0,
	configType = undefined,
}: {
	itct?: string;
	params?: string;
	videoId?: string;
	playlistId?: string;
	ctoken?: string;
	index?: number;
	playlistSetVideoId?: string;
	clickTracking?: string;
	configType?: string;
	visitorData?: string;
}) {
	const obj = {
		itct,
		params,
		videoId,
		playlistId,
		ctoken,
		playlistSetVideoId,
		clickTracking,
		visitorData,
		index,
		configType,
	};
	const options = Object.fromEntries(
		Object.entries(obj)
			.filter(([_, v]) => v)
			.map(([key, value]) => [key, encodeURIComponent(value)]),
	);

	const _params = queryParams(options);
	// console.log(options, _params)
	return fetch("/api/next.json?" + _params, {
		headers: { accept: "application/json" },
	})
		.then((json) => json.json())
		.then((response) => {
			return response;
		})
		.catch((err) => console.error(err));
}
