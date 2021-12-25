<script lang="ts">
	import Icon from '$components/Icon/Icon.svelte'
	import { currentId, isPagePlaying, key } from '$stores/stores'
	import { createEventDispatcher } from 'svelte'
	import list from '$lib/stores/list'
	export let item: Song
	export let index
	export let page
	export let parentPlaylistId = ''
	export let ctx = {}
	export let send
	export let receive
	export let dragTargetIndex
	import { getContext } from 'svelte'
	import type { Item, Song } from '$lib/types'
	const { pageId } = getContext(ctx)
	const dispatch = createEventDispatcher()
	function dispatchPlaying() {
		dispatch('pagePlaying', {
			isPlaying: true
		})
	}
	let isHovering = false
	let parent
</script>

<div
	bind:this={parent}
	class="item"
	class:playing={dragTargetIndex == index &&
		$isPagePlaying == pageId &&
		item.videoId == $currentId}
	draggable={true}
	on:dragstart
	on:drop|preventDefault
	on:dragover|preventDefault={() => {}}
	on:dragenter={() => dispatch('hovering', index)}
	on:dragend={() => dispatch('notHovering', null)}
	on:mouseenter|capture={(e) => {
		if (parent && parent.contains(e.target)) isHovering = true
	}}
	on:mouseleave|capture={(e) => {
		// isHovering = false
		if (parent && parent.contains(e.target)) {
			isHovering = true
		}
		isHovering = false
	}}
	on:click={async () => {
		// @ts-ignore
		if (page == 'playlist') {
			key.set(index)
			// console.log('key: ' + $key, item.playlistId)
			await list.startPlaylist(item.playlistId, index)
			// await list.initList({
			// 	videoId: item.videoId,
			// 	playlistId: parentPlaylistId,
			// 	keyId: $key,
			// 	config: { playerParams: item?.playerParams, type: item.musicVideoType }
			// })
		} else if (page == 'library') {
			key.set(index)
			dispatch('initLocalList', index)
		} else {
			key.set(index)
			// console.log(item, item.videoId)
			await list.initList({
				videoId: item.videoId,
				playlistId: item.playlistId,
				keyId: $key,
				config: { playerParams: item?.playerParams, type: item?.musicVideoType }
			})
		}
		dispatchPlaying()
	}}
>
	<div class="number">
		<span class:hidden={!isHovering}>
			<svelte:component this={Icon} name="play-player" size="1.5em" />
		</span>

		<span class:hidden={isHovering}>{index + 1}</span>
	</div>
	<div class="itemInfo">
		<div class="thumbnail">
			<img
				loading="lazy"
				src={item.thumbnails[0].url}
				width={item.thumbnails[0].width}
				height={item.thumbnails[0].height}
				alt="thumbnail"
			/>
		</div>
		<div class="column">
			<div class="item-title">
				{item?.title}
				{#if item.explicit}
					<span class="explicit">
						{item.explicit ? 'E' : ''}
					</span>
				{/if}
			</div>
			<div class="artists secondary">
				{#if item.artistInfo?.artist}
					{#each item?.artistInfo?.artist as subtitle}
						<span class="artist">{subtitle.text}</span>
					{/each}
				{/if}
			</div>
		</div>
	</div>
	<span class="length" class:hidden={!item?.length ? true : false}
		>{item?.length}</span
	>
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
		margin-right: 1rem;
		width: 100%;
	}
	.artists {
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
	.item-wrapper {
	}

	.itemInfo {
		display: inline-flex;
		align-self: center;
		line-height: 1.6;
		margin-right: 1.8rem;
		grid-area: m;
		flex-direction: row;
		flex: 1 0;
		pointer-events: none;
		.item-title {
			font-weight: 500;
		}
		.artist {
			font-family: 'Commissioner', sans-serif;
			font-weight: 400;
		}
	}
	.item {
		cursor: pointer;
		height: 5rem;
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
		content: '';
		padding-top: calc(100% * 2 / 3);
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	.item {
		display: grid;
		height: 100%;
		align-content: center;
		grid-template-areas: 'm r';
		grid-template-columns: 1fr auto;

		-webkit-user-select: none;
		gap: 0.8rem;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		flex: 0 1 auto;
		height: auto;
		border-bottom: 0.0001605rem solid hsl(240deg 0% 55% / 34%);
		width: 100%;
		padding: 0.4rem 1.5rem 0.4rem 0.8rem;
		@media screen and (min-width: 640px) {
			grid-template-areas: 'c m r';
			grid-template-columns: 2rem 1fr auto;
		}
		@media (hover: hover) {
			&:hover {
				background: lighten(#57575831, 1%);
				transition: cubic-bezier(0.25, 0.46, 0.45, 0.94) all 0.125s;
				pointer-events: all;
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
			font-size: 1.125rem;
			font-weight: 600;
			grid-area: c;
			text-align: center;
			pointer-events: none;
			opacity: 1;
			/* margin-right: 1rem; */
			align-self: center;
			place-self: center;
			justify-self: center;
			display: inline-grid;
			justify-items: center;
			visibility: visible;
		}
	}
</style>
