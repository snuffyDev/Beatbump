<script context="module" lang="ts">
	import type { Load } from "@sveltejs/kit";
	import { api } from "$lib/api";
	export const load: Load = async ({ params, fetch }) => {
		const response = await api(fetch, {
			browseId: params.slug,
			endpoint: "browse",
			path: "artist",
			type: "artist"
		});
		let { header, body, visitorData } = (await response.body) as ArtistPage;

		if (response.ok) {
			return {
				props: {
					carousels: body?.carousels,
					visitorData,

					header,
					songs: body?.songs,
					id: params.slug
				},
				status: 200
			};
		}
	};
</script>

<script lang="ts">
	import Carousel from "$lib/components/Carousel/Carousel.svelte";
	import ArtistPageHeader from "../../lib/components/ArtistPageHeader/ArtistPageHeader.svelte";
	import { page } from "$app/stores";

	import ListItem from "$components/ListItem/ListItem.svelte";
	import { isPagePlaying } from "$lib/stores/stores";
	import { setContext } from "svelte";
	import Header from "$lib/components/Layouts/Header.svelte";

	import type {
		ArtistPage,
		ArtistPageBody,
		IArtistPageHeader
	} from "$lib/js/artist";
	export let header: IArtistPageHeader;
	export let carousels: ArtistPageBody["carousels"];
	export let songs: ArtistPageBody["songs"] = {};
	export let id;
	export let visitorData = "";

	const ctx = {};
	setContext(ctx, { pageId: id });
</script>

<Header
	title={header?.name == undefined ? "Artist" : header?.name}
	desc={header?.name}
	url={$page.url.pathname}
	image={header?.thumbnails && header?.thumbnails[0]?.url}
/>
<ArtistPageHeader
	description={header?.description}
	{header}
	thumbnail={header?.thumbnails}
/>
<main>
	<div class="artist-body">
		{#if songs?.items?.length > 0}
			<section class="song-list">
				<div class="header">
					<span class="h2">Songs</span>
					<a
						style="white-space:pre; display: inline-block;"
						href={`/playlist/${songs?.header?.browseId}`}
						><small>See All</small></a
					>
				</div>
				<section class="songs">
					{#each songs?.items as item, index}
						<ListItem
							{item}
							{index}
							{ctx}
							page="artist"
							on:pagePlaying={() => {
								isPagePlaying.set(id);
							}}
						/>
					{/each}
				</section>
			</section>
		{/if}
		{#each carousels as { contents, header }, i}
			{#if i == carousels.length - 1}
				<Carousel
					{visitorData}
					items={contents}
					type="artist"
					kind={header?.type}
					isBrowseEndpoint={true}
					{header}
				>
					>
				</Carousel>
			{:else}
				<Carousel
					items={contents}
					{visitorData}
					type="artist"
					kind={header?.type}
					isBrowseEndpoint={false}
					{header}
				>
					>
				</Carousel>
			{/if}
		{/each}
	</div>
</main>

<style lang="scss">
	.song-list {
		margin-bottom: 3.3339em;
	}
	.content-wrapper {
		display: flex;
		max-width: inherit;
		margin: 0.5rem 0.7rem 0rem 0.7rem;
		width: auto;
		max-width: 9rem;
	}

	.item-title {
		font-size: $size-1;
		cursor: pointer;
		margin: 0;
		padding: 0;
		width: 100%;
	}
	section {
	}
	.songs {
		margin-bottom: 1rem;
	}
	main {
		@include content-spacing($type: "padding");
	}
	.artist-body {
		padding: 1.25rem 0 2rem;
		// padding-bottom: 2rem;
		@media screen and (max-width: 500px) {
			// padding: 0 1rem;
		}
	}
</style>
