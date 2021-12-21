<script context="module" lang="ts">
	let path

	export async function load({ fetch, stuff }) {
		const response = await fetch('/home.json')
		const data = await response.json()
		if (!response.ok) {
			return {
				status: response.status,
				error: new Error(`Error: ${response.statusText}`)
			}
		}
		const { carousels, headerThumbnail = undefined, continuations } = await data
		path = stuff.page
		return {
			props: {
				carousels,
				headerThumbnail,
				continuations
				// data: await data.data
			},
			maxage: 3600,
			status: 200
		}
	}
</script>

<script lang="ts">
	import viewport from '$lib/actions/viewport'
	import Carousel from '$lib/components/Carousel/Carousel.svelte'
	import Header from '$lib/components/Layouts/Header.svelte'
	import Loading from '$lib/components/Loading/Loading.svelte'
	import type { NextContinuationData, Thumbnail } from '$lib/types'

	export let carousels
	export let headerThumbnail: Array<Thumbnail> = []
	export let continuations: NextContinuationData

	let loading = false
	let hasData = false
</script>

<Header
	title="Home"
	url={path}
	desc="Listen to the hottest tracks from your favorite artists, and discover new playlists and mixes."
/>

<div class="immersive-thumbnail">
	<div class="gradient" style="--theme: var(--base-bg);" />
	{#if headerThumbnail.length !== 0}
		<picture>
			{#each headerThumbnail as thumbnail, i}
				{#if i === 0}
					<source
						media={`(max-width: ${thumbnail?.width}px)`}
						srcset={thumbnail.url}
					/>
				{:else}
					<source
						media={`(min-width: ${
							headerThumbnail[i - 1].width + 1
						}px) and (max-width: ${thumbnail?.width}px)`}
						srcset={thumbnail.url}
					/>
				{/if}
			{/each}
			<img
				src={headerThumbnail[0].url}
				width={headerThumbnail[0].width}
				height={headerThumbnail[0].height}
				class="immer-img"
				alt="large background header"
			/>
		</picture>
	{/if}
</div>
<main>
	{#each carousels as carousel}
		<Carousel
			items={carousel.results}
			header={carousel.header}
			type="home"
			kind={carousel.header?.type}
			isBrowseEndpoint={false}
		/>
	{/each}
	{#if Object.keys(continuations).length}
		<div
			class="viewport"
			use:viewport={{ margin: '0px 450px' }}
			on:enterViewport={async () => {
				if (loading || hasData) return
				loading = true
				const response = await fetch(
					`/home.json?itct=${encodeURIComponent(
						continuations.clickTrackingParams
					)}&ctoken=${encodeURIComponent(continuations.continuation)}&type=next`
				)
				const data = await response.json()
				// const {continuations, carousels} = data;
				if (data.continuations !== {}) {
					continuations = data.continuations
					carousels = [...carousels, ...data.carousels]
					loading = false
					return hasData
				}
				hasData = data.continuations === {}
				return !loading
			}}
		/>
		{#if loading}
			<div class="loading">
				<Loading />
			</div>
		{/if}
	{/if}
</main>

<style lang="scss">
	.viewport {
		height: 8rem;
	}
	.loading {
		display: flex;
		position: relative;
		margin: 0 auto;
	}
	.immersive-thumbnail {
		position: fixed;
		z-index: -1;
		width: 100%;
		max-width: 100%;
		position: absolute;
		z-index: -1;
		width: 100%;
		max-width: 100%;
		top: 0;
		left: 0;
		right: 0;
	}
	.gradient {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(to bottom, hsl(0deg 0% 0% / 60%), var(--theme));
	}
	.immer-img {
		-o-object-fit: cover;
		object-fit: cover;
		-o-object-position: center;
		object-position: top;
		border-radius: unset !important;
		inset: 0;
		width: 100%;
		max-width: 100%;
	}
</style>
