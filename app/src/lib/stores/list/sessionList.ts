import type { Artist, ArtistInfo, Item, Song, Subtitle, Thumbnail } from "$lib/types";
import { Logger, addToQueue, notify, seededShuffle, type ResponseBody, WritableStore } from "$lib/utils";
import { Mutex } from "$lib/utils/sync";
import { splice } from "$lib/utils/collections/array";
import { playerLoading, filterAutoPlay } from "../stores";
import { groupSession } from "../sessions";
import type { ISessionListService, ISessionListProvider } from "./types.list";
import { fetchNext, filterList } from "./utils.list";
import { tick } from "svelte";
import type { VssLoggingContext } from "$lib/types/innertube/internals";
import { APIParams } from "$lib/constants";
import { AudioPlayer, getSrc } from "$lib/player";
import { objectKeys } from "$lib/utils/collections/objects";

const mutex = new Mutex();

interface AutoMixArgs {
	clickTracking?: string;
	config?: { playerParams?: string; type?: string };
	keyId?: number;
	loggingContext?: { vssLoggingContext: { serializedContextData: string } };
	playlistId?: string;
	playlistSetVideoId?: string;
	videoId?: string;
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

export class ListService implements ISessionListService {
	_$: WritableStore<ISessionListProvider> = new WritableStore<ISessionListProvider>(undefined);
	_state: ISessionListProvider = {
		clickTrackingParams: "",
		continuation: "",
		currentMixId: "",
		currentMixType: null,
		visitorData: "",
		mix: [],
		position: 0,
		related: null,
	};

	constructor() {
		this._$.set(this._state);
	}

	public get subscribe() {
		return this._$.subscribe;
	}

	public get clickTrackingParams(): string {
		return this._state.clickTrackingParams;
	}

	public get $() {
		return this._$;
	}

	public get continuation() {
		return this._state.continuation;
	}

	public get currentMixId(): string {
		return this._state.currentMixId;
	}

	public get mix() {
		return this._state.mix.slice();
	}

	public get position() {
		return this._state.position;
	}

	public get set() {
		return this._$.set;
	}

	public get value() {
		return this._state;
	}

	get #update() {
		return this._$.update;
	}

