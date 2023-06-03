<script lang="ts">
	import { page } from "$app/stores";
	import Chip from "./Chip/Chip.svelte";

	export let chips: {
		text: string;
		browseEndpoint: { browseId: string; params: string };
		ctoken?: string;
	}[] = [];
	let active: string;
</script>

<div class="chips resp-content-width">
	{#each chips as chip (chip.text)}
		<Chip
			selected={$page.url.search.includes(chip.browseEndpoint.params)}
			{chip}
			on:click={(e) => {
				if (active !== chip.text) active = chip.text;
				else active = "";
			}}
			on:click
		/>
	{/each}
</div>

<style
	src="./index.scss"
	lang="scss"
>
</style>
