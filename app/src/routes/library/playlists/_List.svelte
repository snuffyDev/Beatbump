<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";
	import { flip } from "svelte/animate";
	export let items = [];
	const [send, receive] = crossfade({
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === "none" ? "" : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform};
					opacity: ${t}
				`,
			};
		},
	});
</script>

<div class="list">
	{#each items as item, i (i)}
		<div
			class="item-wrapper"
			out:send={{ duration: 400, key: i }}
			in:receive={{ duration: 400, key: i }}
			animate:flip={{ duration: 300 }}
		>
			<slot {item} {receive} {send} hovering index={i} />
		</div>
	{/each}
</div>

<style lang="scss">
	.list {
		contain: paint style;
	}
</style>