	#currentTrack(position = 0) {
		return this._state.mix?.[position];
	}

	public async next(userInitiated = false, broadcast = false) {
		console.log("SESSION LIST NEXT");
		let position = await this.updatePosition("next");
		if (position >= this._state.mix.length) {
			position = this._state.position;
		}
		const currentTrack = this.#currentTrack(position);
		const data = await fetchNext({
			visitorData: this._state?.visitorData,
			params: "gAQBiAQB",
			playlistSetVideoId: currentTrack?.playlistSetVideoId,
			index: position,
			loggingContext: currentTrack?.loggingContext?.vssLoggingContext?.serializedContextData,
			videoId: currentTrack?.videoId,
			playlistId: this.currentMixId,
			clickTracking: this?.clickTrackingParams,
		});
		if (!data) return;

		const state = await this.#sanitizeAndUpdate("APPLY", data);
	}

	public async previous(broadcast = false) {
		const data = await fetchNext({
			visitorData: this._state?.visitorData,
			params: "OAHyAQIIAQ==",
			playlistSetVideoId: this._state.mix[this.position]?.playlistSetVideoId,
			index: this._state.position,
			loggingContext: this.#currentTrack(this.position)?.loggingContext?.vssLoggingContext?.serializedContextData,
			videoId: this.#currentTrack(this.position)?.videoId,
			playlistId: this.currentMixId,
			continuation: this?.continuation,
			clickTracking: this?.clickTrackingParams,
		});
		if (!data) return;
		this._state.related = data.related;
		await this.#sanitizeAndUpdate("APPLY", data);
	}
	public async getMoreLikeThis({ playlistId }: { playlistId?: string }): Promise<void> {
		const toggle = togglePlayerLoad();
		await tick();

		try {
			const response = await fetchNext({
				params: APIParams.finite,
				playlistId:
					playlistId !== null
						? playlistId.startsWith("RDAMPL")
							? playlistId
							: "RDAMPL" + playlistId
						: this._state.currentMixId,
			});

			if (!response || !response.results.length) {
				throw new Error("Invalid response returned by `next` endpoint");
			}

			if (this._state.mix.length) {
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
				this._state.mix[this._state.position + 1].videoId,
				this._state.mix[this._state.position].playlistId,
				null,
				false,
			);
		} catch (err) {
			Logger.err(err);
			notify(err, "error");
		} finally {
			toggle();
		}
	}

	public async getSessionContinuation({
		playlistSetVideoId,
		clickTrackingParams,
		ctoken,
		itct,
		key,
		playlistId,
		playerParams,

		videoId,
		loggingContext,
	}: {
		itct?: string;
		videoId: string;
		playlistId: string;
		ctoken: string;
		clickTrackingParams: string;
		loggingContext?: { vssLoggingContext: { serializedContextData: string } };
		key: number;
		playerParams?: string;
		playlistSetVideoId?: string;
	}): Promise<ResponseBody> {
		const toggle = togglePlayerLoad();
		await tick();

		try {
			if (!clickTrackingParams && !ctoken) {
				playlistId = !playlistId.startsWith("RDAMPL") ? "RDAMPL" + playlistId : playlistId;
				itct = "wAEB8gECeAE%3D";
			}

			const params: Parameters<typeof fetchNext>["0"] = {
				visitorData: this._state.visitorData,
				params: playerParams ?? encodeURIComponent("OAHyAQIIAQ=="),
				playlistSetVideoId: playlistSetVideoId ?? this._state.mix[key]?.playlistSetVideoId,
				loggingContext: loggingContext?.vssLoggingContext?.serializedContextData,
				videoId,
				playlistId,
				index: key ?? undefined,
				continuation: ctoken,
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

			const src = await getSrc(state.mix[key].videoId);

			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestContinuation(state);
			}

			return src.body;
		} catch (err) {
			Logger.err(err);
			throw err;
		} finally {
			toggle();
		}
	}

	public async initAutoMixSession(args: AutoMixArgs) {
		const toggle = togglePlayerLoad();
		try {
			const { loggingContext, keyId, clickTracking, config, playlistId, playlistSetVideoId, videoId } = args;
			// Wait for the DOM to update
			await tick();

			let willRevert = false;
			// Reset the current mix state
			if (this._state.mix) {
				willRevert = true;
				this.#revertState();
			}

			this._state.currentMixType = "auto";

			const data = await fetchNext({
				params: config?.playerParams ? config?.playerParams : undefined,
				videoId,
				playlistId: playlistId ? playlistId : undefined,
				loggingContext: loggingContext ? loggingContext.vssLoggingContext?.serializedContextData : undefined,
				playlistSetVideoId: playlistSetVideoId ? playlistSetVideoId : undefined,
				clickTracking,
				configType: config?.type || undefined,
			});

			if (!data || !Array.isArray(data.results)) {
				throw new Error("Invalid response was returned from `next` endpoint.");
			}

			const item = data.results[keyId ?? 0];

			getSrc(videoId ?? item?.videoId, item?.playlistId, config?.playerParams);

			const state = await this.#sanitizeAndUpdate(willRevert ? "SET" : "APPLY", {
				...this._state,
				...data,
				mix: ["append", data.results],
			});

			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.expAutoMix(state);
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
		visitorData?: string;
		playlistSetVideoId?: string;
	}): Promise<{ body: ResponseBody; error?: boolean }> {
		const toggle = togglePlayerLoad();
		try {
			const {
				playlistId = "",
				index = 0,
				clickTrackingParams = "",
				params = "",
				videoId = "",
				playlistSetVideoId = "",
				visitorData = "",
			} = args;
			await tick();
			console.log("this.initPlaylistSession");

			if (this._state.currentMixId !== playlistId) {
				this.#revertState();
			}
			console.time("playlistInit");
			const data = await fetchNext({
				params,
				playlistId: playlistId.startsWith("VL") ? playlistId.slice(2) : playlistId,
				clickTracking: clickTrackingParams,
				visitorData,
				index: index,
				playlistSetVideoId,
				videoId,
			});
			console.timeEnd("playlistInit");

			if (!data || !Array.isArray(data.results)) {
				throw new Error("Invalid response returned from `next` endpoint.");
			}

			if (!data.results.length) {
				Logger.dev("NO RESULTS LENGTH!!!");
				this.getMoreLikeThis({ playlistId });
				return;
			}
			const state = await this.#sanitizeAndUpdate("APPLY", {
				...data,
				mix: ["set", data.results],
				currentMixType: "playlist",
			});
			const position = state.mix.findIndex((item) => item.index === index);
			await this.updatePosition(position ?? 0);
			await tick();
			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.expAutoMix(state);
			}

			return await getSrc(state.mix[position]?.videoId, playlistId, null, true);
		} catch (err) {
			Logger.err(err);
			notify("Error starting playlist playback.", "error");
			return null;
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

	public removeTrack(index: number) {
		this._state.mix.splice(index, 1);
		this._$.update((u) => ({
			...u,
			mix: [...u.mix.slice(0, index), ...u.mix.slice(index + 1)],
		}));
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
		if (groupSession?.initialized && groupSession?.hasActiveSession) {
			groupSession.send("PUT", "state.set.mix", JSON.stringify(guard), groupSession.client);
		}
	}

	public async setTrackWillPlayNext(item: Item, key) {
		await tick();
		if (!item) {
			notify("No track to remove was provided!", "error");
			return;
		}
		try {
			const itemToAdd = await addToQueue(item);
			const oldLength = this._state.mix.length;

			splice(this._state.mix, key + 1, 0, ...itemToAdd);

			await this.#sanitizeAndUpdate("APPLY", {
				mix: ["set", this._state.mix] satisfies MixListAppendOp,
			});

			if (!oldLength) {
				await getSrc(this._state.mix[0].videoId, this._state.mix[0].playlistId, null, true);
			}
		} catch (err) {
			console.error(err);
			notify(`Error: ${err}`, "error");
		}
	}

	public shuffle(index: number, preserveBeforeActive = true) {
		if (typeof index !== "number") return;
		if (!preserveBeforeActive) {
			this._state.mix = seededShuffle(
				this._state.mix.slice(),
				crypto.getRandomValues(new Uint8Array(8)).reduce((prev, cur) => (prev += cur), 0),
			);
		} else {
			this._state.mix = [
				...this._state.mix.slice().slice(0, index),
				this._state.mix[index],
				...seededShuffle(
					this._state.mix.slice().slice(index + 1),
					crypto.getRandomValues(new Uint8Array(8)).reduce((prev, cur) => (prev += cur), 0),
				),
			];
		}
		// console.log(mix)
		this.#sanitizeAndUpdate("APPLY", { mix: this._state.mix }).then((state) => {
			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestTrackQueue(state);
			}
		});
	}

	public shuffleRandom(
		items: ({
			subtitle: { text?: string; pageType?: string; browseId?: string }[] & Subtitle[];
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
		this._state.mix = seededShuffle(
			items,
			crypto.getRandomValues(new Uint8Array(8)).reduce((prev, cur) => (prev += cur), 0),
		);

		this.#sanitizeAndUpdate("SET", { mix: this._state.mix }).then((state) => {
			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestTrackQueue(state);
			}
		});
	}

	public toJSON(): string {
		return JSON.stringify(this._state);
	}

	/** Update the track position based on a keyword or number */
	public async updatePosition(direction: "next" | "back" | number): Promise<number> {
		if (typeof direction === "number") {
			const state = await this.#sanitizeAndUpdate("APPLY", {
				position: direction,
			});
			return state.position;
		}
		if (direction === "next") {
			const state = await this.#sanitizeAndUpdate("APPLY", {
				position: this._state.position + 1,
			});
			return state.position;
		}
		if (direction === "back") {
			const state = await this.#sanitizeAndUpdate("APPLY", {
				position: this._state.position - 1,
			});
			return state.position;
		}

		return this._state.position;
	}

	#revertState(): ISessionListProvider {
		this._state = {
			clickTrackingParams: "",
			continuation: "",
			currentMixId: "",
			currentMixType: null,
			mix: [],
			visitorData: "",
			position: 0,
			related: null,
		};
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
		return this._$.updateAsync(
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

							// `mix` has a slightly altered type here
							if (key === "mix") {
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
								old[key] = to[key];
							}
						}

						Object.assign(this._state, old);

						resolve({ ...old, ...this._state } as ISessionListProvider);
					} else {
						const { mix } = to;
						for (const key in to) {
							if (!VALID_KEYS.includes(key as any)) delete to[key];
						}
						resolve({
							...to,
							mix: mix[1] ? mix[1] : old["mix"],
						} as ISessionListProvider);
					}
				}),
		);
		return this._$.value;
	}
}
export { AudioPlayer as default };
