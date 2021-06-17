<script>
	import lazy from '$lib/lazy'
	import { trendingHandler } from '$lib/js/indexUtils'
	import Loading from '$lib/Loading.svelte'
	import { continuation, currentMix, key } from '$lib/stores/stores'
	import { fade } from 'svelte/transition'
	import Dropdown from './../../Dropdown.svelte'
	import { goto } from '$app/navigation'
	import Icon from '$lib/Icon.svelte'

	import { addToQueue } from '$lib/utils'
	import { clickOutside } from '$lib/js/clickOutside'
	export let section
	export let index
	export let item
	let hovering
	let isLoading = false
	let loading = isLoading ? true : false
	let showing = false
	let menuToggle = showing ? true : false
</script>

<div class="item">
	<section
		class="item"
		on:mouseover={() => {
			hovering = true
		}}
		on:mouseleave={() => {
			hovering = false
			menuToggle = false
		}}
		transition:fade|local
		bind:this={section[index]}>
		<div
			class="clickable"
			on:click={() => {
				if (!loading) {
					trendingHandler(item).then(() => {
						loading = !loading
					})
					key.set(0)
					loading = !loading
				}
			}}>
			<div class="img">
				{#if loading}
					<Loading />
				{/if}
				<!-- svelte-ignore a11y-missing-attribute -->
				<div class="container">
					<img
						transition:fade|local
						type="image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
						data-src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCI+PGRlZnM+PHBhdGggZD0iTS02LjU0LTUuNjFoNTEydjUxMmgtNTEydi01MTJ6IiBpZD0icHJlZml4X19hIi8+PC9kZWZzPjx1c2UgeGxpbms6aHJlZj0iI3ByZWZpeF9fYSIgb3BhY2l0eT0iLjI1IiBmaWxsPSIjMjIyIi8+PC9zdmc+"
						use:lazy={{
							src: item.thumbnails[0].url
						}} />
				</div>
			</div>
			<div class="cont">
				<div class="text-wrapper">
					<h6 class="title">
						{item.title}
					</h6>
					{#each item.subtitle as sub}
						<span>{sub.text}</span>
					{/each}
				</div>
			</div>
		</div>
		{#if hovering}
			<div class="menu">
				<Dropdown bind:show={menuToggle}>
					<div slot="content">
						<div
							class="dd-item"
							on:click={() => {
								goto(
									`/artist?id=${item.subtitle[0].navigationEndpoint.browseEndpoint.browseId}`
								)
							}}
							href={`/artist?id=${item.subtitle[0].navigationEndpoint.browseEndpoint.browseId}`}>
							<Icon name="artist" size="1.5em" />
							<div class="dd-text">View Artist</div>
						</div>
						<div
							class="dd-item"
							on:click={async () => {
								if (index !== $key) {
									let mixList = $currentMix.list
									let length = await addToQueue(item.videoId)
									let next = {
										continuation: mixList[0].continuation,
										autoMixList: item.playlistId,
										artistId:
											item.subtitle[0].navigationEndpoint.browseEndpoint
												.browseId,
										id: $key + 1,
										videoId: item.videoId,
										title: item.title,
										artist: item.subtitle[0].text,
										thumbnail: item.thumbnails[0].url,
										length: length
									}
									mixList.splice($key + 1, 0, next)
									console.log(mixList)
								}
							}}>
							<Icon name="queue" size="1.5rem" />
							<div class="dd-text">Add to Queue</div>
						</div>
					</div>
				</Dropdown>
			</div>
		{/if}
	</section>
</div>

<style lang="scss">
	.item {
		position: relative;
		padding-bottom: 0.8em;
	}
	.menu {
		position: absolute;
		right: 0;
		top: 50%;
		padding-top: 0.125rem;
		padding-right: 0.625rem;
	}
	.title {
		cursor: pointer;
	}
	#scrollItem {
	}
	.left,
	.right {
		> .feather,
		.feather-chevron-left,
		.feather-chevron-right {
			width: 1.25rem;
			height: 1.25rem;
			stroke: black;
			stroke-width: 5;
			stroke-linecap: round;
			stroke-linejoin: round;
			fill: currentColor;
		}
		position: absolute;
		color: white;
		z-index: 50;
		top: 50%;
		padding: 1rem;
		border-radius: 50%;

		background: #0a0a0a6b;
		transform: translateY(-50%);
		transition: cubic-bezier(0.23, 1, 0.32, 1) 0.12s all;

		&:hover {
			background: #0a0a0abd;

			transition: cubic-bezier(0.23, 1, 0.32, 1) 0.12s all;
		}
	}
	.left {
		left: 0;
	}
	.right {
		right: 0;
	}
	main {
		margin: 1.25rem;
	}
	.test {
		background-color: theme-color('dark', 'top');
	}
	.section {
		-webkit-overflow-scrolling: touch;
		position: relative;

		@include scrim(#221e2b42, 'to top', 0.65);
		border-radius: 0.8rem;
		/* width: 100%; */
		/* max-width: 100%; */
		-ms-scroll-snap-type: x mandatory;
		scroll-snap-type: x mandatory;
		/* overflow: scroll;*/
	}

	.header {
		padding: 0.5em;
		// position: sticky;
		// /* top: 0; */
		// width: 100%;
		// left: 0;
		/* display: flow-root; */
		/* right: 0; */
	}
	.scroll {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		height: auto;
		/* overflow-y: clip; */
		display: grid;
		// grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		// grid-auto-rows: 1fr;
		grid-auto-flow: column;
		/* flex-direction: row; */
		overflow-x: scroll;
		width: auto;
		/* flex: 1 1 auto; */
		box-shadow: 0 0 10px 3px rgb(0 0 0 / 13%),
			inset -2px -2px 20px 0 hsl(0deg 0% 57% / 10%),
			inset 0 0 11px 3px rgb(46 56 56 / 9%);
		border-radius: inherit;
		overflow-anchor: none;
		-ms-scroll-snap-type: x mandatory;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
	}
	.text-inline {
		display: inline-flex;
		align-items: center;
	}
	section {
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		margin-top: 1.5rem;
		margin-bottom: 0rem;
		display: block;
		content: '';
		::before {
			display: block;
		}
		/* You could reduce this expression with a preprocessor or by doing the math. I've kept the longer form in `calc()` to make the math more readable for this demo. */
	}
	section.item {
		scroll-snap-align: start;
		min-height: 16.75rem;
		height: auto;

		width: 16rem;
	}

	.img {
		// position: relative;
		/* width: 100%; */
		/* height: clamp(10rem,12.5rem,15rem); */
		/* min-width: 100%; */
		// box-shadow: 0 0 1rem 0.5rem rgb(0 0 0 / 36%);
		position: relative;
		display: block;
		position: relative;
		display: block;
		width: auto;
		min-width: 12.5rem;
		.container {
			display: flex;
			align-items: center;
			width: 100%;
			height: 100%;
			background: #0d0d0f57;
			img {
				// height: inherit;
				// -o-object-fit: scale-down;
				// object-fit: scale-down;
				// // max-height: 12rem;
				// width: 100%;
				// max-width: 18rem;
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
	}
	.cont {
		margin-top: 1em;
		padding-right: 1em;
	}
	.scroll-container {
	}
</style>
