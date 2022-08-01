<script lang="ts">
	import { alertHandler } from "$lib/stores/stores";
	import { expoIn, expoOut, quintOut } from "svelte/easing";
	import { crossfade, fly } from "svelte/transition";
	let height = 0;
	let win_height = 0;
	function removeNotification() {
		if (height && height >= win_height * 0.55) alertHandler.remove($alertHandler[0]);
	}
	// $: height && removeNotification();
	// $: console.log($alertHandler, win_height, height, win_height * 0.55);
	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === "none" ? "" : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
			};
		},
	});
</script>

<svelte:window bind:innerHeight={win_height} />
<div class="alert-container" bind:offsetHeight={height}>
	{#each $alertHandler as notif, idx}
		<div
			in:fly={{ y: 150, duration: 250, easing: expoOut }}
			out:fly={{ y: 150, duration: 500, delay: 250, easing: expoIn }}
			on:introend={() => {
				setTimeout(() => {
					alertHandler.remove(notif);
				}, 2125);
			}}
			style=""
			class={`alert m-alert-${notif.type}`}
		>
			{notif.msg}
		</div>
	{/each}
</div>

<style lang="scss">
	.alert-container {
		// display: flex;
		position: fixed;
		bottom: 5.75rem;
		left: 0;
		// flex-direction: column;
		right: 0;
		z-index: 500;
		// isolation: isolate;
		max-height: 60vmin;
		// align-items: center;
		padding-bottom: 0.75rem;
		pointer-events: none;
	}
</style>
