<script context="module" lang="ts">
	export const ssr = false
</script>

<script lang="ts">
	import { browser } from '$app/env'
	import Icon from '$lib/components/Icon/Icon.svelte'

	import Listing from '$lib/components/Item/Listing.svelte'
	import CreatePlaylist from '$lib/components/PlaylistPopper/CreatePlaylist.svelte'
	// import type { Item } from '$lib/types'
	import db from '$lib/db'

	import { onMount, setContext } from 'svelte'
	import Grid from './_components/Grid/Grid.svelte'
	import Popup from './_components/Popup.svelte'
	import Sync from './_Sync.svelte'
	$: favorites = []
	$: playlists = []

	let showSyncModal
	let showPlaylistModal
	setContext('library', { isLibrary: true })
	type customEvent = Event & {
		currentTarget: EventTarget & HTMLImageElement & HTMLElement
	}

	const updateFavorites = async () => {
		favorites = await db.getFavorites()
		favorites = [...favorites.slice(0, 5)]
		return favorites
	}
	// let lib: Writable<[]> = getContext('db')
	onMount(async () => {
		const hasPlaylists = await db.getPlaylists()
		const hasFavorites = await db.getFavorites()
		favorites = hasFavorites.length !== 0 && [...hasFavorites.slice(0, 5)]
		playlists = hasPlaylists.length !== 0 && [...hasPlaylists]
		// updateFavorites()
	})
	$: console.log(playlists, favorites)
	// $: if (lib !== undefined) console.log(fv, $fv)
</script>

{#if showSyncModal && browser}
	<Sync
		on:close={() => {
			updateFavorites()
			showSyncModal = false
		}}
	/>
{/if}
<main>
	<header>
		<h1>Your Library</h1>
		<button
			on:click={() => {
				showSyncModal = true
			}}
			><Icon name="send" size="1.125em" />
			<span class="btn-text">Sync Your Data</span></button
		>
	</header>

	<section>
		<div class="header">
			<h2>Your Songs</h2>
			<a sveltekit:prefetch href="/library/songs"><small>See All</small></a>
		</div>
		<div class="list">
			{#if favorites.length > 0}
				{#each favorites as favorite}
					<Listing
						on:update={() => {
							updateFavorites()
						}}
						data={favorite}
					/>
				{/each}
			{:else}
				<div class="container">
					<h3>
						<Icon
							style="vertical-align: text-bottom; margin-right: 0.125em;"
							name="frown"
							size="2rem"
						/> Looks like you don't have any songs in your favorites...
					</h3>
					<span class="subheading"
						><em>Add some songs to keep track of what you love!</em></span
					>
				</div>
			{/if}
		</div>
	</section>
	{#if showPlaylistModal}
		<div
			class="backdrop"
			on:click={() => {
				showPlaylistModal = false
			}}
		/>
		<CreatePlaylist
			on:submit={async (e) => {
				await db.createNewPlaylist({
					name: e.detail.name,
					description: e.detail.description,
					items: [],
					thumbnail: e.detail.thumbnail
				})
			}}
			on:close={() => {
				showPlaylistModal = false
			}}
		/>
	{/if}
	<section>
		<Grid
			heading="Your Playlists"
			items={playlists}
			on:new_playlist={() => {
				showPlaylistModal = true
			}}
		/>
	</section>
</main>

<style lang="scss">
	section {
		margin-top: 1rem;
		margin-bottom: 4.5rem;
	}
	.list {
		min-height: 15%;
		margin-bottom: 1rem;
	}
	button {
		gap: 0.5rem;
	}
	header {
		display: inline;
	}
	// .playlist-container {
	// 	gap: 0.8rem;
	// }
	.image {
		min-width: 100%;
		max-width: 12rem;
		width: 100%;
		height: 100%;
		img {
			height: inherit;
			width: inherit;
			max-width: inherit;
			max-height: inherit;
		}
	}
</style>
