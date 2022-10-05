<svelte:options immutable={true} accessors={true} />

<script context="module" lang="ts">
</script>

<script lang="ts">
	import { ctxKey, groupSession, isMobileMQ, isPagePlaying, queue, showAddToPlaylistPopper } from "$lib/stores";
	import { page as PageStore } from "$app/stores";
	import type { Item } from "$lib/types";
	import { notify } from "$lib/utils";

	import { createEventDispatcher, tick } from "svelte";
	import Icon from "../Icon/Icon.svelte";
	import { fullscreenStore } from "../Player/channel";
	import PopperButton from "../Popper/PopperButton.svelte";
	import { goto } from "$app/navigation";
	import { IDBService } from "$lib/workers/db/service";
	import SessionListService from "$lib/stores/list";
	import list from "$lib/stores/list";
	import { AudioPlayer, updateGroupPosition } from "$lib/player";
	import { CTX_ListItem } from "$lib/contexts";
	import { SITE_ORIGIN_URL } from "$stores/url";
	export let item: Item;
	export let idx: number;
	interface $$Events {
		setPageIsPlaying: { id: string };
		initLocalPlaylist: { idx: number };
		change: undefined;
	}
	const dispatch = createEventDispatcher<$$Events>();

	const { page, parentPlaylistId = null } = CTX_ListItem.get();

	let isHovering = false;

	$: isPlaying =
		(page !== "queue" && page !== "release" ? $isPagePlaying.has($PageStore.params.slug) : true) &&
		$SessionListService.mix.length > 0 &&
		$SessionListService.position === idx &&
		$SessionListService.mix[idx]?.videoId === item.videoId;
	let DropdownItems;
	DropdownItems = [
		{
			text: "View Artist",
			icon: "artist",
			action: async () => {
				goto(`/artist/${item?.artistInfo ? item.artistInfo.artist[0].browseId : item?.subtitle[0].browseId}`);
				await tick();
				window.scrollTo({
					behavior: "smooth",
					top: 0,
					left: 0,
				});
			},
		},
		{
			text: "Play Song Radio",
			icon: "radio",
			action: async () => {
				list.initAutoMixSession({ videoId: item.videoId });
			},
		},
		{
			text: "Add to Playlist",
			icon: "list-plus",
			action: async () => {
				if (item.endpoint?.pageType.match(/PLAYLIST|ALBUM|SINGLE/)) {
					const response = await fetch("/api/v1/get_queue.json?playlistId=" + item.playlistId);
					const data = await response.json();
					const items: Item[] = data;
					showAddToPlaylistPopper.set({ state: true, item: [...items] });
				} else {
					showAddToPlaylistPopper.set({ state: true, item: item });
				}
				dispatch("change");
			},
		},
		{
			text: "Favorite",
			icon: "heart",
			action: () => {
				IDBService.sendMessage("create", "favorite", item);
			},
		},
		{
			text: "Share",
			icon: "share",
			action: async () => {
				let shareData = {
					title: item.title,

					url: `${$SITE_ORIGIN_URL}/listen?id=${item.videoId}`,
				};
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_PLAYLIST")) {
					shareData = {
						title: item.title,

						url: `${$SITE_ORIGIN_URL}/playlist/${item.endpoint?.browseId}`,
					};
				}
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_ALBUM")) {
					shareData = {
						title: item.title,

						url: `${$SITE_ORIGIN_URL}/release?id=${item.endpoint?.browseId}`,
					};
				}
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_ARTIST")) {
					shareData = {
						title: item.title,
						text: `${item.title} on Beatbump`,
						url: `${$SITE_ORIGIN_URL}/artist/${item.endpoint?.browseId}`,
					};
				}
				try {
					if (!navigator.canShare) {
						await navigator.clipboard.writeText(shareData.url);
						notify("Link copied successfully", "success");
					} else {
						const share = await navigator.share(shareData);
						notify("Shared successfully", "success");
					}
				} catch (error) {
					notify("Error: " + error, "error");
				}
			},
		},
	];
	async function handleClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target && target.nodeName === "A") return;
		console.log(item, idx, parentPlaylistId);
		/// Are we on the 'Queue' screen ?
		if (page === "queue") {
			/// Do we have a group session?
			if (groupSession.initialized && groupSession.hasActiveSession) {
				/// If the index is 0, handle it differently
				if (idx === 0) {
					updateGroupPosition(undefined, idx === 0 ? 1 : idx);
					list.updatePosition(1);
					return AudioPlayer.previous(false);
				}
				/// If the index is the last item, handle it differently
				if (idx === $queue.length - 1) {
					list.updatePosition(idx === 0 ? 0 : idx - 1);
					AudioPlayer.next(true, true);
					await tick();
					return;
				}

				/// Update position as normal
				list.updatePosition(idx === 0 ? 0 : idx - 1);
				updateGroupPosition(undefined, idx === 0 ? 0 : idx - 1);
				await tick();
				AudioPlayer.next(true, true);
			} else {
				if (idx === 0) {
					list.updatePosition(1);
					await tick();
					return AudioPlayer.previous(false);
				}
				list.updatePosition(idx - 1);
				await tick();

				AudioPlayer.next(true, false);
			}
		} else if (page === "playlist") {
			list.updatePosition(idx);
			await tick();
			await list.initPlaylistSession({
				playlistId: item.playlistId,
				clickTrackingParams: item?.clickTrackingParams,
				index: idx,
				params: item?.playerParams,
				playlistSetVideoId: item?.playlistSetVideoId,
				videoId: item?.videoId,
			});
		} else if (page === "library") {
			list.updatePosition(idx);
			dispatch("initLocalPlaylist", { idx });
		} else if (page === "release") {
			list.updatePosition(idx);
			await list.initAutoMixSession({
				playlistId: item.playlistId ?? parentPlaylistId,
				keyId: item.index,
				videoId: item?.videoId,
			});
			await list.getMoreLikeThis({ playlistId: item.playlistId ?? parentPlaylistId });
		} else {
			await list.initAutoMixSession({
				videoId: item.videoId,
				playlistId: item.playlistId ?? parentPlaylistId,
				playlistSetVideoId: item?.playlistSetVideoId,
				keyId: idx,
				clickTracking: item?.clickTrackingParams ?? undefined,
				loggingContext: item?.loggingContext,
				config: { playerParams: item?.playerParams, type: item?.musicVideoType },
			});
		}
		dispatch("setPageIsPlaying", { id: parentPlaylistId });
	}
</script>

<article
	class="m-item"
	tabindex="0"
	class:isPlaying
	on:click|stopPropagation={handleClick}
	on:pointerenter={(e) => {
		isHovering = true;
	}}
	on:pointerleave={() => {
		isHovering = false;
	}}
>
	<div class="index">
		<span class:hidden={isPlaying !== true && isHovering !== true}>
			<!--#9990a0-->
			<Icon name="play" color="inherit" size="1.5em" />
		</span>
		<span class:hidden={isPlaying !== false || isHovering !== false}>
			{idx + 1}
		</span>
	</div>
	<div class="metadata">
		{#if item.thumbnails.length !== 0}
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
				{#if item?.explicit}
					<span class="explicit">
						{item.explicit ? "E" : ""}
					</span>
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
		<div class="length" tabindex="0" on:focus={() => (isHovering = true)}>
			<PopperButton tabindex="0" items={DropdownItems} />
		</div>
	{:else}
		<span class="length" class:hidden={!item?.length ? true : false}>{(item?.length?.text ?? item.length) || ""}</span>
	{/if}
</article>

<style src="./index.scss" lang="scss">
</style>
