<script lang="ts">
	import db from '$lib/db'

	import { alertHandler, showAddToPlaylistPopper } from '$lib/stores/stores'
	import { readFiles } from '$lib/utils'
	import List from './List.svelte'

	import { createEventDispatcher, onMount } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import CreatePlaylist from './CreatePlaylist.svelte'
	$: isShowing = $showAddToPlaylistPopper.state
	$: item = $showAddToPlaylistPopper.item
	let thumbnail
	let showCreatePlaylist
	let showConfirmation: { index?: number; state?: boolean }
	$: playlists = []
	const fetchPlaylists = async () => {
		const promise = await db.getPlaylists()
		playlists = promise.length !== 0 && [...promise]
	}
	$: if (isShowing) fetchPlaylists()
	const dispatch = createEventDispatcher()
	$: console.log(playlists, showConfirmation)
</script>

{#if showCreatePlaylist}
	<CreatePlaylist
		on:close={() => {
			showCreatePlaylist = false
		}}
		on:submit={async (e) => {
			const promise = await db.createNewPlaylist({
				name: e.detail?.title,
				description: e.detail?.description,
				thumbnail:
					e.detail?.thumbnail ??
					'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjYWNhY2FjIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJtYXRyaXgoMS4yOTkgMCAwIDEuMjcgOTUuNjg4IDE4Ni45NzEpIiBmb250LWZhbWlseT0iTGF0byIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMjAiIGZpbGw9IiMyODI4MjgiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLjI5OSAwIDAgMS4yNyA3OCA0Mi4yODYpIiBkPSJNMCAwaDc3djEzNUgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvZz48L3N2Zz4=',
				items: Array.isArray(item) ? [...item] : item
			})

			showCreatePlaylist = false
		}}
	/>
{/if}
{#if isShowing}
	<div
		class="backdrop"
		on:click={() => dispatch('close')}
		transition:fade={{ duration: 125 }}
	/>

	<section
		class="playlist-modal"
		transition:fly={{ duration: 250, delay: 125 }}
	>
		<h1>Add to Playlist</h1>
		<div class="list">
			<List
				on:click={async (e) => {
					showConfirmation = { index: e.detail, state: true }
					const playlist = playlists[e.detail]
					const items = [...playlist?.items, item]
					const promise = await db.addToPlaylist(playlist.name, {
						playlist: playlist,
						item: Array.isArray(item) ? [...item] : item
					})
					showAddToPlaylistPopper.set({ state: false, item: undefined })
					console.log({
						name: playlists[e.detail].name,
						item
					})
				}}
				items={playlists}
				on:create={() => {
					showCreatePlaylist = true
				}}
			/>
			<!-- {#if showConfirmation && showConfirmation?.index !== undefined}
				<div class="confirmation">
					<em>{playlists[showConfirmation?.index].name}</em>
					<button on:click|preventDefault>Add</button>
				</div>
			{/if} -->
		</div>
	</section>
{/if}

<style lang="scss">
	// .confirmation {
	// 	position: sticky;
	// 	bottom: 0;
	// 	background-color: #585869;
	// 	width: 100%;
	// 	height: 100%;
	// 	margin: 0;
	// 	padding: 0.2rem 0.8rem;
	// 	// backdrop-filter: brightness(5);
	// }
	.list {
		overflow-y: scroll;
		position: relative;
		display: block;
	}
	.playlist-modal {
		position: absolute;
		// gap: 0.8rem;
		padding: 0.8rem;
		z-index: 100;
		background: var(--mobile-popper-bg);
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		top: 50%;
		left: 50%;
		min-width: 30%;
		width: 100%;
		min-height: 50%;
		max-width: 100%;
		max-height: 100%;
		border-radius: var(--lg-radius);
		border-color: rgba(129, 129, 129, 0.411);
		border-width: 0.025rem;
		border-style: solid;
		transform: translate(-50%, -50%);
		@media screen and (min-width: 640px) {
			max-width: 35%;
			max-height: 65%;
		}
	}
</style>
