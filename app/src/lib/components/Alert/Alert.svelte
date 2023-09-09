<script lang="ts">
	import { alertHandler } from "$lib/stores/stores";
	import { flip } from "svelte/animate";
	import { expoOut } from "svelte/easing";
	import { fade, fly } from "svelte/transition";
</script>

<div class="alert-container">
	{#each $alertHandler as notif (notif.id)}
		<div
			in:fly|global={{ y: 150, duration: 250, easing: expoOut }}
			out:fade|global={{ duration: 1250, delay: 500 }}
			animate:flip={{ duration: 250, delay: 0 }}
			on:introend={() => {
				setTimeout(() => {
					alertHandler.remove(notif);
				}, 3125);
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
		display: flex;
        flex-direction: column;
		justify-content: center;
		position: fixed;
		bottom: var(--alert-bottom, 5.75rem);
		left: 0;
		// flex-direction: column;flex-direction
		right: 0;
		z-index: 1000;
		// isolation: isolate;isolation
		max-height: 60vmin;
		align-items: center;
		margin: 0 auto;
		contain: layout;
		padding-bottom: 0.75rem;
		pointer-events: none;
	}
</style>
