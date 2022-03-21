import { parseNextItem } from '$lib/parsers';
import type { Item } from '$lib/types';
import { addToQueue, getSrc, notify, queryParams } from '$lib/utils';

import { writable, get, type Readable, type Writable, type Unsubscriber } from 'svelte/store'
import { currentTitle, filterAutoPlay, key, playerLoading } from './stores';

interface ISessionListProvider {
	currentMixId: string;
	continuation: string;
	clickTrackingParams: string;
	mix: Array<Item>
}

interface ISessionListService {
	subscribe: Writable<ISessionListProvider>['subscribe'],
set: Writable<ISessionListProvider>['set'],
	/** Initialize a new automix session */
	initAutoMixSession(args: {
		videoId?: string;
		playlistId?: string;
		keyId?: number;
		playlistSetVideoId?: string;
		clickTracking?: string;
		config?: { playerParams?: string; type?: string };
	}): Promise<void>;
	/** Initializes a new playlist session */
	initPlaylistSession(args: { playlistId: string, index?: number }): Promise<{ body: string; error?: boolean; }>

	/** Continues current automix session by fetching the next batch of songs */
	getSessionContinuation(args: { itct: string, videoId: string, playlistId: string, ctoken: string, clickTrackingParams: string, key: number })

	/**
	 * Fetches a set of similar songs and appends them to the current
	 * automix session
	 */
	getMoreLikeThis(args: { videoId: string; autoMixList?: string }): Promise<void>;

	/** Sets the item passed to the function to play next */
	setTrackWillPlayNext(item: Item, key: number): Promise<void>;

	removeTrack(index: number): void;

	shuffleRandom(items: Array<Item>): void;

