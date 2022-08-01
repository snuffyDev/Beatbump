<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Playlist from "./Playlist.svelte";
	export let items = [];
	const dispatch = createEventDispatcher();
</script>

<ul>
	<li>
		<button on:click={() => dispatch("create")} class="create">Create New Playlist</button>
	</li>
	{#if items.length > 0}
		{#each items as item, i}
			<Playlist {item} {i} on:click />
		{/each}
	{/if}
</ul>

<style lang="scss">
	.create {
		// display: flex;
		// flex-direction: row;
		// padding: 0.125rem 0.25rem;
		// background-color: var(--);
		margin-bottom: 0;
	}
	li {
		display: flex;
		flex-direction: row;
		padding: 0.8rem;
		gap: 0.8rem;
		backdrop-filter: brightness(1.5);
		border-radius: $lg-radius;
		border: rgba(163, 163, 163, 0.212) solid 1px;

		:first-of-type {
			margin: 0 auto;
		}
		// backdrop-filter: brightness(2);
	}
	ul {
		list-style-type: none;
		// overflow-x: hidden;
		// overflow-y: scroll;
		height: 100%;
		padding: 0;
		margin: 0;
		display: flex;
		gap: 0.5rem;
		padding: 0;
		// overflow-y: scroll;

		flex-direction: column;
		// background: inherit;
		// padding: 0.25rem 0.5rem;
	}
</style>
