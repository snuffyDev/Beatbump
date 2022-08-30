import { parseNextItem } from "$lib/parsers";
import type { Item } from "$lib/types";
import { addToQueue, getSrc, notify, type ResponseBody } from "$lib/utils";
import { Mutex } from "$lib/utils/mutex";
import { splice } from "$lib/utils/collections/array";
import { writable, get } from "svelte/store";
import { playerLoading, currentTitle, filterAutoPlay } from "../stores";
import { groupSession } from "../sessions";
import type { ISessionListService, ISessionListProvider } from "./types.list";
import { fetchNext, split, filterList } from "./utils.list";

const mutex = new Mutex();

const SessionListService: ISessionListService = _sessionListService();
function _sessionListService() {
	// default values for the store
	let mix: Item[] = [],
		continuation,
		clickTrackingParams,
		currentMixId,
		position = 0,
		currentMixType: "playlist" | "auto" | string = "",
		related = "";
	let visitorData = "";

	let internalIdx = 0;
	const { update, subscribe } = writable({
		mix,
		currentMixId: undefined,
		clickTrackingParams: undefined,
		continuation: undefined,
		position,
		currentMixType,
	});

	// Used when playlist session is initialized with more than 50 items
	let chunkedListOriginalLen: number;
	let chunkedPlaylistCurrentIdx = 0;
	const chunkedPlaylistMap = new Map<number, Item[]>();

	const _set = (value: ISessionListProvider) => {
		clickTrackingParams = value.clickTrackingParams ?? clickTrackingParams;
		continuation = value.continuation ?? continuation;
		currentMixId = value.currentMixId ?? currentMixId;
		mix = value.mix ? value.mix : mix;
		position = value.position ?? position;
		currentMixType = value.currentMixType ?? currentMixType;
		update((_) => (_ = { ..._, mix, position, currentMixId, continuation, clickTrackingParams, currentMixType }));
		return {
			clickTrackingParams,
			continuation,
			currentMixId,
			mix,
			position,
			currentMixType,
		};
	};
	const commitChanges = ({ clickTrackingParams, mix, continuation, currentMixId, position, currentMixType }) =>
		_set({ clickTrackingParams, mix, continuation, currentMixId, position, currentMixType });

	return {
		subscribe,
		set: _set,
		async lockedSet(_mix: ISessionListProvider) {
			return mutex.do(() => {
				return _set(_mix);
			});
		},
		async initAutoMixSession({
			clickTracking,
			keyId = 0,
			playlistId,
			playlistSetVideoId,
			videoId,
			config: { playerParams = "", type = "" } = {},
		}) {
			try {
				playerLoading.set(true);
				if (mix.length > 0) {
					mix = [];
					clickTrackingParams = null;
					internalIdx = 0;
				}
				currentMixType = "auto";
				const data = await fetchNext({
					params: playerParams ? playerParams : "",
					videoId,
					playlistId: playlistId ? playlistId : "",

					playlistSetVideoId: playlistSetVideoId ? playlistSetVideoId : "",
					clickTracking,
					configType: type,
				});
				if (!data || (!data["results"] && !data["results"]?.length)) throw new Error("No results!");
				visitorData = data["visitorData"];

				getSrc(videoId ?? data.results[keyId ?? 0].videoId, playlistId, playerParams);
				currentTitle.set((Array.isArray(data.results) && data.results[keyId ?? 0].title) ?? undefined);
				position = keyId ?? 0;
				playerLoading.set(false);
				continuation = data.continuation && data.continuation.length !== 0 && data.continuation;
				currentMixId = data.currentMixId;
				clickTrackingParams =
					data.clickTrackingParams && data.clickTrackingParams.length !== 0 && data.clickTrackingParams;
				mix.push(...data.results);

				commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });
				if (groupSession?.initialized && groupSession?.hasActiveSession) {
					groupSession.expAutoMix({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });
				}
			} catch (err) {
				playerLoading.set(false);
				console.error(err);
			}
		},
		async initPlaylistSession(args) {
			const { playlistId = "", index = 0 } = args;
			playerLoading.set(true);
			// console.log(args, { mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });
			if (mix.length && playlistId === currentMixId && chunkedPlaylistMap.size !== 0) {
				if (index < chunkedPlaylistMap.get(0).length) {
					console.log("index < chunked0", index, chunkedPlaylistMap);
					mix = Array.from(chunkedPlaylistMap.get(0));
				} else {
					const temp = [];
					chunkedPlaylistMap.forEach((value, key) => {
						if (index > value.length) {
							console.log("index < value.length", index, key, value);
							mix.push(...Array.from(chunkedPlaylistMap.get(key)));
						}
						if (index < value.length - 1 && index > chunkedPlaylistMap[key - 1].length) {
							mix = [...temp, Array.from(chunkedPlaylistMap.get(index))];
							console.log("index < value.length - 1", index, key, value, mix);
						}
					});
					if (groupSession?.initialized && groupSession?.hasActiveSession) {
						groupSession.expAutoMix({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });
					}
				}
				playerLoading.set(false);
				return await getSrc(mix[index]?.videoId, playlistId);
			}
			if (mix.length !== 0) mix = [];
			currentMixType = "playlist";
			try {
				console.log("playlist", currentMixType);
				const data = await fetch(`/api/get_queue.json?playlistId=${playlistId}`).then((data) => data.json());
				// console.log(data);
				mix = [...data];
				mix = [...mix.filter((item) => item.title)];
				console.log(args, data, mix);

				if (mix.length > 50) {
					console.log(mix);

					chunkedListOriginalLen = mix.length;
					for (const [key, value] of split(mix, 50).entries()) {
						// console.log(key, value)
						chunkedPlaylistMap.set(key, value);
						// console.log(chunkedPlaylistMap)
					}
					// mix = Array.from(chunkedPlaylistMap)
					if (index < chunkedPlaylistMap.get(0).length) {
						console.log("index < chunked0", index, chunkedPlaylistMap);
						mix = Array.from(chunkedPlaylistMap.get(0));
					} else {
						const temp = [];
						chunkedPlaylistMap.forEach((value, key) => {
							if (index > value.length) {
								console.log("index < value.length", index, key, value);
								temp.push(Array.from(chunkedPlaylistMap.get(key)));
							}
							if (index < value.length - 1 && index > chunkedPlaylistMap[key - 1].length) {
								mix = [...temp, Array.from(chunkedPlaylistMap.get(index))];
								console.log("index < value.length - 1", index, key, value, mix);
							}
						});
					}
				}

				playerLoading.set(false);
				commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });
				currentMixId = playlistId;
				if (groupSession?.initialized && groupSession?.hasActiveSession) {
					groupSession.expAutoMix({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });
				}
				return await getSrc(mix[index].videoId, playlistId);
			} catch (err) {
				console.error(err);

				playerLoading.set(false);
				notify("Error starting playback", "error");
			}
		},
		async setMix(mix: Item[], type?: "auto" | "playlist" | "local") {
			const guard = await mutex.do(async () => {
				return new Promise<ISessionListProvider>((resolve) => {
					resolve(
						commitChanges({
							mix,
							clickTrackingParams,
							currentMixId,
							continuation,
							position,
							currentMixType: type ?? currentMixType,
						}),
					);
				});
			});
			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.send("PUT", "state.set.mix", JSON.stringify(guard), groupSession.client);
			}
		},
		async getMoreLikeThis({ playlistId } = { playlistId: null }) {
			// if (autoMixPreview.length) {
			// 	mix.push(...autoMixPreview);
			// }
			if (!mix.length) {
				/** notify('Error: No track videoId was provided!', 'error'); **/ return;
			}
			playerLoading.set(true);
			console.log(playlistId, currentMixId);
			const response = await fetchNext({
				params: "wAEB8gECeAE%3D",
				playlistId: "RDAMPL" + (playlistId !== null ? playlistId : currentMixId),
			});
			const data = await response;
			// console.log(data)
			data.results.shift();
			mix.push(...data.results);
			continuation = data.continuation;
			commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });

			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestTrackQueue({
					mix,
					clickTrackingParams,
					currentMixId,
					continuation,
					position,
					currentMixType,
				});
			}
			playerLoading.set(false);
		},
		async getSessionContinuation({
			clickTrackingParams,
			ctoken,
			itct,
			key,
			playlistId,
			videoId,
		}): Promise<ResponseBody> {
			playerLoading.set(true);
			if (currentMixType === "playlist" && chunkedPlaylistMap.size && mix.length < chunkedListOriginalLen - 1) {
				console.log("playlist session", chunkedPlaylistMap, currentMixType);
				chunkedPlaylistCurrentIdx++;

				const src = await getSrc(mix[mix.length - 1].videoId);
				mix = [...mix, ...Array.from(chunkedPlaylistMap.get(chunkedPlaylistCurrentIdx))];
				mix = get(filterAutoPlay) ? [...filterList(mix)] : [...mix];
				playerLoading.set(false);
				commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });
				return await src.body;
			}
			console.log("other session");
			internalIdx += 24;

			const data = await fetchNext({
				visitorData,
				params: itct,
				playlistSetVideoId: mix[position]?.playlistSetVideoId,
				// index: internalIdx,
				videoId,
				playlistId,
				ctoken,
				clickTracking: clickTrackingParams,
			}).catch((err) => console.error(err));
			mix.push(...data.results);
			mix = get(filterAutoPlay) ? filterList(mix) : mix;
			visitorData = data["visitorData"];

			continuation = data.continuation;
			currentMixId = data.currentMixId;
			clickTrackingParams = data.clickTrackingParams;

			playerLoading.set(false);
			commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });

			// mixListIndex.set(key);
			const src = await getSrc(mix[key].videoId);
			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestContinuation({
					mix,
					clickTrackingParams,
					currentMixId,
					continuation,
					position,
					currentMixType,
				});
			}
			return src.body;
		},
		removeTrack(index: number) {
			mix.splice(index, 1);
			commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });
		},
		async setTrackWillPlayNext(item: Item, key) {
			if (!item) {
				notify("No track to remove was provided!", "error");
				return;
			}
			try {
				const itemToAdd = await addToQueue(item.videoId);

				// eslint-disable-next-line no-self-assign
				splice(mix, key + 1, 0, itemToAdd);

				// notify(`${item.title} will play next!`, "success");
				commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });
			} catch (err) {
				console.error(err);
				notify(`Error: ${err}`, "error");
			}
		},

		shuffleRandom(items = []) {
			mix = [...items.sort(() => Math.random() - 0.6)];
			commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });

			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestTrackQueue({
					mix,
					clickTrackingParams,
					currentMixId,
					continuation,
					position,
					currentMixType,
				});
			}
		},
		shuffle(index: number, preserveBeforeActive = true) {
			if (typeof index !== "number") return;
			if (!preserveBeforeActive) {
				mix = [...mix.sort(() => Math.random() - 0.5)];
			} else {
				mix = [...mix.slice(0, index), mix[index], ...mix.slice(index + 1).sort(() => Math.random() - 0.5)];
			}
			// console.log(mix)
			commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });

			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestTrackQueue({
					mix,
					clickTrackingParams,
					currentMixId,
					continuation,
					position,
					currentMixType,
				});
			}
		},
		toJSON(): string {
			return JSON.stringify({ clickTrackingParams, continuation, currentMixId, mix, position, currentMixType });
		},
		get mix() {
			return mix;
		},
		get position() {
			return position;
		},
		get clickTrackingParams() {
			return clickTrackingParams;
		},
		get continuation() {
			return continuation;
		},
		get currentMixId() {
			return currentMixId;
		},
		updateInternalIdx() {
			internalIdx += 24;
		},
		updatePosition(direction: "next" | "back" | number): number {
			console.log({ direction });
			if (typeof direction === "number") {
				position = direction;
				// < position ? direction : direction === position ? direction : direction === 0 ? 0 : position + 1;
				// console.log({ position, direction });
				commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });
				return position;
			}
			if (direction === "next") {
				position++;
			}
			if (direction === "back") {
				position--;
			}
			commitChanges({ mix, clickTrackingParams, currentMixId, continuation, position, currentMixType });

			return position;
		},
	};
}
export default SessionListService;
