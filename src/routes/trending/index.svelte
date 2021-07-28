<script context="module">
	export async function load({ page, fetch }) {
		const data = await fetch('/trending.json?q=browse')
		const response = await data.json()
		return {
			props: {
				carouselItems: await response,
				test: await response
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	export let carouselItems
	export let test
	import { currentTitle } from '$stores/stores'
	import Carousel from '$components/Carousel/Carousel.svelte'
	import type { CarouselItem } from '$lib/types'
	$: console.log(carouselItems, test)

	// const moodsAndGenres =  carouselItems[1].results.slice(0,15)
</script>

<svelte:head>
	<title>{$currentTitle ? $currentTitle : 'Trending'} - Beatbump</title>
	<meta name="description" content="The latest trending songs" />
	<meta name="keywords" content="Trending, music, stream" />
	<meta name="og:url" content="https://beatbump.ml/trending" />
	<meta name="og:title" content="Trending" />
</svelte:head>
{#await carouselItems then _}
	<main>
		<Carousel
			setTitle={carouselItems[2].header.title}
			items={carouselItems[2].results}
			type="trending" />

		<div class="breakout">
			<div class="box-cont">
				<h1>{carouselItems[1].header.title}</h1>
				<div class="m-alert-info"><em>Coming Soon!</em></div>
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
			setTitle={carouselItems[3].header.title}
			items={carouselItems[3].results}
			type="trending" />
		<Carousel
			setTitle={carouselItems[0].header.title}
			items={carouselItems[0].results}
			type="new" />
	</main>
{:catch err}
	{err}
{/await}

<style lang="scss">
	.header {
		padding: 0.4em 0.4em 0.2em;
		margin-bottom: 0.4em;
		font-weight: 600;
		letter-spacing: -0.02em;

		h1 {
			font-size: 2.125em;
			@media screen and (min-width: 800px) {
				font-size: 2.05em;
			}
		}
	}
	// h1 {
	// 	cursor: pointer;
	// 	display: inline;
	// 	font-weight: 450;
	// 	// font-size: 1.05rem;
	// 	font-family: 'Commissioner', sans-serif;
	// 	margin-bottom: 0.8em;
	// 	letter-spacing: -0.02em;
	// }

	.breakout {
		// border: 2px solid rgba(119, 136, 153, 0.171);
		border-radius: 0.8rem;
		// padding: 0.8rem;
	}
	.box-cont {
		justify-content: space-around;

		padding: 0.8rem;
	}
	box {
		display: grid;
		width: 100%;
		// overflow-x: scroll;
		white-space: nowrap;
		// grid-gap: 1rem;

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
		// text-overflow: clip;
		text-align: start;
		font-size: 100%;
		border-radius: var(--md-radius);
		width: 100%;
		align-items: center;
		// white-space: normal;
		border-right: none;
		height: 3rem;
		position: relative;
		.innerbox {
			height: 100%;
			padding: 0 0 0 1rem;
			align-items: center;

			display: flex;
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			// z-index: 5;
			// display: inline-bloc // k;;
			border-radius: var(--lg-radius);
			width: 100%;
			background: #9589b314;
		}
		&::before {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			content: '';
			width: 100%;
			z-index: 0;
			border-radius: inherit;
			height: 100%;
			background: #9589b314;
		}
	}
	:root .light .box {
		background: #8870c427;
	}
</style>
