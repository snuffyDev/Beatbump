<script lang="ts">
	import type { CarouselHeader } from '$lib/types'

	import CarouselItem from './CarouselItem.svelte'
	import Icon from '$components/Icon/Icon.svelte'
	// import { tweened } from 'svelte/motion'

	export let header: CarouselHeader
	export let items = []
	export let type = ''
	export let isBrowseEndpoint
	// import { quartInOut } from 'svelte/easing'
	// const tween = tweened(0, {
	// 	easing: quartInOut
	// })
	let isHidden
	let section = []
	let arr = splitArray(items, 5)
	function splitArray(flatArray, numCols) {
		const newArray = []
		for (let c = 0; c < numCols; c++) {
			newArray.push([])
		}
		for (let i = 0; i < flatArray.length; i++) {
			const mod = i % numCols
			newArray[mod].push(flatArray[i])
		}
		return newArray
	}
	let idx = 0
	// $: console.log(group.length, group)
	let carousel
	let group = []
	// let rectValue: any = 0
	// $: if (carousel) carousel.scrollLeft += $tween
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
	<div
		class="left"
		on:click={() => {
			if (!arr || idx == 0) return
			idx--
			let child = group[idx].children
			let rect = child[0].getBoundingClientRect()

			carousel.scrollLeft += rect.left
			// console.log(rect.left)
			// tween.set(rect.left)
			// carousel.scrollLeft += $tween
		}}
	>
		<Icon name="chevron-left" size="1.5em" />
	</div>
	<div
		class="right"
		on:click={() => {
			if (!arr || idx == group.length - 1) return
			idx++
			let child = group[idx].children
			let rect = child[0].getBoundingClientRect()
			// console.log(rect.left)

			// tween.set(rect.left)
			carousel.scrollLeft += rect.left
		}}
	>
		<Icon name="chevron-right" size="1.5em" />
	</div>
	<div class="scroll" id="scrollItem" bind:this={carousel}>
		{#each arr as item, index}
			<div
				class="c-group"
				bind:this={group[index]}
				style="display:inline-flex;"
			>
				{#each item as item, i}
					{#if type == 'trending'}
						<!-- {JSON.stringify(item[1], title, thumbnail, subtitle)} -->
						<CarouselItem
							type="trending"
							aspectRatio={item.aspectRatio}
							{item}
							{isBrowseEndpoint}
							index={i}
							bind:section
						/>
					{:else if type == 'artist'}
						<CarouselItem
							type="artist"
							aspectRatio={item.aspectRatio}
							{isBrowseEndpoint}
							{item}
							index={i}
							bind:section
						/>
					{:else if type == 'new'}
						<!-- content here -->
						<CarouselItem
							type="new"
							aspectRatio={item.aspectRatio}
							{item}
							index={i}
							bind:section
						/>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@import '../../../global/stylesheet/components/_carousel';
	.c-group {
		&:last-child {
			.container.carouselItem:last-child {
				padding-right: 1rem;
			}
		}
	}
	.left,
	.right {
		position: absolute;
		top: 40%;
		z-index: 1;
		bottom: 0;
		pointer-events: all;

		background: rgba(233, 233, 233, 0.384);
		// border: rgba(0, 0, 0, 0.171) 0.01px solid;
		transition: ease-in-out 75ms background;
		height: 3rem;
		box-shadow: 0 0 0.12em 0.1em #11111141;
		color: #111111b0;
		border-radius: 50%;
		padding: 0;
		width: 3rem;
		display: inline-flex !important;
		align-items: center;
		justify-content: center;
		&:hover {
			background: rgb(233, 233, 233);
			color: #111111e0;
		}
		@media screen and (max-width: 640px) {
			display: none !important;
			visibility: hidden;
		}
	}
	.left {
		left: -1.5em;
	}
	.right {
		right: -1.5em;
	}
	.section {
		-webkit-overflow-scrolling: touch;
		position: relative;

		margin-bottom: 2rem;

		border-radius: 0.5em;
		@media screen and (min-width: 960px) {
			margin-bottom: 3rem;
		}
	}
	.hidden {
		display: none !important;
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
