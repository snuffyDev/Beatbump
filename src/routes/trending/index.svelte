<script context="module">
	export async function load({ fetch }) {
		const response = await fetch('/trending.json?q=browse')
		const data = await response.json()
		if (!response.ok) {
			return {
				status: response.status,
				error: new Error(`Error: ${response.statusText}`)
			}
		}

		return {
			props: {
				carouselItems: await data
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	export let carouselItems: ICarousel

	import { currentTitle } from '$stores/stores'
	import Carousel from '$components/Carousel/Carousel.svelte'
	import type { ICarousel } from '$lib/types'

	// $: console.log(carouselItems)
</script>

<svelte:head>
	<title>{$currentTitle ? $currentTitle : 'Trending'} - Beatbump</title>
	<meta name="description" content="The latest trending songs" />
	<meta name="keywords" content="Trending, music, stream" />
	<meta property="og:url" content="https://beatbump.ml/trending" />
	<meta property="og:title" content="Trending" />

	<meta property="og:image" content="/logo.png" />
</svelte:head>
<main>
	<Carousel
		header={carouselItems[2].header}
		items={carouselItems[2].results}
		type="trending" />

	<div class="breakout">
		<div class="box-cont">
			<h1>{carouselItems[1].header.title}</h1>
			<!-- <div class="m-alert-info"><em>Coming Soon!</em></div> -->
			<box>
				{#each carouselItems[1].results.slice(1, 15) as item}
					<div style={`border-left: 1ch solid #${item.color}`} class="box">
						<div class="innerbox">
							<a class="innerlink" href={`/explore/${item.endpoint.params}`}
								>{item.text}</a>
						</div>
					</div>
				{/each}
			</box>
			<a class="link" href="/explore">See All</a>
		</div>
	</div>
	<Carousel
		header={carouselItems[3].header}
		items={carouselItems[3].results}
		type="trending" />
	<Carousel
		header={carouselItems[0].header}
		items={carouselItems[0].results}
		type="new" />
</main>

<style lang="scss">
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

		padding: 0.8rem;
	}
	box {
		display: grid;
		width: 100%;
		white-space: nowrap;

		grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));

		grid-gap: 0.8rem;
	}
	.box {
		margin-bottom: 0.8rem;
		cursor: pointer;
		display: flex;
		justify-content: flex-start;
		flex-direction: row;
		flex-wrap: nowrap;
		text-align: start;
		font-size: 100%;
		width: 100%;
		border-radius: var(--md-radius) 0 0 var(--md-radius);

		align-items: center;
		border-right: none !important;
		height: 3rem;
		position: relative;
		.innerbox {
			height: 100%;
			padding: 0 0 0 1rem;
			align-items: center;
			border-radius: var(--md-radius) 0 0 var(--md-radius);
			width: 100%;
			display: flex;
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;

			width: 100%;
		}
		&::before {
			position: absolute;
			top: 0;
			right: 0;
			border-radius: 0 var(--md-radius) var(--md-radius) 0;

			bottom: 0;
			left: 0;
			content: '';
			width: 100%;

			z-index: 0;
			height: 100%;
			background: #9589b321;
		}
	}
	.innerlink {
		display: flex;
		width: 100%;
		height: 100%;
		align-items: center;
	}
</style>
