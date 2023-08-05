<svelte:options immutable={true} />

<script
	context="module"
	lang="ts"
>
	import type { Action } from "svelte/action";
	// Svelte action that detects if the element is scrolled based on the visibility of a target child element using IntersectionObserver
	// https://svelte.dev/docs#use_action
	const observer: Action<
		HTMLElement,
		IntersectionObserverInit & { target: string },
		{ "on:scrolled": (event: CustomEvent<boolean>) => void }
	> = (
		node: HTMLElement,
		options: IntersectionObserverInit & { target: string },
	) => {
		const observer = new IntersectionObserver(([entry]) => {
			node.dispatchEvent(
				new CustomEvent("scrolled", {
					detail: entry.isIntersecting,
				}),
			);
		}, options);

		observer.observe(node.querySelector<HTMLElement>(options.target)!);

		return {
			destroy() {
				observer.disconnect();
			},
		};
	};
</script>

<script lang="ts">
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
	on:scrolled={({ detail }) => dispatch("scrolled", detail)}
	use:observer={{ target: ".scroll-target" }}
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
		inset: 0;
		position: absolute;
		transform: translateZ(0);
		will-change: top;
		isolation: isolate;
	}

	.app-content-p {
		display: grid;
		inset: 0;
		position: absolute;
	}
</style>
