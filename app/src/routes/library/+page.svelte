<script lang="ts">
	import { browser } from "$app/env";
	import Icon from "$lib/components/Icon/Icon.svelte";

	import Listing from "$lib/components/Item/Listing.svelte";
	import CreatePlaylist from "$lib/components/PlaylistPopper/CreatePlaylist.svelte";
	// import type { Item } from '$lib/types'
	import * as db from "$lib/db";

	import { onMount, setContext } from "svelte";
	import Grid from "./_components/Grid/Grid.svelte";
	import Sync from "./_Sync.svelte";
	let favorites;
	let playlists;

	let showSyncModal;
	let showPlaylistModal;
	setContext("library", { isLibrary: true });
	type customEvent = Event & {
		currentTarget: EventTarget & HTMLImageElement & HTMLElement;
	};

	const updateFavorites = async () => {
		favorites = await db.getFavorites();
		favorites = [...favorites.slice(0, 5)];
		return favorites;
	};
	const updatePlaylists = async () => {
		playlists = await db.getPlaylists();
		playlists = [...playlists];
		return playlists;
	};
	// let lib: Writable<[]> = getContext('db')
	onMount(async () => {
		try {
			const hasPlaylists = await db.getPlaylists();
			const hasFavorites = await db.getFavorites();
			favorites = hasFavorites.length !== 0 && [...hasFavorites.slice(0, 5)];
			playlists = hasPlaylists.length !== 0 && [...hasPlaylists];
		} catch (err) {
			console.error(err);
		}
	});
	// $: console.log(playlists, favorites)
</script>

{#if showSyncModal && browser}
	<Sync
		on:close={() => {
			updateFavorites();
			updatePlaylists();
			showSyncModal = false;
		}}
	/>
{/if}
<main>
	<header>
		<h1>Your Library</h1>
		<button
			on:click={() => {
				showSyncModal = true;
			}}
			><Icon name="send" size="1.1em" />
			<span class="btn-text">Sync Your Data</span></button
		>
	</header>

	<section>
		<div class="header">
			<h2>Your Songs</h2>
			<a sveltekit:prefetch href="/library/songs"
				>{#if favorites?.length > 0}<small>See All</small>{/if}</a
			>
		</div>
		<div class="list">
			{#if favorites?.length > 0}
				{#each favorites as favorite}
					<Listing
						on:update={() => {
							updateFavorites();
						}}
						data={favorite}
					/>
				{/each}
			{:else}
				<div class="container">
					<h3>
						<Icon style="vertical-align: text-bottom; margin-right: 0.125em;" name="frown" size="2rem" /> Looks like you
						don't have any songs in your favorites...
					</h3>
					<span class="subheading"><em>Add some songs to keep track of what you love!</em></span>
				</div>
			{/if}
		</div>
	</section>
	{#if showPlaylistModal}
		<CreatePlaylist
			defaults={{
				description: undefined,
				name: undefined,
				thumbnail: undefined,
			}}
			hasFocus={true}
			on:submit={async (e) => {
				const promise = await db.createNewPlaylist({
					name: e.detail?.title,
					description: e.detail?.description,
					thumbnail:
						e.detail?.thumbnail ??
						"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA1LjU0IDE2Ni43OTQpIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCZxdW90O1NlZ29lIFVJJnF1b3Q7LFJvYm90byxPeHlnZW4sVWJ1bnR1LENhbnRhcmVsbCwmcXVvdDtPcGVuIFNhbnMmcXVvdDssJnF1b3Q7SGVsdmV0aWNhIE5ldWUmcXVvdDssc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMDAiIGZpbGw9IiNmYWZhZmEiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MiA1NC44MzkpIiBkPSJNMCAwaDcydjE0Ni4zMjNIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+",
					items: [],
				});
				await updatePlaylists();
				showPlaylistModal = false;
			}}
			on:close={() => {
				showPlaylistModal = false;
			}}
		/>
	{/if}
	<section>
		{#await playlists then favorites}
			<Grid
				heading="Your Playlists"
				items={playlists}
				on:new_playlist={() => {
					showPlaylistModal = true;
				}}
			>
				<button
					slot="buttons"
					class="outlined"
					on:click={() => {
						db.deleteAllPlaylists();
					}}><Icon name="x" size="1.1em" /><span class="btn-text">Delete All Playlists</span></button
				></Grid
			>
		{:catch err}
			{err}
		{/await}
	</section>
</main>

<style lang="scss">
	section:not(:last-of-type) {
		margin-top: 1rem;
		margin-bottom: 4.5rem;
	}
	.list {
		min-height: 15%;
		margin-bottom: 1rem;
	}
	button {
		gap: 0.25rem;
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
