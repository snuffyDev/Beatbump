<svelte:options
	immutable={true}
	accessors={true}
/>

<script
	context="module"
	lang="ts"
>
	type StoreSubscriptions = {
		$startIndex?: number;
		$queue?: ISessionListService["mix"];
		$list?: ISessionListProvider;
	};

	const startIndex = writable(0);

	export const listItemPageContext = (() => {
		let stack: { context: PageContext }[] = [];

		const { subscribe, update } = writable<PageContext>();
		return {
			subscribe,
			isLibrary() {
				return stack.filter(({ context }) => context === "library").length > 0;
			},
			add(context: PageContext) {
				const id = { context } as const;
				if (context === "queue") {
					stack.unshift(id);
				} else {
					stack.push(id);
				}
				update(() => stack[0].context);
				return () => {
					stack = stack.filter((ctx) => ctx !== id);
				};
			},
		};
	})();

	const PositionCache = () => {
		type TrackListPosition = number;
		type QueuePosition = number;
		const cache = new Map<TrackListPosition, QueuePosition>();

		return {
			cache,
			get(position: TrackListPosition): QueuePosition {
				return cache.get(position)!;
			},
			set(trackListPosition: TrackListPosition, queuePosition: QueuePosition) {
				cache.set(trackListPosition, queuePosition);
				return queuePosition;
			},
			has(trackListPosition: TrackListPosition): boolean {
				return cache.has(trackListPosition);
			},
			clear() {
				return cache.clear();
			},
		} as const;
	};

	const cache = PositionCache();

	interface ClickHandler {
		(
			item: Item,
			index: number,
			stores: StoreSubscriptions,
			visitorData?: string,
		): Promise<void>;
	}

	function binarySearchIndex<T extends Record<string, any>[]>(
		arr: T,
		target: Partial<T[number]>,
		compareFn: (a: Partial<T[number]>, b: Partial<T[number]>) => number,
	): number {
		let left = 0;
		let right = arr.length - 1;

		while (left <= right) {
			const mid = Math.floor((left + right) / 2);
			const cmp = compareFn(arr[mid], target);

			if (cmp === 0) {
				return mid;
			} else if (cmp < 0) {
				left = mid + 1;
			} else {
				right = mid - 1;
			}
		}

		return -1;
	}

	const handlePlaylistClick: ClickHandler = async (
		item,
		index,
		stores,
		visitorData,
	) => {
		const { $queue, $startIndex = 0, $list } = stores;
		console.log({ index, $startIndex, $queue, $list });
		if (item.playlistId === $list!.currentMixId) {
			if ($queue && index - $startIndex < $queue.length) {
				await list.updatePosition($startIndex || index);

				await list.getSessionContinuation({
					videoId: item?.videoId,
					key: $startIndex || index,
					playlistId: item.playlistId,
					loggingContext: item.loggingContext,
					playerParams: item?.playerParams,
					playlistSetVideoId: item?.playlistSetVideoId,
					ctoken: $list ? $list.continuation : "",
					clickTrackingParams: item.clickTrackingParams || "",
				});
			} else {
				await list.updatePosition($startIndex || index);

				await list
					.getSessionContinuation({
						videoId: item?.videoId,
						key: $startIndex || index,
						playlistId: item.playlistId,
						loggingContext: item.loggingContext,
						playerParams: item?.playerParams,
						playlistSetVideoId:
							APIParams.lt100 === item.playerParams
								? undefined
								: item?.playlistSetVideoId,

						ctoken: $list!.continuation,
						clickTrackingParams: item.clickTrackingParams!,
					})
					.catch(() => {
						return list.initPlaylistSession({
							playlistId: item.playlistId ?? "",
							visitorData,
							clickTrackingParams: item?.clickTrackingParams,
							index: index,
							params: item.playerParams ?? item?.itct,
							playlistSetVideoId: item?.playlistSetVideoId,
							videoId: item?.videoId,
						});
					});
			}
			return;
		}
		await tick();
		await list.updatePosition(index);
		await list.initAutoMixSession({
			playlistId: item.playlistId || "",

			clickTracking:
				($queue &&
					item.playlistId === $list?.currentMixId &&
					$queue[index]?.clickTrackingParams) ||
				item?.clickTrackingParams,
			keyId: index,
			config:  {playerParams: item.playerParams ?? item?.itct},
			playlistSetVideoId: item?.playlistSetVideoId,
			videoId: item?.videoId,
		});
	};

	const buildMenu = ({
		item,
		idx,
		SITE_ORIGIN_URL,
		dispatch,
		page,
	}: BuildMenuParams) =>
		buildDropdown()
			.add("View Artist", async () => {
				goto(
					`/artist/${
						item?.artistInfo
							? item?.artistInfo?.artist?.[0].browseId
							: item?.subtitle[0].browseId
					}`,
				);
				await tick();
				window.scrollTo({
					behavior: "smooth",
					top: 0,
					left: 0,
				});
			})
			.add("Play Song Radio", async () => {
				list.initAutoMixSession({
					videoId: item.videoId,
					loggingContext: item?.loggingContext,
				});
			})
			.add("Add to Playlist", async () => {
				if (item.endpoint?.pageType.match(/PLAYLIST|ALBUM|SINGLE/)) {
					const response = await fetch(
						"/api/v1/get_queue.json?playlistId=" + item.playlistId,
					);
					const data = await response.json();
					const items: Item[] = data;
					showAddToPlaylistPopper.set({ state: true, item: [...items] });
				} else {
					showAddToPlaylistPopper.set({ state: true, item: item });
				}
				dispatch("change");
			})
			.add("Favorite", () => {
				IDBService.sendMessage("create", "favorite", item);
			})
			.add(
				page === "queue" ? "Remove from Queue" : undefined,
				page === "queue"
					? () => {
							list.removeTrack(idx);
					  }
					: undefined,
			)
			.add("Share", async () => {
				let shareData: {
					title: string;
					url: string;
					text?: string;
				} = {
					title: item.title,
					url: `${SITE_ORIGIN_URL}/listen?id=${item.videoId}`,
				};
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_PLAYLIST")) {
					shareData = {
						title: item.title,

						url: `${SITE_ORIGIN_URL}/playlist/${item.endpoint?.browseId}`,
					};
				}
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_ALBUM")) {
					shareData = {
						title: item.title,

						url: `${SITE_ORIGIN_URL}/release?id=${item.endpoint?.browseId}`,
					};
				}
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_ARTIST")) {
					shareData = {
						title: item.title,
						text: `${item.title} on Beatbump`,
						url: `${SITE_ORIGIN_URL}/artist/${item.endpoint?.browseId}`,
					};
				}
				try {
					if (!navigator.canShare) {
						await navigator.clipboard.writeText(shareData.url);
						notify("Link copied successfully", "success");
					} else {
						await navigator.share(shareData);
						notify("Shared successfully", "success");
					}
				} catch (error) {
					notify("Error: " + error, "error");
				}
			})
			.build();
