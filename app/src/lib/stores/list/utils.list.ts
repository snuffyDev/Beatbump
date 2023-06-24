import { browser } from "$app/environment";
import type { Item } from "$lib/types";
import { queryParams } from "$lib/utils";
import type { NextEndpointResponse } from "../../../routes/(app)/api/v1/next.json/+server";
import { settings } from "../settings";

export const d = "";
let restricted = false;
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

export function filterList(list: Item[] = []) {
	return list.filter(
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
		restricted?: boolean;
		loggingContext?: string;
		index?: number;
		playlistSetVideoId?: string;
		clickTracking?: string;
		configType?: string;
		visitorData?: string;
	} = {},
): Promise<NextEndpointResponse | void> {
	const _params = queryParams({ ...obj, restricted });
	// console.log(options, _params)
	return fetch<NextEndpointResponse>("/api/v1/next.json?" + _params, {
		headers: { accept: "application/json" },
	})
		.then((json) => json.json())
		.catch((err) => {
			console.error(err);
		});
}

if (browser) {
	settings.subscribe((settings) => {
		restricted = settings.search.Restricted!;
	});
}
