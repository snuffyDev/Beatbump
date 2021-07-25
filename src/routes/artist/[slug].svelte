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

	$: console.log(
		data,
		carouselItems,
		items,
		description,
		thumbnail,
		headerContent
	)
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
			<button
				class="radio-button"
				on:click={list.startPlaylist(headerContent.mixInfo.playlistId)}
				><Icon size="1.25em" name="radio" /><span class="btn-text">
					Play Radio</span
				></button>
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
		padding: 2rem;
		padding-bottom: 2rem;
		@media screen and (max-width: 500px) {
			padding: 0 1rem;
		}
	}
	button {
		flex-wrap: nowrap;
		display: inline-flex;
		place-items: center;
		color: #09090a !important;
		font-weight: 500;
		border: #09090a;
		background: white !important;
		margin-bottom: 0.8rem;

		padding: 0.3em;
	}
	.radio-button {
		margin-left: 0.5rem;
		background: transparent !important;
		border: white 0.1rem solid !important;
		color: white !important;

		&:active,
		&:hover {
			border: rgb(158, 158, 158) 0.1rem solid !important;
			background: rgba(255, 255, 255, 0.027) !important;
			box-shadow: 0 0 0.1em 0 inset black;
			color: rgb(236, 236, 236) !important;
		}
	}
	.btn-text {
		margin-left: 0.25rem;
	}
	main {
		margin: 0;
		padding: 0;
		// overflow-y: scroll;
	}
</style>
