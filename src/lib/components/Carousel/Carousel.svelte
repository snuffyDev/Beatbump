<script lang="ts">
	import CarouselItem from './CarouselItem.svelte'
	export let header: CarouselHeader
	export let items = []
	export let type = ''
	export let isBrowse = false
	import lazy from '$lib/lazy'
	import { fade } from 'svelte/transition'
	import { goto } from '$app/navigation'
	import type { CarouselHeader } from '$lib/types'
	let isHidden
	let section = []
	let arr = items
	let carousel
	let st = ''
</script>

<div class="header">
	<h1>
		{header.title}
	</h1>
	{#if !isBrowse && header.browseId}<a
			href={header.browseId?.includes('VLP')
				? `/playlist?list=${header?.browseId}`
				: `/trending/new/${header?.browseId}${
						header?.params ? `?params=${header?.params}` : ''
				  }${header?.itct ? `&itct=${encodeURIComponent(header?.itct)}` : ''}`}
			><small>See All</small></a
		>{/if}
</div>
<div class="section">
	<div class="scroll" id="scrollItem" bind:this={carousel}>
		<!-- {#each arr as item, index} -->
		{#each items as item, i}
			{#if type == 'trending'}
				<!-- {JSON.stringify(item[1], title, thumbnail, subtitle)} -->
				<CarouselItem
					type="trending"
					aspectRatio={item.aspectRatio}
					{item}
					index={i}
					bind:section />
			{:else if type == 'artist'}
				<CarouselItem
					type="artist"
					aspectRatio={item.aspectRatio}
					{isBrowse}
					{item}
					index={i}
					bind:section />
			{:else if type == 'new'}
				<!-- content here -->
				<CarouselItem
					type="new"
					aspectRatio={item.aspectRatio}
					{item}
					index={i}
					bind:section />
			{/if}
		{/each}
		<!-- {/each} -->
	</div>
</div>

<style lang="scss">
	a small {
		font-size: 0.95rem;
		font-weight: 700;
		font-variant-caps: all-petite-caps;
		letter-spacing: 0.02rem;
		transition: ease-in-out color 75ms;
	}
	.section {
		-webkit-overflow-scrolling: touch;
		position: relative;

		margin-bottom: 2rem;

		border-radius: 0.5em;
		@media screen and (min-width: 960px) {
			margin-bottom: 3rem;
		}
		/* width: 100%; */
		/* max-width: 100%; */
		/* overflow: scroll;*/
	}
	.header {
		display: block;
		font-weight: 600;
		letter-spacing: -0.05rem;
		margin-bottom: 0.5rem;
		padding: 0.4rem 0.4rem 0.2rem;

		h1 {
			margin-right: 0.3em;
			display: inline-flex;
			margin-bottom: 0.7rem;
			font-weight: 600;
			letter-spacing: -0.05rem;
			@media screen and (min-width: 800px) {
				font-size: 2.125em;
			}
		}
	}

	.scroll {
		background: #453d5d2e;
		grid-column-gap: 0.5rem;
		overflow-y: hidden;
		height: auto;
		/* overflow-y: clip; */
		display: grid;
		// grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		// grid-auto-rows: 1fr;
		grid-auto-flow: column;
		/* flex-direction: row; */
		overflow-x: scroll;
		grid-template-columns: repeat(auto, 1fr);

		width: auto;
		scroll-snap-type: x mandatory;
		// /* flex: 1 1 auto; */
		// box-shadow: 0 0 10px 3px rgb(0 0 0 / 13%),
		// 	inset -2px -2px 20px 0 hsl(0deg 0% 57% / 10%),
		// 	inset 0 0 11px 3px rgb(46 56 56 / 9%);

		border-radius: inherit;
		overflow-anchor: none;
		-webkit-overflow-scrolling: touch;
	}
</style>
