<svelte:options immutable={true} />

<script
	context="module"
	lang="ts"
>
</script>

<script lang="ts">
	import { scrollObserver } from "$lib/actions/scrollObserver";
	import { createEventDispatcher } from "svelte";

	import { cubicOut } from "svelte/easing";
	import { fly } from "svelte/transition";
	export let main: HTMLElement;
	export let key: string;

	const dispatch = createEventDispatcher<{ scrolled: boolean }>();
</script>

<div
	class="app-content-p"
	bind:this={main}
	on:scrolled={({ detail }) => dispatch("scrolled", detail["isIntersecting"])}
	use:scrollObserver={{ target: ".scroll-target" }}
>
	<div class="scroll-target" />
	{#key key}
		<div
			class="app-transition-wrapper"
			in:fly={{ x: -5, duration: 500, delay: 500, easing: cubicOut }}
			out:fly={{ x: -5, duration: 500, easing: cubicOut, opacity: 0 }}
		>
			<slot />
		</div>
	{/key}
</div>

<style>
	.scroll-target {
		position: absolute;
		top: 2.25rem;
		left: 0;
		right: 0;
		height: 1px;
	}
	.app-transition-wrapper {
		transform: translateZ(0);
		will-change: top;
		isolation: isolate;
		padding-bottom: 2.1rem;
	}

	.app-content-p {
		/* display: grid;
        */
		inset: 0;
		position: absolute;
	}
</style>
