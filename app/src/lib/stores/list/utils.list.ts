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

export function fetchNext(
	obj: {
		itct?: string;
		params?: string;
		videoId?: string;
		playlistId?: string;
		ctoken?: string;
		loggingContext?: string;
		index?: number;
		playlistSetVideoId?: string;
		clickTracking?: string;
		configType?: string;
		visitorData?: string;
	} = {},
) {
	const _params = queryParams(obj);
	// console.log(options, _params)
	return fetch("/api/v1/next.json?" + _params, {
		headers: { accept: "application/json" },
	})
		.then((json) => json.json())
		.then((response) => {
			return response;
		})
		.catch((err) => console.error(err));
}
