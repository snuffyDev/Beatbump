/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIParams } from "$lib/constants";
// eslint-disable-next-line import/no-cycle
import { getSrc, updateGroupPosition, updatePlayerSrc } from "$lib/player";
import type {
	Artist,
	ArtistInfo,
	Item,
	Song,
	Subtitle,
	Thumbnail,
} from "$lib/types";
import type { VssLoggingContext } from "$lib/types/innertube/internals";
import {
	Logger,
	WritableStore,
	addToQueue,
	notify,
	seededShuffle,
	type ResponseBody,
} from "$lib/utils";
import { splice } from "$lib/utils/collections/array";
import { objectKeys } from "$lib/utils/collections/objects";
import { Mutex } from "$lib/utils/sync";
import { tick } from "svelte";
// eslint-disable-next-line import/no-cycle
import { syncTabs } from "$lib/tabSync";
import { derived } from "svelte/store";
import type { RelatedEndpointResponse } from "../../../routes/(app)/api/v1/related.json/+server";
import { groupSession } from "../sessions";
import { filterAutoPlay, playerLoading } from "../stores";
import type { ISessionListProvider } from "./types.list";
import { fetchNext, filterList } from "./utils.list";

const mutex = new Mutex();

interface AutoMixArgs {
	clickTracking?: string;
	config?: { playerParams?: string; type?: string };
	keyId?: number;
	loggingContext?: { vssLoggingContext: { serializedContextData: string } };
	playlistId?: string;
	playlistSetVideoId?: string;
	videoId?: string;
	visitorData?: string;
}

function togglePlayerLoad() {
	playerLoading.set(true);
	return () => playerLoading.set(false);
}

type MixListAppendOp = [op: "append" | "set", data: Item[]];

const VALID_KEYS = [
	"clickTrackingParams",
	"continuation",
	"currentMixId",
	"currentMixType",
	"visitorData",
	"related",
	"mix",
	"position",
] as const;

export class ListService {
	private isLocal = false;
	private nextTrackUrl: string | null = null;
	private restricted = false;

	_$: WritableStore<ISessionListProvider> =
		new WritableStore<ISessionListProvider>({
			clickTrackingParams: "",
			continuation: "",
			currentMixId: "",
			currentMixType: null,
			visitorData: "",
			mix: [],
			position: 0,
			related: null,
		});

	constructor() {
		this._$.set(this._state);
	}

	public get $() {
		return this._$;
	}

	public get clickTrackingParams(): string | null {
		return this._$.value.clickTrackingParams;
	}

	public get continuation() {
		return this._$.value.continuation;
	}

	public get currentMixId(): string {
		return this._$.value.currentMixId;
	}

	public get mix() {
		return this._$.value.mix.slice();
	}

	public get position() {
		return this._$.value.position;
	}

	public get set() {
		return this._$.set;
	}

	public get subscribe() {
		return this._$.subscribe;
	}

	public get isLocalPlaylist() {
		return this.isLocal;
	}

	public get value() {
		return this._state;
	}

	private get _state() {
		return this._$.value;
	}

	private clearNextTrack() {
		this.nextTrackUrl = null;
	}

	private findIndexForTrack({
		originalVideoId,
		originalIndex,
		originalPlaylistId,
		mix,
	}: {
		originalIndex?: number;
		originalVideoId?: string;
		originalPlaylistId?: string;
		mix: Item[];
	}): number {
		return mix.findIndex((item, index) => {
			// find the index of the item that matches the videoId and optionally the playlist id OR the index property (or array index) that matches the keyId OR  matches both previous condiitions
			const isSameVideoAndPlaylist =
				item.videoId === originalVideoId &&
				item.playlistId === originalPlaylistId;
			const isSameIndex = index === originalIndex;

			if (isSameVideoAndPlaylist || isSameIndex) {
				return true;
			}

			if (isSameVideoAndPlaylist && isSameIndex) {
				return true;
			}

			return false;
		});
	}

