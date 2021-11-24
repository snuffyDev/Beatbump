<script lang="ts">
	import type { CarouselHeader } from '$lib/types'

	import CarouselItem from './CarouselItem.svelte'
	import Icon from '$components/Icon/Icon.svelte'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	// import { tweened } from 'svelte/motion'

	export let header: CarouselHeader
	export let items = []
	export let type = ''
	export let kind = 'normal'
	export let isBrowseEndpoint
	// import { quartInOut } from 'svelte/easing'
	// const tween = tweened(0, {
	// 	easing: quartInOut
	// })
	let isHidden
	let section = []
	let arr = []
	let moreOnLeft, moreOnRight
	if (items.length > 3) {
		arr = [...splitArray(items, 5)]
	} else {
		arr = [[...items]]
	}
	let frame
	function scrollHandler(timestamp) {
		if (!carousel) return
		moreOnLeft = carousel.scrollLeft < 15 ? false : true
		moreOnRight =
			carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 15
				? true
				: false
		frame = requestAnimationFrame(scrollHandler)
	}
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
	let carousel: HTMLDivElement

	let group = []
	onMount(() => {
		if (carousel !== undefined) {
			moreOnLeft = carousel.scrollLeft < 15 ? false : true
			moreOnRight =
				carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth
					? true
					: false

			carousel.addEventListener('scroll', () =>
				window.requestAnimationFrame(scrollHandler)
			)
		}

		return () => {
			carousel.removeEventListener('scroll', () =>
				window.cancelAnimationFrame(frame)
			)
		}
	})
	// let rectValue: any = 0
	// $: if (carousel) carousel.scrollLeft += $tween
	const isArtistPage = $page.path.includes('/artist/')
	let notArtist = header.browseId?.includes('VLP')
		? `/playlist?list=${header?.browseId}`
		: `/trending/new/${header?.browseId}${
				header?.params ? `?params=${header?.params}` : ''
		  }${header?.itct ? `&itct=${encodeURIComponent(header?.itct)}` : ''}`
	let href =
		header?.browseId && isArtistPage
			? `/artist/releases?browseId=${header?.browseId}&params=${header?.params}&itct=${header?.itct}`
			: notArtist

	// $: console.log(moreOnLeft, moreOnRight)
</script>

<div class="header">
	{#if header?.subheading}
		<p class="subheading">{header?.subheading}</p>
	{/if}
	<h1>
		{header.title}
	</h1>
	{#if !isArtistPage && header.browseId}<a
			style="white-space:pre; display: inline-block;"
			{href}><small>See All</small></a
		>{:else if isArtistPage && header.browseId && !header.title.includes('Videos')}
		<a style="white-space:pre; display: inline-block;" {href}
			><small>See All</small></a
		>
	{:else if isArtistPage && header.title.includes('Videos')}
		<a
			style="white-space:pre; display: inline-block;"
			href={`/playlist?list=${header?.browseId}`}><small>See All</small></a
		>
	{/if}
</div>
<div class="section">
	<div
		class="left"
		class:hidden={!moreOnLeft}
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
		class:hidden={!moreOnRight}
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

	<div
		class="scroll"
		id="scrollItem"
		on:scroll={scrollHandler}
		bind:this={carousel}
	>
		{#each arr as item, index}
			<div class="c-group" bind:this={group[index]}>
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
					{:else if type == 'artist' || type == 'home'}
						<CarouselItem
							{type}
							{kind}
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
	.subheading {
		margin-bottom: 0;
		color: rgb(175, 175, 175);
		font-weight: 500;
	}
	.c-group {
		display: inline-flex;
		padding-bottom: 1.8rem;
		// padding-left: 0.5rem;
		scroll-snap-align: start;
		// padding-right: 0.5rem;

		// gap: 1.5rem;
		&:last-child {
			padding-right: 0.5rem;
		}
		&:first-child {
			padding-left: 0.5rem;
		}
		// &:last-child {
		// 	.container.carouselItem:last-child {
		// 		padding-right: 1rem;
		// 	}
		// }
	}
	.left,
	.right {
		position: absolute;
		top: 40%;
		z-index: 1;
		bottom: 0;
		pointer-events: all;
		cursor: pointer;

		background-color: hsl(0deg 0% 91% / 79%);
		// border: rgba(0, 0, 0, 0.171) 0.01px solid;
		transition: linear 75ms background-color;
		height: 3rem;
		box-shadow: 0 0 0.12em 0.1em #11111141;
		color: #111111b0;
		border-radius: 50%;
		opacity: 1;
		padding: 0;
		width: 3rem;
		display: inline-flex !important;
		align-items: center;
		justify-content: center;
		&:hover {
			background-color: rgb(233, 233, 233);
			color: #111111e0;
		}
		&:active {
			background-color: rgb(223, 223, 223);
			box-shadow: 0 0 0.12em 0.1em #11111141, 0 0 0.1em 0.125em #7a7a7a85 inset;
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

		border-radius: var(--sm-radius);
		@media screen and (min-width: 960px) {
			margin-bottom: 3rem;
		}
	}
	.hidden {
		opacity: 0;
		visibility: hidden;
	}
	.scroll {
		background: #453d5d2e;

		// grid-column-gap: 0.5rem;
		/* overflow-y: hidden; */
		// overflow-x: hidden;
		height: auto;
		display: flex;
		/* grid-auto-flow: column; */
		overflow-x: scroll;
		grid-template-rows: 1fr;
		padding-top: 1rem;
		width: auto;
		// gap: 1.25rem;
		-ms-scroll-snap-type: x mandatory;
		scroll-snap-type: x mandatory;
		border-radius: inherit;
		overflow-anchor: none;
		-webkit-overflow-scrolling: touch;
		flex-direction: row;
		flex-wrap: nowrap;
		scrollbar-gutter: 0.833333rem;
		scrollbar-width: thin;
		scrollbar-color: #c7c7c7 #5e5e5e2f;

		&::-webkit-scrollbar {
			width: 0;
			height: 0;
		}

		&::-webkit-scrollbar-track {
			background: #5e5e5e2f;
			border-radius: 0.625rem;
			height: 0;
			width: 0%;
			background-clip: content-box;
			border-radius: 0.833333rem;
			border: transparent solid 0.0983333rem;
		}

		&::-webkit-scrollbar-thumb {
			background-color: #424242c4;
			border-radius: 0;
			width: 0;
			scrollbar-width: 0;
			border: 0 solid #b8b8b800;
			background-clip: content-box;
		}
	}
</style>
