<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let chip: { text: string; browseEndpoint: { browseId: string; params: string }; ctoken?: string };
	export let selected = false;
	const dispatch = createEventDispatcher<{ click: { params: string } }>();
</script>

<div
	role="button"
	class="chip"
	class:selected
	on:click={() => dispatch("click", { params: chip.browseEndpoint.params })}
>
	{chip.text}
</div>

<style
	src="./index.scss"
	lang="scss"
>
</style>
