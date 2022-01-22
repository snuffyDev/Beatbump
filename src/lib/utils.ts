/* eslint-disable @typescript-eslint/no-explicit-any */
import { browser } from '$app/env';
import { sort } from './endpoints/playerUtils';
import { alertHandler, currentId, updateTrack } from './stores/stores';

// notifications
export const notify = (
	msg: string,
	type: 'success' | 'error',
	action?: string
): void => {
	alertHandler.set({
		msg: msg,
		type: type,
		action
	});
};
// Shuffle array positions
export function shuffle(array: any[], index: number): any[] {
	array = [
		...array.slice(0, index),
		array[index],
		...array.slice(index + 1).sort(() => Math.random() - 0.5)
	];
	// array.sort(() => Math.random() - 0.5)
	return array;
}
function format(seconds) {
	if (isNaN(seconds)) return '...';

	const minutes = Math.floor(seconds / 60);
	seconds = Math.floor(seconds % 60);
	if (seconds < 10) seconds = '0' + seconds;

	return `${minutes}:${seconds}`;
}

// Fetches a song length for adding to queue
export const addToQueue = async (videoId: string): Promise<string> => {
	const url = `/api/player.json${videoId ? `?videoId=${videoId}` : ''}`;
	const data = await fetch(url, { headers: { accept: 'application/json' } })
		.then((json) => json.json())
		.catch((err) => console.log(err));
	const length = format(data.videoDetails.lengthSeconds);
	return length;
};

// Get source URLs
export const getSrc = async (
	videoId?: string,
	playlistId?: string,
	params?: string
): Promise<{ body: string; error?: boolean }> => {
	const webM = false;

	const res = await fetch(
		`/api/player.json?videoId=${videoId}${
			playlistId ? `&playlistId=${playlistId}` : ''
		}${params ? `&playerParams=${params}` : ''}`
	);
	const data = await res.json();
	const formats = sort(data, webM);
	currentId.set(videoId);
	// console.log(formats)
	const src = formats[0].url !== null ? setTrack(formats, webM) : handleError();

	return src;
};

function setTrack(formats = [], webM) {
	if (webM) {
		const item = formats.find((v) => v.mimeType === 'webm');
		const parsedURL = item !== undefined ? item.url : formats[0].url;
		updateTrack.update(() => ({
			originalUrl: formats[0].original_url,
			url: parsedURL
		}));
		return { body: parsedURL, error: false };
	}
	const parsedURL = formats[0].url;
	updateTrack.update(() => ({
		originalUrl: formats[0].original_url,
		url: parsedURL
	}));
	return { body: parsedURL, error: false };
}
function handleError() {
	console.log('error');

	notify(
		'An error occurred while initiating playback, skipping...',
		'error',
		'getNextTrack'
	);
	return {
		body: null,
		error: true
	};
}

export const queryParams = (params: Record<any, any>): string =>
	Object.keys(params)
		.map((k) => {
			if (params[k] == undefined) return;
			return k + '=' + params[k];
		})
		.join('&');
// parse array object input for child

export const pb = (input: string, query: string, justOne = false): any => {
	const iterate = (x: string | any, y: string | number) => {
		let r = [];

		Object.prototype.hasOwnProperty.call(x, y) && r.push(x[y]);
		if (justOne && Object.prototype.hasOwnProperty.call(x, y)) {
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

	let d = query.split(':'),
		v = input;
	for (let i = 0; i < d.length; i++) {
		v = iterate(v, d[i]);
	}
	return v;
};
