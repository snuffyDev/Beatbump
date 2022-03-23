<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';

	export let items = [];
	const [send, receive] = crossfade({
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});
	let sliding;

	const dispatch = createEventDispatcher();
</script>

<div class="list">
	{#each items as item, i (i)}
		<slot {item} {receive} {send} hovering index={i} />
	{/each}
</div>

<style lang="scss">
</style>
