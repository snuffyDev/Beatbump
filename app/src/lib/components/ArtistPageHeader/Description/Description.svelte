<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";

	export let description = "";
	let _class = "";
	export { _class as class };
	let isExpanded = false;

	let descriptionElm: HTMLDivElement;

	let descClientHeight = undefined;
	let descOffsetHeight = undefined;

	$: descIsOverflow = descClientHeight < descOffsetHeight ? false : true;

	const dispatch = createEventDispatcher<{ update: boolean }>();

	onMount(() => {
		if (descriptionElm) {
			descClientHeight = descriptionElm.clientHeight;
			descOffsetHeight = descriptionElm.scrollHeight;
			return () => {
				descriptionElm = null;
			};
		}
	});
</script>

<div class="description-wrapper {_class}">
	<div class="description" bind:this={descriptionElm} class:expanded={isExpanded}>
		{description}
	</div>
	<div
		class="show-more"
		class:hidden={descIsOverflow}
		on:click={() => {
			dispatch("update", (isExpanded = !isExpanded));
		}}
	>
		<span class="btn-text">Show {isExpanded ? "Less" : "More"}</span>
	</div>
</div>

<style src="./index.scss" lang="scss">
</style>
