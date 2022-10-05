/* eslint-disable @typescript-eslint/no-explicit-any */
import { sort, type PlayerFormats } from "$lib/parsers/player";
import { updatePlayerSrc } from "$lib/player";
import { alertHandler, currentId, preferWebM } from "$lib/stores/stores";
import { settings, type UserSettings } from "$lib/stores/settings";
import { get } from "svelte/store";
import { findFirst, map } from "./collections";
import { browser } from "$app/environment";
import type { Song } from "$lib/types";

let userSettings: UserSettings;
if (browser && globalThis.self.name !== "IDB" && settings) {
	settings.subscribe((value) => {
		userSettings = value;
	});
}
// notifications
export const notify = (msg: string, type: "success" | "error", action?: string): void => {
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
	array = [...array.slice(0, index), array[index], ...array.slice(index + 1).sort(() => Math.random() - 0.5)];
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
export const addToQueue = async (videoId: string): Promise<Song> => {
	try {
		const url = `/api/v1/get_queue.json${videoId ? `?videoIds=${videoId}` : ""}`;
		const data = (await fetch(url, { headers: { accept: "application/json" } })
			.then((json) => json.json())
			.catch((err) => console.log(err))) as Song[];

		if (Array.isArray(data)) return data[0];
	} catch (err) {
		console.error(err);
		notify(err, "error");
	}
};

export type ResponseBody = { original_url: string; url: string };
// Get source URLs
export const getSrc = async (
	videoId?: string,
	playlistId?: string,
	params?: string,
	shouldAutoplay = true,
): Promise<{
	body: ResponseBody;
	error?: boolean;
}> => {
	try {
		const res = await fetch(
			`/api/v1/player.json?videoId=${videoId}${playlistId ? `&playlistId=${playlistId}` : ""}${
				params ? `&playerParams=${params}` : ""
			}`,
		).then((res) => res.json());
		if (res && !res?.streamingData && res?.playabilityStatus.status === "UNPLAYABLE") {
			return handleError();
		}
		const formats = sort({
			data: res,
			dash: false,
			proxyUrl: userSettings?.network["HLS Stream Proxy"] ?? "",
		});
		currentId.set(videoId);

		const src = setTrack(formats, shouldAutoplay);

		return src;
	} catch (err) {
		console.error(err);
		notify(err, "error");
	}
};

function setTrack(formats: PlayerFormats, shouldAutoplay) {
	let format;
	if (userSettings?.playback?.Stream === "HLS") {
		format = { original_url: formats?.hls, url: formats.hls };
	} else {
		format = formats.streams[0];
	}
	if (shouldAutoplay) updatePlayerSrc({ original_url: format.original_url, url: format.url });
	return {
		body: { original_url: format.original_url, url: format.url },
		error: false,
	};
}
function handleError() {
	console.log("error");

	notify("An error occurred while initiating playback, skipping...", "error", "getNextTrack");
	return {
		body: null,
		error: true,
	};
}

export const queryParams = (params: Record<any, any>): string => {
	const result = [];
	for (const key in params) {
		if (typeof params[key] !== "number" && !params[key]) continue;
		result.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
	}
	return result.join("&");
};
// export const queryParams = (params: Record<any, any>): string =>
// 	map(Object.keys(params), (k) => {
// 		if (params[k] === undefined) return;
// 		return k + "=" + params[k];
// 	}).join("&");
