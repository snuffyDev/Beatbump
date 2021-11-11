<script lang="ts">
	import GridItem from './GridItem.svelte'

	export let items = []
	export let heading = ''
</script>

<div class="grid-container">
	<div class="header">
		<span class="h2">{heading}</span>
	</div>
	<div class="grid">
		{#each items as item, i (item)}
			<GridItem {item} />
		{/each}
	</div>
</div>

<style src="./index.scss" lang="scss">
</style>
