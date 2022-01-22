<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	let path;

	export const load: Load = async ({ fetch, stuff }) => {
		const response = await fetch('/trending.json?q=browse');
		const data = await response.json();
		if (!response.ok) {
			return {
				status: response.status,
				error: Error(`Error: ${response.statusText}`)
			};
		}
		path = stuff.page;
		return {
			props: {
				carouselItems: await data
			},
			maxage: 3600,
			status: 200
		};
	};
</script>

<script lang="ts">
	export let carouselItems: ICarousel;

	import Carousel from '$components/Carousel/Carousel.svelte';
	import type { ICarousel } from '$lib/types';
	import Header from '$lib/components/Layouts/Header.svelte';
	// $: console.log(carouselItems)
</script>

<Header
	title="Trending"
	url={path}
	desc="The latest trending songs and releases"
/>
<main>
	<Carousel
		isBrowseEndpoint={false}
		header={carouselItems[2].header}
		items={carouselItems[2].results}
		type="trending"
	/>

	<div class="breakout">
		<div class="box-cont">
			<div class="header">
				<h1>{carouselItems[1].header.title}</h1>
				<a class="link" href="/explore"><small>See All</small></a>
			</div>
			<box>
				<div class="scroll">
					{#each carouselItems[1].results as { color, endpoint: { params }, text }}
						<a
							style="border-left: 0.5rem solid #{color}"
							class="box"
							href="/explore/{params}">{text}</a
						>
					{/each}
				</div>
			</box>
		</div>
	</div>
	<Carousel
		header={carouselItems[3].header}
		items={carouselItems[3].results}
		isBrowseEndpoint={false}
		type="trending"
	/>
	<Carousel
		header={carouselItems[0].header}
		items={carouselItems[0].results}
		type="trending"
		isBrowseEndpoint={true}
	/>
</main>

<style lang="scss">
	@import '../../global/stylesheet/components/_carousel';
	.breakout {
		border-radius: 0.8rem;
		-webkit-overflow-scrolling: touch;
		position: relative;

		margin-bottom: 2rem;

		@media screen and (min-width: 960px) {
			margin-bottom: 3rem;
		}
	}
	.box-cont {
		justify-content: space-around;
	}
	box {
		display: flex;
		width: 100%;
		overflow-x: auto;
		padding: 0.8rem;
		flex-direction: column;
	}
	.scroll {
		display: flex;
		flex-flow: column wrap;
		gap: 0.8rem;
		max-height: 26rem;
	}
	.box {
		margin-bottom: 0.8rem;
		cursor: pointer;
		background: #201e27;
		display: inline-flex;
		justify-content: flex-start;
		flex-direction: row;
		flex-wrap: nowrap;
		text-overflow: clip;
		font-size: 1.1rem;
		min-width: 12rem;
		max-width: 15rem;
		width: 100%;
		border-radius: 0.8rem;
		font-family: 'Commissioner', sans-serif;

		align-items: center;

		height: 3.5rem;
		padding: 0 0 0 0.8rem;
	}
</style>
