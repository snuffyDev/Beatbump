<script lang="ts">
	import Icon from "../Icon/Icon.svelte";
	import Select from "./Select.svelte";
	export let value = 0;
	export let options: { params: string; action: () => void; label: string }[] =
		[];
</script>

{#if options.length !== 0}
	<div
		class="sort resp-content-width"
		style="margin-inline: 1.5rem;"
	>
		<Select
			{options}
			bind:value
			on:change
		/>
	</div>
{/if}
<div class="info-bar">
	<span class="index">#</span>
	<span class="mobile-thumbnail"
		><Icon
			name="image"
			size="1em"
		/></span
	>
	<span class="title">Title</span>
	<span class="length">
		<Icon
			name="clock"
			size="1em"
		/>
	</span>
</div>

<style
	src="./index.scss"
	lang="scss"
>
</style>
