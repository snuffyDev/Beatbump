<script context="module">
	export const ssr = false
</script>

<script lang="ts">
	import { browser } from '$app/env'

	import Listing from '$lib/components/Item/Listing.svelte'
	import type { Item } from '$lib/types'
	import db from '$lib/db'

	import { onMount, setContext } from 'svelte'
	import Sync from './_Sync.svelte'
	$: favorites = []
	let playlists = []
	$: sync = false
	setContext('library', { isLibrary: true })
	onMount(async () => {
		favorites = await db.getFavorites()
		console.log(favorites)
	})
	const updateFavorites = async () => {
		favorites = await db.getFavorites()
	}
</script>

{#if sync && browser}
	<Sync
		on:close={() => {
			updateFavorites()
			sync = !sync
		}}
	/>
{/if}
<main>
	<h1>Your Library</h1>
	<button
		on:click={() => {
			sync = true
		}}>Sync to another device</button
	>
	<section>
		<h2>Your Favorites</h2>
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
	</section>
</main>

<style lang="scss">
	section {
		margin-top: 1rem;
		margin-bottom: 4.5rem;
	}
	.list {
		min-height: 15%;
	}
</style>
