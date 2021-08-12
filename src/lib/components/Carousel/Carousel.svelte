<script lang="ts">
	import type { CarouselHeader } from '$lib/types'

	import CarouselItem from './CarouselItem.svelte'
	export let header: CarouselHeader
	export let items = []
	export let type = ''
	export let isBrowseEndpoint

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
	{#if header.browseId}<a
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
					{isBrowseEndpoint}
					index={i}
					bind:section />
			{:else if type == 'artist'}
				<CarouselItem
					type="artist"
					aspectRatio={item.aspectRatio}
					{isBrowseEndpoint}
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
	@import '../../../global/scss/components/_carousel';
	.section {
		-webkit-overflow-scrolling: touch;
		position: relative;

		margin-bottom: 2rem;

		border-radius: 0.5em;
		@media screen and (min-width: 960px) {
			margin-bottom: 3rem;
		}
	}

	.scroll {
		background: #453d5d2e;
		grid-column-gap: 0.5rem;
		overflow-y: hidden;
		height: auto;

		display: grid;

		grid-auto-flow: column;

		overflow-x: scroll;
		grid-template-columns: repeat(auto, 1fr);
		padding-top: 1rem;
		width: auto;
		scroll-snap-type: x mandatory;
		border-radius: inherit;
		overflow-anchor: none;
		-webkit-overflow-scrolling: touch;
	}
</style>
