<script lang="ts">
	import type { PageData } from "./$types";
	import Carousel from "$components/Carousel/Carousel.svelte";
	import Header from "$lib/components/Layouts/Header.svelte";
	import { isMoodsAndGenres, isValidCarousel } from "$lib/validation/typeGuards/isIListItemRenderer";

	export let data: PageData;

	const { carouselItems, page: path } = data;
</script>

<Header
	title="Trending"
	url={path}
	desc="The latest trending songs and releases"
/>
<main data-testid="trending">
	{#each carouselItems as carousel (carousel)}
		{#if isValidCarousel(carousel)}
			<Carousel
				isBrowseEndpoint={false}
				header={carousel.header}
				items={carousel.results}
				type="trending"
				kind="isPlaylist"
			/>
		{:else if isMoodsAndGenres(carousel)}
			<div class="breakout">
				<div class="header">
					<span class="h2">{carousel.header.title}</span>
					<a
						class="link"
						href="/explore"><small>See All</small></a
					>
				</div>
				<div class="box">
					<div class="scroll">
						{#each carousel.results as item}
							<a
								style="--color: #{item?.color}"
								class="item-box"
								href="/explore/{item.endpoint.params}">{item.text}</a
							>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{/each}
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
	.box {
		display: flex;
		width: 100%;
		overflow-x: auto;
		padding: 0.8rem;
		contain: content;
		flex-direction: column;
	}
	.scroll {
		display: flex;
		flex-flow: column wrap;
		gap: 0.8rem;
		justify-content: space-around;
		//
		max-height: calc(100vh - 1px - calc(100vh - 23em));
	}
	.item-box {
		cursor: pointer;
		background: #201e27;
		display: flex;
		justify-content: flex-start;
		flex-direction: row;
		flex-wrap: nowrap;
		text-overflow: clip;
		width: clamp(12em, 13em, 15em);
		contain: content;
		border-radius: 0.3em;
		font-family: "CommissionerVariable", sans-serif;
		border-left: 0.5rem solid var(--color, red);
		align-items: center;

		height: 3.25em;
		padding: 0 0 0 0.8rem;
	}
</style>
