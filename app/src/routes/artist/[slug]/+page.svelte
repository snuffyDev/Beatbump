<script lang="ts">
	import Carousel from "$lib/components/Carousel/Carousel.svelte";
	import ArtistPageHeader from "../../../lib/components/ArtistPageHeader/ArtistPageHeader.svelte";
	import { page } from "$app/stores";

	import ListItem from "$lib/components/ListItem/ListItem.svelte";
	import { isPagePlaying } from "$lib/stores/stores";
	import Header from "$lib/components/Layouts/Header.svelte";

	import type { ArtistPage, IArtistPageHeader, ArtistPageBody } from "$lib/parsers/artist";
	import { CTX_ListItem } from "$lib/contexts";
	import type { PageData } from "./$types";
	import { isMobileMQ } from "$stores/window";
	import { onMount } from "svelte";
	import Description from "$components/ArtistPageHeader/Description";

	export let data: PageData;
	const { body, header, visitorData } = data;

	let carousels: ArtistPageBody["carousels"] = body["carousels"] ?? [];
	let songs = body["songs"] ?? {};

	const id = $page.params.slug;

	const ctx = {};
	let innerWidth = 640;

	CTX_ListItem.set({ page: "artist", innerWidth });
	// $: console.log(body)
</script>

<Header
	title={header?.name == undefined ? "Artist" : header?.name}
	desc={header?.name}
	url={$page.url.pathname}
	image={header?.thumbnails && header?.thumbnails[0]?.url}
/>
<svelte:window bind:innerWidth />
<ArtistPageHeader description={header?.description} {header} thumbnail={header?.thumbnails} />
<main>
	<div class="artist-body">
		{#if songs?.items?.length > 0}
			<section class="song-list resp-content-width">
				<div class="header">
					<span class="h2">Songs</span>
					<a style="white-space:pre; display: inline-block;" href={`/playlist/${songs?.header?.browseId}`}
						><small>See All</small></a
					>
				</div>
				<section class="songs">
					{#each songs?.items as item, idx}
						<ListItem
							{item}
							{idx}
							on:setPageIsPlaying={() => {
								isPagePlaying.add(id);
							}}
						/>
					{/each}
				</section>
			</section>
		{/if}
		{#each carousels as { contents, header }, i}
			{#if i === carousels.length - 1}
				<Carousel {visitorData} items={contents} type="artist" kind={header?.type} isBrowseEndpoint={true} {header}>
					>
				</Carousel>
			{:else}
				<Carousel items={contents} {visitorData} type="artist" kind={header?.type} isBrowseEndpoint={false} {header}>
					>
				</Carousel>
			{/if}
		{/each}
		{#if $isMobileMQ && header?.description}
			<Description class="resp-content-width" description={header.description} />
		{/if}
	</div>
</main>

<style lang="scss">
	@import "../../../lib/components/ArtistPageHeader/index.scss";
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
		padding: 1em 0 0 0;
		// padding-bottom: 2rem;
		@media screen and (max-width: 500px) {
			// padding: 0 1rem;
		}
	}
</style>
