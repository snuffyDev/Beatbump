<script lang="ts">
	import { IDBService } from "$lib/workers/db/service";

	import { showAddToPlaylistPopper } from "$lib/stores/stores";
	import List from "./List.svelte";

	import type { IDBPlaylist } from "$lib/workers/db/types";
	import { createEventDispatcher } from "svelte";
	import Modal from "../Modal";
	import CreatePlaylist from "./CreatePlaylist.svelte";
	$: isShowing = $showAddToPlaylistPopper.state;

	$: item = $showAddToPlaylistPopper.item;
	let showCreatePlaylist = false;
	let playlists: IDBPlaylist[] = [];
	const fetchPlaylists = async () => {
		const promise = await IDBService.sendMessage("get", "playlists");
		if (promise) {
			playlists = promise;
		}
	};
	$: if (isShowing) fetchPlaylists();
	const dispatch = createEventDispatcher();
	let hasFocus = false;
	// $: console.log(playlists, showConfirmation, item);
</script>

{#if showCreatePlaylist}
	<CreatePlaylist
		hasFocus={true}
		on:close={() => {
			hasFocus = true;
			showCreatePlaylist = false;
		}}
		on:submit={async (e) => {
			await IDBService.sendMessage("create", "playlist", {
				name: e.detail?.title,
				description: e.detail?.description,
				thumbnail:
					e.detail?.thumbnail ??
					"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJpc29sYXRpb246aXNvbGF0ZSIgdmlld0JveD0iMCAwIDI1NiAyNTYiIHdpZHRoPSIyNTZwdCIgaGVpZ2h0PSIyNTZwdCI+PGRlZnM+PGNsaXBQYXRoIGlkPSJwcmVmaXhfX2EiPjxwYXRoIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNwcmVmaXhfX2EpIj48cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMCAwaDI1NnYyNTZIMHoiLz48ZyBjbGlwLXBhdGg9InVybCgjcHJlZml4X19iKSI+PHRleHQgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA1LjU0IDE2Ni43OTQpIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCZxdW90O1NlZ29lIFVJJnF1b3Q7LFJvYm90byxPeHlnZW4sVWJ1bnR1LENhbnRhcmVsbCwmcXVvdDtPcGVuIFNhbnMmcXVvdDssJnF1b3Q7SGVsdmV0aWNhIE5ldWUmcXVvdDssc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjQwMCIgZm9udC1zaXplPSIxMDAiIGZpbGw9IiNmYWZhZmEiPj88L3RleHQ+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0icHJlZml4X19iIj48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MiA1NC44MzkpIiBkPSJNMCAwaDcydjE0Ni4zMjNIMHoiLz48L2NsaXBQYXRoPjwvZGVmcz48L2c+PC9zdmc+",
				items: Array.isArray(item) ? [...item] : [item],
			});
			hasFocus = true;
			showCreatePlaylist = false;
			dispatch("close");
		}}
	/>
{/if}

{#if isShowing}
	<Modal
		on:close={() => {
			dispatch("close");
			hasFocus = true;
		}}
		bind:hasFocus
	>
		<h1 slot="header">Add to Playlist</h1>
		<div class="list">
			<List
				on:click={async (e) => {
					showAddToPlaylistPopper.set({ state: false, item: undefined });
				}}
				items={playlists}
				on:create={() => {
					hasFocus = false;
					showCreatePlaylist = true;
				}}
			/>
		</div>
	</Modal>
{/if}

<style lang="scss">
	.list {
		overflow-y: auto;
		position: relative;
		padding: 0 0.5rem;
		// justify-content: center;justify-content
	}

	.playlist-modal {
		position: absolute;
		// gap: 0.8rem;gap
		padding: 0.8rem;
		z-index: 100;
		background: var(--mobile-popper-bg);
		display: flex;
		flex-flow: column nowrap;
		top: 50%;
		left: 50%;
		min-width: 30%;
		width: 100%;
		min-height: 50%;
		max-width: 100%;
		max-height: calc(100vh - 4rem);
		border-radius: $lg-radius;
		border-color: rgb(129 129 129 / 41.1%);
		border-width: 0.025rem;
		border-style: solid;
		transform: translate(-50%, -50%);

		@media screen and (min-width: 640px) {
			max-width: 35%;
			max-height: 65%;
		}
	}
</style>