	shuffle(index: number, preserveBeforeActive?: boolean): void;

}
type _T = { mix: Item[], currentMixId: string, clickTrackingParams: string; continuation: string }
const SessionListService: ISessionListService = _sessionListService();
function _sessionListService() {
	// default values for the store
	let mix = [], continuation, clickTrackingParams, currentMixId;

	const { set, subscribe, update } = writable({ mix, currentMixId: undefined, clickTrackingParams: undefined, continuation: undefined })


	// Used when playlist session is initialized with more than 50 items
	let chunkedListOriginalLen: number;
	let chunkedPlaylistCurrentIdx: number;
	let chunkedPlaylist
	const chunkedPlaylistMap = new Map()

	return {
		subscribe,
		set,
		async initAutoMixSession({ clickTracking, keyId = 0, playlistId, playlistSetVideoId, videoId, config: { playerParams = '', type = '' } = {} }) {
			try {
				playerLoading.set(true);
				key.set(keyId);
				if (get(SessionListService).mix.length > 0) {
					mix = [];

				}
				const response = await fetchNext({
					params: playerParams ? playerParams : '',
					videoId,
					playlistId: playlistId ? playlistId : '',

					playlistSetVideoId: playlistSetVideoId ? playlistSetVideoId : '',
					clickTracking,
					configType: type
				});

				const data = await response;
				getSrc(videoId ?? data.results[0].videoId, playlistId, playerParams)
				currentTitle.set(
					(Array.isArray(data.results) && data.results[0].title) ?? undefined
				);

				playerLoading.set(false);
				continuation = data.continuation && data.continuation.length !== 0 && data.continuation;
				currentMixId = data.currentMixId;
				clickTrackingParams = data.clickTrackingParams ** data.clickTrackingParams.length !== 0 && data.clickTrackingParams;

				mix = [...data.results];
				set({ currentMixId, clickTrackingParams, continuation, mix });
			} catch (err) {
				playerLoading.set(false);
				console.error(err);
			}

		},
		async initPlaylistSession(args) {
			const { playlistId = '', index = 0 } = args;
			playerLoading.set(true);
			if (mix.length !== 0) mix = [];
			key.set(index);
			try {
				const data = await fetch(
					`/api/getQueue.json?playlistId=${playlistId}`
				).then((data) => data.json());
				mix = [...data];
				mix = [...mix.filter((item) => item.title)];
				// console.log(args, data, mix, split(mix, 50) )

				if (mix.length > 50) {
					chunkedListOriginalLen = mix.length;
					for (const [key, value] of
						split(mix, 50).entries()
					) {
						// console.log(key, value)
						chunkedPlaylistMap.set(key, value)
						// console.log(chunkedPlaylistMap)
					}
					// mix = Array.from(chunkedPlaylistMap)
					if (index < chunkedPlaylistMap.get(0).length) {
						mix = Array.from(chunkedPlaylistMap.get(0));
					} else {
						let temp = []
						chunkedPlaylistMap.forEach((value, key) => {
							if (index > value.length) {
								temp = [...temp, Array.from(chunkedPlaylistMap.get(key))]
							}
							if (index < value.length - 1 && index > chunkedPlaylistMap[key - 1].length) {
								mix = [...temp, Array.from(chunkedPlaylistMap.get(index))];
							}
						}

						);
					}
				}


				playerLoading.set(false);
				set({ currentMixId, clickTrackingParams, continuation, mix });

				return await getSrc(mix[index].videoId, playlistId)
			} catch (err) {
				console.error(err)

				playerLoading.set(false);
				notify('Error starting playback', 'error');

			}
		},

		async getMoreLikeThis({ videoId, autoMixList }) {
			if (!videoId || !autoMixList) { notify('Error: No track videoId was provided!', 'error'); return; }
			playerLoading.set(true);
			const response = await fetchNext({
				videoId: videoId,
				playlistId: autoMixList
			});
			const data = await response;
			// console.log(data)
			data.results.shift();
			mix = [...mix, ...data.results];
			continuation = data.continuation;
			set({ currentMixId, clickTrackingParams, continuation, mix });
			playerLoading.set(false);
		},
		async getSessionContinuation({ clickTrackingParams, ctoken, itct, key, playlistId, videoId }) {
			playerLoading.set(true);

			if (chunkedPlaylistMap.size && mix.length < chunkedListOriginalLen - 1) {
				chunkedPlaylistCurrentIdx++;

				const src = await getSrc(mix[mix.length - 1].videoId);
				mix = [...mix, ...chunkedPlaylistMap[chunkedPlaylistCurrentIdx]];
				mix = get(filterAutoPlay) ? [...filterList(mix)] : [...mix];
				playerLoading.set(false);
				set({ currentMixId, clickTrackingParams, continuation, mix });
				return await src;
			}
			const data = await fetchNext({
				params: itct,

				videoId,
				playlistId,
				ctoken,
				clickTracking: clickTrackingParams
			});
			mix = get(filterAutoPlay) ? filterList([...mix, ...data.results]) : [...mix, ...data.results];

			continuation = data.continuation;
			currentMixId = data.currentMixId;
			clickTrackingParams = data.clickTrackingParams;

			playerLoading.set(false);
			set({ currentMixId, clickTrackingParams, continuation, mix });
			return await getSrc(data.results[0].videoId);

		},
		removeTrack(index) {
			mix.splice(index, 1);
			set({ mix, currentMixId, clickTrackingParams, continuation })
		},
		async setTrackWillPlayNext(item: Item, key) {
			if (!item) { notify('No track to remove was provided!', 'error'); return }
			try {
				const lengthOfCurrentItem = await addToQueue(item.videoId);
				const nextItem = parseNextItem(item, lengthOfCurrentItem);
				mix.splice(key + 1, 0, nextItem);
				notify(`${item.title} will play next!`, 'success');
				set({ currentMixId, clickTrackingParams, continuation, mix });

			} catch (err) {
				console.error(err);
				notify(`Error: ${err}`, 'error');
			}
		},

		shuffleRandom(items = []) {
			mix = [...items.sort(() => Math.random() - 0.6)]
			set({ clickTrackingParams, continuation, currentMixId, mix });

		},
		shuffle(index: number, preserveBeforeActive = true) {
			if (typeof index !== 'number') return;
			if (!preserveBeforeActive) {
				mix = [...mix.sort(() => Math.random() - 0.5)]
			}
			else {
				mix = [...mix.slice(0, index), mix[index], ...mix.slice(index + 1).sort(() => Math.random() - 0.5)]
			}
			// console.log(mix)
			set({ clickTrackingParams, continuation, currentMixId, mix });
		}
	}
}


// SessionListService Utils

/** Take an array, turn it into chunks[][] of size `chunk` */
function split(arr, chunk) {
	const temp = [];
	let i = 0;

	while (i < arr.length) {
		temp.push(arr.slice(i, chunk + i));
		i += chunk;
	}

	return temp;
}

function filterList(list) {
	return ([...list].filter(
		((set) => (f) => !set.has(f.videoId) && set.add(f.videoId))(new Set())
	));
};

function fetchNext({
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
}) {
	const obj = {
		itct,
		params,
		videoId,
		playlistId,
		ctoken,
		playlistSetVideoId,
		clickTracking,
		configType
	};
	const options = Object.fromEntries(
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

export default SessionListService;