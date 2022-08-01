<script context="module" lang="ts">
	import type { Load } from "@sveltejs/kit";
	let path;

	export const load: Load = async ({ fetch, stuff }) => {
		// console.time("startLoad");
		const response = await fetch("/home.json");
		const data = await response.json();
		if (!response.ok) {
			return {
				status: response.status,
				error: new Error(`Error: ${response.statusText}`),
			};
		}
		// console.timeEnd("startLoad");
		const { carousels, headerThumbnail = undefined, continuations, visitorData } = data;
		path = stuff.page;
		return {
			props: {
				carousels,
				headerThumbnail,
				continuations,
				visitorData,
			},

			cache: { maxage: 3600 },
			status: 200,
		};
	};
</script>

<script lang="ts">
	import viewport from "$lib/actions/viewport";
	import Carousel from "$lib/components/Carousel/Carousel.svelte";
	import Header from "$lib/components/Layouts/Header.svelte";
	import Loading from "$lib/components/Loading/Loading.svelte";
	import type { NextContinuationData, Thumbnail } from "$lib/types";

	export let carousels;
	export let headerThumbnail: Array<Thumbnail> = [];
	export let continuations: NextContinuationData;
	export let visitorData = "";
	let loading = false;
	let hasData = false;
	// $: console.log(data);
</script>

<svelte:head>
	{#if Array.isArray(headerThumbnail) && headerThumbnail.length !== 0 ? headerThumbnail[0].url : ""}
		<link rel="preload" as="image" href={headerThumbnail[0].url} />
	{/if}
</svelte:head>
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
					<source media={`(max-width: ${thumbnail?.width}px)`} srcset={thumbnail.url} />
				{:else}
					<source
						media={`(min-width: ${headerThumbnail[i - 1].width + 1}px) and (max-width: ${thumbnail?.width}px)`}
						srcset={thumbnail.url}
					/>
				{/if}
			{/each}
			<img
				src={headerThumbnail[0].url}
				width={headerThumbnail[0].width}
				height={headerThumbnail[0].height}
				decoding="sync"
				class="immer-img"
				alt="large background header"
			/>
		</picture>
	{/if}
</div>
<main>
	{#each carousels as carousel (carousel)}
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
			use:viewport={{ margin: "0px 325px" }}
			on:enterViewport={async () => {
				if (loading || hasData) return;
				loading = true;
				const response = await fetch(
					`/home.json?itct=${encodeURIComponent(continuations.clickTrackingParams)}&ctoken=${encodeURIComponent(
						continuations.continuation,
					)}&type=next&visitorData=${visitorData}`,
				);
				const data = await response.json();
				// const {continuations, carousels} = data;
				if (data.continuations !== {}) {
					window.queueMicrotask(() => {
						continuations = data.continuations;
						carousels = [...carousels, ...data.carousels];
					});
					loading = false;
					return hasData;
				}
				hasData = data.continuations === {};
				return !loading;
			}}
		/>

		<div class="loading" style:opacity={loading ? 1 : 0}>
			<Loading />
		</div>
	{/if}
</main>

<style lang="scss">
	.viewport {
		height: 8rem;
		position: absolute;
		bottom: 0;
		margin-bottom: 5rem;
		will-change: contents;
		contain: content;
	}
	.loading {
		transition: opacity cubic-bezier(0.95, 0.05, 0.795, 0.035) 500ms;
		opacity: 0;
		display: flex;
		position: relative;
		margin: 0 auto;
		padding-block: 2.5rem;
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

		contain: layout style paint;
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
		contain: style;
		width: 100%;
		max-width: 100%;
	}
</style>
