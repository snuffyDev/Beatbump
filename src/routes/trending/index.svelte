<script context="module" lang="ts">
	import type { Load } from "@sveltejs/kit";

	let path;

	export const load: Load = async ({ fetch, stuff }) => {
		const response = await fetch("/trending.json?q=browse");
		const data = await response.json();
		if (!response.ok) {
			return {
				status: response.status,
				error: Error(`Error: ${response.statusText}`)
			};
		}
		const { carouselItems, data: _data } = data;
		path = stuff.page;
		return {
			props: {
				carouselItems,
				_data
			},
			maxage: 3600,
			status: 200
		};
	};
</script>

<script lang="ts">
	export let carouselItems: ICarousel;
	export let _data;
	import Carousel from "$components/Carousel/Carousel.svelte";
	import type { ICarousel } from "$lib/types";
	import Header from "$lib/components/Layouts/Header.svelte";
	// $: console.log(carouselItems, _data);
</script>

<Header
	title="Trending"
	url={path}
	desc="The latest trending songs and releases"
/>
<main>
	<Carousel
		isBrowseEndpoint={false}
		header={carouselItems[1].header}
		items={carouselItems[1].results}
		type="trending"
	/>

	<div class="breakout">
		<div class="box-cont">
			<div class="header">
				<span class="h2">{carouselItems[2].header.title}</span>
				<a class="link" href="/explore"><small>See All</small></a>
			</div>
			<box>
				<div class="scroll">
					{#each carouselItems[2].results as { color, endpoint: { params }, text }}
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
		header={carouselItems[0].header}
		items={carouselItems[0].results}
		isBrowseEndpoint={false}
		type="trending"
	/>
	<Carousel
		header={carouselItems[3].header}
		items={carouselItems[3].results}
		type="trending"
		isBrowseEndpoint={true}
	/>
</main>

<style lang="scss">
	@import "../../global/stylesheet/components/_carousel";
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
		contain: layout;
		flex-direction: column;
	}
	.scroll {
		display: flex;
		flex-flow: column wrap;
		gap: 0.8rem;
		max-height: 26rem;
	}
	.box {
		margin-bottom: 0.8em;
		cursor: pointer;
		background: #201e27;
		display: inline-flex;
		justify-content: flex-start;
		flex-direction: row;
		flex-wrap: nowrap;
		text-overflow: clip;
		font-size: 1em;
		min-width: 12em;
		max-width: 15em;
		width: 100%;
		contain: content;
		border-radius: 0.8em;
		font-family: "Commissioner", sans-serif;

		align-items: center;

		height: 3.25em;
		padding: 0 0 0 0.8rem;
	}
</style>
