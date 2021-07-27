<script context="module">
	export async function load({ page, fetch }) {
		const url =
			'/api/artist.json?endpoint=browse&browseId=' +
			encodeURIComponent(page.params.slug) +
			'&pt=MUSIC_PAGE_TYPE_ARTIST'
		const response = await fetch(url)
		const data = await response.json()
		let {
			carouselItems,
			description,
			thumbnail,
			headerContent,
			items
		} = await data

		return {
			props: {
				carouselItems,
				description,
				thumbnail,
				headerContent,
				items,
				data
			},
			status: 200
		}
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation'
	import Carousel from '$components/Carousel/Carousel.svelte'
	import ArtistPageHeader from '../../lib/components/ArtistPageHeader/ArtistPageHeader.svelte'
	import { page } from '$app/stores'

	import Icon from '$components/Icon/Icon.svelte'
	import ListItem from '$components/ListItem/ListItem.svelte'
	import { isPagePlaying } from '$lib/stores/stores'
	import list from '$lib/stores/list'

	export let headerContent
	export let description
	export let thumbnail
	export let carouselItems
	export let items
	export let data
	let width

	console.log(data, carouselItems, items, description, thumbnail, headerContent)
</script>

<svelte:head>
	<title
		>{headerContent?.name == undefined
			? 'Artist - '
			: `${headerContent.name} - `}Beatbump</title>
</svelte:head>

<svelte:window bind:innerWidth={width} />
{#await headerContent then _}
	<main>
		<ArtistPageHeader {description} {headerContent} {width} {thumbnail} />
		<div class="artist-body">
			{#if items.length > 0}
				<section>
					<h4 class="grid-title">Songs</h4>
					<section class="songs">
						{#each items as item, index}
							<ListItem
								{item}
								{index}
								page="artist"
								on:pagePlaying={() => {
									isPagePlaying.set($page.path + $page.params)
								}} />
						{/each}
					</section>
				</section>
			{/if}
			{#key carouselItems}
				{#each carouselItems as { contents, header }, i}
					{#if i < 4}
						<Carousel
							items={contents}
							type="artist"
							isBrowse={false}
							setTitle={header?.title ? header.title : header}>
							>
						</Carousel>
					{:else}
						<Carousel
							items={contents}
							type="artist"
							isBrowse={true}
							setTitle={header.title ? header.title : header}>
							>
						</Carousel>
					{/if}
				{/each}
			{/key}
		</div>
	</main>
{/await}

<style lang="scss">
	.content-wrapper {
		display: flex;
		max-width: inherit;
		margin: 0.5rem 0.7rem 0rem 0.7rem;
		width: auto;
		max-width: 9rem;
	}

	.item-title {
		font-size: 1rem;
		cursor: pointer;
		margin: 0;
		padding: 0;
		width: 100%;
	}
	.grid {
		display: grid;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10.85rem, 1fr));
		grid-gap: 1rem 1.2rem; // grid-gap: 1rem 1.5rem;
		@media screen and (max-width: 575px) {
			grid-template-columns: repeat(auto-fit, minmax(10.85rem, 1fr));
		}
	}
	.songs {
		margin-bottom: 1rem;
	}
	.artist-body {
		padding: 0 2rem;
		padding-bottom: 2rem;
		@media screen and (max-width: 500px) {
			padding: 0 1rem;
		}
	}
	main {
		margin: 0;
		padding: 0;
		// overflow-y: scroll;
	}
</style>
