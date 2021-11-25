<script lang="ts">
	import { goto } from '$app/navigation'
	import GridItem from './GridItem.svelte'

	export let items = []
	export let heading = ''
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
</script>

<div class="grid-container">
	<div class="header">
		<span class="h2">{heading}</span>
		<slot name="buttons" />
	</div>
	<div class="grid">
		{#if items.length > 0}
			{#each items as item, i (item)}
				<GridItem
					{item}
					on:click={() => goto('/library/playlists/' + item.id)}
				/>
			{/each}
		{/if}
		<GridItem
			item={{
				thumbnail:
					'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIxMDAgLTEzLjA4OSA1MDAgNTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGw9IiNhNmE2YTYiIGQ9Ik0xMDAtMTMuMDg5aDUwMHY1MDBIMTAweiIvPjxwYXRoIGQ9Ik0zNjUuMTIzIDMzNy4yMzdoLTMydi03OS41NzZoLTc5LjU3NXYtMzJoNzkuNTc1di03OS41NzVoMzJ2NzkuNTc1SDQ0NC43djMyaC03OS41NzZ6IiBmaWxsPSIjZDhkOGQ4Ii8+PC9zdmc+',
				name: 'Add New Playlist'
			}}
			on:click={() => dispatch('new_playlist')}
		/>
	</div>
</div>

<style src="./index.scss" lang="scss">
</style>
