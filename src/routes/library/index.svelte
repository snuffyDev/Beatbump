<script context="module">
	export const ssr = false
</script>

<script lang="ts">
	import { browser } from '$app/env'

	import Item from '$lib/components/Item/Item.svelte'
	import db from '$lib/db'
	import { onMount } from 'svelte'
	import Sync from './_Sync.svelte'
	let favorites: any[] | string = []
	let playlists = []
	let sync = true
	onMount(async () => {
		favorites = await db.getFavorites()
		console.log(favorites)
	})
</script>

{#if sync && browser}
	<Sync on:close={() => (sync = !sync)} />
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
				<Item data={favorite} />
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
