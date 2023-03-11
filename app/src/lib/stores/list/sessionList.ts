/**
 * TODO: clean this module up massively.
 *
 * - Use class instead of func impl (...?)
 *
 */
import type { Artist, ArtistInfo, Item, Song, Subtitle, Thumbnail } from "$lib/types";
import { Logger, addToQueue, getSrc, notify, seededShuffle, type ResponseBody, WritableStore } from "$lib/utils";
import { Mutex } from "$lib/utils/sync";
import { splice } from "$lib/utils/collections/array";
import { writable, type Writable } from "svelte/store";
import { playerLoading, filterAutoPlay } from "../stores";
import { groupSession } from "../sessions";
import type { ISessionListService, ISessionListProvider } from "./types.list";
import { fetchNext, filterList } from "./utils.list";
import { tick } from "svelte";
import type { VssLoggingContext } from "$lib/types/innertube/internals";
import type { RelatedEndpointResponse } from "src/routes/api/v1/related.json/+server";
import { AudioPlayer } from "$lib/player";

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

class ListService implements ISessionListService {
	private $: WritableStore<ISessionListProvider> = new WritableStore<ISessionListProvider>(undefined);
	private state: ISessionListProvider = {
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
		this.$.set(this.state);
	}

	public get clickTrackingParams(): string {
		return this.state.clickTrackingParams;
	}

	public get continuation() {
		return this.state.continuation;
	}

	public get currentMixId(): string {
		return this.state.currentMixId;
	}

	public get mix() {
		return this.state.mix.slice();
	}

	public get position() {
		return this.state.position;
	}

	public get set() {
		return this.$.set;
	}

	public get value() {
		return this.state;
	}

	public get subscribe() {
		return this.$.subscribe;
	}

	private get update() {
		return this.$.update;
	}

	private currentTrack(position = 0) {
		return this.state.mix?.[position];
	}

	public async next(userInitiated = false, broadcast = false) {
		let position = this.state.position + 1;
		if (position >= this.state.mix.length) {
			position = this.state.position;
		}
		const currentTrack = this.currentTrack(position);
		const data = await fetchNext({
			visitorData: this.state?.visitorData,
			params: encodeURIComponent("OAHyAQIIAQ=="),
			playlistSetVideoId: currentTrack?.playlistSetVideoId,
			index: position,
			loggingContext: currentTrack?.loggingContext?.vssLoggingContext?.serializedContextData,
			videoId: currentTrack?.videoId,
			playlistId: this.currentMixId,
			clickTracking: this?.clickTrackingParams,
		});
		if (!data) return;
		await this.sanitizeAndUpdate("APPLY", data);

		await AudioPlayer.next(userInitiated, broadcast);
	}

