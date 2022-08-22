<script lang="ts">
	import type { PageData } from "./$types";
	import Carousel from "$components/Carousel/Carousel.svelte";
	import Header from "$lib/components/Layouts/Header.svelte";

	export let data: PageData;

	const { carouselItems, page: path } = data;
</script>

<Header title="Trending" url={path} desc="The latest trending songs and releases" />
<main>
	<Carousel
		isBrowseEndpoint={false}
		header={carouselItems[2].header}
		items={carouselItems[2].results}
		type="trending"
		kind="isPlaylist"
	/>

	<div class="breakout">
		<div class="box-cont">
			<div class="header">
				<span class="h2">{carouselItems[1].header.title}</span>
				<a class="link" href="/explore"><small>See All</small></a>
			</div>
			<box>
				<div class="scroll">
					{#each carouselItems[1].results as { color, endpoint = { params: '' }, text }}
						<a style="border-left: 0.5rem solid #{color}" class="box" href="/explore/{endpoint.params}">{text}</a>
					{/each}
				</div>
			</box>
		</div>
	</div>
	<Carousel
		header={carouselItems[3].header}
		items={carouselItems[3].results}
		type="trending"
		isBrowseEndpoint={false}
	/>
	<Carousel header={carouselItems[0].header} items={carouselItems[0].results} isBrowseEndpoint={true} type="trending" />
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
		font-family: "CommissionerVariable", sans-serif;

		align-items: center;

		height: 3.25em;
		padding: 0 0 0 0.8rem;
	}
</style>
