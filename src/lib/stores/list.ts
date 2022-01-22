/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { parseNextItem } from '$lib/parsers';
import type { Item } from '$lib/types';
import { getSrc, notify, queryParams } from '$lib/utils';
import { currentTitle } from '$stores/stores';
import { writable } from 'svelte/store';

import { addToQueue } from '../utils';
import { filterAutoPlay, key, playerLoading } from './stores';

let hasList = false;
let mix: Item[] = [];
let continuation: string;
let clickTrackingParams: string;

let splitList: any[];
let splitListIndex = 0;
let currentMixId: string;
let loading = false;
type ChunkedPlaylist = {
	chunks?: any[][];
	origLength?: number;
};
let Chunked: ChunkedPlaylist = {};

let filterSetting = false;

const list = writable({
	currentMixId,
	continuation,
	clickTrackingParams,
	mix
});
const fetchNext = ({
	params = undefined,
	videoId = undefined,
	itct = undefined,
	playlistId = undefined,
	ctoken = undefined,
	playlistSetVideoId = undefined,
	clickTracking = undefined,
	configType = undefined
}: {
	itct?: string;
	params?: string;
	videoId?: string;
	playlistId?: string;
	ctoken?: string;
	playlistSetVideoId?: string;
	clickTracking?: string;
	configType?: string;
}) => {
	let obj = {
		itct,
		params,
		videoId,
		playlistId,
		ctoken,
		playlistSetVideoId,
		clickTracking,
		configType
	};
	let options = Object.fromEntries(
		Object.entries(obj)
			.filter(([_, v]) => v != null)
			.map(([key, value]) => [key, encodeURIComponent(value)])
	);

	const _params = queryParams(options);
	// console.log(options, _params)
	return fetch('/api/next.json?' + _params, {
		headers: { accept: 'application/json' }
	})
		.then((json) => json.json())
		.then((response) => {
			return response;
		})
		.catch((err) => console.error(err));
};

const unsubscribe = filterAutoPlay.subscribe((setting) => {
	filterSetting = setting;
});
unsubscribe();

const filterList = (list) => {
	return (mix = [...list].filter(
		((set) => (f) => !set.has(f.videoId) && set.add(f.videoId))(new Set())
	));
};

