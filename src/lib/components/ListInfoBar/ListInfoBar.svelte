<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import Icon from '../Icon/Icon.svelte'
	export let value
	export let options = []
	const dispatch = createEventDispatcher()
</script>

<div class="sort">
	<label for="select">Sort</label>
	<div class="select">
		<select id="select" bind:value on:change>
			{#each options as option, i (option.params)}
				<option value={i}>{option.label}</option>
			{/each}
		</select>
	</div>
</div>
<div class="info-bar">
	<span class="index">#</span>
	<span class="mobile-thumbnail"><Icon name="image" size="1em" /></span>
	<span class="title">Title</span>
	<span class="length">
		<Icon name="clock" size="1em" />
	</span>
</div>

<style src="./index.scss" lang="scss">
</style>
