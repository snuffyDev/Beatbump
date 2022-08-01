<script lang="ts">
	import { createEventDispatcher } from "svelte";
	export let value;
	export let options = [];
	const dispatch = createEventDispatcher();
</script>

<label class="secondary" for="select">Sort</label>

<div class="select">
	<select id="select" bind:value on:change>
		{#each options as option, i (option.params)}
			<option value={i}>{option.label}</option>
		{/each}
	</select>
</div>

<style src="./index.scss" lang="scss">
</style>
