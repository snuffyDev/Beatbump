<script context="module">
	export async function load({ page, fetch }) {
		const data = await fetch('/trending.json?q=browse')
		const response = await data.json()
		return {
			props: {
				carouselItems: await response
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	export let carouselItems
	import { currentTitle } from '$stores/stores'
	import Carousel from '$components/Carousel/Carousel.svelte'
	$: console.log(carouselItems)
</script>

<svelte:head>
	<title>{$currentTitle ? $currentTitle : 'Trending'} - Beatbump</title>
	<meta name="description" content="The latest trending songs" />
	<meta name="keywords" content="Trending, music, stream" />
	<meta name="og:url" content="https://beatbump.ml/trending" />
	<meta name="og:title" content="Trending" />
</svelte:head>

<main>
	<Carousel
		setTitle={carouselItems[2].header.title}
		items={carouselItems[2].results}
		type="trending" />

	<Carousel
		setTitle={carouselItems[3].header.title}
		items={carouselItems[3].results}
		type="trending" />
	<Carousel
		setTitle={carouselItems[0].header.title}
		items={carouselItems[0].results}
		type="new" />

	<div class="breakout">
		<div class="box-cont">
			<h3>{carouselItems[1].header.title}</h3>
			<div class="m-alert-info"><em>Coming Soon!</em></div>
			<box>
				{#each carouselItems[1].results as item}
					<div
						style={`border-left: 0.4286rem solid #${item.color}`}
						class="box">
						<a href={`/explore/${item.endpoint.params}`}>{item.text}</a>
					</div>
				{/each}
			</box>
			<a class="link" href="/explore">See All</a>
		</div>
	</div>
</main>

<style lang="scss">
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
		// grid-gap: 1rem;

		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));

		grid-gap: 0.8rem;
	}
	.box {
		margin-bottom: 0.8rem;
		cursor: pointer;
		background: #17151c;
		display: inline-flex;
		justify-content: flex-start;
		flex-direction: row;
		flex-wrap: nowrap;
		text-overflow: clip;
		font-size: 100%;
		min-width: 180px;
		border-radius: 0.8rem;
		width: 100%;
		align-items: center;
		white-space: nowrap;

		height: 3rem;
		padding: 0 0 0 1rem;

		a {
			display: inline-block;
			width: 100%;
		}
	}
</style>