function split(arr, chunk) {
	const temp = [];
	let i = 0;

	while (i < arr.length) {
		temp.push(arr.slice(i, chunk + i));
		i += chunk;
	}

	return temp;
}
export default {
	subscribe: list.subscribe,
	set: list.set,
	async initList({
		videoId,
		playlistId,
		keyId,
		playlistSetVideoId,
		clickTracking,
		config: { playerParams = '', type = '' } = {}
	}: {
		videoId?: string;
		playlistId?: string;
		keyId?: number;
		playlistSetVideoId?: string;
		clickTracking?: string;
		config?: { playerParams?: string; type?: string };
	}) {
		try {
			loading = true;
			playerLoading.set(loading);

			keyId = keyId ? keyId : 0;
			key.set(keyId);
			if (hasList == true) {
				mix = [];
				splitList = [];
				Chunked = {};
			}
			hasList = true;

			const response = await fetchNext({
				params: playerParams ? playerParams : '',
				videoId,
				playlistId: playlistId ? playlistId : '',

				playlistSetVideoId: playlistSetVideoId ? playlistSetVideoId : '',
				clickTracking,
				configType: type
			});
			const data = response;
			getSrc(videoId ?? data.results[0].videoId, playlistId, playerParams);
			currentTitle.set(data.results[0].title);

			loading = false;
			playerLoading.set(loading);

			continuation =
				data.continuation &&
				data.continuation.length !== 0 &&
				data.continuation;
			currentMixId = data.currentMixId;
			clickTrackingParams =
				data.clickTrackingParams &&
				data.clickTrackingParams.length !== 0 &&
				data.clickTrackingParams;

			mix = [...data.results];
			list.set({ currentMixId, clickTrackingParams, continuation, mix });
		} catch (err) {
			loading = false;
			playerLoading.set(loading);
			console.error(err);
		}
	},
	removeItem(index) {
		mix.splice(index, 1);
		mix = [...mix];
		list.set({ currentMixId, clickTrackingParams, continuation, mix });
	},
	async addNext(item, key) {
		if (!item) return;
		const length = await addToQueue(item.videoId);
		const nextItem = parseNextItem(item, length);
		mix.splice(key + 1, 0, nextItem);
		// console.log(mix, nextItem)
		notify('Added to queue!', 'success');
		list.set({ currentMixId, clickTrackingParams, continuation, mix });
	},
	async moreLikeThis(item) {
		if (!item) return;
		loading = true;
		playerLoading.set(loading);
		const response = await fetchNext({
			videoId: item.videoId,
			playlistId: item.autoMixList
		});
		const data = await response;
		// console.log(data)
		data.results.shift();
		mix = [...mix, ...data.results];
		continuation = data.continuation;
		list.set({ currentMixId, clickTrackingParams, continuation, mix });
		loading = false;
		playerLoading.set(loading);
	},
	async startPlaylist(playlistId: string, index = 0) {
		loading = true;
		playerLoading.set(loading);
		if (hasList) mix = [];
		hasList = true;
		key.set(index);
		try {
			const data = await fetch(
				`/api/getQueue.json?playlistId=${playlistId}`
			).then((data) => data.json());
			mix = [...data];
			mix = [...mix.filter((item) => item.title)];
			if (mix.length > 50) {
				Chunked = {
					chunks: [...split(mix, 50)],
					origLength: mix.length
				};

				splitList = Chunked.chunks;

				if (index < splitList[0].length) {
					mix = splitList[0];
				} else {
					let temp = [];
					splitList.forEach((chunk, i) => {
						if (index > chunk.length) {
							temp = [...temp, splitList[i]];
						}
						if (index < chunk.length - 1 && index > splitList[i--].length) {
							mix = [...temp, ...splitList[i]];
						}
					});
				}
			}
			loading = false;
			playerLoading.set(loading);

			list.set({ currentMixId, clickTrackingParams, continuation, mix });
			return await getSrc(mix[index].videoId);
		} catch (error) {
			console.error(`Error starting playlist!\nOriginal Error:\n${error}`);
			loading = false;
			playerLoading.set(loading);
			notify('Error starting playback', 'error');
		}
	},
	async getMore(itct, videoId, playlistId, ctoken, clickTrackingParams, key) {
		let loading = true;
		playerLoading.set(loading);

		if (splitList && mix.length < Chunked.origLength - 1) {
			splitListIndex++;

			const src = await getSrc(mix[mix.length - 1].videoId);
			mix = [...mix, ...splitList[splitListIndex]];
			filterSetting ? filterList([...mix]) : (mix = [...mix]);
			loading = false;
			playerLoading.set(loading);
			list.set({ currentMixId, clickTrackingParams, continuation, mix });
			return await src;
		} else {
			/*  Fetch the next batch of songs for autoplay
				- autoId: current position in mix
				- itct: params for /api/player.json (typically 'OAHyAQIIAQ%3D%3D')
				- videoId: current videoId
				- playlistId: current playlistId
				- ctoken: continuation token retrieved when mix is first initialized
				- playlistSetVideoId: set to '' since it is not a Playlist, it only is an autoplay
				= clickTrackingParams: YouTube sends these for certain requests to prevent people
				using their API for this purpose  */
			const data = await fetchNext({
				params: itct,

				videoId,
				playlistId,
				ctoken,
				clickTracking: clickTrackingParams
			});
			mix = filterSetting
				? [...mix, ...data.results].filter(
						((set) => (f) => !set.has(f.videoId) && set.add(f.videoId))(
							new Set()
						)
				  )
				: [...mix, ...data.results];
			// mix = [...mix, ...data.results]
			continuation = data.continuation;
			currentMixId = data.currentMixId;
			clickTrackingParams = data.clickTrackingParams;
			// mix.push(...mix)
			loading = false;
			playerLoading.set(loading);
			list.set({ currentMixId, clickTrackingParams, continuation, mix });
			return await getSrc(data.results[0].videoId);
		}
	}
};
