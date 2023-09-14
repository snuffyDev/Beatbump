<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import Playlist from "./Playlist.svelte";
	export let items = [];
	const dispatch = createEventDispatcher();
</script>

<ul>
	<li>
		<button
			on:click={() => dispatch("create")}
			class="create">Create New Playlist</button
		>
	</li>
	{#if items.length > 0}
		{#each items as item, i}
			<Playlist
				{item}
				{i}
				on:click
			/>
		{/each}
	{/if}
</ul>

<style lang="scss">
	.create {
		// display: flex;display
		// flex-direction: row;flex-direction
		// padding: 0.125rem 0.25rem;padding
		// background-color: var(--);background-color
		margin-bottom: 0;
	}

	li {
		display: flex;
		flex-direction: row;
		padding: 0.8rem;
		gap: 0.8rem;
		margin-bottom: 0.125rem;
		margin-top: 0rem;

		:first-of-type {
			margin: 0 auto;
		}
		// backdrop-filter: brightness(2);backdrop-filter
	}

	ul {
		list-style-type: none;
		// overflow-x: hidden;overflow-x
		// overflow-y: scroll;overflow-y
		height: 100%;
		margin: 0;
		display: flex;
		gap: 0.5rem;
		padding: 0;
		// overflow-y: scroll;overflow-y

		flex-direction: column;
		// background: inherit;background
		// padding: 0.25rem 0.5rem;padding
	}
</style>
