<svelte:options immutable={true} />

<script lang="ts">
	import { cubicOut, quintOut } from "svelte/easing";
	import { fly } from "svelte/transition";
	export let main: HTMLElement;
	export let key;
</script>

<div class="app-content-p">
	{#key key}
		<div
			class="app-transition-wrapper"
			in:fly|local={{ x: -5, duration: 500, delay: 500, easing: cubicOut }}
			out:fly|local={{ x: -5, duration: 500, easing: cubicOut, opacity: 0 }}
		>
			<slot />
		</div>
	{/key}
</div>

<style>
	.app-transition-wrapper {
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

	.app-content-p {
		display: grid;
		inset: 0;
		position: absolute;
	}
</style>
