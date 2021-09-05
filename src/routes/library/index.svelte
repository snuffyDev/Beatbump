<script context="module">
	export const ssr = true
</script>

<script lang="ts">
	import { browser } from '$app/env'

	import Listing from '$lib/components/Item/Listing.svelte'
	// import type { Item } from '$lib/types'
	import db from '$lib/db'

	import { onMount, setContext, getContext } from 'svelte'
	import type { Writable } from 'svelte/store'
	import Sync from './_Sync.svelte'
	$: favorites = []
	let playlists = []

	$: sync = false

	setContext('library', { isLibrary: true })

	const updateFavorites = async () => {
		favorites = await db.getFavorites()
		favorites = [...favorites.slice(0, 5)]
		return favorites
	}
	// let lib: Writable<[]> = getContext('db')
	onMount(async () => {
		updateFavorites()
	})

	// $: if (lib !== undefined) console.log(fv, $fv)
</script>

{#if sync && browser}
	<Sync
		on:close={() => {
			updateFavorites()
			sync = !sync
		}}
	/>
{/if}
<h1>Your Library</h1>

<section>
	<div class="header">
		<h2>Your Songs</h2>
		<a href="/library/songs"><small>See All</small></a>
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
	<button
		on:click={() => {
			sync = true
		}}>Sync to another device</button
	>
</section>
<section>
	<h2>Your Playlists</h2>
	<em>Coming soon!</em>
</section>

<style lang="scss">
	section {
		margin-top: 1rem;
		margin-bottom: 4.5rem;
	}
	.list {
		min-height: 15%;
		margin-bottom: 1rem;
	}
	header {
		display: inline;
	}
</style>
