<script context="module">
	let path

	export async function load({ fetch, context }) {
		const response = await fetch('/trending.json?q=browse')
		const data = await response.json()
		if (!response.ok) {
			return {
				status: response.status,
				error: new Error(`Error: ${response.statusText}`)
			}
		}
		path = context.page
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
	import tagStore from '$lib/stores/ogtags'
	// $: console.log(carouselItems)
	tagStore.desc('The latest trending songs')
	tagStore.title('Trending')
	tagStore.url(path)
	tagStore.image('/logo.png')
</script>

<svelte:head>
	{#each Object.entries($tagStore) as [property, content]}
		{#if content}
			{#if ['title', 'description', 'image'].includes(property)}
				<meta name={property} {content} />
			{:else}
				<meta {property} {content} />
			{/if}
		{/if}
	{/each}
	<title>{$currentTitle ? $currentTitle : $tagStore.title} - Beatbump</title>
</svelte:head>
<!-- <svelte:head>
	<title>{$currentTitle ? $currentTitle : 'Trending'} - Beatbump</title>
	<meta name="description" content="The latest trending songs" />
	<meta name="keywords" content="Trending, music, stream" />
	<meta property="og:url" content="https://beatbump.ml/trending" />
	<meta property="og:title" content="Trending" />

	<meta property="og:image" content="/logo.png" />
</svelte:head> -->
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
				{#each carouselItems[1].results.slice(1, 15) as { color, endpoint: { params }, text }}
					<div style={`border-left: 0.5em solid #${color}`} class="box">
						<div class="innerbox">
							<a class="innerlink" href={`/explore/${params}`}>{text}</a>
						</div>
					</div>
				{/each}
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
		display: grid;
		width: 100%;
		white-space: nowrap;
		padding: 0.8rem;

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