</script>

<script lang="ts">
	import { page as PageStore } from "$app/stores";
	import {
		isMobileMQ,
		isPagePlaying,
		queue,
		showAddToPlaylistPopper,
	} from "$lib/stores";
	import type { Item } from "$lib/types";
	import { Logger, notify } from "$lib/utils";

	import { goto } from "$app/navigation";
	import { buildDropdown } from "$lib/configs/dropdowns.config";
	import { APIParams, FINITE_LIST_PARAMS } from "$lib/constants";
	import { CTX_ListItem } from "$lib/contexts";
	import { currentTrack, queuePosition } from "$lib/stores/list";
	import type {
		ISessionListProvider,
		ISessionListService,
	} from "$lib/stores/list/types.list";
	import type { PageContext } from "$lib/types/allContexts";
	import type { BuildMenuParams } from "$lib/types/common";
	import { IDBService } from "$lib/workers/db/service";
	import list from "$stores/list/sessionList";
	import { SITE_ORIGIN_URL } from "$stores/url";
	import { createEventDispatcher, tick } from "svelte";
	import { writable } from "svelte/store";
	import Icon from "../Icon/Icon.svelte";
	import { fullscreenStore } from "../Player/channel";
	import PopperButton from "../Popper/PopperButton.svelte";

	export let item: Item;
	export let idx: number;
	export let draggable = false;
	interface $$Events {
		click: MouseEvent;
		setPageIsPlaying: { id: string };
		initLocalPlaylist: { idx: number };
		change: undefined;
	}

	const dispatch = createEventDispatcher<$$Events>();
	const {
		visitorData = "",
		parentPlaylistId = "",
		page: currentCtx,
	} = CTX_ListItem.get()!;
	$: page = $listItemPageContext;
	const DropdownItems = buildMenu({
		item,
		idx,
		SITE_ORIGIN_URL: $SITE_ORIGIN_URL,
		dispatch,
		page,
	});

	$: isPlaying =
		($isPagePlaying.has($PageStore.params.slug) || currentCtx === "queue") &&
		$queue.length > 0 &&
		$queuePosition === idx &&
		$currentTrack?.videoId === item.videoId;

	let isHovering = false;

	async function handleClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target && target.nodeName === "A") return;

		Logger.dev(item);
		const queueIndex = binarySearchIndex<typeof $list.mix>(
			$list.mix,
			{ index: idx },
			(a, b) => (a.index ?? 0) - (b.index ?? 0),
		);

		const position = cache.has(idx)
			? cache.get(idx)
			: cache.set(idx, queueIndex < 0 ? idx : queueIndex);
		console.log(event, position, idx, queueIndex, $list);
		Logger.mark(`Handle Click: ${position}`);
		switch (page) {
			case "queue": {
				if (listItemPageContext.isLibrary() && !list.isLocalPlaylist) {
					dispatch("initLocalPlaylist", { idx });
					dispatch("setPageIsPlaying", { id: "", index: idx });
					return;
				}

				await handlePlaylistClick(
					{ ...item, params: FINITE_LIST_PARAMS },
					position,
					{ $list, $queue, $startIndex },
					visitorData,
				);
				break;
			}
			case "playlist":
				Logger.mark(`Handle Playlist Click @ ${$startIndex}:  ${position}`);
				await handlePlaylistClick(
					item,
					position,
					{ $list, $queue, $startIndex },
					visitorData,
				);
				break;
			case "library":
				list.updatePosition(idx);
				dispatch("initLocalPlaylist", { idx });
				break;
			case "release":
				Logger.mark(`Release Click: ${$startIndex} ${position}`);
				await handlePlaylistClick(
					item,
					position,
					{ $list, $queue, $startIndex },
					visitorData,
				);

				break;
			default:
				await list.initAutoMixSession({
					videoId: item.videoId,
					playlistId: item.playlistId ?? parentPlaylistId,
					playlistSetVideoId: item?.playlistSetVideoId,
					keyId: idx,
					clickTracking: item?.clickTrackingParams ?? undefined,
					loggingContext: item?.loggingContext,
					config: {
						playerParams: item?.playerParams,
						type: item?.musicVideoType,
					},
				});
				break;
		}
		dispatch("setPageIsPlaying", { id: parentPlaylistId });
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<article
	class="m-item"
	tabindex="0"
	class:isPlaying
	{draggable}
	on:click|stopPropagation={handleClick}
	on:pointerenter={() => {
		isHovering = true;
	}}
	on:pointerleave={() => {
		isHovering = false;
	}}
