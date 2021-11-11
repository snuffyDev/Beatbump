<script context="module">
	import { api } from '$lib/api'

	export async function load({ page, fetch }) {
		const id = page.params.slug
		const response = await api(fetch, {
			browseId: id,
			endpoint: 'browse',
			path: 'artist',
			type: 'artist'
		})
		let {
			carousels,
			description,
			thumbnail,
			header,
			songs,
			headerRaw
		} = await response.body
		if (response.ok) {
			return {
				props: {
					carousels,
					headerRaw,
					description,
					thumbnail,
					header,
					// songs: response.body,
					songs,
					id: page.params.slug
				},
				status: 200
			}
		}
	}
</script>

<script lang="ts">
	import Carousel from '$components/Carousel/Carousel.svelte'
	import ArtistPageHeader from '../../lib/components/ArtistPageHeader/ArtistPageHeader.svelte'
	import tags from '$lib/stores/ogtags'
	import { page } from '$app/stores'

	import ListItem from '$components/ListItem/ListItem.svelte'
	import { isPagePlaying } from '$lib/stores/stores'
	import { setContext } from 'svelte'
	import Header from '$lib/components/Layouts/Header.svelte'
	export let header
	export let headerRaw
	export let description
	export let thumbnail
	export let carousels
	export let songs = []
	// export let raw
	export let id
	$: id = id
	let width
	const ctx = {}
	$: console.log(headerRaw, carousels, songs, $page.path)
	setContext(ctx, { pageId: id })
</script>

<Header
	title={header?.name == undefined ? 'Artist' : header?.name}
	desc={header?.name}
	url={$page.path}
	image={thumbnail && thumbnail[0].url}
/>
<ArtistPageHeader {description} {header} {width} {thumbnail} />
<main>
	<div class="artist-body">
		{#if songs?.length > 0}
			<section>
				<h1 class="grid-title">Songs</h1>
				<section class="songs">
					{#each songs as item, index}
						<ListItem
							{item}
							{index}
							{ctx}
							page="artist"
							on:pagePlaying={() => {
								isPagePlaying.set(id)
							}}
						/>
					{/each}
				</section>
			</section>
		{/if}
		{#each carousels as { contents, header }, i}
			{#if i == carousels.length - 1}
				<Carousel
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

<!-- {/await} -->
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

	.songs {
		margin-bottom: 1rem;
	}
	.artist-body {
		padding: 2rem 2rem 0 2rem;
		// padding-bottom: 2rem;
		@media screen and (max-width: 500px) {
			padding: 0 1rem;
		}
	}
	main {
		margin: 0;
	}
</style>
