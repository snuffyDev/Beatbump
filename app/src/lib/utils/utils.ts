/* eslint-disable @typescript-eslint/no-explicit-any */
import { alertHandler } from "$lib/stores/stores";
import type { Song } from "$lib/types";
import { normalizeURIEncoding } from "./strings/strings";

// notifications
export const notify = (
	msg: string,
	type: "success" | "error",
	action?: string,
): void => {
	alertHandler.add({
		msg: msg,
		type: type,
		action,
	});
};

// Shuffle array positions
export function seededShuffle<T>(array: T[], _seed?: number): T[] {
	let rand: () => number;

	if (typeof _seed === "number") {
		let seed = _seed;
		// Seeded random number generator in JS. Modified from:
		// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
		rand = () => {
			const x = Math.sin(seed++) * 179426549; // throw away most significant digits and reduce any potential bias
			return x - Math.floor(x);
		};
	} else {
		rand = Math.random;
	}

	for (let i = array.length - 1; i > 0; i -= 1) {
		const j = Math.floor(rand() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}

export function shuffle(array: any[], index: number): any[] {
	array = [
		...array.slice(0, index),
		array[index],
		...array.slice(index + 1).sort(() => Math.random() - 0.5),
	];
	return array;
}

export function format(seconds: number) {
	if (isNaN(seconds)) return "...";

	const minutes = Math.floor(seconds / 60);
	seconds = Math.floor(seconds % 60);
	if (seconds < 10) seconds = ("0" + seconds) as unknown as number;

	return `${minutes}:${seconds}`;
}

// Fetches a song length for adding to queue
export const addToQueue = async ({
	videoId,
	playlistId,
}: {
	videoId?: string;
	playlistId?: string;
}): Promise<Song[]> => {
	try {
		const url = `/api/v1/get_queue.json${
			videoId
				? `?videoIds=${videoId}`
				: playlistId
				? "?playlistId=" + playlistId
				: ""
		}`;
		const data = (await fetch(url, { headers: { accept: "application/json" } })
			.then((json) => json.json())
			.catch((err) => console.log(err))) as Song[];

		if (Array.isArray(data)) return data;
	} catch (err) {
		console.error(err);
		notify(err, "error");
	}
};

export type ResponseBody = { original_url: string; url: string };

export const queryParams = (params: Record<any, any>): string => {
	const result = [];
	let key = "";
	for (key in params) {
		if (typeof params[key] !== "number" && !params[key]) continue;
		result.push(
			`${encodeURIComponent(key)}=${normalizeURIEncoding(params[key])}`,
		);
	}
	return result.join("&");
};
// export const queryParams = (params: Record<any, any>): string =>
// 	map(Object.keys(params), (k) => {
// 		if (params[k] === undefined) return;
// 		return k + "=" + params[k];
// 	}).join("&");
