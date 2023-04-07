<script lang="ts">
	import { IDBService } from "$lib/workers/db/service";

	import { showAddToPlaylistPopper } from "$lib/stores/stores";
	import List from "./List.svelte";

	import { createEventDispatcher } from "svelte";
	import CreatePlaylist from "./CreatePlaylist.svelte";
	import Modal from "../Modal";
	$: isShowing = $showAddToPlaylistPopper.state;
	let showCreatePlaylist;
	let playlists = [];
	const fetchPlaylists = async () => {
		const promise = await IDBService.sendMessage("get", "playlists");
		playlists = promise;
	};
	$: if (isShowing) fetchPlaylists();
	const dispatch = createEventDispatcher();
	let hasFocus;
	// $: console.log(playlists, showConfirmation, item);
</script>

{#if showCreatePlaylist}
	<CreatePlaylist
		hasFocus={true}
		on:close={() => {
			hasFocus = true;
			showCreatePlaylist = false;
		}}
		on:submit={async () => {
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
		// justify-content: center;
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
		max-height: calc(100vh - 4rem);
		border-radius: $lg-radius;
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
