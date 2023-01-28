<svelte:options immutable={true} />

<script lang="ts">
	import { quintOut } from "svelte/easing";
	import { fly } from "svelte/transition";
	export let main: HTMLElement;
	export let key;
</script>

{#key key}
	<div
		class="app-content-p"
		in:fly|local={{ x: -5, duration: 500, delay: 500, easing: quintOut, opacity: 0 }}
		out:fly|local={{ duration: 500, x: 5, easing: quintOut, opacity: 0 }}
	>
		<slot />
	</div>
{/key}

<style>
	div {
		/* display: block; */
		/* position: relative; */
		contain: content;
		overflow-y: auto;
		contain: content;
		inset: 0;
		overflow-y: auto;
		position: absolute;
		/* isolation: isolate; */
	}
</style>
