<script lang="ts">
	import { browser } from '$app/env'
	import Icon from '$lib/components/Icon/Icon.svelte'

	import Listing from '$lib/components/Item/Listing.svelte'
	// import type { Item } from '$lib/types'
	import db from '$lib/db'

	import { onMount, setContext } from 'svelte'
	import Sync from './_Sync.svelte'
	$: favorites = []
	$: playlists = []

	let sync
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
		playlists = await db.getPlaylists()
		playlists = [...playlists]
		updateFavorites()
	})
	$: console.log(playlists)
	// $: if (lib !== undefined) console.log(fv, $fv)
</script>

{#if sync && browser}
	<Sync
		on:close={() => {
			updateFavorites()
			sync = false
		}}
	/>
{/if}
<main>
	<header>
		<h1>Your Library</h1>
		<button
			on:click={() => {
				sync = true
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
			{#each favorites as favorite}
				<Listing
					on:update={() => {
						updateFavorites()
					}}
					data={favorite}
				/>
			{/each}
		</div>
	</section>
	<section>
		<h2>Your Playlists</h2>
		<em>Coming soon!</em>
		{#each playlists as playlist, i}
			<div class="container">
				<img src={playlist.thumbnail} width="200" height="200" />
				<div class="title">{playlist.name}</div>
				<em class="length">{playlist.length} songs</em>
			</div>
		{/each}
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
</style>
