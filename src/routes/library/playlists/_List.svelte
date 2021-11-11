<script lang="ts">
	import viewport from '$lib/actions/viewport'
	import ListItem from '$lib/components/ListItem/ListItem.svelte'
	import { createEventDispatcher } from 'svelte'

	export let items = []
	const dispatch = createEventDispatcher()
</script>

<div class="list">
	{#each items as item, i (item)}
		<slot {item} index={i} />
	{/each}
</div>

<style lang="scss">
</style>
