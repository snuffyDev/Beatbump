<svelte:options immutable={true} accessors={true} />

<script lang="ts">
	import { groupSession, isPagePlaying } from "$lib/stores";
	import { page as SPage } from "$app/stores";
	import type { Item } from "$lib/types";
	import { notify } from "$lib/utils";

	import { createEventDispatcher, tick } from "svelte";
	import Icon from "../Icon/Icon.svelte";
	import { fullscreenStore } from "../Player/channel";
	import PopperButton from "../Popper/PopperButton.svelte";
	import { goto } from "$app/navigation";
	import { IDBService } from "$lib/workers/db/service";
	import SessionListService, { queuePosition, queue } from "$lib/stores/list";
	import { AudioPlayer, updateGroupPosition } from "$lib/player";
	import { CTX_ListItem } from "$lib/contexts";
	import { SITE_ORIGIN_URL } from "$lib/stores/url";
	export let item: Item;
	export let idx: number;
	export let ctx: Record<string, unknown> = {};

	let parent: HTMLElement;

	const dispatch = createEventDispatcher<{
		setPageIsPlaying: { id: string };
		initLocalPlaylist: { idx: number };
		hovering: { idx: number };
		notHovering: null;
		change: undefined;
	}>();
	const { page, parentPlaylistId = null } = CTX_ListItem.get();

	$: isPlaying =
		(page !== "queue" && page !== "release" ? $isPagePlaying.has($SPage.params.slug) : true) &&
		$SessionListService.mix.length > 0 &&
		$SessionListService.position === idx &&
		$SessionListService.mix[idx]?.videoId === item.videoId;

	let isHovering = false;
	let width = 640;
	let DropdownItems = [
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
			text: "Remove from Playlist",
			icon: "x",
			action: async () => {
				const promise = await deleteSongFromPlaylist(item.videoId, parentPlaylistId);
				// console.log(promise, item, parentPlaylistId);
				dispatch("change");
			},
		},
		{
			text: "Favorite",
			icon: "heart",
			action: () => {
				setNewFavorite(item);
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
		if (page === "queue") {
			if (groupSession.initialized && groupSession.hasActiveSession) {
				if (idx === 0) {
					updateGroupPosition(undefined, idx === 0 ? 1 : idx);
					SessionListService.updatePosition(1);
					return AudioPlayer.previous(false);
				}
				if (idx === $queue.length - 1) {
					const pos = SessionListService.updatePosition(idx === 0 ? 0 : idx - 1);
					// updateGroupPosition("<-", pos);
					AudioPlayer.next(true, true);
					await tick();
					return;
				}
				SessionListService.updatePosition(idx === 0 ? 0 : idx - 1);
				updateGroupPosition(undefined, idx === 0 ? 0 : idx - 1);
				await tick();
				AudioPlayer.next(true, true);
			} else {
				if (idx === 0) {
					SessionListService.updatePosition(1);
					await tick();
					return AudioPlayer.previous(false);
				}
				SessionListService.updatePosition(idx - 1);
				await tick();

				AudioPlayer.next(true, false);
			}
		} else if (page === "playlist") {
			SessionListService.updatePosition(idx);
			await SessionListService.initPlaylistSession({ playlistId: item.playlistId, index: idx });
		} else if (page === "library") {
			SessionListService.updatePosition(idx);
			dispatch("initLocalPlaylist", { idx });
		} else {
			await SessionListService.initAutoMixSession({
				videoId: item.videoId,
				playlistId: parentPlaylistId,
				keyId: page === "artist" ? 0 : idx,
				config: { playerParams: item?.playerParams, type: item?.musicVideoType },
			});
		}
		dispatch("setPageIsPlaying", { id: parentPlaylistId });
	}
</script>

<svelte:window bind:innerWidth={width} />
<article
	bind:this={parent}
	class="m-item"
	tabindex="0"
	class:isPlaying={isPagePlaying.has($SPage.params.slug) && $queue?.length > 0 && $queuePosition === idx}
	on:click={handleClick}
	on:pointerenter={(e) => {
		isHovering = true;
	}}
	on:pointerleave={() => {
		isHovering = false;
	}}
	on:pointerenter={(e) => {
		if (parent && parent.contains(e.target)) isHovering = true;
	}}
	draggable={true}
	on:dragstart
	on:drop|preventDefault
	on:dragover|preventDefault={() => {}}
	on:dragenter={() => dispatch("hovering", { idx })}
	on:dragend={() => dispatch("notHovering", null)}
	on:mouseenter|capture={(e) => {
		if (parent && parent.contains(e.target)) isHovering = true;
	}}
	on:pointerleave={(e) => {
		if (parent && parent.contains(e.target)) {
			isHovering = true;
		}
		isHovering = false;
	}}
>
	<div class="index">
		<span class:hidden={isPlaying !== true && isHovering !== true}>
			<!--#9990a0-->
			<Icon name="play-player" color="inherit" size="1.5em" />
		</span>
		<span class:hidden={isPlaying !== false || isHovering !== false}>
			{idx + 1}
		</span>
	</div>
	<div class="metadata">
		{#if Array.isArray(item?.thumbnails) && item.thumbnails.length !== 0}
			<div class="thumbnail">
				<img
					loading="lazy"
					src={item.thumbnails?.[0]?.url}
					width={item.thumbnails?.[0]?.width}
					height={item.thumbnails?.[0]?.height}
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
	{#if isHovering || width < 640}
		<div class="length" tabindex="0" on:focus={() => (isHovering = true)}>
			<PopperButton tabindex="0" items={DropdownItems} />
		</div>
	{:else}
		<span class="length" class:hidden={!item?.length ? true : false}>{(item?.length?.text ?? item.length) || ""}</span>
	{/if}
</article>

<style src="./index.scss" lang="scss">
</style>