	public async previous(broadcast = false) {
		const data = await fetchNext({
			visitorData: this.state?.visitorData,
			params: encodeURIComponent("OAHyAQIIAQ=="),
			playlistSetVideoId: this.state.mix[this.position]?.playlistSetVideoId,
			index: this.state.position,
			loggingContext: this.currentTrack?.loggingContext?.vssLoggingContext?.serializedContextData,
			videoId: this.currentTrack?.videoId,
			playlistId: this.currentMixId,
			ctoken: this?.continuation,
			clickTracking: this?.clickTrackingParams,
		});
		if (!data) return;
		this.state.related = data.related;
		await this.sanitizeAndUpdate("APPLY", data);

		await AudioPlayer.next(true, true);
	}
	public async getMoreLikeThis({ playlistId }: { playlistId?: string }): Promise<void> {
		const toggle = togglePlayerLoad();
		await tick();

		try {
			const response = await fetchNext({
				params: "wAEB8gECeAE%3D",
				playlistId:
					playlistId !== null
						? playlistId.startsWith("RDAMPL")
							? playlistId
							: "RDAMPL" + playlistId
						: this.state.currentMixId,
			});

			if (!response || !response.results.length) {
				throw new Error("Invalid response returned by `next` endpoint");
			}

			if (this.state.mix.length) {
				response.results.shift();
			}

			const state = await this.sanitizeAndUpdate("APPLY", { ...response, mix: ["append", response.results] });

			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestTrackQueue(state);
			}

			await getSrc(
				this.state.mix[this.state.position + 1].videoId,
				this.state.mix[this.state.position].playlistId,
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
		clickTrackingParams,
		ctoken,
		itct,
		key,
		playlistId,
		videoId,
		loggingContext,
	}: {
		itct: string;
		videoId: string;
		playlistId: string;
		ctoken: string;
		clickTrackingParams: string;
		loggingContext?: { vssLoggingContext: { serializedContextData: string } };
		key: number;
	}): Promise<ResponseBody> {
		const toggle = togglePlayerLoad();
		await tick();

		try {
			if (!clickTrackingParams && !ctoken) {
				playlistId = !playlistId.startsWith("RDAMPL") ? "RDAMPL" + playlistId : playlistId;
				itct = "wAEB8gECeAE%3D";
			}

			const data = await fetchNext({
				visitorData: this.state.visitorData,
				params: encodeURIComponent("OAHyAQIIAQ=="),
				playlistSetVideoId: this.state.mix[key]?.playlistSetVideoId,
				index: key,
				loggingContext: loggingContext?.vssLoggingContext?.serializedContextData,
				videoId,
				playlistId,
				ctoken,
				clickTracking: clickTrackingParams,
			});

			if (!data || !(Array.isArray(data.results) ? data.results.length : false)) {
				this.getMoreLikeThis({ playlistId });
				return;
			}

			const results = data.results;

			const state = await this.sanitizeAndUpdate("APPLY", {
				...data,
				mix: ["append", results],
			});

			const src = await getSrc(this.state.mix[key].videoId);

			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.updateGuestContinuation(state);
			}

			return src.body;
		} catch (err) {
			Logger.err(err);
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
			if (this.state.mix) {
				willRevert = true;
				this.revertState();
			}

			this.state.currentMixType = "auto";

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

			const state = await this.sanitizeAndUpdate(willRevert ? "SET" : "APPLY", {
				...this.state,
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
			let {
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

			if (this.state.currentMixType !== "playlist" || this.state.currentMixId !== playlistId) {
				this.updatePosition(typeof index === "number" ? index : 0);
			}
			if (this.state.currentMixId !== playlistId) {
				this.revertState();
			}

			const data = await fetchNext({
				params,
				playlistId: playlistId.startsWith("VL") ? playlistId.slice(2) : playlistId,
				clickTracking: clickTrackingParams,
				visitorData,
				playlistSetVideoId,
				videoId,
			});

			if (!data || !Array.isArray(data.results)) {
				throw new Error("Invalid response returned from `next` endpoint.");
			}

			if (!data.results.length) {
				this.getMoreLikeThis({ playlistId });
				return;
			}

			const state = await this.sanitizeAndUpdate("APPLY", {
				...data,
				mix: ["set", data.results],
				currentMixType: "playlist",
			});
			await tick();
			if (groupSession?.initialized && groupSession?.hasActiveSession) {
				groupSession.expAutoMix(state);
			}

			return await getSrc(this.state.mix[index]?.videoId, playlistId, null, true);
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
			this.$.set(_mix);
			return Promise.resolve(this.state);
		});
	}

	public removeTrack(index: number) {
		this.state.mix.splice(index, 1);
		this.$.update((u) => ({ ...u, mix: [...u.mix.slice(0, index), ...u.mix.slice(index + 1)] }));
	}

	public async setMix(mix: Item[], type?: "auto" | "playlist" | "local") {
		const guard = await mutex.do(async () => {
			await tick();
			return new Promise<ISessionListProvider>((resolve) => {
				this.sanitizeAndUpdate("SET", { ...this.state, mix: ["set", mix], currentMixType: type }), resolve(this.state);
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
			const oldLength = this.state.mix.length;

			splice(this.state.mix, key + 1, 0, ...itemToAdd);

			await this.sanitizeAndUpdate("APPLY", { mix: ["set", this.state.mix] satisfies MixListAppendOp });

			if (!oldLength) {
				await getSrc(this.state.mix[0].videoId, this.state.mix[0].playlistId, null, true);
			}
		} catch (err) {
			console.error(err);
			notify(`Error: ${err}`, "error");
		}
	}

	public shuffle(index: number, preserveBeforeActive = true) {
		if (typeof index !== "number") return;
		if (!preserveBeforeActive) {
			this.state.mix = seededShuffle(
				this.state.mix.slice(),
				crypto.getRandomValues(new Uint8Array(8)).reduce((prev, cur) => (prev += cur), 0),
			);
		} else {
			this.state.mix = [
				...this.state.mix.slice().slice(0, index),
				this.state.mix[index],
				...seededShuffle(
					this.state.mix.slice().slice(index + 1),
					crypto.getRandomValues(new Uint8Array(8)).reduce((prev, cur) => (prev += cur), 0),
				),
			];
		}
		// console.log(mix)
		const state = this.sanitizeAndUpdate("APPLY", { mix: this.state.mix });

		if (groupSession?.initialized && groupSession?.hasActiveSession) {
			groupSession.updateGuestTrackQueue(state);
		}
	}

	public shuffleRandom(
		items: ({
			subtitle: { text?: string; pageType?: string; browseId?: string }[] & Subtitle[];
			artistInfo: { pageType?: string; artist?: Artist[]; browseId?: string } & ArtistInfo;
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
		this.state.mix = seededShuffle(
			items,
			crypto.getRandomValues(new Uint8Array(8)).reduce((prev, cur) => (prev += cur), 0),
		);

		const state = this.sanitizeAndUpdate("SET", { mix: this.state.mix });

		if (groupSession?.initialized && groupSession?.hasActiveSession) {
			groupSession.updateGuestTrackQueue(state);
		}
	}

	public toJSON(): string {
		return JSON.stringify(this.state);
	}

	/** Update the track position based on a keyword or number */
	public updatePosition(direction: "next" | "back" | number): number {
		if (typeof direction === "number") {
			this.sanitizeAndUpdate("APPLY", { position: direction });
			return direction;
		}
		if (direction === "next") {
			this.sanitizeAndUpdate("APPLY", { position: this.state.position + 1 });
		}
		if (direction === "back") {
			this.sanitizeAndUpdate("APPLY", { position: this.state.position - 1 });
		}

		return this.state.position;
	}

	private revertState(): ISessionListProvider {
		this.state = {
			clickTrackingParams: "",
			continuation: "",
			currentMixId: "",
			currentMixType: null,
			mix: [],
			visitorData: "",
			position: 0,
			related: null,
		};
		return this.state;
	}

	/** Sanitize (diff) and update the state */
	private async sanitizeAndUpdate(
		kind: "APPLY" | "SET",
		to: {
			[Key in keyof ISessionListProvider]?: ISessionListProvider[Key] extends any[]
				? MixListAppendOp | Item[]
				: ISessionListProvider[Key];
		},
	) {
		await this.$.updateAsync(
			(old) =>
				new Promise((resolve) => {
					if (kind === "APPLY") {
						let key;
						let item;
						for (key in to) {
							item = to[key];
							if (!(item != undefined && item != null)) continue;

							if (!VALID_KEYS.includes(key)) {
								console.log("SKIPPING INVALID KEY", key);

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
								console.log("SKIPPING UNCHANGED", key);
								continue;
							}

							// `mix` has a slightly altered type here
							if (key === "mix") {
								// index 0 = operation
								// index 1 = data
								if (to.mix[0] === "append") {
									old.mix.push(...(to.mix[1] as Item[]));
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

						Object.assign(this.state, old);

						resolve({ ...old, ...this.state } as ISessionListProvider);
					} else {
						const { mix } = to;
						for (const key in to) {
							if (!VALID_KEYS.includes(key as any)) delete to[key];
						}
						resolve({ ...to, mix: mix[1] ? mix[1] : old["mix"] } as ISessionListProvider);
					}
				}),
		);
		return this.$.value;
	}
}

const SessionListService: ListService = new ListService();

export default SessionListService;
