<svelte:options immutable={true} />

<script lang="ts">
	import { cubicOut, quintOut } from "svelte/easing";
	import { fly } from "svelte/transition";
	export let main: HTMLElement;
	export let key;
</script>

{#key key}
	<div
		class="app-content-p"
		in:fly={{ x: -5, duration: 500, delay: 500, easing: cubicOut, opacity: 0 }}
		out:fly={{ duration: 500, easing: cubicOut, opacity: 0 }}
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
		inset: 0;
		overflow-y: auto;
		position: absolute;
		transform: translateZ(0px);
		isolation: isolate;
	}
</style>
