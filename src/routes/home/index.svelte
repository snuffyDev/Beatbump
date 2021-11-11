<script context="module" lang="ts">
	let path

	export async function load({ fetch, stuff }) {
		const response = await fetch('/home.json?q=browse')
		const data = await response.json()
		if (!response.ok) {
			return {
				status: response.status,
				error: new Error(`Error: ${response.statusText}`)
			}
		}
		path = stuff.page
		return {
			props: {
				carousels: await data.carousels,
				headerThumbnail: await data.headerThumbnail,
				continuations: await data.continuations
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
	import tagStore from '$lib/stores/ogtags'
	import { currentTitle, theme } from '$lib/stores/stores'
	import type { NextContinuationData, Thumbnail } from '$lib/types'

	export let carousels
	export let headerThumbnail: Array<Thumbnail> = []
	export let continuations: NextContinuationData

	let loading = false
	let hasData = false
	$: if (!import.meta.env.SSR)
		console.log(carousels, headerThumbnail, continuations)
	// $: console.log(hasData, loading, Object.keys(continuations).length)
</script>

<Header title="Home" url={path} desc="See the hottest tracks and playlists" />

<main>
	<div class="immersive-thumbnail">
		<div class="gradient" style="--theme: var(--{$theme}-base);" />
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
				<img src={headerThumbnail[0].url} class="immer-img" />
			</picture>
		{/if}
	</div>

	{#each carousels as carousel}
		<Carousel
			items={carousel.results}
			header={carousel.header}
			type="artist"
			kind={carousel.header?.type}
			isBrowseEndpoint={false}
		/>
	{/each}
	{#if Object.keys(continuations).length}
		<div
			class="viewport"
			use:viewport
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
				console.log(data)
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
		height: 1rem;
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
		object-fit: cover;
		object-position: center;
		border-radius: unset !important;
	}
</style>