>
	<div class="index">
		<span class:hidden={isPlaying !== true && isHovering !== true}>
			<!--#9990a0-->
			<Icon
				name="play"
				color="inherit"
				size="1.5em"
			/>
		</span>
		<span class:hidden={isPlaying !== false || isHovering !== false}>
			{idx + 1}
		</span>
	</div>
	<div class="metadata">
		{#if Array.isArray(item.thumbnails) && item.thumbnails.length}
			<div class="thumbnail">
				<img
					decoding="async"
					loading="lazy"
					src={item.thumbnails[0]?.url}
					width={item.thumbnails[0]?.width}
					height={item.thumbnails[0]?.height}
					alt="thumbnail"
				/>
			</div>
		{/if}
		<div class="column">
			<span class="title"
				>{item.title}
				{#if item.explicit}
					<Icon
						name="explicit"
						fill="hsla(0, 0%, 95%, 0.7)"
						size="12px"
					>
						<span class="sr-only">Explicit</span>
					</Icon>
				{/if}
			</span>
			<div class="artists secondary">
				{#if Array.isArray(item.subtitle)}
					{#each item.subtitle as subtitle}
						{#if subtitle?.browseId}
							<a
								class="artist secondary"
								href={`/artist/${subtitle.browseId}`}
								on:click|preventDefault={() => {
									goto(`/artist/${subtitle.browseId}`);
									fullscreenStore.set("closed");
								}}>{subtitle.text}</a
							>
						{:else}
							<span>{subtitle.text} </span>
						{/if}
					{/each}
				{/if}
			</div>
		</div>
	</div>
	{#if $isMobileMQ || isHovering}
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div
			class="length"
			tabindex="0"
			on:focus={() => (isHovering = true)}
		>
			<PopperButton
				tabindex={0}
				items={DropdownItems}
			/>
		</div>
	{:else}
		<span
			class="length"
			class:hidden={!item?.length ? true : false}
			>{(item?.length?.text ?? item.length) || ""}</span
		>
	{/if}
</article>

<style
	src="./index.scss"
	lang="scss"
></style>