	public async getMoreLikeThis({
		playlistId,
	}: {
		playlistId?: string;
	}): Promise<void> {
		const toggle = togglePlayerLoad();
		await tick();

		try {
			const response = await fetchNext({
				params: APIParams.finite,
				playlistId:
					playlistId != null && !!playlistId
						? playlistId?.startsWith("RDAMPL")
							? playlistId
							: "RDAMPL" + playlistId
						: this._$.value.currentMixId,
			});

			if (!response || !response.results.length) {
				throw new Error("Invalid response returned by `next` endpoint");
			}

			if (this._$.value.mix.length) {
				response.results.shift();
			}

			const state = await this.#sanitizeAndUpdate("APPLY", {
				...response,
				mix: ["append", response.results],
			});

			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestTrackQueue(state);
			}

			await getSrc(
				this._$.value.mix[state.position + 1].videoId,
				this._$.value.mix[state.position + 1].playlistId,
				undefined,
				false,
			);
		} catch (err) {
			Logger.err(err);
			notify(err as string, "error");
		} finally {
			toggle();
		}
	}

	public async getSessionContinuation(
		{
			playlistSetVideoId,
			clickTrackingParams,
			ctoken,
			key,
			playlistId,
			playerParams,

			videoId,
			loggingContext,
		}: {
			itct?: string;
			videoId: string;
			playlistId: string | undefined;
			ctoken: string;
			clickTrackingParams: string;
			loggingContext?: { vssLoggingContext: { serializedContextData: string } };
			key: number;
			playerParams?: string;
			playlistSetVideoId?: string;
		},
		autoPlay = true,
	): Promise<ResponseBody | void> {
		const toggle = togglePlayerLoad();
		await tick();

		if (key < this._$.value.mix.length - 1) {
			const nextIndex = await this.updatePosition(key);
			if (groupSession.initialized && groupSession.hasActiveSession) {
				updateGroupPosition("->", nextIndex);
			}
			const nextTrack = this._$.value.mix[nextIndex];
			await getSrc(nextTrack?.videoId, nextTrack?.playlistId, undefined, true);
			// await this.prefetchTrackAtIndex(nextIndex + 1);
			syncTabs.updatePosition(nextIndex);
			toggle();
			return;
		}

		try {
			if (!clickTrackingParams && !ctoken) {
				playlistId = `RDAMPL${
					playlistId ? playlistId : this.currentMixId ?? ""
				}`;
			}

			const params: Parameters<typeof fetchNext>["0"] = {
				...(this._$.value?.visitorData && {
					visitorData: this._$.value?.visitorData,
				}),
				params: playerParams ?? encodeURIComponent("OAHyAQIIAQ=="),
				playlistSetVideoId:
					playlistSetVideoId ?? this._$.value.mix[key]?.playlistSetVideoId,
				loggingContext:
					loggingContext?.vssLoggingContext?.serializedContextData,
				videoId,
				playlistId,
				index: key ?? undefined,
				...(ctoken && { continuation: ctoken }),
				clickTracking: clickTrackingParams,
			};
			const data = await fetchNext(params);

			if (!data || !Array.isArray(data.results)) {
				await this.getMoreLikeThis({ playlistId });
				return;
			}

			const results = data.results;

			const state = await this.#sanitizeAndUpdate("APPLY", {
				...data,
				mix: ["append", results],
			});
			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestContinuation(state);
			}

			syncTabs.updateSessionList(state);
			if (autoPlay) {
				const src = await getSrc(state.mix[key].videoId);

				return src?.body ?? ({} as ResponseBody);
			}
		} catch (err) {
			Logger.err(err);
			if (playlistId?.startsWith("RDAMPL")) return;
			return this.getSessionContinuation(
				{
					clickTrackingParams,
					ctoken,
					key,
					videoId,
					playlistId: `RDAMPL${playlistId}`,
					loggingContext,
					playerParams,
					playlistSetVideoId,
				},
				autoPlay,
			);
		} finally {
			toggle();
		}
	}

	public async initAutoMixSession(args: AutoMixArgs) {
		const toggle = togglePlayerLoad();
		this.isLocal = false;
		try {
			const {
				loggingContext,
				keyId,
				clickTracking,
				config,
				playlistId,
				visitorData,
				playlistSetVideoId,
				videoId,
			} = args;
			// Wait for the DOM to update
			await tick();
			console.log(args);
			let willRevert = false;
			this.clearNextTrack();
			// Reset the current mix state
			if (
				this._$.value.mix.length &&
				this._$.value.currentMixId !== playlistId
			) {
				willRevert = true;
				this.#revertState();
			}

			if (
				this._$.value.currentMixId !== undefined &&
				(this._$.value.currentMixId !== playlistId ||
					`RDAMPL${this._$.value.currentMixId}` !== playlistId)
			) {
				this._$.value.currentMixType = "auto";

				const data = await fetchNext({
					params: config?.playerParams ? config?.playerParams : undefined,
					videoId,
					...(visitorData && { visitorData }),
					playlistId: playlistId ? playlistId : `RDAMVM${videoId}`,
					loggingContext: loggingContext
						? loggingContext.vssLoggingContext?.serializedContextData
						: undefined,
					playlistSetVideoId: playlistSetVideoId
						? playlistSetVideoId
						: undefined,
					clickTracking,
					configType: config?.type || undefined,
				});

				if (!data || !Array.isArray(data.results)) {
					throw new Error(
						"Invalid response was returned from `next` endpoint.",
					);
				}

				const playbackIndex =
					keyId === 0
						? 0
						: this.findIndexForTrack({
								originalVideoId: videoId,
								originalPlaylistId: playlistId,
								mix: data.results,
								originalIndex: keyId,
						  }) ||
						  keyId ||
						  0;
				const item = data.results[playbackIndex ?? 0];

				const state = await this.#sanitizeAndUpdate(
					willRevert ? "SET" : "APPLY",
					{
						...this._state,
						...data,
						position: Math.max(0, playbackIndex),
						mix: ["append", data.results],
					},
				);
				await tick();
				await getSrc(
					videoId
						? videoId
						: item?.videoId
						? item.videoId
						: data.results[0]
						? data.results[0]?.videoId
						: undefined,
					item?.playlistId,
					config?.playerParams,
				);
				syncTabs.updateSessionList(state);

				if (groupSession?.initialized && groupSession?.hasActiveSession) {
					groupSession.expAutoMix(state);
				}
			} else {
				return await this.getSessionContinuation({
					...args,
					clickTrackingParams: args.clickTracking!,
					key: args.keyId!,
					ctoken: "",
				} as never);
			}
		} catch (err) {
			Logger.err(err);
		} finally {
			toggle();
		}
	}

	public async initPlaylistSession(args: {
		playlistId: string;
		index: number;
		clickTrackingParams?: string;
		params?: string;
		videoId?: string;
		loggingContext?: string;
		visitorData?: string;
		playlistSetVideoId?: string;
	}): Promise<{ body: ResponseBody; error?: boolean } | undefined> {
		const toggle = togglePlayerLoad();
		this.isLocal = false;

		try {
			const {
				playlistId = "",
				index = 0,
				clickTrackingParams = "",
				params = "",
				videoId = "",
				loggingContext,
				playlistSetVideoId = "",
				visitorData = "",
			} = args;

			await tick();

			if (this._$.value.currentMixId !== playlistId) {
				this.clearNextTrack();

				this.#revertState();
			}
			const data = await fetchNext({
				params,
				playlistId: playlistId.startsWith("VL")
					? playlistId.slice(2)
					: playlistId,
				loggingContext,
				clickTracking: clickTrackingParams,
				visitorData,
				playlistSetVideoId,
				videoId,
			});

			if (!data || !Array.isArray(data.results)) {
				throw new Error("Invalid response returned from `next` endpoint.");
			}

			if (!data.results.length) {
				Logger.dev("NO RESULTS LENGTH!!!");
				this.getMoreLikeThis({ playlistId });
			} else {
				const state = await this.#sanitizeAndUpdate("APPLY", {
					...data,
					mix: ["set", data.results],
					currentMixType: "playlist",
				});

				const playbackIndex =
					index === 0
						? 0
						: this.findIndexForTrack({
								originalVideoId: videoId,
								originalPlaylistId: playlistId,
								mix: state.mix,
								originalIndex: index,
						  }) ||
						  index ||
						  0;
				await this.updatePosition(playbackIndex);
				Logger.mark("wow");
				await tick();
				syncTabs.updateSessionList(state);
				if (groupSession?.initialized && groupSession?.hasActiveSession) {
					groupSession.expAutoMix(state);
				}

				return (await getSrc(
					state.mix[playbackIndex]?.videoId,
					playlistId,
					undefined,
					true,
				)) as any;
			}
		} catch (err) {
			Logger.err(err);
			notify("Error starting playlist playback.", "error");
		} finally {
			toggle();
		}
	}

	public lockedSet(_mix: ISessionListProvider): Promise<ISessionListProvider> {
		return mutex.do(async () => {
			this._$.set(_mix);
			return Promise.resolve(this._state);
		});
	}

	public async next(nextSrc: string | undefined = undefined, update = false) {
		const currentPosition = this._$.value.position;
		const nextTrack = this._$.value.mix[this._$.value.position + 1];

		if (!nextTrack) {
			const currentTrack = this._$.value.mix[this._$.value.position];
			Logger.dev("No next track", { nextSrc, _$: this._$ });
			await this.getSessionContinuation(
				{
					videoId: currentTrack?.videoId,
					key: this._$.value.position + 1,
					playlistId: currentTrack?.playlistId,
					loggingContext: currentTrack?.loggingContext,
					playerParams: currentTrack?.playerParams,
					playlistSetVideoId:
						APIParams.lt100 === currentTrack?.playerParams
							? undefined
							: currentTrack?.playlistSetVideoId,

					ctoken: this.continuation,
					clickTrackingParams: this.clickTrackingParams!,
				},
				true,
			)
				.then(() => {
					syncTabs.updatePosition(currentPosition + 1);
					return this.updatePosition("next");
				})
				.then((data) => {
					return data;
				});

			return;
		} else {
			if (nextSrc || this.nextTrackUrl) {
				Logger.dev("next track Cond A", {
					nextSrc,
					_$: this._$,
					nextTrack,
					thisNextTrackURL: this.nextTrackUrl,
				});
				const state = await this.updatePosition("next");
				updatePlayerSrc({
					original_url: nextSrc ? nextSrc : (this.nextTrackUrl as string),
					url: nextSrc ? (nextSrc as string) : (this.nextTrackUrl as string),
				});
				this.nextTrackUrl = null;
				// await this.prefetchTrackAtIndex(state + 1);
			} else {
				let position = await this.updatePosition("next");
				if (position >= this._$.value.mix.length) {
					position = this._$.value.position;
				}
				const currentTrack = this.#currentTrack(position);
				const data = await fetchNext({
					...(this._$.value?.visitorData && {
						visitorData: this._$.value.visitorData,
					}),
					params: "gAQBiAQB",
					playlistSetVideoId: currentTrack?.playlistSetVideoId,
					index: position,
					loggingContext:
						currentTrack?.loggingContext?.vssLoggingContext
							?.serializedContextData,
					videoId: currentTrack?.videoId,
					playlistId: this.currentMixId,
					...(this?.clickTrackingParams && {
						clickTracking: this.clickTrackingParams,
					}),
				});
				if (!data) return console.log("no data on next", { data });

				const state = await this.#sanitizeAndUpdate("APPLY", data);
				await getSrc(
					state.mix[currentPosition + 1].videoId,
					state.mix[currentPosition + 1].playlistId,
					undefined,
					true,
				);
				// await this.prefetchTrackAtIndex(state.position + 1);
			}
			const position = this._$.value.position;
			if (update) {
				updateGroupPosition("->", position);
			}

			syncTabs.updatePosition(position);
		}
	}

	public async prefetchNextTrack() {
		return;
	}

	public async prefetchTrackAtIndex(index: number) {
		return;
	}

	public async previous() {
		let position = await this.updatePosition("back");
		if (position >= this._$.value.mix.length) {
			position = this._$.value.position;
		}
		const data = await fetchNext({
			...(this._$.value?.visitorData && {
				visitorData: this._$.value?.visitorData,
			}),
			params: "OAHyAQIIAQ==",
			playlistSetVideoId: this._$.value.mix[this.position]?.playlistSetVideoId,
			index: this._$.value.position,
			loggingContext: this.#currentTrack(this.position)?.loggingContext
				?.vssLoggingContext?.serializedContextData,
			videoId: this.#currentTrack(this.position)?.videoId,
			playlistId: this.currentMixId,
			...(this.continuation && { continuation: this?.continuation }),
			...(this.clickTrackingParams && {
				clickTracking: this.clickTrackingParams,
			}),
		});
		if (!data) return;
		if (data.related) this._$.value.related = data.related;
		const state = await this.#sanitizeAndUpdate("APPLY", data);
		await getSrc(
			state.mix[position].videoId,
			state.mix[position].playlistId,
			undefined,
			true,
		);

		syncTabs.updatePosition(position);
	}

	public removeTrack(index: number) {
		this._$.value.mix.splice(index, 1);
		this._$.update((u) => ({
			...u,
			mix: [...u.mix.slice(0, index), ...u.mix.slice(index + 1)],
		}));
		syncTabs.updateSessionList(this._$.value);
	}

	public async setMix(mix: Item[], type?: "auto" | "playlist" | "local") {
		const guard = await mutex.do(async () => {
			await tick();
			return new Promise<ISessionListProvider>((resolve) => {
				this.#sanitizeAndUpdate("SET", {
					...this._state,
					mix: ["set", mix],
					currentMixType: type,
				}),
					resolve(this._state);
			});
		});
		this.isLocal = type === "local";
		if (groupSession?.initialized && groupSession?.hasActiveSession) {
			groupSession.send(
				"PUT",
				"state.set.mix",
				JSON.stringify(guard),
				groupSession.client,
			);
		}
		syncTabs.updateSessionList(guard);
	}

	public async setTrackWillPlayNext(item: Item, key: number) {
		await tick();
		if (!item) {
			notify("No track to remove was provided!", "error");
			return;
		}
		try {
			const itemToAdd = await addToQueue(item);
			const oldLength = this._$.value.mix.length;

			splice(this._$.value.mix, key + 1, 0, ...itemToAdd);

			const state = await this.#sanitizeAndUpdate("APPLY", {
				mix: ["set", this._$.value.mix] satisfies MixListAppendOp,
			});

			if (!oldLength) {
				await getSrc(
					this._$.value.mix[0].videoId,
					this._$.value.mix[0].playlistId,
					undefined,
					true,
				);
				await this.prefetchTrackAtIndex(state.position + 1);
			}
		} catch (err) {
			console.error(err);
			notify(`Error: ${err}`, "error");
		}
	}

	public shuffle(index: number, preserveBeforeActive = true) {
		if (typeof index !== "number") return;
		if (!preserveBeforeActive) {
			this._$.value.mix = seededShuffle(
				this._$.value.mix.slice(),
				crypto
					.getRandomValues(new Uint8Array(8))
					.reduce((prev, cur) => (prev += cur), 0),
			);
		} else {
			this._$.value.mix = [
				...this._$.value.mix.slice().slice(0, index),
				this._$.value.mix[index],
				...seededShuffle(
					this._$.value.mix.slice().slice(index + 1),
					crypto
						.getRandomValues(new Uint8Array(8))
						.reduce((prev, cur) => (prev += cur), 0),
				),
			];
		}
		// console.log(mix)
		this.#sanitizeAndUpdate("APPLY", { mix: this._$.value.mix }).then(
			(state) => {
				if (groupSession?.initialized && groupSession?.hasActiveSession) {
					groupSession.updateGuestTrackQueue(state);
				}
				syncTabs.updateSessionList(state);
			},
		);
	}

	public shuffleRandom(
		items: ({
			subtitle: { text?: string; pageType?: string; browseId?: string }[] &
				Subtitle[];
			artistInfo: {
				pageType?: string;
				artist?: Artist[];
				browseId?: string;
			} & ArtistInfo;
			explicit: boolean;
			title: string;
			aspectRatio: string;
			playerParams?: string;
			playlistSetVideoId?: string;
			clickTrackingParams?: string;
			endpoint?: { browseId: string; pageType: string };
			musicVideoType?: string;
			params?: string;
			index?: number;
			length?: string & { text?: string };
			videoId: string;
			playlistId: string;
			loggingContext?: { vssLoggingContext: VssLoggingContext };
			thumbnails: Thumbnail[];
			type?: string;
		} & Song)[],
	): void {
		this._$.value.mix = seededShuffle(
			items,
			crypto
				.getRandomValues(new Uint8Array(8))
				.reduce((prev, cur) => (prev += cur), 0),
		);

		this.#sanitizeAndUpdate("SET", { mix: this._$.value.mix }).then((state) => {
			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestTrackQueue(state);
			}
		});
	}

	public toJSON(): string {
		return JSON.stringify(this._state);
	}

	/** Update the track position based on a keyword or number */
	public async updatePosition(
		direction: "next" | "back" | number,
	): Promise<number> {
		if (typeof direction === "number") {
			const state = await this.#sanitizeAndUpdate("APPLY", {
				position: direction,
			});

			return state.position;
		}
		if (direction === "next") {
			const state = await this.#sanitizeAndUpdate("APPLY", {
				position: this._$.value.position + 1,
			});

			return state.position;
		}
		if (direction === "back") {
			const state = await this.#sanitizeAndUpdate("APPLY", {
				position: this._$.value.position - 1,
			});
			return state.position;
		}

		return this._$.value.position;
	}

	#currentTrack(position = 0) {
		return this._$.value.mix[position];
	}

	#revertState(): ISessionListProvider {
		this._$.set({
			clickTrackingParams: "",
			continuation: "",
			currentMixId: "",
			currentMixType: null,
			mix: [],
			visitorData: "",
			position: 0,
			related: null,
		});
		return this._state;
	}

	/** Sanitize (diff) and update the state */
	async #sanitizeAndUpdate(
		kind: "APPLY" | "SET",
		to: {
			[Key in keyof ISessionListProvider]?: ISessionListProvider[Key] extends any[]
				? MixListAppendOp | Item[]
				: ISessionListProvider[Key];
		},
	) {
		const value = await this._$.updateAsync(
			(old) =>
				new Promise((resolve) => {
					if (kind === "APPLY") {
						let key;
						let item;
						for (key of objectKeys(to)) {
							item = to[key];
							if (!(item != undefined && item != null)) continue;

							if (!VALID_KEYS.includes(key)) {
								console.log("SKIPPING INVALID KEY", key);

								continue;
							}
							if (key === "visitorData" && !to[key]) {
								continue;
							}
							if (key === "related") {
								if (old[key]?.browseId === to[key]?.browseId) {
									old.related = null;
									continue;
								}
							}
							// Skip if same value
							if (old[key] === to[key]) {
								// console.log("SKIPPING UNCHANGED", key);
								continue;
							}

							if (key === "position" && (to[key] as number) < 0) {
								old[key] = 0;
							}

							// `mix` has a slightly altered type here
							if (key === "mix") {
								if (!Array.isArray(to.mix)) continue;
								// index 0 = operation
								// index 1 = data
								if (to.mix[0] === "append") {
									old.mix.push(...(to.mix[1] as Item[]));
									old.mix = filterList(old.mix);
								} else if (to.mix[0] === "set") {
									old.mix = (to.mix as MixListAppendOp)[1];
								}
								if (filterAutoPlay.value) {
									old.mix = filterList(old.mix);
								}
							} else if (to[key] !== undefined && to[key] !== null) {
								old[key] = to[key] as never;
							}
						}

						Object.assign(this._state, old);

						resolve({ ...old, ...this._state } as ISessionListProvider);
					} else {
						let { mix } = to;
						const toKeys = objectKeys(to);

						if (!mix) mix = [];
						for (const key of toKeys) {
							if (!VALID_KEYS.includes(key as any))
								delete to[key as keyof typeof to];
						}
						Object.assign(this._state, old);
						resolve({
							...to,
							mix: mix[1] ? mix[1] : old["mix"],
						} as ISessionListProvider);
					}
				}),
		);
		return value;
	}
}

export const SessionListService = new ListService();
export default SessionListService;

/**
 * A derived store for read-only access to the current mix
 */
const queue = derived(SessionListService, ($list) => $list.mix);
/**
 * A derived store for read-only access to the current track
 */
const currentTrack = derived(
	SessionListService,
	($list) => $list.mix[Math.max(0, $list.position)],
);
/**
 * A derived store for read-only access to the current position
 */
const queuePosition = derived<typeof SessionListService, number>(
	SessionListService,
	($list, set) => {
		set($list.position);
	},
);

const related = (() => {
	const prevPosition = undefined;
	const { subscribe } = derived<
		typeof SessionListService,
		RelatedEndpointResponse
	>(SessionListService, ($list, set) => {
		try {
			(async () => {
				if ($list.position === prevPosition) return;
				if ($list.related !== null) {
					await fetch<RelatedEndpointResponse>(
						`/api/v1/related.json?browseId=${$list.related?.browseId}`,
					)
						.then((res) => res.json())
						.then(set);
				}
			})();
		} catch (err) {
			Logger.err(err);
		}
	});
	return { subscribe };
})();

export { currentTrack, queue, queuePosition, related };
