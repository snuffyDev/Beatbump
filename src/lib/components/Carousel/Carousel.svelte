<script lang="ts">
	import CarouselItem from './CarouselItem.svelte'
	export let setTitle = ''
	export let items = []
	export let type = ''
	export let isBrowse = false
	import lazy from '$lib/lazy'
	import { fade } from 'svelte/transition'
	import { goto } from '$app/navigation'
	let isHidden
	let section = []
	let arr = items
	let carousel
</script>

<div class="header">
	<h1>
		{setTitle}
	</h1>
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
	.item {
		padding-bottom: 2em;
	}
	.details {
		display: flex;
		align-items: center;
		margin-top: 3px;
		display: block;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.title {
		cursor: pointer;

		text-overflow: ellipsis, 2px;
		display: inline-block;
	}
	.section {
		-webkit-overflow-scrolling: touch;
		position: relative;

		margin-bottom: 1.5rem;

		border-radius: 0.5em;
		/* width: 100%; */
		/* max-width: 100%; */
		/* overflow: scroll;*/
	}
	.header {
		padding: 0.4em 0.4em 0.2em;
		margin-bottom: 0.4em;

		letter-spacing: -0.01em;
	}

	.scroll {
		background: linear-gradient(
			180deg,
			rgb(18 15 24 / 8%) 1%,
			rgb(20 17 29 / 14%) 10%,
			rgb(31 26 43 / 18%) 18%,
			rgb(22 18 30 / 31%) 27%,
			rgb(33 29 47 / 23%) 37%,
			rgb(30 26 42 / 28%) 50%,
			rgb(42 35 64 / 22%) 62%,
			rgb(33 29 46 / 38%) 70%,
			rgb(41 33 57 / 34%) 78%,
			rgb(27 22 39 / 50%) 82%,
			rgb(49 40 66 / 37%) 100%
		);
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
		scroll-snap-type: x proximity;
		// /* flex: 1 1 auto; */
		// box-shadow: 0 0 10px 3px rgb(0 0 0 / 13%),
		// 	inset -2px -2px 20px 0 hsl(0deg 0% 57% / 10%),
		// 	inset 0 0 11px 3px rgb(46 56 56 / 9%);

		border-radius: inherit;
		overflow-anchor: none;
		-webkit-overflow-scrolling: touch;
	}

	section {
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		padding-top: 1.5rem;
		margin-bottom: 0;
		display: block;
		cursor: pointer;
		content: '';

		::before {
			display: block;
		}
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	.item {
		scroll-snap-align: start;
		min-height: 16.75rem;
		height: auto;
		width: 16rem;
	}

	.img {
		border-radius: var(--md-radius);
		height: auto;
		width: 100%;
		.container {
			position: relative; /* If you want text inside of it */

			cursor: pointer;
			width: 100%;
			position: relative;
			padding-top: 100%; /* 1:1 Aspect Ratio */
			&::before {
				position: absolute;
				content: '';
				top: 0;
				right: 0;

				bottom: 0;
				left: 0;
				background: linear-gradient(rgba(0, 0, 0, 0.473), rgba(0, 0, 0, 0.473));

				transition: opacity cubic-bezier(0.29, -0.3, 0.7, 0.95) 0.15s;
				opacity: 0.001;
				z-index: 1;
			}
			&:hover::before {
				// transition: all cubic-bezier(0.42, 0.16, 0.58, 0.8) 0.2s !important;
				background: linear-gradient(rgba(0, 0, 0, 0.534), rgba(0, 0, 0, 0.534));
				opacity: 0.6;
				z-index: 1;
			}
			img {
				width: 100%;
				height: auto;

				position: absolute;
				top: 0;
				right: 0;
				border-radius: var(--sm-radius);

				bottom: 0;
				left: 0;
			}
		}
	}
	.cont {
		display: flex;
		flex-direction: column;
		margin-top: 0.8571rem;
		padding-right: 1em;
	}
</style>
