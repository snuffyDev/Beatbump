<script lang="ts">
	import Icon from "$components/Icon/Icon.svelte";
	import { currentId, isPagePlaying, key } from "$stores/stores";
	import { createEventDispatcher, tick } from "svelte";
	import list from "$lib/stores/list";
	export let item: Item;
	export let index;
	export let parentPlaylistId = "";
	export let page;

	export let send;
	export let receive;
	export let dragTargetIndex;
	export let ctx = {};
	import { getContext } from "svelte";
	import type { Item } from "$lib/types";
	import PopperButton from "$lib/components/Popper/PopperButton.svelte";
	import { notify } from "$lib/utils";
	import db from "$lib/db";
	import { goto } from "$app/navigation";
	const { pageId } = getContext(ctx);
	const dispatch = createEventDispatcher();

	const dispatchPlaying = () =>
		dispatch("pagePlaying", {
			isPlaying: true
		});

	async function handleClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.nodeName.match("A")) return;
		// @ts-ignore
		if (page == "playlist") {
			key.set(index);
			await list.initPlaylistSession({ playlistId: item.playlistId, index });
		} else if (page == "library") {
			key.set(index);
			dispatch("initLocalList", index);
		} else {
			key.set(index);
			// console.log(item, item.videoId)
			await list.initAutoMixSession({
				videoId: item.videoId,
				playlistId: parentPlaylistId,
				keyId: $key,
				config: { playerParams: item?.playerParams, type: item?.musicVideoType }
			});
		}
		dispatchPlaying();
	}
	let DropdownItems = [
		{
			text: "View Artist",
			icon: "artist",
			action: async () => {
				goto(`/artist/${item.artistInfo.artist[0].browseId}`);
				await tick();
				window.scrollTo({
					behavior: "smooth",
					top: 0,
					left: 0
				});
			}
		},
		{
			text: "Remove from Playlist",
			icon: "x",
			action: async () => {
				const promise = await db.deleteSongFromPlaylist(
					item.videoId,
					parentPlaylistId
				);
				// console.log(promise, item, parentPlaylistId);
				dispatch("change");
			}
		},
		{
			text: "Favorite",
			icon: "heart",
			action: () => {
				db.setNewFavorite(item);
			}
		},
		{
			text: "Share",
			icon: "share",
			action: async () => {
				let shareData = {
					title: item.title,

					url: `https://beatbump.ml/listen?id=${item.videoId}`
				};
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_PLAYLIST")) {
					shareData = {
						title: item.title,

						url: `https://beatbump.ml/playlist/${item.endpoint?.browseId}`
					};
				}
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_ALBUM")) {
					shareData = {
						title: item.title,

						url: `https://beatbump.ml/release?id=${item.endpoint?.browseId}`
					};
				}
				if (item.endpoint?.pageType?.includes("MUSIC_PAGE_TYPE_ARTIST")) {
					shareData = {
						title: item.title,
						text: `${item.title} on Beatbump`,
						url: `https://beatbump.ml/artist/${item.endpoint?.browseId}`
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
			}
		}
	];

	let isHovering = false;
	let parent;
	let width = 740;
</script>

<svelte:window bind:innerWidth={width} />
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
	bind:this={parent}
	class="item"
	class:playing={$isPagePlaying == pageId && item.videoId == $currentId}
	on:pointerenter={(e) => {
		if (parent && parent.contains(e.target)) isHovering = true;
	}}
	draggable={true}
	on:dragstart
	on:drop|preventDefault
	on:dragover|preventDefault={() => {}}
	on:dragenter={() => dispatch("hovering", index)}
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
	on:click={handleClick}
>
	<div class="number">
		<span class:hidden={!isHovering}>
			<svelte:component this={Icon} name="play-player" size="1.5em" />
		</span>

		<span class:hidden={isHovering}>{index + 1}</span>
	</div>
	<div class="itemInfo">
		{#if item.thumbnails.length !== 0}
			<div class="thumbnail">
				<img
					loading="lazy"
					src={item.thumbnails[0]?.url}
					width={item.thumbnails[0]?.width}
					height={item.thumbnails[0]?.height}
					alt="thumbnail"
					decoding="async"
				/>
			</div>
		{/if}
		<div class="column">
			<div class="item-title">
				{item?.title}
				{#if item.explicit}
					<span class="explicit">
						{item.explicit ? "E" : ""}
					</span>
				{/if}
			</div>
			<div class="artists secondary">
				{#if item.artistInfo?.artist}
					{#each item?.artistInfo?.artist as subtitle}
						<a
							class="artist"
							href={`/artist/${subtitle.browseId}`}
							sveltekit:prefetch>{subtitle.text}</a
						>
					{/each}
				{/if}
			</div>
		</div>
	</div>
	{#if isHovering || width < 640}
		<div class="length">
			<PopperButton tabindex="0" items={DropdownItems} />
		</div>
	{:else}
		<span class="length" class:hidden={!item?.length ? true : false}
			>{(item?.length?.text ?? item.length) || ""}</span
		>
	{/if}
</div>

<!-- markup (zero or more items) goes here -->
<style lang="scss">
	.column {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.thumbnail {
		max-width: 3.5rem;
		aspect-ratio: 1/1;
		/* margin-right: 1rem; */
		max-height: 3.5rem;
		width: 100%;
	}

	.hidden {
		display: none;
		visibility: hidden;
	}
	.length {
		align-self: center;
		// margin-right: 1.5rem;
		grid-area: r;
	}
	.itemInfo {
		display: flex;
		align-self: center;
		/* padding-right: 1.8rem; */
		grid-area: m;
		flex-direction: row;
		flex: none;
		gap: 0.7em;
		.item-title {
			font-weight: 500;
			max-width: calc(100vw - 22ch);
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: nowrap;
			display: block;
		}
		.artist {
			font-family: "Commissioner", sans-serif;
			font-weight: 400;
			font-size: 0.9em;
		}
	}
	.item {
		cursor: pointer;
		height: 4.25rem;
	}

	.text-title {
		&:hover {
			text-decoration: underline solid white 0.0714rem;
			cursor: pointer;
		}
	}
	img {
		width: auto;
		height: auto;
		width: auto;
		height: auto;
		aspect-ratio: inherit;
		object-fit: contain;
	}
	img::before {
		display: block;
		content: "";
		padding-top: calc(100% * 2 / 3);
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	.item {
		display: grid;
		align-content: center;
		grid-template-areas: "m r";
		grid-template-columns: 1fr auto;

		-webkit-user-select: none;
		gap: 0.8rem;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		flex: 0 1 auto;
		min-height: 3rem;
		border-bottom: 0.0001605rem solid hsl(240deg 0% 55% / 34%);
		width: 100%;
		padding: 0.8em 1.5em 0.8em 0.8em;
		@media screen and (min-width: 640px) {
			padding: 0.4rem 1.5rem 0.4rem 0.8rem;
			grid-template-areas: "c m r";
			grid-template-columns: 2rem 1fr auto;
		}
		@media (hover: hover) {
			&:hover {
				background: lighten(#57575831, 1%);
				transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
			}
		}
		&:active:not(.menu) {
			background: lighten(#212225, 5%);
			transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
		}
	}
	.playing {
		background: lighten(#2122254f, 5%);
		transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
	}

	.number {
		display: none;
		visibility: none;
		@media screen and (min-width: 640px) {
			font-weight: 600;
			grid-area: c;
			text-align: center;
			pointer-events: none;
			opacity: 1;
			/* margin-right: 1rem; */
			place-self: center;
			display: grid;
			justify-items: center;
			visibility: visible;
		}
	}
</style>
